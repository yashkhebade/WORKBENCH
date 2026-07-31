import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { Plus, Search, FileText, History, Edit3, Eye, Save, Tag, Link2, BookOpen } from 'lucide-react';
import { toast } from '../components/ui/toast';

const CATEGORIES = ['All', 'Hardware', 'Firmware', 'Software', 'Mechanical', 'Datasheet'];

export default function NotesView() {
  const { user } = useAuth();
  const { projects, activeProjectId } = useProjects();
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('Hardware');
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (activeProjectId) {
      fetchNotes(activeProjectId);
    }
  }, [activeProjectId]);

  const fetchNotes = async (projectId) => {
    try {
      const res = await api.get(`/notes/project/${projectId}`);
      setNotes(res.data);
      if (res.data.length > 0 && !activeNote) {
        selectNote(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createNote = () => {
    setActiveNote(null);
    setEditTitle('Untitled Documentation');
    setEditContent('# Title\n\nAdd your Markdown notes here...');
    setEditTag('Hardware');
    setIsEditing(true);
    setIsPreview(false);
    setShowHistory(false);
  };

  const selectNote = (note) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content_markdown || '');
    setEditTag(note.tags || 'Hardware');
    setIsEditing(false);
    setIsPreview(false);
    setShowHistory(false);
  };

  const saveNote = async () => {
    if (!editTitle.trim()) return;
    try {
      if (activeNote && activeNote.id) {
        await api.put(`/notes/${activeNote.id}`, { title: editTitle, content_markdown: editContent, tags: editTag });
        toast.add({ title: 'Saved', description: 'Note updated successfully', type: 'success' });
      } else {
        const res = await api.post('/notes', { project_id: activeProjectId, title: editTitle, content_markdown: editContent, tags: editTag });
        toast.add({ title: 'Created', description: 'Note created successfully', type: 'success' });
        if (res.data.id) {
          setActiveNote({ id: res.data.id, title: editTitle, content_markdown: editContent, tags: editTag });
        }
      }
      setIsEditing(false);
      fetchNotes(activeProjectId);
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to save note', type: 'error' });
    }
  };

  const viewHistory = async () => {
    if (!activeNote || !activeNote.id) return;
    try {
      const res = await api.get(`/notes/${activeNote.id}/versions`);
      setVersions(res.data);
      setShowHistory(true);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => {
    if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(n.content_markdown || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTag !== 'All' && n.tags !== selectedTag) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-64px-2rem)] overflow-hidden">
      
      {/* Category Filter Bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${selectedTag === tag ? 'bg-primary text-white shadow-sm' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        
        {/* Left Sidebar Pane */}
        <div className="glass-panel w-full lg:w-80 flex flex-col p-4 bg-[#18181b] border border-white/10 rounded-2xl shrink-0">
          <button 
            onClick={createNote} 
            className="w-full py-2.5 mb-3 rounded-xl bg-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Create New Note</span>
          </button>

          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => selectNote(note)}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex flex-col gap-1 border ${activeNote?.id === note.id ? 'bg-primary/10 border-primary text-white' : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-semibold text-sm line-clamp-1">{note.title}</span>
                  {note.tags && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                      {note.tags}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500">By {note.author_name || 'Team Member'}</span>
              </div>
            ))}

            {filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
                <BookOpen size={24} className="text-gray-500 mb-2" />
                <p className="text-xs text-gray-400 font-medium">No notes found</p>
                <button onClick={createNote} className="mt-3 text-xs text-primary underline">
                  + Add your first note
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Document Content Pane */}
        <div className="glass-panel flex-1 flex flex-col bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden p-6">
          {(activeNote || isEditing) ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              
              {/* Document Header Controls */}
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-white/10 gap-4 flex-wrap">
                {isEditing ? (
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    className="text-xl font-bold bg-transparent text-white border-b border-white/20 pb-1 outline-none focus:border-primary flex-1 min-w-[200px]"
                    placeholder="Note Title..."
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {activeNote.title}
                    {activeNote.tags && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary">
                        {activeNote.tags}
                      </span>
                    )}
                  </h2>
                )}
                
                <div className="flex gap-2 items-center">
                  {isEditing && (
                    <select
                      value={editTag}
                      onChange={e => setEditTag(e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-xs outline-none cursor-pointer"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}

                  {isEditing && (
                    <button 
                      onClick={() => setIsPreview(!isPreview)} 
                      className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                      <span>{isPreview ? 'Edit' : 'Preview Markdown'}</span>
                    </button>
                  )}

                  {showHistory && (
                    <button onClick={() => setShowHistory(false)} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10">
                      Back to Note
                    </button>
                  )}

                  {!isEditing && !showHistory && (
                    <button onClick={viewHistory} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center gap-1.5">
                      <History size={14} /> History
                    </button>
                  )}

                  {!isEditing && !showHistory && (
                    <button onClick={() => { setEditTitle(activeNote.title); setEditContent(activeNote.content_markdown); setIsEditing(true); }} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm">
                      <Edit3 size={14} /> Edit
                    </button>
                  )}

                  {isEditing && (
                    <button onClick={saveNote} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm">
                      <Save size={14} /> Save Note
                    </button>
                  )}
                </div>
              </div>

              {/* Document Content View */}
              {showHistory ? (
                <div className="flex-1 overflow-y-auto pr-2">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">Version History</h3>
                  <div className="flex flex-col gap-3">
                    {versions.map((v, i) => (
                      <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>Version {versions.length - i} • By {v.author_name || 'Member'} • {new Date(v.created_at).toLocaleString()}</span>
                          <button onClick={() => { setEditContent(v.content_markdown); setIsEditing(true); setShowHistory(false); }} className="text-primary hover:underline font-semibold">
                            Restore
                          </button>
                        </div>
                        <div className="prose prose-invert max-w-none text-xs text-gray-300 line-clamp-3">
                          <ReactMarkdown>{v.content_markdown}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex gap-4 overflow-hidden">
                  {isEditing && !isPreview && (
                    <textarea 
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      placeholder="Write markdown content here..."
                      className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 text-white font-mono text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  )}
                  
                  {(isPreview || !isEditing) && (
                    <div className="flex-1 p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-y-auto prose prose-invert max-w-none text-sm leading-relaxed text-gray-200">
                      <ReactMarkdown>{isEditing ? editContent : (activeNote.content_markdown || '*No content*')}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
              <BookOpen size={36} className="opacity-40" />
              <p className="text-sm font-medium">Select a note from the left sidebar or create a new one.</p>
              <button onClick={createNote} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
                + Create New Note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

