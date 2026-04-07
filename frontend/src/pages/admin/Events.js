// src/pages/admin/Events.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const STATUS_COLORS = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', cancelled: 'badge-gray', completed: 'badge-info' };

function RejectModal({ event, onClose, onReject }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    await onReject(event._id, reason);
    setLoading(false);
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Reject Event</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Rejecting: <strong>{event.title}</strong>
        </p>
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label>Reason for rejection</label>
          <textarea className="form-control" rows={3} placeholder="Explain why this event is being rejected..." value={reason} onChange={e => setReason(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-danger" onClick={handle} disabled={loading}>{loading ? 'Rejecting...' : 'Reject Event'}</button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchEvents = () => {
    const params = filterStatus !== 'all' ? { status: filterStatus } : {};
    api.get('/admin/events', { params }).then(r => setEvents(r.data.events)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchEvents(); }, [filterStatus]);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/events/${id}/approve`);
      toast.success('Event approved! Organizer has been notified.');
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const reject = async (id, reason) => {
    try {
      await api.patch(`/admin/events/${id}/reject`, { reason });
      toast.success('Event rejected. Organizer has been notified.');
      setRejectTarget(null);
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Manage Events</h1>
            <p className="text-muted">Approve, reject, and monitor all events</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
              <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <div className="spinner" /> :
            events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗓️</div>
                <h3>No events found</h3>
                <p>No events match the selected filter.</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Event</th><th>Organizer</th><th>Date</th><th>Category</th>
                      <th>Participants</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{event.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>📍 {event.venue}</div>
                          {event.adminNote && <div style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: 2 }}>Note: {event.adminNote}</div>}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{event.organizer?.name}</div>
                          <div style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{event.organizer?.email}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{format(new Date(event.startDate), 'MMM d, yyyy')}</td>
                        <td>
                          {event.category && (
                            <span className="badge" style={{ background: event.category.color || 'var(--primary)', color: 'white' }}>
                              {event.category.name}
                            </span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {event.currentParticipants}
                          <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>/{event.maxParticipants}</span>
                        </td>
                        <td><span className={`badge ${STATUS_COLORS[event.status] || 'badge-gray'}`}>{event.status}</span></td>
                        <td>
                          {event.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn btn-success btn-sm" onClick={() => approve(event._id)}>✅ Approve</button>
                              <button className="btn btn-danger btn-sm" onClick={() => setRejectTarget(event)}>❌ Reject</button>
                            </div>
                          )}
                          {event.status !== 'pending' && <span style={{ color: 'var(--gray-300)', fontSize: '0.8rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {rejectTarget && <RejectModal event={rejectTarget} onClose={() => setRejectTarget(null)} onReject={reject} />}
      </main>
    </div>
  );
}
