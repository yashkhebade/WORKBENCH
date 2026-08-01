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
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              className="mt-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all"
            >
              Reset Session & Reload
            </button>
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
  const { user } = useAuth();
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
          <ProtectedRoute>
            <Layout>
              <PageWrapper><Dashboard /></PageWrapper>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/timeline" element={
          <ProtectedRoute>
            <Layout>
              <PageWrapper><Timeline /></PageWrapper>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/board" element={
          <ProtectedRoute>
            <Layout>
              <PageWrapper><TaskBoard /></PageWrapper>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <PageWrapper><CalendarView /></PageWrapper>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <Layout>
              <PageWrapper><NotesView /></PageWrapper>
            </Layout>
          </ProtectedRoute>
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
