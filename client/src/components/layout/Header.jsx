import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, User, Search, UserPlus, ChevronRight } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';
import NotificationDropdown from '../ui/NotificationDropdown';
import CommandPaletteModal from '../ui/CommandPaletteModal';
import InviteMemberModal from '../ui/InviteMemberModal';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { projects, activeProjectId, setActiveProjectId } = useProjects();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setShowSearch(true);
    window.addEventListener('open-command-palette', handleOpenSearch);
    return () => window.removeEventListener('open-command-palette', handleOpenSearch);
  }, []);

  const activeProject = projects.find(p => p.id === parseInt(activeProjectId));

  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname === '/board') return 'Task Board';
    if (pathname === '/calendar') return 'Calendar';
    if (pathname === '/notes') return 'Notes';
    if (pathname === '/timeline') return 'Timeline';
    return 'Workspace';
  };

  return (
    <header className="sticky top-0 h-16 glass-panel !rounded-none !border-x-0 !border-t-0 !border-b border-white/10 shadow-sm flex items-center justify-between px-4 z-50 bg-[#18181b]">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button onClick={toggleSidebar} className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg focus:outline-none transition-colors">
          <Menu size={20} strokeWidth={2.25} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 text-white focus:outline-none rounded-md">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold shadow-sm text-sm">
            HW
          </div>
          <span className="hidden sm:inline text-lg font-bold tracking-tight text-white">Team Hub</span>
        </Link>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 pl-4 border-l border-white/10">
          <span>{getPageTitle(location.pathname)}</span>
          {activeProject && (
            <>
              <ChevronRight size={14} className="text-gray-600" />
              <span className="font-semibold text-primary px-2 py-0.5 rounded bg-primary/10">
                {activeProject.name}
              </span>
            </>
          )}
        </div>

        {/* Project Selector */}
        <div className="hidden lg:flex ml-2 items-center">
          <select 
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-1.5 pl-3 pr-8 rounded-lg border border-white/10 cursor-pointer outline-none focus:ring-2 focus:ring-primary appearance-none relative"
            aria-label="Select Active Project"
            style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} className="bg-[#18181b] text-white">{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Nav */}
      <nav className="hidden lg:flex gap-1 items-center bg-white/5 p-1 rounded-xl border border-white/5">
        <NavLink to="/" className={({ isActive }) => `font-medium text-xs transition-colors rounded-lg px-3 py-1.5 ${isActive ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Dashboard</NavLink>
        <NavLink to="/board" className={({ isActive }) => `font-medium text-xs transition-colors rounded-lg px-3 py-1.5 ${isActive ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Board</NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `font-medium text-xs transition-colors rounded-lg px-3 py-1.5 ${isActive ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Calendar</NavLink>
        <NavLink to="/notes" className={({ isActive }) => `font-medium text-xs transition-colors rounded-lg px-3 py-1.5 ${isActive ? 'text-white bg-primary shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>Notes</NavLink>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button 
          onClick={() => setShowSearch(true)} 
          className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 px-3 py-1.5 rounded-xl transition-all"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 bg-white/10 rounded text-gray-400">⌘K</kbd>
        </button>

        {/* Invite Member */}
        <button
          onClick={() => setShowInviteModal(true)}
          title="Invite Member"
          className="p-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors hidden sm:flex items-center justify-center"
        >
          <UserPlus size={18} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-2 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-colors flex items-center justify-center relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        {/* User Badge */}
        <div 
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
          onClick={logout}
          title="Click to logout"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold leading-tight text-white">{user?.name || 'User'}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{user?.role || 'Member'}</span>
          </div>
        </div>
      </div>

      <CommandPaletteModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <InviteMemberModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </header>
  );
}
