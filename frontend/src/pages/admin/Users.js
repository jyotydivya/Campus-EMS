// src/pages/admin/Users.js
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

const ROLE_COLORS = { student: 'badge-info', organizer: 'badge-purple', admin: 'badge-danger' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data.users)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('User role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    organizers: users.filter(u => u.role === 'organizer').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Users 👥</h1>
          <p className="text-muted">Manage user accounts and roles</p>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Users', value: counts.total, color: 'var(--primary)' },
            { label: 'Students', value: counts.students, color: 'var(--accent)' },
            { label: 'Organizers', value: counts.organizers, color: 'var(--secondary)' },
            { label: 'Admins', value: counts.admins, color: 'var(--danger)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ borderLeftColor: s.color }}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.25rem' }}>
          <input className="form-control" style={{ maxWidth: 360 }} placeholder="🔍 Search by name, email, department..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? <div className="spinner" /> :
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>User</th><th>Roll No.</th><th>Department</th><th>Role</th><th>Joined</th><th>Change Role</th></tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)', flexShrink: 0 }}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{user.rollNumber || '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{user.department || '—'}</td>
                      <td><span className={`badge ${ROLE_COLORS[user.role] || 'badge-gray'}`}>{user.role}</span></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={e => updateRole(user._id, e.target.value)}
                          className="form-control"
                          style={{ width: 130, padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      </main>
    </div>
  );
}
