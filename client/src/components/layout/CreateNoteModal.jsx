import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';
import { toast } from '../ui/toast';

export default function CreateNoteModal({ onClose, onSuccess, initialProjectId }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [note, setNote] = useState({
    title: '',
    content_markdown: '',
    project_id: initialProjectId || '',
    task_id: '',
    tags: '',
    is_milestone: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (!note.project_id && res.data.length > 0) {
        setNote(prev => ({ ...prev, project_id: res.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  useEffect(() => {
    if (note.project_id) {
      fetchTasks(note.project_id);
    }
  }, [note.project_id]);

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.project_id) {
      toast.add({ title: 'Error', description: 'Please select a project', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/notes', note);
      toast.add({ title: 'Success', description: 'Note created', type: 'success' });
      onSuccess();
      onClose();
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to create note', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="font-semibold text-lg">{note.is_milestone ? 'Create Milestone' : 'Quick Note'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Project</label>
              <select 
                required
                value={note.project_id} 
                onChange={e => setNote({...note, project_id: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="" disabled>Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Link to Task (Optional)</label>
              <select 
                value={note.task_id} 
                onChange={e => setNote({...note, task_id: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="">None</option>
                {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <input 
                value={note.tags} 
                onChange={e => setNote({...note, tags: e.target.value})} 
                className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm" 
                placeholder="e.g. feedback, urgent" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Title</label>
            <input 
              required
              value={note.title} 
              onChange={e => setNote({...note, title: e.target.value})} 
              className="w-full p-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm font-medium" 
              placeholder="e.g. Initial Prototype Testing" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Content (Markdown supported)</label>
            <textarea 
              required
              value={note.content_markdown} 
              onChange={e => setNote({...note, content_markdown: e.target.value})} 
              className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary outline-none text-sm min-h-[120px] resize-y" 
              placeholder="Write your note here..." 
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <input 
              type="checkbox" 
              checked={note.is_milestone} 
              onChange={e => setNote({...note, is_milestone: e.target.checked})}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary focus:ring-offset-background accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Mark as Milestone</span>
              <span className="text-xs text-muted-foreground">Highlight this prominently in the timeline feed.</span>
            </div>
          </label>

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg font-medium hover:bg-muted text-muted-foreground transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm text-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
