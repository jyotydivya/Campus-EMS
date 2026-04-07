// src/components/Sidebar.js
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = {
  student: [
    { path: '/student', label: 'Browse Events', icon: '🏠', end: true },
    { path: '/student/registrations', label: 'My Registrations', icon: '📋' },
    { path: '/student/tickets', label: 'My Tickets', icon: '🎟️' },
  ],
  organizer: [
    { path: '/organizer', label: 'Dashboard', icon: '📊', end: true },
    { path: '/organizer/events/new', label: 'Create Event', icon: '➕' },
    { path: '/organizer/scan', label: 'Scan QR Code', icon: '📷' },
  ],
  admin: [
    { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { path: '/admin/events', label: 'Manage Events', icon: '🗓️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/report', label: 'Reports', icon: '📈' },
  ],
};

const roleLabels = { student: 'Student', organizer: 'Organizer', admin: 'Administrator' };
const roleColors = { student: 'badge-info', organizer: 'badge-purple', admin: 'badge-danger' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎓</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-900)' }}>Campus EMS</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>Event Management</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--gray-100)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <span className={`badge ${roleColors[user?.role]}`} style={{ marginTop: 2 }}>{roleLabels[user?.role]}</span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '0 0.75rem' }}>
        {items.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-sm)',
              marginBottom: 2, fontSize: '0.9rem', fontWeight: 500,
              color: isActive ? 'var(--primary)' : 'var(--gray-600)',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              textDecoration: 'none', transition: 'var(--transition)',
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--gray-100)' }}>
        <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
