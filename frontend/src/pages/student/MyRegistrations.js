// src/pages/student/MyRegistrations.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRegs = () => api.get('/registrations/my').then(r => setRegistrations(r.data.registrations)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchRegs(); }, []);

  const cancel = async (regId) => {
    if (!window.confirm('Cancel this registration?')) return;
    try {
      await api.delete(`/registrations/${regId}`);
      toast.success('Registration cancelled');
      fetchRegs();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const now = new Date();
  const upcoming = registrations.filter(r => r.event && new Date(r.event.startDate) > now && r.status === 'confirmed');
  const past = registrations.filter(r => r.event && new Date(r.event.startDate) <= now && r.status === 'confirmed');
  const cancelled = registrations.filter(r => r.status === 'cancelled');

  const Section = ({ title, items, showCancel }) => (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gray-700)' }}>{title} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>({items.length})</span></h2>
      {items.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>None</p> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Category</th><th>Status</th>{showCancel && <th>Action</th>}</tr></thead>
            <tbody>
              {items.map(reg => (
                <tr key={reg._id}>
                  <td style={{ fontWeight: 500 }}>{reg.event?.title}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{reg.event?.startDate ? format(new Date(reg.event.startDate), 'MMM d, yyyy') : '-'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{reg.event?.venue || '-'}</td>
                  <td>
                    {reg.event?.category && (
                      <span className="badge" style={{ background: reg.event.category.color || 'var(--primary)', color: 'white' }}>
                        {reg.event.category.icon} {reg.event.category.name}
                      </span>
                    )}
                  </td>
                  <td><span className={`badge ${reg.status === 'confirmed' ? 'badge-success' : 'badge-gray'}`}>{reg.status}</span></td>
                  {showCancel && (
                    <td><button className="btn btn-danger btn-sm" onClick={() => cancel(reg._id)}>Cancel</button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '0.5rem' }}>My Registrations 📋</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Track all your event registrations</p>

        {loading ? <div className="spinner" /> : (
          <>
            <Section title="📅 Upcoming" items={upcoming} showCancel={true} />
            <Section title="✅ Past Events" items={past} showCancel={false} />
            <Section title="❌ Cancelled" items={cancelled} showCancel={false} />
          </>
        )}
      </main>
    </div>
  );
}
