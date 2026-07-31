import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, FileText, Image, Code, File as FileIcon, FileType2, FileVideo, Plus, Upload, MessageSquare, Flag } from 'lucide-react';
import api from '../services/api';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import CreateNoteModal from '../components/layout/CreateNoteModal';
import { toast } from '../components/ui/toast';

const getFileIcon = (type) => {
  switch(type) {
    case 'image': return <Image size={24} className="text-blue-400" />;
    case 'pdf': return <FileType2 size={24} className="text-red-400" />;
    case 'code': return <Code size={24} className="text-green-400" />;
    case 'document': return <FileText size={24} className="text-amber-400" />;
    case 'video': return <FileVideo size={24} className="text-purple-400" />;
    default: return <FileIcon size={24} className="text-slate-400" />;
  }
};

const formatDateHeader = (dateString) => {
  const d = new Date(dateString);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
};

export default function Timeline() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('project_id');
  const subjectId = queryParams.get('subject_id');
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchTimeline = async () => {
    try {
      let url = `/timeline?`;
      if (projectId) url += `project_id=${projectId}&`;
      if (subjectId) url += `subject_id=${subjectId}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [projectId, subjectId, search]);

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const dateHeader = formatDateHeader(item.created_at);
    if (!acc[dateHeader]) acc[dateHeader] = [];
    acc[dateHeader].push(item);
    return acc;
  }, {});

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
      }
    };
    input.click();
  };

  const handleFileUpload = async (file) => {
    if (!projectId) {
      toast.add({ title: 'Error', description: 'Please select a specific project from the sidebar to upload files.', type: 'error' });
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post(`/files/project/${projectId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.add({ title: 'Success', description: 'File uploaded successfully', type: 'success' });
      fetchTimeline();
    } catch (err) {
      toast.add({ title: 'Error', description: 'Failed to upload file', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto bg-background/50 relative p-6 h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[200] bg-primary/10 backdrop-blur-sm border-2 border-primary border-dashed rounded-xl flex items-center justify-center pointer-events-none m-4">
          <div className="bg-background shadow-xl rounded-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Drop to Upload</h2>
              <p className="text-muted-foreground mt-1">File will be added to this project's timeline</p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State Overlay */}
      {uploading && (
        <div className="absolute inset-0 z-[150] bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card shadow-lg rounded-xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Uploading to Telegram...</span>
          </div>
        </div>
      )}
      
      {/* Header & Search */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Timeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">Chronological view of all files and notes.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search files and notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Capture Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-card border border-border rounded-2xl p-2 flex gap-2 shadow-sm">
          <button onClick={handleUploadClick} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
            <Upload size={18} /> Upload File
          </button>
          <div className="w-px bg-border my-2" />
          <button onClick={() => setShowNoteModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
            <MessageSquare size={18} /> Quick Note
          </button>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="max-w-4xl mx-auto">
        {Object.entries(groupedItems).map(([date, dateItems]) => (
          <div key={date} className="mb-10 relative">
            
            {/* Date Header Marker */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
              <div className="bg-muted px-4 py-1.5 rounded-full text-sm font-semibold text-muted-foreground shadow-sm">
                {date}
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Items for this date */}
            <div className="flex flex-col gap-4 ml-4 pl-6 border-l-2 border-border/50">
              {dateItems.map(item => (
                <div key={item.id + item.type} className="relative bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Timeline connecting dot */}
                  <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                  
                  {item.type === 'file' ? (
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-muted rounded-xl">
                        {getFileIcon(item.filetype)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-base mb-1 truncate">{item.title}</h4>
                        {item.content && <p className="text-muted-foreground text-sm mb-3 truncate">{item.content}</p>}
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span className="text-primary truncate max-w-[150px]">{item.project_name}</span>
                          <span>&bull;</span>
                          <span>{item.author_name}</span>
                          <span>&bull;</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                          {item.size && (
                            <>
                              <span>&bull;</span>
                              <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                          )}
                          <div className="flex-1"></div>
                          {item.version_id && (
                             <a href={`/api/files/download/${item.version_id}`} target="_blank" rel="noreferrer" className="text-accent-liquid-blue hover:underline">
                               Download
                             </a>
                          )}
                        </div>

                        {item.tags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.split(',').map(t => t.trim() ? (
                              <span key={t} className="px-2 py-1 bg-muted/80 rounded-md text-xs text-muted-foreground">
                                #{t.trim()}
                              </span>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : item.is_milestone ? (
                    <div className="flex gap-4 items-start bg-indigo-500/10 -m-4 p-4 rounded-xl border border-indigo-500/20">
                      <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                        <Flag size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="uppercase text-[10px] font-bold tracking-wider text-indigo-500">Milestone</span>
                        </div>
                        <h4 className="font-bold text-foreground text-lg mb-1">{item.title}</h4>
                        <p className="text-foreground text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-500/70 font-medium">
                          <span className="text-indigo-600 font-semibold">{item.project_name}</span>
                          <span>&bull;</span>
                          <span>{item.author_name}</span>
                          <span>&bull;</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <MessageSquare size={24} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.title && item.title !== 'Quick Note' && (
                          <h4 className="font-semibold text-foreground text-base mb-1 truncate">{item.title}</h4>
                        )}
                        <p className="text-foreground text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span className="text-primary truncate max-w-[150px]">{item.project_name}</span>
                          <span>&bull;</span>
                          <span>{item.author_name}</span>
                          <span>&bull;</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                        </div>

                        {item.tags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.split(',').map(t => t.trim() ? (
                              <span key={t} className="px-2 py-1 bg-muted/80 rounded-md text-xs text-muted-foreground">
                                #{t.trim()}
                              </span>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No timeline events found</h3>
            <p>Upload a file or add a note to see it appear here.</p>
          </div>
        )}
      </div>

      {showNoteModal && (
        <CreateNoteModal 
          onClose={() => setShowNoteModal(false)} 
          onSuccess={fetchTimeline} 
          initialProjectId={projectId} 
        />
      )}
    </div>
  );
}
