// src/pages/student/EventDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`).then(r => {
      setEvent(r.data.event);
      setLoading(false);
    }).catch(() => { toast.error('Event not found'); navigate('/student'); });

    // Check if student already registered
    api.get('/registrations/my').then(r => {
      const found = r.data.registrations.some(reg => reg.event?._id === id && reg.status === 'confirmed');
      setAlreadyRegistered(found);
    }).catch(() => {});
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post('/registrations', { eventId: id });
      toast.success('Registered successfully! Check your email for the QR ticket 🎟️');
      setAlreadyRegistered(true);
      setEvent(ev => ({ ...ev, currentParticipants: ev.currentParticipants + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setRegistering(false); }
  };

  if (loading) return <div className="page-layout"><Sidebar /><main className="main-content"><div className="spinner" /></main></div>;
  if (!event) return null;

  const isFull = event.currentParticipants >= event.maxParticipants;
  const isOpen = event.registrationOpen;
  const pct = Math.round((event.currentParticipants / event.maxParticipants) * 100);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/student')} style={{ marginBottom: '1.5rem' }}>
          ← Back to Events
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main content */}
          <div className="card">
            {/* Banner */}
            <div style={{ height: 200, borderRadius: 'var(--radius)', marginBottom: '1.5rem', background: event.bannerImage ? `url(${event.bannerImage}) center/cover` : `linear-gradient(135deg, ${event.category?.color || '#4F46E5'}22, ${event.category?.color || '#4F46E5'}55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
              {!event.bannerImage && (event.category?.icon || '🎪')}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: '1rem' }}>
              <div>
                <span className="badge" style={{ background: event.category?.color || 'var(--primary)', color: 'white', marginBottom: 8 }}>
                  {event.category?.icon} {event.category?.name}
                </span>
                <h1 style={{ fontSize: '1.6rem', lineHeight: 1.3 }}>{event.title}</h1>
              </div>
            </div>

            <p style={{ color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: '1.5rem' }}>{event.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', fontSize: '0.9rem' }}>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Start Date</strong>{format(new Date(event.startDate), 'PPp')}</div>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>End Date</strong>{format(new Date(event.endDate), 'PPp')}</div>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Venue</strong>{event.venue}</div>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Organizer</strong>{event.organizer?.name}</div>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Registration Closes</strong>{format(new Date(event.registrationDeadline), 'PPp')}</div>
              <div><strong style={{ display: 'block', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Entry Fee</strong>{event.isPaid ? `₹${event.price}` : 'Free'}</div>
            </div>
          </div>

          {/* Sidebar: registration */}
          <div className="card" style={{ position: 'sticky', top: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem' }}>Registration</h3>

            {/* Capacity */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: 6 }}>
                <span>{event.currentParticipants} / {event.maxParticipants} registered</span>
                <span>{isFull ? '🔴 Full' : `${event.maxParticipants - event.currentParticipants} spots left`}</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: isFull ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.5s' }} />
              </div>
            </div>

            {alreadyRegistered ? (
              <div style={{ textAlign: 'center', padding: '1rem', background: '#D1FAE5', borderRadius: 'var(--radius)', color: '#065F46' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅</div>
                <div style={{ fontWeight: 600 }}>You're registered!</div>
                <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Check My Tickets for your QR code</div>
              </div>
            ) : isOpen && !isFull ? (
              <button className="btn btn-primary w-full btn-lg" onClick={handleRegister} disabled={registering} style={{ justifyContent: 'center' }}>
                {registering ? 'Registering...' : event.isPaid ? `Pay ₹${event.price} & Register` : '🎟️ Register for Free'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--gray-100)', borderRadius: 'var(--radius)', color: 'var(--gray-500)' }}>
                {isFull ? '🔴 Event is full' : '⏰ Registration closed'}
              </div>
            )}

            {event.tags?.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {event.tags.map(tag => (
                    <span key={tag} className="badge badge-gray">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
