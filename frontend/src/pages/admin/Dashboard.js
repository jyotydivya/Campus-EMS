// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content"><div className="spinner" /></main></div>;

  const chartData = stats?.topEvents?.map(e => ({ name: e.eventTitle?.slice(0, 20), registrations: e.count })) || [];

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Admin Dashboard 🛡️</h1>
          <p className="text-muted">System overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="stat-value">{stats?.totalEvents ?? 0}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
            <div className="stat-value">{stats?.pendingEvents ?? 0}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
            <div className="stat-value">{stats?.totalUsers ?? 0}</div>
            <div className="stat-label">Students</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <div className="stat-value">{stats?.totalRegistrations ?? 0}</div>
            <div className="stat-label">Registrations</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Pending approvals alert */}
          {stats?.pendingEvents > 0 && (
            <div style={{ gridColumn: '1 / -1', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: 'var(--radius)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#92400E' }}>{stats.pendingEvents} event{stats.pendingEvents > 1 ? 's' : ''} awaiting approval</div>
                  <div style={{ fontSize: '0.82rem', color: '#B45309' }}>Review and approve or reject pending event submissions</div>
                </div>
              </div>
              <Link to="/admin/events?status=pending" className="btn btn-sm" style={{ background: '#F59E0B', color: 'white', border: 'none' }}>Review Now →</Link>
            </div>
          )}

          {/* Top events chart */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>📊 Top Events by Registrations</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="registrations" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem 0' }}>No data yet</p>}
          </div>

          {/* Upcoming events */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem' }}>🗓️ Upcoming Events</h3>
              <Link to="/admin/events" style={{ fontSize: '0.82rem', color: 'var(--primary)' }}>View all →</Link>
            </div>
            {stats?.recentEvents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.recentEvents.map(event => (
                  <div key={event._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: event.category?.color || 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                      {event.category?.icon || '🎪'}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{format(new Date(event.startDate), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No upcoming events</p>}
          </div>

          {/* Quick links */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/admin/events" className="btn btn-outline">🗓️ Manage Events</Link>
              <Link to="/admin/users" className="btn btn-outline">👥 Manage Users</Link>
              <Link to="/admin/categories" className="btn btn-outline">🏷️ Categories</Link>
              <Link to="/admin/report" className="btn btn-outline">📈 View Reports</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
