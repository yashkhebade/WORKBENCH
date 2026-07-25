import React, { useState, useEffect } from 'react';

// --- 1. CATEGORIZED FILE CONTAINERS (TABS) ---

export function FileContainerTabs({ files }) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Derive unique categories from files
  const categories = ['all', ...new Set(files.map(f => f.category))];

  const filteredFiles = activeCategory === 'all' 
    ? files 
    : files.filter(f => f.category === activeCategory);

  return (
    <div className="file-containers card">
      <h3 className="mb-4">Project Files</h3>
      
      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 border-b pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-t-lg font-medium capitalize ${
              activeCategory === cat 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* File List */}
      <div className="file-list flex flex-col gap-2">
        {filteredFiles.length === 0 ? (
          <p className="text-[var(--text-secondary)] italic">No files in this category.</p>
        ) : (
          filteredFiles.map(file => (
            <div key={file.id} className="flex justify-between items-center p-3 border rounded bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
              <div className="flex flex-col">
                <a href={file.file_url} target="_blank" rel="noreferrer" className="font-semibold text-blue-500 hover:underline">
                  {file.filename}
                </a>
                <span className="text-xs text-[var(--text-secondary)]">
                  Uploaded: {new Date(file.uploaded_at).toLocaleString()}
                </span>
              </div>
              <span className="text-xs font-mono bg-[var(--bg-tertiary)] px-2 py-1 rounded">
                {file.category.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- 2. LIVE ACTIVITY FEED (WEBSOCKETS) ---

export function LiveActivityFeed({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  useEffect(() => {
    // Initial fetch of historical logs could go here
    // fetch(`/api/projects/${projectId}/activity`).then(...)

    // Setup WebSocket
    const ws = new WebSocket(`ws://localhost:8000/ws/projects/${projectId}`);

    ws.onopen = () => {
      setConnectionStatus('Connected (Live)');
    };

    ws.onmessage = (event) => {
      try {
        const newLog = JSON.parse(event.data);
        // Prepend new log to the top of the feed
        setLogs(prevLogs => [newLog, ...prevLogs]);
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('Disconnected');
    };

    return () => {
      ws.close();
    };
  }, [projectId]);

  return (
    <div className="live-activity-feed card mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectionStatus.includes('Live') ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          Live Activity Feed
        </h3>
        <span className="text-xs text-[var(--text-secondary)]">{connectionStatus}</span>
      </div>
      
      <div className="log-container flex flex-col gap-3 max-h-64 overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-[var(--text-secondary)] italic text-sm">Waiting for activity...</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="log-item flex flex-col text-sm border-l-2 border-[var(--color-primary)] pl-3 py-1">
              <span className="font-medium">
                User #{log.user_id} {log.action_type.replace('_', ' ')}
              </span>
              <span className="text-[var(--text-secondary)] text-xs mt-1">
                {log.details}
              </span>
              <span className="text-[var(--text-tertiary)] text-[10px] mt-1">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
