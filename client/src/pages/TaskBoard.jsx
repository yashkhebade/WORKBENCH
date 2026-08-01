import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Plus, Calendar as CalendarIcon, User, ChevronRight, ChevronDown, Filter, Search } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDebounce } from '../hooks/useDebounce';
import { cn } from '../lib/utils';
import { toast } from '../components/ui/toast';
import { TaskTimer } from '../components/ui/TaskComponents';
import { useProjects } from '../contexts/ProjectContext';
import TaskDetailModal from '../components/ui/TaskDetailModal';
import PriorityLegend from '../components/ui/PriorityLegend';
import WorkflowStepper from '../components/ui/WorkflowStepper';
import { X } from 'lucide-react';

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: 'var(--status-todo)' },
  { id: 'In Progress', label: 'In Progress', color: 'var(--status-progress)' },
  { id: 'Review', label: 'Review / Testing', color: 'var(--status-review)' },
  { id: 'Done', label: 'Done', color: 'var(--status-done)' }
];

const getPriorityClasses = (priority) => {
  if (priority === 'High') return 'bg-red-50 text-red-600';
  if (priority === 'Medium') return 'bg-amber-50 text-amber-600';
  return 'bg-sky-50 text-sky-600';
};

const SortableTask = memo(({ task, isOverlay, onOpen, dragJustHappenedRef }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'all 200ms ease',
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging || isOverlay ? 999 : 1,
    scale: isOverlay ? '1.05' : '1',
    boxShadow: isOverlay ? '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' : undefined,
    rotate: isOverlay ? '2deg' : '0deg'
  };

  const handleClick = () => {
    // dragJustHappenedRef is set true in onDragEnd for 150ms.
    // Browsers also naturally suppress click after pointer moves >4px,
    // so real drags will never open the modal.
    if (dragJustHappenedRef?.current) return;
    onOpen(task);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "group flex flex-col gap-2 p-3.5 mb-3 bg-white/10 border border-white/5 rounded-xl shadow-sm hover:shadow-md hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none",
        isOverlay ? 'ring-2 ring-primary shadow-xl scale-105 rotate-2' : ''
      )}
      style={style}
    >
      <div className="flex justify-between items-start gap-2">
        <span className="font-semibold text-[0.95rem] text-text-primary break-words">{task.title}</span>
        <span className={`text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p className="text-sm text-muted-foreground m-0 line-clamp-2 overflow-hidden">
          {task.description}
        </p>
      )}

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <CalendarIcon size={12} />
          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
        </div>
        
        {task.assignee_name && (
          <div title={task.assignee_name} className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.7rem] font-bold">
            {task.assignee_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Task Timer UI */}
      <TaskTimer task={task} onTimerUpdate={(updated) => {}} />
    </div>
  );
});

const KanbanColumn = memo(({ col, colTasks, isCollapsed, onToggle, onAdd, onTaskOpen, dragJustHappenedRef }) => {
  const { setNodeRef } = useDroppable({ id: col.id, data: { type: 'Column' } });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-white/5 rounded-2xl border border-white/10 shadow-sm transition-all duration-300 overflow-hidden min-h-[300px] xl:min-h-0",
        isCollapsed ? "opacity-75" : "w-full"
      )}
    >
      {/* Column Header */}
      <button 
        onClick={() => onToggle(col.id)}
        className="w-full px-4 py-3.5 flex justify-between items-center border-b border-white/10 hover:bg-white/5 focus:outline-none min-h-[56px] text-left transition-colors group cursor-pointer"
        aria-expanded={!isCollapsed}
        aria-label={`Toggle column ${col.label}`}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color, boxShadow: `0 0 10px ${col.color}80` }} />
              <h3 className="text-[0.95rem] font-semibold text-text-primary tracking-tight m-0">{col.label}</h3>
              <span 
                className="px-2 py-0.5 rounded-full text-[0.7rem] font-bold shadow-sm"
                style={{ backgroundColor: `color-mix(in srgb, ${col.color} 15%, transparent)`, color: col.color }}
              >
                {colTasks.length}
              </span>
            </div>
            <div className="p-1 rounded-md group-hover:bg-black/5 transition-colors">
              <ChevronDown size={16} className="text-text-secondary opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            <ChevronRight size={16} className="text-text-secondary" />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color, boxShadow: `0 0 10px ${col.color}80` }} />
            <span className="[writing-mode:vertical-rl] rotate-180 font-semibold text-text-secondary mt-4">{col.label}</span>
          </div>
        )}
      </button>

      {/* Column Content */}
      {!isCollapsed && (
        <div className="p-3 pt-4 flex-1 flex flex-col overflow-y-auto min-h-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(col.id); }}
            className="w-full py-2 mb-3 rounded-xl border border-dashed border-white/20 bg-transparent text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/10 cursor-pointer flex items-center justify-center gap-2 text-[0.9rem] font-medium transition-all focus:outline-none group"
            aria-label={`Add task to ${col.label}`}
          >
            <Plus size={16} className="opacity-70 group-hover:opacity-100" />
            <span>Add Issue</span>
          </button>
          
          <SortableContext id={col.id} items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="min-h-[100px] h-full flex flex-col">
              {colTasks.map(task => (
                <SortableTask key={task.id} task={task} onOpen={onTaskOpen} dragJustHappenedRef={dragJustHappenedRef} />
              ))}
              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 opacity-60 flex-1">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-400">No tasks yet</p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
});

const CreateTaskModal = ({ statusId, projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    priority: 'Medium',
    due_date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setIsSubmitting(true);
    await onSubmit({ ...formData, status: statusId, project_id: projectId });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#18181b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-semibold text-lg text-white">Create New Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Task Title *</label>
            <input 
              required autoFocus
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="e.g. Design v2 PCB layout" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="Add details, specs, links..." 
              rows={3} 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Category</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-xs outline-none"
              >
                <option value="Hardware">Hardware</option>
                <option value="Firmware">Firmware</option>
                <option value="Software">Software</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Documentation">Documentation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-300">Priority</label>
              <select 
                value={formData.priority} 
                onChange={e => setFormData({...formData, priority: e.target.value})} 
                className="w-full p-2.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-xs outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-300">Due Date</label>
            <input 
              type="date"
              value={formData.due_date}
              onChange={e => setFormData({...formData, due_date: e.target.value})}
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#27272a] text-white text-xs outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-white/5 text-gray-400 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TaskBoard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { projects, activeProjectId, setActiveProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [collapsedCols, setCollapsedCols] = useState({});
  const [activeDragTask, setActiveDragTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState(null);
  const dragJustHappenedRef = React.useRef(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (activeProjectId) fetchTasks(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (socket && activeProjectId) {
      const handleTaskUpdate = () => fetchTasks(activeProjectId);
      socket.on('task:updated', handleTaskUpdate);
      return () => socket.off('task:updated', handleTaskUpdate);
    }
  }, [socket, activeProjectId]);

  const fetchTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTaskSubmit = useCallback(async (taskData) => {
    if (!activeProjectId) return;
    
    // Optimistic UI
    const tempId = 'temp-' + Date.now();
    const newTask = {
      id: tempId,
      ...taskData,
      assignee_name: user?.name,
      due_date: null
    };
    setTasks(prev => [...prev, newTask]);
    setCreatingTaskStatus(null);

    try {
      await api.post('/tasks', taskData);
      fetchTasks(activeProjectId);
      toast.add({ title: 'Task Created', description: 'Your task has been added successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setTasks(prev => prev.filter(t => t.id !== tempId)); // Revert on failure
      toast.add({ title: 'Error', description: 'Failed to create task', type: 'error' });
    }
  }, [activeProjectId, user]);

  const toggleColumn = useCallback((colId) => {
    setCollapsedCols(prev => ({ ...prev, [colId]: !prev[colId] }));
  }, []);

  const onDragStart = useCallback((event) => {
    setActiveDragTask(event.active.data.current.task);
  }, []);

  const onDragOver = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Logic to move tasks between columns instantly for smooth UI
    const activeTask = tasks.find(t => t.id === activeId);
    const overColId = COLUMNS.find(c => c.id === overId)?.id || tasks.find(t => t.id === overId)?.status;
    
    if (activeTask && overColId && activeTask.status !== overColId) {
      setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overColId } : t));
    }
  }, [tasks]);

  const onDragEnd = useCallback(async (event) => {
    setActiveDragTask(null);
    // Block accidental click-to-open-modal for 150ms after any drag ends
    dragJustHappenedRef.current = true;
    setTimeout(() => { dragJustHappenedRef.current = false; }, 150);

    const { active, over } = event;
    if (!over) return;
    
    const activeTask = tasks.find(t => t.id === active.id);
    const overColId = COLUMNS.find(c => c.id === over.id)?.id || tasks.find(t => t.id === over.id)?.status;

    if (activeTask && overColId) {
      try {
        await api.put(`/tasks/${activeTask.id}`, { status: overColId });
      } catch (err) {
        console.error(err);
        fetchTasks(activeProjectId); // revert on error
      }
    }
  }, [tasks, activeProjectId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (debouncedSearch && !t.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
      if (filterAssignee !== 'All' && t.assignee_name !== filterAssignee && !(filterAssignee === 'Unassigned' && !t.assignee_name)) return false;
      return true;
    });
  }, [tasks, debouncedSearch, filterPriority, filterAssignee]);

  const uniqueAssignees = useMemo(() => {
    return [...new Set(tasks.map(t => t.assignee_name).filter(Boolean))];
  }, [tasks]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px-2rem)] overflow-hidden">
      
      {/* Toolbar */}
      <div className="glass-panel p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center w-full">
          <select 
            value={activeProjectId} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-white/5 text-white font-medium outline-none focus:ring-2 focus:ring-primary shadow-sm flex-1 sm:flex-none cursor-pointer transition-shadow"
            aria-label="Select Project"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <div className="relative flex-1 sm:flex-none sm:min-w-[200px] group">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 min-h-[44px] rounded-lg border border-white/10 outline-none text-sm focus:ring-2 focus:ring-primary focus:border-primary bg-white/5 text-white placeholder-gray-500 shadow-sm transition-shadow"
              aria-label="Search Tasks"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center sm:border-l border-border-subtle sm:pl-4 w-full sm:w-auto">
            <Filter size={16} className="text-text-secondary hidden sm:block" />
            <select 
              value={filterPriority} 
              onChange={e => setFilterPriority(e.target.value)} 
              className="px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-white/5 text-white outline-none text-sm focus:ring-2 focus:ring-primary shadow-sm flex-1 sm:flex-none cursor-pointer transition-shadow"
              aria-label="Filter by Priority"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select 
              value={filterAssignee} 
              onChange={e => setFilterAssignee(e.target.value)} 
              className="px-3 py-2 min-h-[44px] rounded-lg border border-white/10 bg-white/5 text-white outline-none text-sm focus:ring-2 focus:ring-primary shadow-sm flex-1 sm:flex-none cursor-pointer transition-shadow"
              aria-label="Filter by Assignee"
            >
              <option value="All">All Assignees</option>
              <option value="Unassigned">Unassigned</option>
              {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="ml-auto hidden xl:block">
            <PriorityLegend />
          </div>
        </div>
      </div>

      <WorkflowStepper 
        activeProject={projects.find(p => String(p.id) === String(activeProjectId))}
        onStateChanged={() => fetchProjects()}
      />

      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:grid-rows-2 gap-4 flex-1 pb-4 min-h-0">
          {COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const isCollapsed = collapsedCols[col.id];

            return (
              <KanbanColumn 
                key={col.id}
                col={col}
                colTasks={colTasks}
                isCollapsed={isCollapsed}
                onToggle={toggleColumn}
                onAdd={setCreatingTaskStatus}
                onTaskOpen={setSelectedTask}
                dragJustHappenedRef={dragJustHappenedRef}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeDragTask ? <SortableTask task={activeDragTask} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projectId={activeProjectId}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={(updated) => {
            setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
            setSelectedTask(prev => ({ ...prev, ...updated }));
          }}
        />
      )}

      {/* Create Task Modal */}
      {creatingTaskStatus && (
        <CreateTaskModal 
          statusId={creatingTaskStatus}
          projectId={activeProjectId}
          onClose={() => setCreatingTaskStatus(null)}
          onSubmit={handleCreateTaskSubmit}
        />
      )}
    </div>
  );
}
