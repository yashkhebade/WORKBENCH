from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, schemas
import os
import json
import shutil
from typing import List, Optional, Dict

# Database setup (using sqlite for local dev, configure postgres later via ENV)
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./workbench.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Workbench API")

# --- WEBSOCKET CONNECTION MANAGER ---
class ConnectionManager:
    def __init__(self):
        # Dictionary mapping project_id to list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: int):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: int):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]

    async def broadcast(self, project_id: int, message: dict):
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# Helper to log activity and broadcast
async def log_activity(db: Session, project_id: int, user_id: int, action_type: str, entity_type: str, entity_id: int, details: str = None):
    log_entry = models.ActivityLog(
        project_id=project_id,
        user_id=user_id,
        action_type=action_type,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    
    # Broadcast to all users connected to this project
    await manager.broadcast(project_id, {
        "id": log_entry.id,
        "action_type": action_type,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "timestamp": log_entry.timestamp.isoformat()
    })

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PROJECT CRUD ---

@app.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # SQLAlchemy relationship with cascade="all, delete-orphan" handles cleanup
    db.delete(db_project)
    db.commit()
    return {"message": "Project and all associated tasks/files deleted successfully"}

@app.put("/projects/{project_id}/state", response_model=schemas.ProjectResponse)
async def update_project_state(
    project_id: int, 
    workflow_state: str = Form(...), 
    db: Session = Depends(get_db)
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    old_state = db_project.workflow_state
    db_project.workflow_state = workflow_state
    db.commit()
    db.refresh(db_project)

    # Log and broadcast activity
    await log_activity(
        db=db,
        project_id=project_id,
        user_id=1, 
        action_type="workflow_state_changed",
        entity_type="project",
        entity_id=project_id,
        details=f"Project state changed from {old_state} to {workflow_state}"
    )

    return db_project

# --- TASK-SPECIFIC FILE UPLOADS ---

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload", response_model=schemas.FileResponse)
async def upload_file(
    project_id: int = Form(...),
    task_id: Optional[int] = Form(None),
    category: str = Form("other"), # NEW: category support
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Verify project exists
    if not db.query(models.Project).filter(models.Project.id == project_id).first():
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify task exists if task_id provided
    if task_id:
        if not db.query(models.Task).filter(models.Task.id == task_id, models.Task.project_id == project_id).first():
            raise HTTPException(status_code=404, detail="Task not found or doesn't belong to project")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save to db
    db_file = models.File(
        project_id=project_id,
        task_id=task_id,
        filename=file.filename,
        file_url=f"/uploads/{file.filename}",
        category=category # NEW
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Log and broadcast activity
    await log_activity(
        db=db,
        project_id=project_id,
        user_id=1, # Mocked user ID
        action_type="file_uploaded",
        entity_type="file",
        entity_id=db_file.id,
        details=f"File {file.filename} uploaded to {category} category"
    )

    return db_file

# --- WEBSOCKET ENDPOINT ---
@app.websocket("/ws/projects/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: int):
    await manager.connect(websocket, project_id)
    try:
        while True:
            # We just hold the connection open. Client doesn't need to send much yet.
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)

# --- PHASE 4 ADVANCED FEATURES ---

import subprocess
from fastapi.responses import FileResponse as FastAPIFileResponse
from pydantic import BaseModel

class WebhookPayload(BaseModel):
    ref: Optional[str] = None
    repository: Optional[dict] = None
    pusher: Optional[dict] = None

@app.post("/projects/{project_id}/git-sync")
async def sync_git_repo(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project or not project.repository_url:
        raise HTTPException(status_code=400, detail="Project has no repository URL configured")
    
    repo_dir = f"repos/{project_id}"
    os.makedirs("repos", exist_ok=True)
    
    try:
        if os.path.exists(repo_dir):
            subprocess.run(["git", "pull"], cwd=repo_dir, check=True, capture_output=True)
            action = "git_pull"
        else:
            subprocess.run(["git", "clone", project.repository_url, repo_dir], check=True, capture_output=True)
            action = "git_clone"
            
        await log_activity(db, project_id, 1, action, "project", project_id, f"Successfully synced repository {project.repository_url}")
        return {"message": "Repository synced successfully", "action": action}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Git operation failed: {e.stderr.decode('utf-8', errors='ignore')}")

@app.post("/webhooks/github")
async def github_webhook(payload: WebhookPayload, db: Session = Depends(get_db)):
    if not payload.repository or not payload.pusher:
        return {"message": "Ignored"}
        
    repo_url = payload.repository.get("clone_url")
    pusher_name = payload.pusher.get("name", "Unknown")
    
    project = db.query(models.Project).filter(models.Project.repository_url == repo_url).first()
    if project:
        await log_activity(db, project.id, 1, "github_push", "project", project.id, f"User {pusher_name} pushed to repository")
    return {"status": "received"}

@app.put("/tasks/{task_id}/status")
async def update_task_status(task_id: int, status: str = Form(...), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    old_status = task.status
    task.status = status
    db.commit()
    db.refresh(task)
    
    await log_activity(db, task.project_id, 1, "task_moved", "task", task_id, f"Task moved from {old_status} to {status}")
    return task

@app.put("/tasks/{task_id}/timer")
async def toggle_task_timer(task_id: int, action: str = Form(...), db: Session = Depends(get_db)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    from datetime import datetime
    
    if action == "start" and task.timer_status == "stopped":
        task.timer_status = "running"
        task.last_timer_start = datetime.utcnow()
    elif action == "stop" and task.timer_status == "running":
        task.timer_status = "stopped"
        if task.last_timer_start:
            delta = datetime.utcnow() - task.last_timer_start
            task.time_spent += int(delta.total_seconds() / 60)
            task.last_timer_start = None
            
    db.commit()
    db.refresh(task)
    return task

@app.get("/projects/{project_id}/report")
async def generate_project_report(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    from reportlab.pdfgen import canvas
    
    os.makedirs("reports", exist_ok=True)
    report_path = f"reports/project_{project_id}_report.pdf"
    
    c = canvas.Canvas(report_path)
    c.drawString(100, 800, f"Project Report: {project.name}")
    c.drawString(100, 780, f"Workflow State: {project.workflow_state}")
    c.drawString(100, 760, f"Description: {project.description or 'N/A'}")
    
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).all()
    total_time = sum([t.time_spent for t in tasks])
    
    c.drawString(100, 730, f"Total Time Logged: {total_time} minutes")
    
    y = 700
    for t in tasks:
        c.drawString(100, y, f"- {t.title} ({t.status}): {t.time_spent} mins")
        y -= 20
        if y < 50:
            c.showPage()
            y = 800
            
    c.save()
    return FastAPIFileResponse(report_path, media_type="application/pdf", filename=f"{project.name}_Report.pdf")

class PriorityRequest(BaseModel):
    description: str

@app.post("/tasks/suggest-priority")
async def suggest_priority(req: PriorityRequest):
    desc = req.description.lower()
    if "urgent" in desc or "critical" in desc or "bug" in desc:
        priority = "High"
    elif "feature" in desc or "enhancement" in desc:
        priority = "Medium"
    else:
        priority = "Low"
    return {"suggested_priority": priority}
