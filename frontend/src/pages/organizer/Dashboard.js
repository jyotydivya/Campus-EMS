// src/pages/organizer/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const statusColors = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', cancelled: 'badge-gray', completed: 'badge-info' };

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/organizer/mine').then(r => setEvents(r.data.events)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalReg = events.reduce((sum, e) => sum + e.currentParticipants, 0);
  const approved = events.filter(e => e.status === 'approved').length;
  const pending = events.filter(e => e.status === 'pending').length;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Organizer Dashboard</h1>
            <p className="text-muted">Manage your events and participants</p>
          </div>
          <Link to="/organizer/events/new" className="btn btn-primary">➕ Create Event</Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card" style={{ borderLeftColor: 'var(--primary)' }}>
            <div className="stat-value">{events.length}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
            <div className="stat-value">{approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--warning)' }}>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: 'var(--accent)' }}>
            <div className="stat-value">{totalReg}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
        </div>

        {/* Events table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem' }}>My Events</h2>
          </div>
          {loading ? <div className="spinner" /> :
            events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗓️</div>
                <h3>No events yet</h3>
                <p>Create your first event to get started.</p>
                <Link to="/organizer/events/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Event</Link>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Registrations</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id}>
                        <td style={{ fontWeight: 500 }}>{event.title}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{format(new Date(event.startDate), 'MMM d, yyyy')}</td>
                        <td style={{ fontSize: '0.85rem' }}>{event.venue}</td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{event.currentParticipants}</span>
                          <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>/{event.maxParticipants}</span>
                        </td>
                        <td><span className={`badge ${statusColors[event.status] || 'badge-gray'}`}>{event.status}</span></td>
                        <td>
                          <Link to={`/organizer/events/${event._id}`} className="btn btn-secondary btn-sm">Manage →</Link>
                        </td>
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
