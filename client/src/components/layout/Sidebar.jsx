import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, CalendarDays, BookOpen, FolderOpen, Users, Plus, X, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../services/api';
import { toast } from '../ui/toast';
import InviteMemberModal from '../ui/InviteMemberModal';
import CreateProjectModal from '../ui/CreateProjectModal';
import { useProjects } from '../../contexts/ProjectContext';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const { projects, fetchProjects, activeProjectId, setActiveProjectId } = useProjects();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Collapsible section states
  const [quickAccessOpen, setQuickAccessOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [teamOpen, setTeamOpen] = useState(true);



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
              {projects.map(p => {
                const isProjectActive = String(p.id) === String(activeProjectId);
                return (
                  <Link 
                    key={p.id} 
                    to={`/timeline`} 
                    onClick={() => setActiveProjectId(p.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs transition-all duration-200 md:justify-center lg:justify-start",
                      isProjectActive ? "bg-primary text-white shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <FolderOpen size={16} strokeWidth={2} className={cn("shrink-0", isProjectActive ? "text-white" : "text-primary")} />
                    <span className="hidden lg:block truncate">{p.name}</span>
                  </Link>
                );
              })}

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
      <CreateProjectModal 
        isOpen={showProjectModal} 
        onClose={() => setShowProjectModal(false)} 
        onSuccess={() => fetchProjects()}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} />
    </aside>
  );
}
