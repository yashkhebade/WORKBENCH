import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, ChevronDown, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../contexts/ProjectContext';

export default function Header({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const { projects, activeProjectId, setActiveProjectId } = useProjects();

  return (
    <header className="sticky top-0 h-16 glass-panel !rounded-none !border-x-0 !border-t-0 !border-b border-subtle shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button onClick={toggleSidebar} className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded-md focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue transition-colors">
          <Menu size={20} strokeWidth={2.25} />
          <span className="sr-only">Toggle Sidebar</span>
        </button>

        <Link to="/" className="flex items-center gap-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue rounded-md">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-sm">
            HW
          </div>
          <span className="hidden md:inline text-xl font-bold tracking-tight">Team Hub</span>
        </Link>

        {/* Project Selector */}
        <div className="hidden md:flex ml-4 items-center">
          <select 
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="bg-muted hover:bg-accent text-foreground text-sm font-medium py-1.5 pl-3 pr-8 rounded-md border-none cursor-pointer outline-none focus:ring-2 focus:ring-ring appearance-none relative"
            aria-label="Select Active Project"
            style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
          >
            <option value="" disabled>Select Project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <nav className="hidden lg:flex gap-6 items-center">
        <Link to="/" className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue rounded-md px-3 py-1.5">Dashboard</Link>
        <Link to="/board" className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue rounded-md px-3 py-1.5">Board</Link>
        <Link to="/calendar" className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue rounded-md px-3 py-1.5">Calendar</Link>
        <Link to="/notes" className="text-text-secondary hover:text-text-primary hover:bg-bg-subtle font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue rounded-md px-3 py-1.5">Notes</Link>
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-text-secondary hover:bg-bg-subtle hover:text-text-primary rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-liquid-blue min-h-[44px] min-w-[44px] flex items-center justify-center relative">
          <Bell size={20} strokeWidth={2.25} />
          <span className="absolute top-2.5 right-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          <span className="sr-only">Notifications</span>
        </button>
        <div 
          className="flex items-center gap-3 p-1 md:p-2 md:-mr-2 rounded-xl hover:bg-bg-subtle cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent-liquid-blue"
          onClick={logout}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') logout(); }}
        >
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={20} strokeWidth={2.25} className="text-indigo-600" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold leading-tight text-text-primary">{user?.name || 'User'}</span>
            <span className="text-xs text-text-secondary leading-tight">{user?.role || 'Member'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
