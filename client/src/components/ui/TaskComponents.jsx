import React, { useState } from 'react';
import api from '../../services/api';

export function TaskTimer({ task, onTimerUpdate }) {
  const [status, setStatus] = useState(task.timer_status || 'stopped');
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleTimer = async (e) => {
    e.stopPropagation(); // Prevent drag
    setIsUpdating(true);
    const action = status === 'stopped' ? 'start' : 'stop';
    
    try {
      const response = await api.put(`/tasks/${task.id}/timer`, { action });
      setStatus(response.data.timer_status);
      onTimerUpdate(response.data);
    } catch (error) {
      console.error("Timer update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2 w-full">
      <div className="flex flex-col gap-0.5">
        <span className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider">Time Logged</span>
        <span className="font-mono text-xs font-medium text-foreground">{task.time_spent || 0} mins</span>
      </div>
      
      <button 
        onClick={toggleTimer}
        disabled={isUpdating}
        className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50
          ${status === 'running' 
            ? 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-500/20 hover:bg-red-100 animate-pulse' 
            : 'bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:bg-indigo-600 hover:shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:-translate-y-0.5'
          }`}
      >
        {status === 'running' ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}
