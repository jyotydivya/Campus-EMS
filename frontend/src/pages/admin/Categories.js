// src/pages/admin/Categories.js
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { MdOutlineDelete } from 'react-icons/md';

const DEFAULT_COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];
const DEFAULT_ICONS = ['🎓', '💻', '🎭', '🏆', '🎵', '🔬', '🎨', '📚', '🏅', '🎤'];

function CategoryModal({ category, onClose, onSave }) {
  const [form, setForm] = useState(category || { name: '', description: '', color: '#4F46E5', icon: '🎓' });
  const [loading, setLoading] = useState(false);
  const set = f => e => setForm({ ...form, [f]: e.target.value });

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{category ? 'Edit Category' : 'New Category'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Category Name *</label>
            <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. Technical Events" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={2} value={form.description} onChange={set('description')} placeholder="Brief description..." style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {DEFAULT_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--gray-800)' : '2px solid transparent', cursor: 'pointer', outline: 'none' }} />
              ))}
            </div>
            <input type="color" value={form.color} onChange={set('color')} style={{ width: 40, height: 32, border: 'none', cursor: 'pointer', background: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', display: 'block', marginBottom: 8 }}>Icon</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {DEFAULT_ICONS.map(icon => (
                <button type="button" key={icon} onClick={() => setForm({ ...form, icon })}
                  style={{ width: 38, height: 38, borderRadius: 8, border: form.icon === icon ? '2px solid var(--primary)' : '1px solid var(--gray-200)', background: form.icon === icon ? 'var(--primary-light)' : 'var(--white)', fontSize: '1.25rem', cursor: 'pointer' }}>
                  {icon}
                </button>
              ))}
            </div>
            <input className="form-control" value={form.icon} onChange={set('icon')} placeholder="Or type an emoji" style={{ width: 100 }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 4 }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Category'}</button>
            <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | category object

  const fetch = () => api.get('/categories').then(r => setCategories(r.data.categories)).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const save = async (data) => {
    try {
      if (modal?._id) {
        await api.patch(`/categories/${modal._id}`, data);
        toast.success('Category updated');
      } else {
        await api.post('/categories', data);
        toast.success('Category created');
      }
      setModal(null);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 4 }}>Categories 🏷️</h1>
            <p className="text-muted">Manage event categories and their appearance</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}>➕ New Category</button>
        </div>

        {loading ? <div className="spinner" /> :
          categories.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🏷️</div>
              <h3>No categories yet</h3>
              <p>Create categories to help organizers classify their events.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setModal('new')}>Create Category</button>
            </div>
          ) : (
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {categories.map(cat => (
                <div key={cat._id} className="card fade-in" style={{ borderTop: `4px solid ${cat.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cat.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>{cat.color}</span>
                      </div>
                    </div>
                  </div>
                  {cat.description && <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: '1rem', lineHeight: 1.5 }}>{cat.description}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(cat)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(cat._id)}><MdOutlineDelete /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {modal && <CategoryModal category={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={save} />}
      </main>
    </div>
  );
}
