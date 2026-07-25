import React, { useState } from 'react';

// --- 1. PROJECT CRUD COMPONENTS ---

export function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });
      if (response.ok) {
        const newProject = await response.json();
        onProjectCreated(newProject);
        onClose();
      }
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content card">
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Project Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            className="input-field"
          />
          <textarea 
            placeholder="Description" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            className="input-field"
          />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteProjectDialog({ isOpen, onClose, projectId, onProjectDeleted }) {
  const handleDelete = async () => {
    try {
      const response = await fetch(`/projects/${projectId}`, { method: 'DELETE' });
      if (response.ok) {
        onProjectDeleted(projectId);
        onClose();
      }
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content card">
        <h2>Delete Project?</h2>
        <p className="text-danger">This will permanently delete the project and cascade delete all associated tasks and files. Are you sure?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn">Cancel</button>
          <button onClick={handleDelete} className="btn btn-danger">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
}

// --- 2. TASK-SPECIFIC FILE UPLOAD COMPONENT ---

export function TaskDetailUpload({ projectId, taskId, onFileUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('task_id', taskId); // NEW: Task specific linking
    formData.append('file', file);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const newFile = await response.json();
        onFileUploaded(newFile);
        setFile(null);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="task-upload-section mt-4 p-4 border rounded">
      <h4 className="font-semibold mb-2">Upload to Task</h4>
      <div className="flex gap-2 items-center">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          className="text-sm"
        />
        <button 
          onClick={handleUpload} 
          disabled={!file || isUploading}
          className="btn btn-primary btn-sm"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>
    </div>
  );
}
