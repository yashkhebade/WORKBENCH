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
  
  const [filterType, setFilterType] = useState('all');
  const [filterTag, setFilterTag] = useState('all');

  const fetchTimeline = async () => {
    try {
      let url = `/timeline?`;
      if (projectId) url += `project_id=${projectId}&`;
      if (subjectId) url += `subject_id=${subjectId}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterType !== 'all') url += `filter_type=${filterType}&`;
      if (filterTag !== 'all') url += `filter_tag=${filterTag}&`;
      
      const res = await api.get(url);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [projectId, subjectId, search, filterType, filterTag]);

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
      className="flex-1 overflow-y-auto bg-[#09090b] relative p-6 h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-[200] bg-primary/10 backdrop-blur-sm border-2 border-primary border-dashed rounded-2xl flex items-center justify-center pointer-events-none m-4">
          <div className="bg-[#18181b] border border-white/10 shadow-2xl rounded-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Drop to Upload</h2>
              <p className="text-gray-400 mt-1 text-sm">File will be added to this project's timeline</p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading State Overlay */}
      {uploading && (
        <div className="absolute inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#18181b] border border-white/10 shadow-2xl rounded-2xl p-6 flex items-center gap-4">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-semibold text-white text-sm">Uploading to Telegram...</span>
          </div>
        </div>
      )}
      
      {/* Header & Search */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Project Timeline</h1>
          <p className="text-gray-400 mt-0.5 text-xs">Chronological view of all files and notes.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Types</option>
            <option value="file">Files Only</option>
            <option value="note">Notes Only</option>
            <option value="milestone">Milestones Only</option>
          </select>
          
          <select 
            value={filterTag} 
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
          >
            <option value="all">All Tags</option>
            <option value="hardware">Hardware</option>
            <option value="firmware">Firmware</option>
            <option value="mechanical">Mechanical</option>
            <option value="datasheet">Datasheet</option>
          </select>

          <div className="relative flex-1 md:w-64 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search files and notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Capture Bar */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-2 flex gap-2 shadow-sm">
          <button onClick={handleUploadClick} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors font-medium text-xs">
            <Upload size={16} /> Upload File
          </button>
          <div className="w-px bg-white/10 my-2" />
          <button onClick={() => setShowNoteModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors font-medium text-xs">
            <MessageSquare size={16} /> Quick Note
          </button>
        </div>
      </div>

      {/* Timeline Feed */}
      <div className="max-w-4xl mx-auto">
        {Object.entries(groupedItems).map(([date, dateItems]) => (
          <div key={date} className="mb-10 relative">
            
            {/* Date Header Marker */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 bg-[#09090b]/95 backdrop-blur py-2">
              <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm border border-white/10">
                {date}
              </div>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Items for this date */}
            <div className="flex flex-col gap-4 ml-4 pl-6 border-l-2 border-white/10">
              {dateItems.map(item => (
                <div key={item.id + item.type} className="relative bg-[#18181b] border border-white/10 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-white/20 transition-all duration-200">
                  {/* Timeline connecting dot */}
                  <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-primary ring-4 ring-[#09090b]" />
                  
                  {item.type === 'file' ? (
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl shrink-0">
                        {getFileIcon(item.filetype)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-sm mb-1 truncate">{item.title}</h4>
                        {item.content && <p className="text-gray-400 text-xs mb-3 truncate">{item.content}</p>}
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="text-primary truncate max-w-[150px] font-semibold">{item.project_name}</span>
                          <span>•</span>
                          <span>{item.author_name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                          {item.size && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-gray-300 bg-white/5 px-1.5 py-0.5 rounded">
                                {item.size < 1024 * 1024 
                                  ? `${(item.size / 1024).toFixed(1)} KB` 
                                  : `${(item.size / 1024 / 1024).toFixed(2)} MB`}
                              </span>
                            </>
                          )}
                          <div className="flex-1" />
                          {item.version_id && (
                             <a href={`${import.meta.env.VITE_API_URL || ''}/api/files/download/${item.version_id}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">
                               ↓ Download
                             </a>
                          )}
                        </div>

                        {item.tags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.split(',').map(t => t.trim() ? (
                              <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                                #{t.trim()}
                              </span>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : item.is_milestone ? (
                    <div className="flex gap-4 items-start bg-amber-500/5 -m-4 p-4 rounded-2xl border border-amber-500/20">
                      <div className="p-3 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-500/20 shrink-0">
                        <Flag size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="uppercase text-[10px] font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">🏁 Milestone</span>
                        </div>
                        <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                        <p className="text-gray-300 text-xs mb-3 whitespace-pre-wrap">{item.content}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-amber-400/70 font-medium">
                          <span className="text-amber-400 font-semibold">{item.project_name}</span>
                          <span>•</span>
                          <span>{item.author_name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl shrink-0">
                        <MessageSquare size={18} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.title && item.title !== 'Quick Note' && (
                          <h4 className="font-semibold text-white text-sm mb-1 truncate">{item.title}</h4>
                        )}
                        <p className="text-gray-300 text-xs mb-3 whitespace-pre-wrap leading-relaxed">{item.content}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="text-primary truncate max-w-[150px] font-semibold">{item.project_name}</span>
                          <span>•</span>
                          <span>{item.author_name}</span>
                          <span>•</span>
                          <span>{format(new Date(item.created_at), 'h:mm a')}</span>
                        </div>

                        {item.tags && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.tags.split(',').map(t => t.trim() ? (
                              <span key={t} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
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
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No timeline events found</h3>
            <p className="text-gray-400 text-xs">Upload a file or add a note to see it appear here.</p>
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
