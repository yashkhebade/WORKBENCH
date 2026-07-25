from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    workflow_state: Optional[str] = "Ideation"
    repository_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "Todo"
    time_spent: Optional[int] = 0
    timer_status: Optional[str] = "stopped"
    last_timer_start: Optional[datetime] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskResponse(TaskBase):
    id: int
    project_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class FileResponse(BaseModel):
    id: int
    project_id: int
    task_id: Optional[int] = None
    filename: str
    file_url: str
    category: str
    uploaded_at: datetime

    class Config:
        orm_mode = True

class ActivityLogResponse(BaseModel):
    id: int
    project_id: int
    user_id: int
    action_type: str
    entity_type: str
    entity_id: int
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        orm_mode = True
