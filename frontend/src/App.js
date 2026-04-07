// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Student pages
import StudentHome from './pages/student/Home';
import EventDetail from './pages/student/EventDetail';
import MyRegistrations from './pages/student/MyRegistrations';
import MyTickets from './pages/student/MyTickets';

// Organizer pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvent from './pages/organizer/ManageEvent';
import ScanQR from './pages/organizer/ScanQR';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminReport from './pages/admin/Report';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '4rem' }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

      {/* Root redirect based on role */}
      <Route path="/" element={
        user?.role === 'admin' ? <Navigate to="/admin" /> :
        user?.role === 'organizer' ? <Navigate to="/organizer" /> :
        user ? <Navigate to="/student" /> :
        <Navigate to="/login" />
      } />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentHome /></ProtectedRoute>} />
      <Route path="/student/events/:id" element={<ProtectedRoute roles={['student']}><EventDetail /></ProtectedRoute>} />
      <Route path="/student/registrations" element={<ProtectedRoute roles={['student']}><MyRegistrations /></ProtectedRoute>} />
      <Route path="/student/tickets" element={<ProtectedRoute roles={['student']}><MyTickets /></ProtectedRoute>} />

      {/* Organizer routes */}
      <Route path="/organizer" element={<ProtectedRoute roles={['organizer']}><OrganizerDashboard /></ProtectedRoute>} />
      <Route path="/organizer/events/new" element={<ProtectedRoute roles={['organizer']}><CreateEvent /></ProtectedRoute>} />
      <Route path="/organizer/events/:id" element={<ProtectedRoute roles={['organizer']}><ManageEvent /></ProtectedRoute>} />
      <Route path="/organizer/scan" element={<ProtectedRoute roles={['organizer']}><ScanQR /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><AdminEvents /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategories /></ProtectedRoute>} />
      <Route path="/admin/report" element={<ProtectedRoute roles={['admin']}><AdminReport /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3500, style: { fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' } }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
