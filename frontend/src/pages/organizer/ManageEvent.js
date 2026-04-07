// src/pages/organizer/ManageEvent.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function ManageEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifForm, setNotifForm] = useState({ title: '', body: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/events/${id}`),
      api.get(`/events/${id}/participants`),
    ]).then(([evRes, partRes]) => {
      setEvent(evRes.data.event);
      setParticipants(partRes.data.registrations);
    }).catch(() => toast.error('Failed to load event')).finally(() => setLoading(false));
  }, [id]);

  const sendNotif = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/send', { eventId: id, ...notifForm });
      toast.success('Notification sent to all participants!');
      setNotifForm({ title: '', body: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSending(false); }
  };

  const cancelEvent = async () => {
    if (!window.confirm('Cancel this event? All participants will be notified.')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event cancelled');
      navigate('/organizer');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content"><div className="spinner" /></main></div>;
  if (!event) return null;

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/organizer')} style={{ marginBottom: '1.5rem' }}>← Back</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <span className={`badge ${event.status === 'approved' ? 'badge-success' : event.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ marginBottom: 8 }}>{event.status}</span>
            <h1 style={{ fontSize: '1.6rem' }}>{event.title}</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>📅 {format(new Date(event.startDate), 'PPp')} · 📍 {event.venue}</p>
          </div>
          {['pending', 'approved'].includes(event.status) && (
            <button className="btn btn-danger" onClick={cancelEvent}>Cancel Event</button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Participants */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ fontSize: '1.1rem' }}>Participants ({participants.length} / {event.maxParticipants})</h2>
            </div>
            {participants.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">👥</div><h3>No registrations yet</h3></div>
            ) : (
              <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr><th>#</th><th>Name</th><th>Roll No.</th><th>Department</th><th>Email</th><th>Registered</th></tr></thead>
                  <tbody>
                    {participants.map((reg, i) => (
                      <tr key={reg._id}>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>{i + 1}</td>
                        <td style={{ fontWeight: 500 }}>{reg.student?.name}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{reg.student?.rollNumber || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{reg.student?.department || '-'}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{reg.student?.email}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{format(new Date(reg.createdAt), 'MMM d')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Send notification */}
          <div className="card">
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>📣 Send Notification</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
              Send a push notification to all {participants.length} registered participants.
            </p>
            <form onSubmit={sendNotif} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" placeholder="e.g. Event Reminder" value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" rows={3} placeholder="Your message..." value={notifForm.body}
                  onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })} required style={{ resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={sending}>
                {sending ? 'Sending...' : '📤 Send to All'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
