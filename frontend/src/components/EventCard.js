// src/components/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function EventCard({ event, linkPrefix = '/student' }) {
  const isFull = event.currentParticipants >= event.maxParticipants;
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const pct = Math.round((event.currentParticipants / event.maxParticipants) * 100);

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>

      {/* Banner */}
      <div style={{ height: 130, background: event.bannerImage ? `url(${event.bannerImage}) center/cover` : `linear-gradient(135deg, ${event.category?.color || '#4F46E5'}22, ${event.category?.color || '#4F46E5'}55)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!event.bannerImage && <span style={{ fontSize: '3rem' }}>{event.category?.icon || '🎪'}</span>}
        <span className="badge badge-info" style={{ position: 'absolute', top: 10, left: 10, background: event.category?.color || 'var(--primary)', color: 'white', border: 'none' }}>
          {event.category?.name}
        </span>
        {isFull && <span className="badge badge-danger" style={{ position: 'absolute', top: 10, right: 10 }}>Full</span>}
      </div>

      {/* Body */}
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: '1rem', lineHeight: 1.4, color: 'var(--gray-900)' }}>{event.title}</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.82rem', color: 'var(--gray-500)' }}>
          <span>📅 {format(new Date(event.startDate), 'MMM d, yyyy · h:mm a')}</span>
          <span>📍 {event.venue}</span>
          <span>👤 {event.organizer?.name}</span>
        </div>

        {/* Capacity bar */}
        <div style={{ marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: 4 }}>
            <span>{event.currentParticipants} registered</span>
            <span>{isFull ? 'Full' : `${spotsLeft} spots left`}</span>
          </div>
          <div style={{ height: 4, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: isFull ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.5s' }} />
          </div>
        </div>

        <Link to={`${linkPrefix}/events/${event._id}`} className="btn btn-primary btn-sm" style={{ marginTop: 'auto', justifyContent: 'center', textDecoration: 'none' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}
