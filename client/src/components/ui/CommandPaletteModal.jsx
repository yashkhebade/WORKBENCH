import React, { useState, useEffect, useRef } from 'react';
import { Search, X, KanbanSquare, BookOpen, FileText, FolderOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CommandPaletteModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], notes: [], files: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ tasks: [], notes: [], files: [], projects: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ tasks: [], notes: [], files: [], projects: [] });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  const hasResults = results.tasks.length > 0 || results.notes.length > 0 || results.files.length > 0 || results.projects.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#18181b] w-full max-w-2xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="relative flex items-center p-4 border-b border-white/10">
          <Search size={20} className="text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type to search tasks, notes, files, projects..."
            className="w-full bg-transparent text-white placeholder-gray-500 text-base outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-1 rounded bg-white/10 text-gray-400 mr-2 shrink-0">
            ESC
          </kbd>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[400px] overflow-y-auto p-4 flex flex-col gap-4">
          {loading && <div className="text-center py-8 text-sm text-gray-400">Searching across workspace...</div>}

          {!loading && query.trim().length >= 2 && !hasResults && (
            <div className="text-center py-8 text-sm text-gray-400">No results found for "{query}"</div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="text-center py-6 text-xs text-gray-500">
              Type at least 2 characters to search across tasks, notes, uploaded files, and projects.
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">Tasks</span>
              {results.tasks.map(t => (
                <div key={t.id} onClick={() => handleSelect('/board')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-sm group transition-colors">
                  <div className="flex items-center gap-2.5">
                    <KanbanSquare size={16} className="text-primary shrink-0" />
                    <span className="text-white font-medium">{t.title}</span>
                    <span className="text-xs text-gray-500">{t.project_name}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">Notes</span>
              {results.notes.map(n => (
                <div key={n.id} onClick={() => handleSelect('/notes')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-sm group transition-colors">
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className="text-amber-400 shrink-0" />
                    <span className="text-white font-medium">{n.title}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          {results.files.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">Files</span>
              {results.files.map(f => (
                <div key={f.id} onClick={() => handleSelect('/timeline')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-sm group transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FileText size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-white font-medium">{f.name}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2">Projects</span>
              {results.projects.map(p => (
                <div key={p.id} onClick={() => handleSelect('/')} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-sm group transition-colors">
                  <div className="flex items-center gap-2.5">
                    <FolderOpen size={16} className="text-sky-400 shrink-0" />
                    <span className="text-white font-medium">{p.name}</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
