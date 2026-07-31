import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, LayoutDashboard, Code2, Paperclip, Calendar, User, Clock, Download, Edit3, Save, Loader2, CheckCircle2, Upload } from 'lucide-react';
import api from '../../services/api';
import { toast } from './toast';
import { TaskTimer } from './TaskComponents';
import { cn } from '../../lib/utils';

/* ─── Config ─────────────────────────────────────────────────────── */
const PRIORITY = {
  High:   { color: 'bg-red-500/15 text-red-500 border-red-500/30', dot: 'bg-red-500' },
  Medium: { color: 'bg-amber-500/15 text-amber-500 border-amber-500/30', dot: 'bg-amber-500' },
  Low:    { color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', dot: 'bg-emerald-500' },
};
const STATUS_COLORS = {
  'To Do':       'bg-slate-500/10 text-slate-500',
  'In Progress': 'bg-blue-500/10 text-blue-500',
  'Review':      'bg-amber-500/10 text-amber-500',
  'Done':        'bg-emerald-500/10 text-emerald-500',
};
const TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'code',     label: 'Code',     Icon: Code2 },
  { id: 'files',    label: 'Files',    Icon: Paperclip },
];

/* ─── Overview Tab ─────────────────────────────────────────────── */
function OverviewTab({ task, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title:       task.title || '',
    description: task.description || '',
    priority:    task.priority || 'Medium',
    due_date:    task.due_date ? task.due_date.split('T')[0] : '',
    status:      task.status || 'To Do',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/tasks/${task.id}`, form);
      onUpdate(data);
      setEditing(false);
      toast.add({ title: 'Saved', description: 'Task updated', type: 'success' });
    } catch {
      toast.add({ title: 'Error', description: 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto flex-1">
      {/* Title */}
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <input autoFocus value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="text-xl font-bold bg-muted rounded-md px-3 py-1.5 flex-1 outline-none focus:ring-2 focus:ring-primary border border-border"
          />
        ) : (
          <h2 className="text-xl font-bold text-foreground flex-1">{form.title}</h2>
        )}
        <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-muted hover:bg-accent transition-colors shrink-0">
          {saving ? <Loader2 size={13} className="animate-spin" /> : editing ? <Save size={13} /> : <Edit3 size={13} />}
          {saving ? 'Saving…' : editing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2">
        {editing ? (
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border outline-none">
            {['To Do','In Progress','Review','Done'].map(s => <option key={s}>{s}</option>)}
          </select>
        ) : (
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_COLORS[form.status] || 'bg-muted text-muted-foreground')}>{form.status}</span>
        )}
        {editing ? (
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border outline-none">
            {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
          </select>
        ) : (
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', PRIORITY[form.priority]?.color || 'bg-muted')}>
            <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle', PRIORITY[form.priority]?.dot)} />
            {form.priority}
          </span>
        )}
        {editing ? (
          <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border outline-none" />
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            <Calendar size={11} /> {form.due_date ? new Date(form.due_date).toLocaleDateString() : 'No date'}
          </span>
        )}
        {task.assignee_name && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            <User size={11} /> {task.assignee_name}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
        {editing ? (
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={5} placeholder="Add a description…"
            className="w-full p-3 rounded-lg bg-muted border border-border text-sm resize-none outline-none focus:ring-2 focus:ring-primary" />
        ) : (
          <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-muted/40 rounded-lg p-3 min-h-[72px] border border-border/50">
            {form.description || <span className="text-muted-foreground italic">No description.</span>}
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Clock size={12} /> Time Tracking
        </p>
        <TaskTimer task={task} onTimerUpdate={onUpdate} />
      </div>
    </div>
  );
}

/* ─── Code Tab ──────────────────────────────────────────────────── */
function CodeTab() {
  const [code, setCode]     = useState('');
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  const lineNumRef  = useRef(null);

  const handleScroll = () => {
    if (lineNumRef.current && textareaRef.current)
      lineNumRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target.selectionStart;
      const newVal = code.substring(0, s) + '  ' + code.substring(e.target.selectionEnd);
      setCode(newVal);
      setSaved(false);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = s + 2;
          textareaRef.current.selectionEnd   = s + 2;
        }
      });
    }
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      toast.add({ title: 'Code saved', description: `${code.split('\n').length} lines`, type: 'success' });
    }, 300);
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#1e1e2e]/80 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-amber-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="text-[#555] font-mono text-xs ml-2">code editor — tab inserts 2 spaces</span>
        </div>
        <div className="flex items-center gap-2">
          {saved && !saving && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden flex bg-[#1e1e2e]">
        {/* Line numbers */}
        <div ref={lineNumRef} aria-hidden="true"
          className="select-none font-mono text-xs leading-6 text-[#3e3e5e] text-right pr-4 pl-3 pt-3 overflow-hidden"
          style={{ minWidth: '3.5rem' }}>
          {Array.from({ length: lineCount }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => { setCode(e.target.value); setSaved(false); }}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          placeholder={'// Write your code here...'}
          className="flex-1 bg-transparent text-[#cdd6f4] font-mono text-xs leading-6 resize-none outline-none pt-3 pr-4 overflow-auto caret-[#cdd6f4] placeholder:text-[#3e3e5e]"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}

/* ─── Files Tab ──────────────────────────────────────────────── */
function FilesTab({ task, projectId }) {
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files/task/${task.id}`);
      setFiles(data);
    } catch { /* no files yet */ }
    finally { setLoading(false); }
  }, [task.id]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('task_id', task.id);
    try {
      await api.post(`/files/project/${projectId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.add({ title: 'Uploaded', description: file.name, type: 'success' });
      fetchFiles();
    } catch {
      toast.add({ title: 'Upload failed', type: 'error' });
    } finally { setUploading(false); }
  };

  const EXT_ICON = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['zip','rar','7z'].includes(ext)) return '🗜️';
    if (['ino','c','cpp','py','js','ts','sh'].includes(ext)) return '💻';
    if (['kicad_pcb','kicad_sch','sch','brd'].includes(ext)) return '🔌';
    return '📎';
  };

  return (
    <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">
      {/* Upload button alternative (since modal handles drop) */}
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
          dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/60 hover:border-primary/40 hover:bg-muted/40'
        )}
      >
        {uploading
          ? <Loader2 size={30} className="animate-spin text-primary mb-3" />
          : <Upload size={30} className={cn('mb-3 transition-colors', dragging ? 'text-primary' : 'text-muted-foreground')} />
        }
        <p className="text-sm font-semibold text-foreground">
          {uploading ? 'Uploading…' : dragging ? 'Drop to upload' : 'Drop files here or click to browse'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Files are attached directly to this task</p>
        <input ref={inputRef} type="file" className="hidden" onChange={e => upload(e.target.files?.[0])} />
      </div>

      {/* File list */}
      <div className="flex flex-col gap-2">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4 justify-center">
            <Loader2 size={14} className="animate-spin" /> Loading files…
          </div>
        ) : files.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">No files attached to this task yet.</p>
        ) : (
          files.map(f => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background hover:bg-muted/40 transition-colors group">
              <span className="text-xl">{EXT_ICON(f.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  v{f.version_number} · {f.uploader_name || 'Unknown'} · {new Date(f.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/files/download/${f.latest_version_id}`}
                target="_blank" rel="noreferrer"
                className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                <Download size={14} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Main Modal ──────────────────────────────────────────────── */
export default function TaskDetailModal({ task: initialTask, projectId, onClose, onTaskUpdate }) {
  const [task, setTask]         = useState(initialTask);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [globalUploading, setGlobalUploading] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleUpdate = (updated) => {
    setTask(prev => ({ ...prev, ...updated }));
    if (onTaskUpdate) onTaskUpdate(updated);
  };

  const handleGlobalDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setGlobalUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('task_id', task.id);
    try {
      await api.post(`/files/project/${projectId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.add({ title: 'Uploaded', description: 'File attached to task', type: 'success' });
      // Force switch to files tab to see it
      setActiveTab('files');
    } catch {
      toast.add({ title: 'Upload failed', type: 'error' });
    } finally {
      setGlobalUploading(false);
    }
  };

  const statusColor =
    task.status === 'Done'        ? 'var(--status-done)'     :
    task.status === 'In Progress' ? 'var(--status-progress)' :
    task.status === 'Review'      ? 'var(--status-review)'   : 'var(--status-todo)';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleGlobalDrop}
        className={cn(
          "bg-background w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden relative transition-colors duration-200",
          isDraggingOver ? "border-primary ring-4 ring-primary/20" : "border-border"
        )}
        style={{ maxHeight: '90vh', minHeight: '520px', animation: 'tdmIn 0.2s cubic-bezier(0.22,1,0.36,1)' }}
      >
        {/* Global Drag Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-[100] bg-primary/10 backdrop-blur-[2px] flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-background rounded-2xl p-8 shadow-xl flex flex-col items-center text-primary animate-in zoom-in duration-200">
              <Upload size={48} className="mb-4" />
              <h2 className="text-2xl font-bold">Drop to attach file to task</h2>
            </div>
          </div>
        )}

        {/* Global Uploading Overlay */}
        {globalUploading && (
          <div className="absolute inset-0 z-[100] bg-background/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="bg-card shadow-lg rounded-xl p-4 flex items-center gap-3">
              <Loader2 size={24} className="animate-spin text-primary" />
              <span className="font-medium text-lg">Uploading to Telegram...</span>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-5 rounded-full" style={{ background: statusColor }} />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Task #{task.id}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 bg-muted/10">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2',
                activeTab === id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
              )}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'overview' && <OverviewTab task={task} onUpdate={handleUpdate} />}
          {activeTab === 'code'     && <CodeTab />}
          {activeTab === 'files'    && <FilesTab task={task} projectId={projectId} />}
        </div>
      </div>

      <style>{`
        @keyframes tdmIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
