import React, { useState } from 'react';

// --- 1. TIME TRACKING UI COMPONENT ---

export function TaskTimer({ taskId, currentStatus, timeSpent, onTimerUpdate }) {
  const [status, setStatus] = useState(currentStatus || 'stopped');
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleTimer = async () => {
    setIsUpdating(true);
    const action = status === 'stopped' ? 'start' : 'stop';
    
    try {
      const formData = new URLSearchParams();
      formData.append('action', action);

      const response = await fetch(`/tasks/${taskId}/timer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setStatus(updatedTask.timer_status);
        onTimerUpdate(updatedTask);
      }
    } catch (error) {
      console.error("Timer update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="task-timer flex items-center justify-between border rounded p-2 bg-[var(--bg-tertiary)]">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">Time Logged</span>
        <span className="font-mono">{timeSpent || 0} mins</span>
      </div>
      
      <button 
        onClick={toggleTimer}
        disabled={isUpdating}
        className={`px-3 py-1 text-sm font-semibold rounded text-white transition-colors
          ${status === 'running' 
            ? 'bg-[var(--color-danger)] hover:bg-red-600 animate-pulse' 
            : 'bg-[var(--color-success)] hover:bg-green-600'
          }`}
      >
        {status === 'running' ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

// --- 2. AI PRIORITY SUGGESTION COMPONENT ---

export function AIPrioritySuggester({ description, onPrioritySuggested }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSuggest = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    
    try {
      const response = await fetch(`/tasks/suggest-priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });

      if (response.ok) {
        const data = await response.json();
        onPrioritySuggested(data.suggested_priority);
      }
    } catch (error) {
      console.error("AI Suggestion failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="ai-suggester mt-2">
      <button 
        type="button"
        onClick={handleSuggest}
        disabled={isAnalyzing || !description}
        className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded flex items-center gap-1"
      >
        <span className="font-mono">✨</span>
        {isAnalyzing ? 'Analyzing...' : 'Suggest Priority (AI)'}
      </button>
    </div>
  );
}

// --- 3. PROJECT REPORT DOWNLOAD BUTTON ---

export function DownloadReportButton({ projectId }) {
  return (
    <a 
      href={`/projects/${projectId}/report`}
      target="_blank"
      rel="noreferrer"
      className="btn btn-secondary flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Download PDF Report
    </a>
  );
}
