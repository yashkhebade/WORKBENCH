import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, CalendarDays, BookOpen, FolderOpen, Users, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { toast } from '../ui/toast';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', parent_project_id: '' });
  const [newMember, setNewMember] = useState({ project_id: '', user_id: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowProjectModal(false);
      setNewProject({ name: '', description: '', parent_project_id: '' });
      fetchProjects();
      toast.add({ title: 'Success', description: 'Project created', type: 'success' });
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to create project', type: 'error' });
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.project_id || !newMember.user_id) return;
    try {
      await api.post(`/projects/${newMember.project_id}/members`, { user_id: newMember.user_id, role: 'member' });
      setShowMemberModal(false);
      setNewMember({ project_id: '', user_id: '' });
      toast.add({ title: 'Success', description: 'Member added to project', type: 'success' });
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to add member', type: 'error' });
    }
  };

  if (!isOpen) return null;

  // Filter top-level projects vs sub-projects
  const topLevelProjects = projects.filter(p => !p.parent_project_id);

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40",
        "glass-panel !rounded-none !border-y-0 !border-l-0 !border-r border-subtle transition-all duration-300 ease-in-out",
        "md:w-[80px] lg:w-[260px] overflow-y-auto py-6"
      )}
      style={{ background: 'var(--bg-secondary)' }}
      aria-label="Main Sidebar"
    >
      <div className="flex flex-col gap-8 px-4 lg:px-6">
        {/* Quick Access */}
        <div className="flex flex-col gap-2">
          <h4 className="hidden lg:block text-[11px] uppercase tracking-wider text-text-secondary font-bold px-3 mb-1">Quick Access</h4>
          <nav className="flex flex-col gap-1.5">
            <Link to="/" className={cn("flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] relative overflow-hidden", isActive('/') ? "bg-indigo-50/80 text-accent-liquid-blue before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent-liquid-blue before:rounded-r-md px-4" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary px-4", "md:justify-center lg:justify-start")}>
              <LayoutDashboard size={20} strokeWidth={2.25} className="shrink-0" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
            <Link to="/board" className={cn("flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] relative overflow-hidden", isActive('/board') ? "bg-indigo-50/80 text-accent-liquid-blue before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent-liquid-blue before:rounded-r-md px-4" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary px-4", "md:justify-center lg:justify-start")}>
              <KanbanSquare size={20} strokeWidth={2.25} className="shrink-0" />
              <span className="hidden lg:block">Board</span>
            </Link>
            <Link to="/calendar" className={cn("flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] relative overflow-hidden", isActive('/calendar') ? "bg-indigo-50/80 text-accent-liquid-blue before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent-liquid-blue before:rounded-r-md px-4" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary px-4", "md:justify-center lg:justify-start")}>
              <CalendarDays size={20} strokeWidth={2.25} className="shrink-0" />
              <span className="hidden lg:block">Calendar</span>
            </Link>
            <Link to="/notes" className={cn("flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] relative overflow-hidden", isActive('/notes') ? "bg-indigo-50/80 text-accent-liquid-blue before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-accent-liquid-blue before:rounded-r-md px-4" : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary px-4", "md:justify-center lg:justify-start")}>
              <BookOpen size={20} strokeWidth={2.25} className="shrink-0" />
              <span className="hidden lg:block">Notes</span>
            </Link>
          </nav>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-3 mb-1 hidden lg:flex">
            <h4 className="text-[11px] uppercase tracking-wider text-text-secondary font-bold">Projects</h4>
            <button onClick={() => setShowProjectModal(true)} className="text-text-secondary hover:text-accent-liquid-blue transition-colors p-1 rounded-md hover:bg-indigo-50">
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
          <nav className="flex flex-col gap-1.5">
            {topLevelProjects.map(p => (
              <div key={p.id} className="flex flex-col">
                <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] md:justify-center lg:justify-start">
                  <FolderOpen size={20} strokeWidth={2.25} className="shrink-0" />
                  <span className="hidden lg:block text-sm truncate">{p.name}</span>
                </button>
                {/* Sub-projects */}
                {projects.filter(sub => sub.parent_project_id === p.id).map(sub => (
                  <button key={sub.id} className="flex items-center gap-3 px-4 py-2 ml-4 rounded-xl font-medium text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[36px] md:hidden lg:flex">
                    <div className="w-1.5 h-1.5 rounded-full bg-text-secondary shrink-0 ml-1 opacity-50" />
                    <span className="text-xs truncate">{sub.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Team */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-3 mb-1 hidden lg:flex">
            <h4 className="text-[11px] uppercase tracking-wider text-text-secondary font-bold">Team</h4>
            <button onClick={() => setShowMemberModal(true)} className="text-text-secondary hover:text-accent-liquid-blue transition-colors p-1 rounded-md hover:bg-indigo-50">
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
          <nav className="flex flex-col gap-1.5">
            <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] md:justify-center lg:justify-start">
              <Users size={20} strokeWidth={2.25} className="shrink-0" />
              <span className="hidden lg:block text-sm">Add Members</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-lg">New Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Project Name</label>
                <input required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Apollo Phase 2" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Description</label>
                <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="Optional details..." rows={3} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Parent Project (Optional)</label>
                <select value={newProject.parent_project_id} onChange={e => setNewProject({...newProject, parent_project_id: e.target.value})} className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="">None (Top Level)</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded-md font-medium hover:bg-muted text-muted-foreground transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Add Team Member</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Select Project</label>
                <select required value={newMember.project_id} onChange={e => setNewMember({...newMember, project_id: e.target.value})} className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Choose a project...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">User ID (Demo)</label>
                <input required type="number" value={newMember.user_id} onChange={e => setNewMember({...newMember, user_id: e.target.value})} className="w-full p-2.5 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary outline-none" placeholder="Enter User ID (e.g. 1)" />
                <span className="text-xs text-muted-foreground mt-1">In a real app, this would be a user search dropdown.</span>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 rounded-md font-medium hover:bg-muted text-muted-foreground transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
