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

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const TaskBoard = lazy(() => import('./pages/TaskBoard'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const NotesView = lazy(() => import('./pages/NotesView'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Landing = lazy(() => import('./pages/marketing/Landing'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Timeline = lazy(() => import('./pages/Timeline'));

const FallbackLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
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
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
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
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
  );
}

export default App;
