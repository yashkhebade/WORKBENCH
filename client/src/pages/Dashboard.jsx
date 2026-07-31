import React, { useState, useEffect, useCallback, memo } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FolderOpen, User, Clock, CheckCircle, TrendingUp, TrendingDown, Calendar, FileText, Activity, Check, AlertCircle, Plus, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useProjects } from '../contexts/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/ui/CreateProjectModal';

// --- WORKFLOW STEPPER COMPONENT ---
const DEFAULT_WORKFLOW_STEPS = ['Ideation', 'Design (KiCad)', 'Prototyping (Code)', 'Testing', 'Done'];

function WorkflowStepper({ activeProject, onStateChanged }) {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getSteps = (proj) => {
    if (!proj) return DEFAULT_WORKFLOW_STEPS;
    try {
      const parsed = proj.workflow_steps ? JSON.parse(proj.workflow_steps) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKFLOW_STEPS;
    } catch { return DEFAULT_WORKFLOW_STEPS; }
  };

  const [editSteps, setEditSteps] = useState(() => getSteps(activeProject));

  useEffect(() => {
    setEditSteps(getSteps(activeProject));
    setIsEditing(false);
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const steps = getSteps(activeProject);
  const currentState = activeProject.workflow_state || steps[0];
  const currentIndex = steps.indexOf(currentState);

  const handleStateClick = async (newState) => {
    if (isEditing) return;
    if (newState === currentState) {
      navigate(`/board?stage=${encodeURIComponent(newState)}`);
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.put(`/projects/${activeProject.id}/state`, { workflow_state: newState });
      onStateChanged(activeProject.id, response.data.workflow_state);
    } catch (error) {
      console.error('Failed to update state', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const addStep = () => setEditSteps(s => [...s, `Step ${s.length + 1}`]);

  const removeStep = (i) => {
    if (editSteps.length <= 2) return;
    setEditSteps(s => s.filter((_, idx) => idx !== i));
  };

  const renameStep = (i, val) =>
    setEditSteps(s => s.map((step, idx) => idx === i ? val : step));

  const moveStep = (i, dir) => {
    const next = i + dir;
    if (next < 0 || next >= editSteps.length) return;
    setEditSteps(s => {
      const arr = [...s];
      [arr[i], arr[next]] = [arr[next], arr[i]];
      return arr;
    });
  };

  const saveSteps = async () => {
    const cleaned = editSteps.map(s => s.trim()).filter(Boolean);
    if (cleaned.length < 2) return;
    setIsSaving(true);
    try {
      await api.put(`/projects/${activeProject.id}/workflow-steps`, { steps: cleaned });
      if (!cleaned.includes(currentState)) {
        await api.put(`/projects/${activeProject.id}/state`, { workflow_state: cleaned[0] });
        onStateChanged(activeProject.id, cleaned[0], cleaned);
      } else {
        onStateChanged(activeProject.id, currentState, cleaned);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save workflow steps', err);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditSteps(steps);
    setIsEditing(false);
  };

  return (
    <div className="glass-panel mb-6 p-6 bg-[#18181b] border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          {isEditing ? 'Editing Workflow:' : 'Active Project Workflow:'}{' '}
          <span className="text-primary font-bold">{activeProject.name}</span>
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => { setEditSteps(steps); setIsEditing(true); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors shadow-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Steps
            </button>
          ) : (
            <>
              <button onClick={cancelEdit} className="text-xs font-medium px-3 py-1.5 rounded-xl border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveSteps}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {isSaving ? 'Saving…' : '✓ Save Workflow'}
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400 mb-1">Click step titles to rename • Drag arrows to reorder</p>
          {editSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 group">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs">▲</button>
                <button onClick={() => moveStep(i, 1)} disabled={i === editSteps.length - 1} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors text-xs">▼</button>
              </div>

              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-primary">
                {i + 1}
              </div>

              <input
                value={step}
                onChange={e => renameStep(i, e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Step ${i + 1} name…`}
              />

              <button
                onClick={() => removeStep(i)}
                disabled={editSteps.length <= 2}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-20 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addStep}
            className="mt-1 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl border border-dashed border-white/20 text-primary hover:bg-primary/10 transition-all cursor-pointer"
          >
            <span className="text-base font-bold">+</span> Add Step
          </button>
        </div>
      ) : (
        <div className="flex items-center overflow-x-auto min-w-0 pb-1 pt-2 px-2">
          {steps.map((state, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            return (
              <React.Fragment key={state}>
                <div
                  onClick={() => handleStateClick(state)}
                  title="Click to activate stage or view board"
                  className={`flex flex-col items-center cursor-pointer transition-all shrink-0 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300
                      ${isActive ? 'bg-primary border-primary text-white scale-110 ring-4 ring-primary/20 shadow-lg'
                      : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary hover:scale-105'
                    }`}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : index + 1}
                  </div>
                  <span className={`mt-3 text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {state}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-1 mx-2 rounded-full bg-white/10 overflow-hidden shrink-0 -translate-y-3 relative">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-in-out"
                      style={{ width: isCompleted ? '100%' : isActive ? '50%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

const SkeletonCard = memo(({ height }) => (
  <div className="glass-panel animate-shimmer bg-[#18181b] rounded-2xl border border-white/10" style={{ height: height || '120px', padding: '1.25rem', opacity: 0.7 }} />
));

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { projects, fetchProjects } = useProjects();
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => fetchDashboardData();
      socket.on('task:updated', handleUpdate);
      socket.on('file:uploaded', handleUpdate);
      return () => {
        socket.off('task:updated', handleUpdate);
        socket.off('file:uploaded', handleUpdate);
      };
    }
  }, [socket, fetchDashboardData]);

  const StatCard = memo(({ icon: Icon, label, value, trend, trendUp }) => (
    <div className="glass-panel p-6 flex flex-col relative bg-[#18181b] border border-white/10 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute top-6 right-6">
        <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {trendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />} {trend}
        </div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <div>
        <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
        <div className="text-xs font-medium text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  ));

  const onProjectStateChanged = useCallback((projectId, newState, newSteps) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        activeProjects: prev.activeProjects.map(p =>
          p.id === projectId
            ? {
                ...p,
                workflow_state: newState,
                ...(newSteps ? { workflow_steps: JSON.stringify(newSteps) } : {})
              }
            : p
        )
      };
    });
  }, []);

  if (!loading && !data) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="glass-panel text-center p-8 bg-[#18181b] border border-white/10 rounded-2xl">
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4 text-sm">There was a problem connecting to the server.</p>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium" onClick={fetchDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard Overview</h1>
          <p className="text-gray-400 text-xs font-medium">Welcome back, <span className="text-white font-semibold">{user?.name}</span>!</p>
        </div>
        <button
          onClick={() => setShowCreateProjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Project</span>
        </button>
      </div>

      {/* WORKFLOW STEPPER */}
      {!loading && data?.activeProjects?.length > 0 && (
        <WorkflowStepper 
          activeProject={data.activeProjects[0]} 
          onStateChanged={onProjectStateChanged}
        />
      )}
      
      {/* 4 Stat Cards Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : error || !data || !data.trends ? (
          <div className="col-span-4 p-6 glass-panel flex flex-col items-center justify-center text-red-400 bg-[#18181b] border border-white/10 rounded-2xl">
            <AlertCircle size={24} className="mb-2 opacity-80" />
            <p>{error || "Unable to load dashboard statistics."}</p>
          </div>
        ) : (
          <>
            <StatCard icon={FolderOpen} label="Active Projects" value={data.stats.active_projects} trend={data.trends.active_projects.value} trendUp={data.trends.active_projects.trendUp} />
            <StatCard icon={User} label="My Tasks" value={data.stats.my_tasks} trend={data.trends.my_tasks.value} trendUp={data.trends.my_tasks.trendUp} />
            <StatCard icon={Clock} label="In Progress" value={data.stats.in_progress} trend={data.trends.in_progress.value} trendUp={data.trends.in_progress.trendUp} />
            <StatCard icon={CheckCircle} label="Completed Tasks" value={data.stats.completed_tasks} trend={data.trends.completed_tasks.value} trendUp={data.trends.completed_tasks.trendUp} />
          </>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Projects */}
          <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FolderOpen size={18} strokeWidth={2.25} />
                </div>
                Active Projects
              </h3>
              <button onClick={() => setShowCreateProjectModal(true)} className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                + New Project
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {loading ? <SkeletonCard height="60px" /> : data.activeProjects.map(p => {
                const progress = p.total_tasks > 0 ? (p.completed_tasks / p.total_tasks) * 100 : 0;
                return (
                  <div key={p.id} className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {p.owner_name ? p.owner_name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-sm">{p.name}</span>
                          <span className="text-[10px] text-gray-500">Updated {new Date(p.updated_at || p.created_at).toLocaleDateString()} • Owner: {p.owner_name}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400">{p.completed_tasks} / {p.total_tasks} Tasks</span>
                    </div>

                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}

              {!loading && data.activeProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                  <FolderOpen size={28} strokeWidth={1.5} className="text-gray-500 mb-2 opacity-50" />
                  <span className="text-gray-400 text-xs font-medium mb-3">No active projects found.</span>
                  <button onClick={() => setShowCreateProjectModal(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                    + Add your first project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Tasks */}
          <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2 text-base">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <CheckCircle size={18} strokeWidth={2.25} />
                </div>
                My Priority Tasks
              </h3>
              <Link to="/board" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
                View Board <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="80px" /> : data.myTasks.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-medium text-white text-sm">{t.title}</span>
                    <span className="text-xs text-gray-400 mt-0.5">Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${t.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}

              {!loading && data.myTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                  <CheckCircle size={28} strokeWidth={1.5} className="text-gray-500 mb-2 opacity-50" />
                  <span className="text-gray-400 text-xs font-medium mb-3">You're all caught up!</span>
                  <Link to="/board" className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors shadow-sm">
                    + Add your first task
                  </Link>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Sidebar Column */}
        <div className="flex flex-col gap-6">
          
          {/* This Week Quick Summary */}
          {data?.thisWeek && (
            <div className="glass-panel p-5 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-primary/20 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>This Week Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col">
                  <span className="text-2xl font-bold text-white">{data.thisWeek.due_this_week || 0}</span>
                  <span className="text-[11px] text-gray-400">Due This Week</span>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col">
                  <span className="text-2xl font-bold text-red-400">{data.thisWeek.overdue_count || 0}</span>
                  <span className="text-[11px] text-red-300">Overdue Tasks</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar size={18} strokeWidth={2.25} />
              </div>
              Upcoming Deadlines
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="60px" /> : data.deadlines.map((d, i) => (
                <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className={`w-1 h-8 rounded-full ${d.type === 'task' ? 'bg-primary' : 'bg-amber-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{d.title}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{new Date(d.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {!loading && data.deadlines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-gray-500">
                  No impending deadlines
                </div>
              )}
            </div>
          </div>

          {/* Recent Files */}
          <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText size={18} strokeWidth={2.25} />
              </div>
              Recent Files
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="60px" /> : data.recentFiles.map((f, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col max-w-[70%]">
                    <span className="text-xs font-semibold text-white truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-400">by {f.uploader_name || 'System'}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">v{f.version_number}</span>
                </div>
              ))}
              {!loading && data.recentFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-gray-500">
                  No files uploaded yet
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Activity Feed Bottom Section */}
      <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl">
        <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          Activity Feed
        </h3>
        <div className="flex flex-col gap-2">
          {loading ? <SkeletonCard height="40px" /> : data.activity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {a.user_name ? a.user_name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-300"><b className="font-semibold text-white">{a.user_name || 'Team Member'}</b> {a.action.toLowerCase()}: {a.name}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{new Date(a.time).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateProjectModal 
        isOpen={showCreateProjectModal} 
        onClose={() => setShowCreateProjectModal(false)} 
        onSuccess={() => { fetchDashboardData(); fetchProjects(); }}
      />
      
    </div>
  );
}
