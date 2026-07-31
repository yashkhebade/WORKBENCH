import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import api from '../../services/api';
import { toast } from './toast';

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/projects', { name: name.trim(), description });
      toast.add({ title: 'Success', description: 'Project created successfully', type: 'success' });
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.add({ title: 'Error', description: err.response?.data?.error || 'Failed to create project', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FolderPlus size={18} />
            </div>
            <h3 className="font-semibold text-white text-base">Create New Project</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Project Name *</label>
            <input 
              required 
              autoFocus
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-primary" 
              placeholder="e.g. Avionics Controller Rev B" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Goals, technical stack, deadlines..." 
              rows={3} 
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-white/5 text-gray-400 transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
