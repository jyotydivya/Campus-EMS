// src/pages/admin/Report.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function AdminReport() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/events').then(r => setEvents(r.data.events.filter(e => e.status === 'approved'))).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedEvent ? { eventId: selectedEvent } : {};
    api.get('/admin/report', { params }).then(r => setRegistrations(r.data.registrations)).catch(() => {}).finally(() => setLoading(false));
  }, [selectedEvent]);

  // Group by event for chart
  const byEvent = Object.values(
    registrations.reduce((acc, r) => {
      const title = r.event?.title || 'Unknown';
      acc[title] = acc[title] || { name: title.slice(0, 18), count: 0 };
      acc[title].count++;
      return acc;
    }, {})
  );

  // Group by department
  const byDept = Object.values(
    registrations.reduce((acc, r) => {
      const dept = r.student?.department || 'Unknown';
      acc[dept] = acc[dept] || { name: dept, value: 0 };
      acc[dept].value++;
      return acc;
    }, {})
  );

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Roll No', 'Department', 'Event', 'Date', 'Venue', 'Registered On'];
    const rows = registrations.map(r => [
      r.student?.name, r.student?.email, r.student?.rollNumber || '', r.student?.department || '',
      r.event?.title, r.event?.startDate ? format(new Date(r.event.startDate), 'yyyy-MM-dd') : '',
      r.event?.venue || '', format(new Date(r.createdAt), 'yyyy-MM-dd HH:mm'),
    ]);
    const csv = [headers, ...rows].map(row => row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `campus-ems-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Reports 📈</h1>
            <p className="text-muted">Participation analytics and data export</p>
          </div>
          <button className="btn btn-primary" onClick={exportCSV}>📥 Export CSV</button>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <select className="form-control" style={{ maxWidth: 320 }} value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
            <option value="">All Events</option>
            {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="stat-value">{registrations.length}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
            <div className="stat-value">{byEvent.length}</div>
            <div className="stat-label">Events Covered</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <div className="stat-value">{byDept.length}</div>
            <div className="stat-label">Departments</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--secondary)' }}>
            <div className="stat-value">{byEvent.length > 0 ? Math.round(registrations.length / byEvent.length) : 0}</div>
            <div className="stat-label">Avg per Event</div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>Registrations by Event</h3>
            {byEvent.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byEvent} margin={{ left: -10 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No data</p>}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>Distribution by Department</h3>
            {byDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={byDept} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {byDept.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>No data</p>}
          </div>
        </div>

        {/* Data table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem' }}>Detailed Registrations</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{registrations.length} records</span>
          </div>
          {loading ? <div className="spinner" /> :
            registrations.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📊</div><h3>No data</h3><p>Select an event or wait for registrations.</p></div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>Student</th><th>Roll No.</th><th>Department</th><th>Event</th><th>Event Date</th><th>Registered On</th></tr></thead>
                  <tbody>
                    {registrations.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.student?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.student?.email}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{r.student?.rollNumber || '—'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{r.student?.department || '—'}</td>
                        <td style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.event?.title}</td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{r.event?.startDate ? format(new Date(r.event.startDate), 'MMM d, yyyy') : '—'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{format(new Date(r.createdAt), 'MMM d, yyyy HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}
