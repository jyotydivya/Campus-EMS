// src/pages/student/Home.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import EventCard from '../../components/EventCard';
import api from '../../utils/api';

export default function StudentHome() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [upcoming, setUpcoming] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCat) params.category = selectedCat;
      if (upcoming) params.upcoming = true;
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {}); }, []);
  useEffect(() => { fetchEvents(); }, [search, selectedCat, upcoming]);

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Upcoming Events 🎪</h1>
          <p className="text-muted">Discover and register for campus events</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-control" style={{ width: 260 }} placeholder="🔍 Search events..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <select className="form-control" style={{ width: 180 }} value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: 'var(--gray-600)', cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" checked={upcoming} onChange={(e) => setUpcoming(e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
            Upcoming only
          </label>
          {(search || selectedCat || upcoming) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSelectedCat(''); setUpcoming(false); }}>Clear filters</button>
          )}
        </div>

        {loading ? <div className="spinner" /> :
          events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No events found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          )
        }
      </main>
    </div>
  );
}
