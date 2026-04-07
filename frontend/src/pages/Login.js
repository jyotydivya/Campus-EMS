// src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'organizer') navigate('/organizer');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 1rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.6rem' }}>🎓</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Campus EMS</h1>
          <p className="text-muted">Sign in to your account</p>
        </div>

        <div className="card" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label>Email address</label>
              <input className="form-control" type="email" placeholder="you@college.edu" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-control" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Register here</Link>
          </p>
        </div>

        {/* Demo accounts hint */}
        <div style={{ marginTop: '1rem', background: 'var(--white)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--gray-200)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
          <strong style={{ color: 'var(--gray-700)' }}>Demo accounts:</strong>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span>👨‍🎓 Student: student@demo.com / demo123</span>
            <span>🎤 Organizer: organizer@demo.com / demo123</span>
            <span>🛡️ Admin: admin@demo.com / demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
