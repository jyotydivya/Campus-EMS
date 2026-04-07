// src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', rollNumber: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      if (user.role === 'organizer') navigate('/organizer');
      else navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ width: 52, height: 52, background: 'var(--primary)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.5rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Create Account</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Join Campus EMS today</p>
        </div>

        <div className="card" style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" placeholder="Your full name" value={form.name} onChange={set('name')} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-control" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-control" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} required style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={showConfirmPassword ? "Hide password" : "Show password"}>
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="organizer">Event Organizer</option>
              </select>
            </div>

            {form.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Roll Number</label>
                  <input className="form-control" placeholder="e.g. CS21B001" value={form.rollNumber} onChange={set('rollNumber')} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input className="form-control" placeholder="e.g. CSE" value={form.department} onChange={set('department')} />
                </div>
              </div>
            )}

            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading} style={{ marginTop: 6, justifyContent: 'center' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
