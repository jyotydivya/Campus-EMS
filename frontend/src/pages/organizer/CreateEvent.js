// src/pages/organizer/CreateEvent.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '', venue: '',
    startDate: '', endDate: '', registrationDeadline: '',
    maxParticipants: 50, isPaid: false, price: 0, tags: '',
  });

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {}); }, []);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), price: form.isPaid ? form.price : 0 };
      await api.post('/events', payload);
      toast.success('Event submitted for approval! 🎉');
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/organizer')} style={{ marginBottom: '1.5rem' }}>← Back</button>
        <h1 style={{ marginBottom: '0.5rem' }}>Create New Event</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Fill in the details — an admin will review and approve your event.</p>

        <div className="card" style={{ maxWidth: 680 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>Event Title *</label>
              <input className="form-control" placeholder="e.g. Annual Tech Fest 2025" value={form.title} onChange={set('title')} required />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-control" rows={4} placeholder="Describe your event..." value={form.description} onChange={set('description')} required style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={form.category} onChange={set('category')} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Venue *</label>
                <input className="form-control" placeholder="e.g. Seminar Hall A" value={form.venue} onChange={set('venue')} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input className="form-control" type="datetime-local" value={form.startDate} onChange={set('startDate')} required />
              </div>
              <div className="form-group">
                <label>End Date & Time *</label>
                <input className="form-control" type="datetime-local" value={form.endDate} onChange={set('endDate')} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Registration Deadline *</label>
                <input className="form-control" type="datetime-local" value={form.registrationDeadline} onChange={set('registrationDeadline')} required />
              </div>
              <div className="form-group">
                <label>Max Participants *</label>
                <input className="form-control" type="number" min={1} value={form.maxParticipants} onChange={set('maxParticipants')} required />
              </div>
            </div>

            {/* Paid event */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', margin: 0 }}>
                <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                Paid Event
              </label>
              {form.isPaid && (
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <input className="form-control" type="number" min={0} placeholder="Entry fee (₹)" value={form.price} onChange={set('price')} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input className="form-control" placeholder="e.g. tech, hackathon, workshop" value={form.tags} onChange={set('tags')} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : '🚀 Submit for Approval'}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/organizer')}>Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
