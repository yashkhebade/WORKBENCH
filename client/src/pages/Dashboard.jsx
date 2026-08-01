import React, { useState, useEffect, useCallback, memo } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FolderOpen, User, Clock, CheckCircle, TrendingUp, TrendingDown, Calendar, FileText, Activity, AlertCircle, Plus, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useProjects } from '../contexts/ProjectContext';
import { Link, useNavigate } from 'react-router-dom';
import CreateProjectModal from '../components/ui/CreateProjectModal';

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
  const [serverWaking, setServerWaking] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    setLoading(true);
    let retries = 12;
    let delay = 3000;
    while (retries > 0) {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
        setServerWaking(false);
        setLoading(false);
        return;
      } catch (err) {
        if (err.response) {
          console.error('Dashboard fetch error:', err);
          setError('Failed to load dashboard data.');
          setLoading(false);
          setServerWaking(false);
          return;
        }
        retries -= 1;
        if (retries === 0) {
          setError('Could not reach the server after 60 seconds.');
          setLoading(false);
          setServerWaking(false);
        } else {
          setServerWaking(true);
          setLoading(false);
          await new Promise(r => setTimeout(r, delay));
        }
      }
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

  const StatCard = memo(({ icon: Icon, label, value, trend, trendUp, link }) => {
    const content = (
      <div className="glass-panel p-6 flex flex-col relative bg-[#18181b] border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 cursor-pointer h-full group">
        <div className="absolute top-6 right-6">
          <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {trendUp ? <TrendingUp size={12} strokeWidth={3} /> : <TrendingDown size={12} strokeWidth={3} />} {trend}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-transform">
          <Icon size={20} strokeWidth={2.25} />
        </div>
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-white">{value}</div>
          <div className="text-xs font-medium text-gray-400 mt-1">{label}</div>
        </div>
      </div>
    );
    return link ? <Link to={link}>{content}</Link> : content;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (serverWaking) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="glass-panel text-center p-8 bg-[#18181b] border border-white/10 rounded-2xl flex flex-col items-center gap-4 max-w-sm">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">⏳ Server is waking up...</h2>
            <p className="text-gray-400 text-sm">Render's free server was sleeping. It takes <strong className="text-white">30–60 seconds</strong> to boot. Retrying automatically...</p>
          </div>
          <div className="w-48 bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="glass-panel text-center p-8 bg-[#18181b] border border-white/10 rounded-2xl">
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4 text-sm">{error || 'There was a problem connecting to the server.'}</p>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-medium" onClick={fetchDashboardData}>Try Again</button>
        </div>
      </div>
    );
  }

  const overdueCount = data.thisWeek?.overdue_count || 0;
  const hasOverdue = overdueCount > 0;

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
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
        >
          <Plus size={16} />
          <span>Create Project</span>
        </button>
      </div>

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
            <StatCard link="/board" icon={FolderOpen} label="Active Projects" value={data.stats.active_projects} trend={data.trends.active_projects.value} trendUp={data.trends.active_projects.trendUp} />
            <StatCard link="/board" icon={User} label="My Tasks" value={data.stats.my_tasks} trend={data.trends.my_tasks.value} trendUp={data.trends.my_tasks.trendUp} />
            <StatCard link="/board" icon={Clock} label="In Progress" value={data.stats.in_progress} trend={data.trends.in_progress.value} trendUp={data.trends.in_progress.trendUp} />
            <StatCard link="/board" icon={CheckCircle} label="Completed Tasks" value={data.stats.completed_tasks} trend={data.trends.completed_tasks.value} trendUp={data.trends.completed_tasks.trendUp} />
          </>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* My Tasks */}
          <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl flex flex-col h-full">
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

            <div className="flex flex-col gap-3 flex-1">
              {loading ? <SkeletonCard height="80px" /> : data.myTasks.map(t => (
                <Link to="/board" key={t.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex flex-col">
                    <span className="font-medium text-white text-sm group-hover:text-primary transition-colors">{t.title}</span>
                    <span className="text-xs text-gray-400 mt-0.5">Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'No date'}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wide ${t.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}`}>
                    {t.priority}
                  </span>
                </Link>
              ))}

              {!loading && data.myTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 flex-1 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
                  <CheckCircle size={28} strokeWidth={1.5} className="text-gray-500 mb-2 opacity-50" />
                  <span className="text-gray-400 text-xs font-medium mb-3">You're all caught up!</span>
                  <Link to="/board" className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/10 hover:-translate-y-0.5 transition-all shadow-sm">
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
            <div className="glass-panel p-5 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-primary/20 rounded-2xl flex flex-col gap-3 transition-transform hover:-translate-y-0.5 hover:shadow-lg duration-300 cursor-pointer">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>This Week Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-2xl font-bold text-white">{data.thisWeek.due_this_week || 0}</span>
                  <span className="text-[11px] text-gray-400">Due This Week</span>
                </div>
                <div className={`p-3 rounded-xl flex flex-col items-center text-center border transition-colors ${hasOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                  <span className={`text-2xl font-bold ${hasOverdue ? 'text-red-400' : 'text-white'}`}>{overdueCount}</span>
                  <span className={`text-[11px] ${hasOverdue ? 'text-red-300' : 'text-gray-400'}`}>Overdue Tasks</span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="glass-panel p-5 bg-[#18181b] border border-white/10 rounded-2xl flex flex-col">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar size={18} strokeWidth={2.25} />
              </div>
              Upcoming Deadlines
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="60px" /> : data.deadlines.map((d, i) => (
                <div key={i} className="flex gap-3 items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className={`w-1 h-8 rounded-full ${d.type === 'task' ? 'bg-primary' : 'bg-amber-400'}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{d.title}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{new Date(d.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {!loading && data.deadlines.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-xs text-gray-500 mb-2">No impending deadlines</span>
                  <Link to="/board" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                    + Add Deadline
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Files */}
          <div className="glass-panel p-5 bg-[#18181b] border border-white/10 rounded-2xl flex flex-col">
            <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FileText size={18} strokeWidth={2.25} />
              </div>
              Recent Files
            </h3>
            <div className="flex flex-col gap-2">
              {loading ? <SkeletonCard height="60px" /> : data.recentFiles.map((f, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 transition-all cursor-pointer">
                  <div className="flex flex-col max-w-[70%]">
                    <span className="text-xs font-semibold text-white truncate">{f.name}</span>
                    <span className="text-[10px] text-gray-400">by {f.uploader_name || 'System'}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">v{f.version_number}</span>
                </div>
              ))}
              {!loading && data.recentFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-xs text-gray-500 mb-2">No files uploaded yet</span>
                  <Link to="/files" className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                    + Upload a File
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Activity Feed Bottom Section */}
      <div className="glass-panel p-6 bg-[#18181b] border border-white/10 rounded-2xl transition-all duration-300 hover:shadow-lg">
        <h3 className="font-semibold text-white flex items-center gap-2 text-base mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Activity size={18} strokeWidth={2.25} />
          </div>
          Activity Feed
        </h3>
        <div className="flex flex-col gap-2">
          {loading ? <SkeletonCard height="40px" /> : data.activity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer hover:-translate-x-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                {a.user_name ? a.user_name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-300"><b className="font-semibold text-white">{a.user_name || 'Team Member'}</b> {a.action.toLowerCase()}: {a.name}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{new Date(a.time).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!loading && data.activity.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <Activity size={24} className="text-gray-500 mb-2 opacity-50" />
              <span className="text-gray-400 text-xs font-medium">Your team's recent activity will appear here.</span>
            </div>
          )}
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
