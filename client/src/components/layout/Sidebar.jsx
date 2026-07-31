import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, CalendarDays, BookOpen, FolderOpen, Users, Plus, X, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { toast } from '../ui/toast';
import InviteMemberModal from '../ui/InviteMemberModal';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Collapsible section states
  const [quickAccessOpen, setQuickAccessOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);

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
    if (!newProject.name.trim()) return;
    try {
      await api.post('/projects', newProject);
      setShowProjectModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
      toast.add({ title: 'Success', description: 'Project created', type: 'success' });
    } catch (err) {
      toast.add({ title: 'Error', description: err.response?.data?.error || 'Failed to create project', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40",
        "glass-panel !rounded-none !border-y-0 !border-l-0 !border-r border-white/10 transition-all duration-300 ease-in-out",
        "md:w-[80px] lg:w-[260px] overflow-y-auto py-6 bg-[#18181b]"
      )}
      aria-label="Main Sidebar"
    >
      <div className="flex flex-col gap-6 px-4 lg:px-5">
        
        {/* Quick Access */}
        <div className="flex flex-col gap-2">
          <div 
            onClick={() => setQuickAccessOpen(!quickAccessOpen)} 
            className="hidden lg:flex justify-between items-center px-2 cursor-pointer group"
          >
            <h4 className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Quick Access</h4>
            {quickAccessOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
          </div>

          {quickAccessOpen && (
            <nav className="flex flex-col gap-1">
              <Link to="/" className={cn("flex items-center gap-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none min-h-[40px] relative overflow-hidden", isActive('/') ? "bg-primary text-white px-3 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white px-3", "md:justify-center lg:justify-start")}>
                <LayoutDashboard size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="hidden lg:block">Dashboard</span>
              </Link>
              <Link to="/board" className={cn("flex items-center gap-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none min-h-[40px] relative overflow-hidden", isActive('/board') ? "bg-primary text-white px-3 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white px-3", "md:justify-center lg:justify-start")}>
                <KanbanSquare size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="hidden lg:block">Task Board</span>
              </Link>
              <Link to="/timeline" className={cn("flex items-center gap-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none min-h-[40px] relative overflow-hidden", isActive('/timeline') ? "bg-primary text-white px-3 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white px-3", "md:justify-center lg:justify-start")}>
                <Sparkles size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="hidden lg:block">Timeline View</span>
              </Link>
              <Link to="/calendar" className={cn("flex items-center gap-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none min-h-[40px] relative overflow-hidden", isActive('/calendar') ? "bg-primary text-white px-3 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white px-3", "md:justify-center lg:justify-start")}>
                <CalendarDays size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="hidden lg:block">Calendar</span>
              </Link>
              <Link to="/notes" className={cn("flex items-center gap-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 focus:outline-none min-h-[40px] relative overflow-hidden", isActive('/notes') ? "bg-primary text-white px-3 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white px-3", "md:justify-center lg:justify-start")}>
                <BookOpen size={18} strokeWidth={2.25} className="shrink-0" />
                <span className="hidden lg:block">Notes</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-2 hidden lg:flex cursor-pointer" onClick={() => setProjectsOpen(!projectsOpen)}>
            <div className="flex items-center gap-1">
              <h4 className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Active Projects</h4>
              {projectsOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowProjectModal(true); }} title="New Project" className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          {projectsOpen && (
            <nav className="flex flex-col gap-1">
              {projects.map(p => (
                <Link key={p.id} to={`/timeline?project_id=${p.id}`} className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 md:justify-center lg:justify-start">
                  <FolderOpen size={16} strokeWidth={2} className="shrink-0 text-primary" />
                  <span className="hidden lg:block truncate">{p.name}</span>
                </Link>
              ))}

              {projects.length === 0 && (
                <div className="text-xs text-gray-500 px-3 py-2 hidden lg:block">No projects found.</div>
              )}
            </nav>
          )}
        </div>

        {/* Team */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-2 hidden lg:flex cursor-pointer" onClick={() => setTeamOpen(!teamOpen)}>
            <div className="flex items-center gap-1">
              <h4 className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Team</h4>
              {teamOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowMemberModal(true); }} title="Manage Team" className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5">
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          {teamOpen && (
            <nav className="flex flex-col gap-1">
              <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200 md:justify-center lg:justify-start">
                <Users size={16} strokeWidth={2} className="shrink-0 text-emerald-400" />
                <span className="hidden lg:block">Team Members & Invites</span>
              </button>
            </nav>
          )}
        </div>

      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="font-semibold text-lg text-white">Create New Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">Project Name *</label>
                <input 
                  required 
                  autoFocus
                  value={newProject.name} 
                  onChange={e => setNewProject({...newProject, name: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none text-sm" 
                  placeholder="e.g. NextGen PCB Redesign" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-300">Description</label>
                <textarea 
                  value={newProject.description} 
                  onChange={e => setNewProject({...newProject, description: e.target.value})} 
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none text-sm" 
                  placeholder="Goals, specs, architecture..." 
                  rows={3} 
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowProjectModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/5 text-gray-400 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} />
    </aside>
  );
}
