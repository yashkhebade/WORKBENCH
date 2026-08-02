import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/PageWrapper';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProjectProvider } from './contexts/ProjectContext';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/toast';
import { Loader2 } from 'lucide-react';

import Login from './pages/Login';
import Signup from './pages/Signup';
import TaskBoard from './pages/TaskBoard';
import CalendarView from './pages/CalendarView';
import NotesView from './pages/NotesView';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Timeline from './pages/Timeline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#18181b] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-gray-400 text-sm">The application encountered an unexpected error.</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => { window.location.reload(); }}
                className="px-6 py-2.5 bg-white/10 text-white rounded-xl text-xs font-semibold hover:bg-white/20 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all"
              >
                Sign out & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FallbackLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-[#09090b]">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
  </div>
);
const ProtectedRoute = ({ children }) => {
  const { user, loading, wakingServer } = useAuth();
  
  if (loading || wakingServer) {
    return (
      <div className="flex-1 p-6 flex flex-col gap-6 animate-pulse w-full max-w-[1440px] mx-auto mt-6">
        {wakingServer && (
          <div className="bg-primary/20 text-primary-foreground p-4 rounded-xl border border-primary/30 flex items-center gap-3 shadow-lg mb-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold text-sm">Waking up Render backend (this takes ~30s)...</span>
          </div>
        )}
        <div className="h-10 bg-white/5 rounded-xl w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
          <div className="h-32 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-64 bg-white/5 rounded-2xl mt-4" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
        <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={
          <Layout>
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/timeline" element={
          <Layout>
            <ProtectedRoute>
              <PageWrapper><Timeline /></PageWrapper>
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/board" element={
          <Layout>
            <ProtectedRoute>
              <PageWrapper><TaskBoard /></PageWrapper>
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/calendar" element={
          <Layout>
            <ProtectedRoute>
              <PageWrapper><CalendarView /></PageWrapper>
            </ProtectedRoute>
          </Layout>
        } />
        
        <Route path="/notes" element={
          <Layout>
            <ProtectedRoute>
              <PageWrapper><NotesView /></PageWrapper>
            </ProtectedRoute>
          </Layout>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        <TooltipProvider>
          <AuthProvider>
            <SocketProvider>
              <ProjectProvider>
                <Router>
                  <Suspense fallback={<FallbackLoader />}>
                    <AnimatedRoutes />
                  </Suspense>
                </Router>
              </ProjectProvider>
            </SocketProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
