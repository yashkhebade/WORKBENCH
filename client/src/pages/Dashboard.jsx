import React, { useState, useEffect, useCallback, memo } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FolderOpen, User, Clock, CheckCircle, TrendingUp, TrendingDown, Calendar, FileText, Activity, Check } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useProjects } from '../contexts/ProjectContext';
import { Link } from 'react-router-dom';

// --- WORKFLOW STEPPER COMPONENT ---
const DEFAULT_WORKFLOW_STEPS = ['Ideation', 'Design (KiCad)', 'Prototyping (Code)', 'Testing', 'Done'];

function WorkflowStepper({ activeProject, onStateChanged }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parse persisted custom steps or fall back to defaults
  const getSteps = (proj) => {
    if (!proj) return DEFAULT_WORKFLOW_STEPS;
    try {
      const parsed = proj.workflow_steps ? JSON.parse(proj.workflow_steps) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKFLOW_STEPS;
    } catch { return DEFAULT_WORKFLOW_STEPS; }
  };

  const [editSteps, setEditSteps] = useState(() => getSteps(activeProject));

  // Sync when active project changes
  useEffect(() => {
    setEditSteps(getSteps(activeProject));
    setIsEditing(false);
  }, [activeProject?.id]);

  if (!activeProject) return null;

  const steps = getSteps(activeProject);
  const currentState = activeProject.workflow_state || steps[0];
  const currentIndex = steps.indexOf(currentState);

  const handleStateClick = async (newState) => {
    if (newState === currentState || isEditing) return;
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

  // ── Edit mode helpers ──────────────────────────────────────
  const addStep = () => setEditSteps(s => [...s, `Step ${s.length + 1}`]);

  const removeStep = (i) => {
    if (editSteps.length <= 2) return; // must keep at least 2
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
      // If current workflow_state no longer exists, move to first step
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
    <div className="glass-panel mb-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-semibold text-text-primary flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          {isEditing ? 'Editing Workflow:' : 'Active Project Workflow:'}{' '}
          <span className="text-accent-liquid-blue">{activeProject.name}</span>
        </h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => { setEditSteps(steps); setIsEditing(true); }}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-text-primary text-text-primary bg-white hover:bg-sky-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Workflow
            </button>
          ) : (
            <>
              <button onClick={cancelEdit} className="text-xs font-medium px-3 py-1.5 rounded-md border border-text-primary text-text-primary bg-white hover:bg-sky-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={saveSteps}
                disabled={isSaving}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md text-white bg-zinc-900 hover:scale-105 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isSaving ? 'Saving…' : '✓ Save Workflow'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Edit Mode ── */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground mb-1">Drag to reorder • Click labels to rename • Min. 2 steps</p>
          {editSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 group">
              {/* Order controls */}
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-20 transition-colors text-xs">▲</button>
                <button onClick={() => moveStep(i, 1)} disabled={i === editSteps.length - 1} className="w-5 h-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-20 transition-colors text-xs">▼</button>
              </div>

              {/* Step number bubble */}
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--color-primary)' }}>
                {i + 1}
              </div>

              {/* Inline rename input */}
              <input
                value={step}
                onChange={e => renameStep(i, e.target.value)}
                className="flex-1 bg-background border border-border/60 rounded-md px-2.5 py-1 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Step ${i + 1} name…`}
              />

              {/* Delete */}
              <button
                onClick={() => removeStep(i)}
                disabled={editSteps.length <= 2}
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-20 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add step */}
          <button
            onClick={addStep}
            className="mt-1 flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all"
            style={{ color: 'var(--color-primary)' }}
          >
            <span className="text-lg leading-none">+</span> Add Step
          </button>
        </div>
      ) : (
        /* ── View Mode (original stepper) ── */
        <div className="flex items-center overflow-x-auto min-w-0 pb-1 pt-2 px-2">
          {steps.map((state, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            return (
              <React.Fragment key={state}>
                <div
                  onClick={() => handleStateClick(state)}
                  className={`flex flex-col items-center cursor-pointer transition-all shrink-0 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                      ${isActive ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white scale-110 ring-4 ring-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.3)]'
                      : isCompleted ? 'bg-[var(--status-done)] border-[var(--status-done)] text-white'
                      : 'bg-white border-border-subtle text-text-secondary hover:border-accent-liquid-blue hover:scale-105'
                    }`}
                  >
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : index + 1}
                  </div>
                  <span className={`mt-3 text-xs font-medium whitespace-nowrap transition-colors ${isActive ? 'text-accent-liquid-blue font-bold' : 'text-text-secondary'}`}>
                    {state}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-1 mx-2 rounded-full bg-border-subtle overflow-hidden shrink-0 -translate-y-3 relative">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-accent-liquid-blue to-transparent transition-all duration-500 ease-in-out"
                      style={{ width: isCompleted ? '100%' : '0%' }}
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
// --- END WORKFLOW STEPPER ---

// Skeleton Loader Component
const SkeletonCard = memo(({ height }) => (
  <div className="glass-panel animate-shimmer" style={{ height: height || '120px', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', opacity: 0.7 }}>
    <div style={{ width: '40%', height: '20px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
    <div style={{ width: '60%', height: '30px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px' }} />
  </div>
));

export default function Dashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { projects, activeProjectId, setActiveProjectId, fetchProjects } = useProjects();
  const [tasks, setTasks] = useState([]);
  const [workflowState, setWorkflowState] = useState('');
  
  // Dashboard Metrics State
  const [metrics, setMetrics] = useState({
    activeTasks: 0,
    completedTasks: 0,
    timeLogged: 0,
    upcomingDeadlines: 0
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
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

  const handleQuickCreateProject = async () => {
    const name = prompt("Enter new project name:");
    if (!name) return;
    try {
      await api.post('/projects', { name, description: '' });
      fetchDashboardData();
      fetchProjects();
    } catch (e) {
      console.error('Failed to create project', e);
    }
  };

  const StatCard = memo(({ icon: Icon, label, value, trend, trendUp }) => (
    <div className="glass-panel p-6 flex flex-col relative transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_12px_28px_rgba(0,0,0,0.08)]">
      <div className="absolute top-6 right-6">
        <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />} {trend}
        </div>
      </div>
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-accent-liquid-blue mb-4">
        <Icon size={20} strokeWidth={2.25} />
      </div>
      <div>
        <div className="text-4xl font-extrabold tracking-tight text-text-primary">{value}</div>
        <div className="text-sm font-medium text-text-secondary mt-1">{label}</div>
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
        <div className="card text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">There was a problem connecting to the server.</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-primary mb-1">Dashboard</h1>
          <p className="text-text-secondary text-sm font-medium">Welcome back, {user?.name}!</p>
        </div>
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
        ) : (
          <>
            <StatCard icon={FolderOpen} label="Active Projects" value={data.stats.active_projects} trend={data.trends.active_projects.value} trendUp={data.trends.active_projects.trendUp} />
            <StatCard icon={User} label="My Tasks" value={data.stats.my_tasks} trend={data.trends.my_tasks.value} trendUp={data.trends.my_tasks.trendUp} />
            <StatCard icon={Clock} label="In Progress" value={data.stats.in_progress} trend={data.trends.in_progress.value} trendUp={data.trends.in_progress.trendUp} />
            <StatCard icon={CheckCircle} label="Completed" value={data.stats.completed_tasks} trend={data.trends.completed_tasks.value} trendUp={data.trends.completed_tasks.trendUp} />
          </>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Active Projects */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
                <FolderOpen size={18} strokeWidth={2.25} />
              </div>
              Active Projects
            </h3>
            <div className="flex flex-col gap-4">
              {loading ? <SkeletonCard height="60px" /> : data.activeProjects.map(p => {
                const progress = p.total_tasks > 0 ? (p.completed_tasks / p.total_tasks) * 100 : 0;
                return (
                  <div key={p.id} className="flex flex-col gap-2 p-4 rounded-xl border border-border-subtle bg-white/40">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary">{p.name}</span>
                      <span className="text-sm font-medium text-text-secondary">{p.completed_tasks} / {p.total_tasks} Tasks</span>
                    </div>
                    <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                      <div className="h-full bg-accent-liquid-blue transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
              {!loading && data.activeProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <FolderOpen size={24} strokeWidth={1.5} className="text-text-secondary/40 mb-2" />
                  <span className="text-text-secondary text-sm font-medium mb-4">No active projects found.</span>
                  <button onClick={handleQuickCreateProject} className="px-4 py-2 bg-accent-liquid-blue text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors shadow-sm">
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Tasks */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
                <CheckCircle size={18} strokeWidth={2.25} />
              </div>
              My Tasks
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="80px" /> : data.myTasks.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 border-b border-border-subtle last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">{t.title}</span>
                    <span className="text-xs font-medium text-text-secondary mt-0.5">Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'None'}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide ${t.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-bg-subtle text-text-secondary'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
              {!loading && data.myTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle size={24} strokeWidth={1.5} className="text-text-secondary/40 mb-2" />
                  <span className="text-text-secondary text-sm font-medium mb-4">You're all caught up!</span>
                  <Link to="/board" className="px-4 py-2 bg-white border border-border-subtle text-text-primary rounded-lg text-sm font-medium hover:bg-bg-subtle transition-colors shadow-sm">
                    Go to Task Board
                  </Link>
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Sidebar Column */}
        <div className="flex flex-col gap-6">
          
          {/* Upcoming Deadlines */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
                <Calendar size={18} strokeWidth={2.25} />
              </div>
              Upcoming Deadlines
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="60px" /> : data.deadlines.map((d, i) => (
                <div key={i} className="flex gap-3 items-center py-2">
                  <div className={`w-1 h-8 rounded-full ${d.type === 'task' ? 'bg-accent-liquid-blue' : 'bg-amber-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{d.title}</span>
                    <span className="text-xs font-medium text-text-secondary mt-0.5">{new Date(d.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {!loading && data.deadlines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar size={24} strokeWidth={1.5} className="text-text-secondary/40 mb-2" />
                  <span className="text-text-secondary text-sm font-medium">No impending deadlines</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Files */}
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-1.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
                <FileText size={18} strokeWidth={2.25} />
              </div>
              Recent Files
            </h3>
            <div className="flex flex-col gap-3">
              {loading ? <SkeletonCard height="60px" /> : data.recentFiles.map((f, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="flex flex-col max-w-[70%]">
                    <span className="text-sm font-medium text-text-primary truncate">{f.name}</span>
                    <span className="text-xs font-medium text-text-secondary mt-0.5">by {f.uploader_name || 'System'}</span>
                  </div>
                  <span className="text-xs font-bold bg-bg-subtle text-text-secondary px-2 py-0.5 rounded-full">v{f.version_number}</span>
                </div>
              ))}
              {!loading && data.recentFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <FileText size={24} strokeWidth={1.5} className="text-text-secondary/40 mb-2" />
                  <span className="text-text-secondary text-sm font-medium">No files uploaded yet</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Activity Feed Bottom Section */}
      <div className="glass-panel p-6">
        <h3 className="font-semibold text-text-primary flex items-center gap-1.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-accent-liquid-blue shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          Activity Timeline
        </h3>
        <div className="flex flex-col gap-3">
          {loading ? <SkeletonCard height="40px" /> : data.activity.map((a, i) => (
            <div key={i} className={`flex items-center gap-4 py-2 ${i !== data.activity.length - 1 ? 'border-b border-border-subtle' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-accent-liquid-blue shrink-0">
                {a.user_name ? a.user_name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-sm text-text-primary"><b className="font-semibold text-text-primary">{a.user_name || 'Someone'}</b> {a.action.toLowerCase()}: {a.name}</span>
                <span className="text-xs font-medium text-text-secondary mt-0.5">{new Date(a.time).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!loading && data.activity.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Activity size={24} strokeWidth={1.5} className="text-text-secondary/40 mb-2" />
              <span className="text-text-secondary text-sm font-medium">No activity yet</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
