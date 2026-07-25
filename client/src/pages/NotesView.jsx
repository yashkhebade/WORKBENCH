import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import PresenceWidget from '../components/PresenceWidget';

export default function NotesView() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      if (searchQuery.trim().length > 0) {
        handleSearch();
      } else {
        fetchNotes(activeProjectId);
      }
    }
  }, [activeProjectId, searchQuery]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0) setActiveProjectId(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotes = async (projectId) => {
    try {
      const res = await api.get(`/notes/project/${projectId}`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await api.get(`/notes/search?projectId=${activeProjectId}&q=${encodeURIComponent(searchQuery)}`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createNote = () => {
    setActiveNote(null);
    setEditTitle('New Note');
    setEditContent('# Start typing...');
    setIsEditing(true);
    setShowHistory(false);
  };

  const selectNote = (note) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content_markdown);
    setIsEditing(false);
    setShowHistory(false);
  };

  const saveNote = async () => {
    try {
      if (activeNote) {
        await api.put(`/notes/${activeNote.id}`, { title: editTitle, content_markdown: editContent });
      } else {
        await api.post('/notes', { project_id: activeProjectId, title: editTitle, content_markdown: editContent });
      }
      setIsEditing(false);
      fetchNotes(activeProjectId);
      if (!activeNote) setActiveNote({ title: editTitle, content_markdown: editContent });
    } catch (err) {
      alert('Failed to save note');
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

  const restoreVersion = (version) => {
    if (window.confirm("Restore this version? This will become the newest active version.")) {
      setEditTitle(activeNote.title);
      setEditContent(version.content_markdown);
      setIsEditing(true);
      setShowHistory(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <header className="glass-panel" style={{ padding: '1rem 2rem', margin: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600 }}>HW Team Hub - Notes</h1>
          <Link to="/" className="btn" style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)' }}>Dashboard</Link>
          <Link to="/board" className="btn" style={{ background: 'transparent', color: 'white', border: '1px solid var(--border-color)' }}>Task Board</Link>
          <select 
            value={activeProjectId || ''} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--border-color)', outline: 'none' }}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <PresenceWidget />
          <span style={{ color: 'var(--text-muted)' }}>{user.name} ({user.role})</span>
          <button className="btn" onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, padding: '0 2rem 2rem', gap: '1.5rem', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
          <button className="btn btn-primary" onClick={createNote} style={{ marginBottom: '1rem' }}>+ New Note</button>
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', marginBottom: '1rem' }}
          />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notes.map(note => (
              <div 
                key={note.id} 
                onClick={() => selectNote(note)}
                style={{ 
                  padding: '0.75rem', 
                  background: activeNote?.id === note.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)', 
                  borderRadius: '4px', cursor: 'pointer' 
                }}
              >
                <div style={{ fontWeight: 600 }}>{note.title}</div>
                <div style={{ fontSize: '0.8rem', color: activeNote?.id === note.id ? 'white' : 'var(--text-muted)' }}>By {note.author_name}</div>
              </div>
            ))}
            {notes.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No notes found.</div>}
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {(activeNote || isEditing) ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                {isEditing ? (
                  <input 
                    value={editTitle} 
                    onChange={e => setEditTitle(e.target.value)} 
                    style={{ fontSize: '1.5rem', background: 'transparent', border: 'none', color: 'white', outline: 'none', flex: 1 }}
                  />
                ) : (
                  <h2 style={{ fontSize: '1.5rem' }}>{activeNote.title}</h2>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {showHistory && <button className="btn" onClick={() => setShowHistory(false)}>Back to Note</button>}
                  {!isEditing && !showHistory && <button className="btn" onClick={viewHistory}>History</button>}
                  {!isEditing && !showHistory && <button className="btn btn-primary" onClick={() => { setEditTitle(activeNote.title); setEditContent(activeNote.content_markdown); setIsEditing(true); }}>Edit</button>}
                  {isEditing && <button className="btn btn-primary" onClick={saveNote}>Save</button>}
                </div>
              </div>

              {showHistory ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <h3>Version History</h3>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {versions.map((v, i) => (
                      <div key={v.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Version {versions.length - i} • By {v.author_name} • {new Date(v.created_at).toLocaleString()}</span>
                          <button className="btn" style={{ padding: '0.2rem 0.5rem' }} onClick={() => restoreVersion(v)}>Restore</button>
                        </div>
                        <div style={{ maxHeight: '150px', overflowY: 'hidden', opacity: 0.7, fontSize: '0.9rem' }}>
                           <ReactMarkdown>{v.content_markdown}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                  {/* Markdown Editor */}
                  {isEditing && (
                    <textarea 
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'none', outline: 'none', fontFamily: 'monospace' }}
                    />
                  )}
                  {/* Markdown Preview */}
                  <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: isEditing ? 'rgba(0,0,0,0.1)' : 'transparent', border: isEditing ? '1px solid var(--border-color)' : 'none', borderRadius: '4px' }}>
                    <ReactMarkdown>{isEditing ? editContent : activeNote.content_markdown}</ReactMarkdown>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a note or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
