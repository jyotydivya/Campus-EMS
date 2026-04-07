// src/pages/student/MyTickets.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

function TicketModal({ ticket, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
        <div className="modal-header">
          <h3>Your QR Ticket</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0.5rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: '1.25rem' }}>
          <img src={ticket.qrCodeData} alt="QR Code" style={{ width: '100%', maxWidth: 240, display: 'block', margin: '0 auto' }} />
        </div>
        <h3 style={{ marginBottom: 6 }}>{ticket.event?.title}</h3>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 4 }}>
          📅 {ticket.event?.startDate ? format(new Date(ticket.event.startDate), 'PPp') : ''}
        </p>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>📍 {ticket.event?.venue}</p>
        <div style={{ background: 'var(--gray-100)', borderRadius: 6, padding: '0.4rem 0.75rem', fontSize: '0.72rem', color: 'var(--gray-500)', fontFamily: 'monospace' }}>
          ID: {ticket.ticketId?.slice(0, 18)}...
        </div>
        {ticket.isValid === false ? (
          <div style={{ marginTop: '1rem', background: '#FEE2E2', borderRadius: 'var(--radius)', padding: '0.75rem', color: '#991B1B', fontSize: '0.85rem' }}>
            ❌ Ticket Cancelled
          </div>
        ) : ticket.scanned && (
          <div style={{ marginTop: '1rem', background: '#DEF7EC', borderRadius: 'var(--radius)', padding: '0.75rem', color: '#03543F', fontSize: '0.85rem' }}>
            ✅ Scanned at entry on {format(new Date(ticket.scannedAt), 'PPp')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/tickets/my').then(r => {
      const validTickets = r.data.tickets.filter(t => t.isValid !== false);
      setTickets(validTickets);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '0.5rem' }}>My Tickets 🎟️</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Show your QR code at the event entry</p>

        {loading ? <div className="spinner" /> :
          tickets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎟️</div>
              <h3>No tickets yet</h3>
              <p>Register for events to get your digital QR tickets.</p>
            </div>
          ) : (
            <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {tickets.map(ticket => (
                <div key={ticket._id} className="card" style={{ cursor: 'pointer', border: ticket.scanned ? '2px solid var(--gray-200)' : ticket.isValid === false ? '2px solid var(--danger)' : '2px solid var(--success)', transition: 'transform 0.2s' }}
                  onClick={() => setSelected(ticket)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', marginBottom: 4 }}>{ticket.event?.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        {ticket.event?.startDate ? format(new Date(ticket.event.startDate), 'MMM d, yyyy') : ''}
                      </p>
                    </div>
                    <span className={`badge ${ticket.scanned ? 'badge-gray' : ticket.isValid === false ? 'badge-danger' : 'badge-success'}`}>
                      {ticket.scanned ? 'Used' : ticket.isValid === false ? 'Cancelled' : 'Valid'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <img src={ticket.qrCodeData} alt="QR" style={{ width: 72, height: 72, borderRadius: 6, opacity: ticket.scanned ? 0.5 : 1 }} />
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                      <div>📍 {ticket.event?.venue}</div>
                      <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {ticket.ticketId?.slice(0, 12)}...
                      </div>
                      <div style={{ marginTop: 8, color: 'var(--primary)', fontWeight: 500 }}>Tap to view →</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {selected && <TicketModal ticket={selected} onClose={() => setSelected(null)} />}
      </main>
    </div>
  );
}
