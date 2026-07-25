import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, KanbanSquare, CalendarDays, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/board', label: 'Board', icon: KanbanSquare },
    { path: '/calendar', label: 'Calendar', icon: CalendarDays },
    { path: '/notes', label: 'Notes', icon: BookOpen }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-2 py-2 flex justify-around items-center min-h-[64px] shadow-lg">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:bg-muted"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={24} className={isActive ? "animate-bounce" : ""} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
