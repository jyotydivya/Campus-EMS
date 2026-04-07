// src/pages/organizer/ScanQR.js
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';

export default function ScanQR() {
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scanTicket = async (qrPayload) => {
    if (!qrPayload) return;
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await api.post('/tickets/scan', { qrPayload });
      setResult({ success: true, ...res.data });
      toast.success('Entry approved!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid ticket';
      setError(msg);
      setResult({ success: false, message: msg, student: err.response?.data?.student });
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleManual = (e) => {
    e.preventDefault();
    scanTicket(manualInput.trim());
  };

  const reset = () => { setResult(null); setError(''); setManualInput(''); };

  return (
    <div className="page-layout">
      <Sidebar />
      <main className="main-content">
        <h1 style={{ marginBottom: '0.5rem' }}>QR Code Scanner 📷</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Scan or paste a ticket QR payload to validate entry
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', maxWidth: 900 }}>
          {/* Camera scanner info */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>📱 Camera Scan</h3>
            <div style={{ background: 'var(--gray-50)', border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius)', padding: '3rem 1.5rem', textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Use your device camera to scan the student's QR ticket
              </p>
              <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
                Install the <strong>react-qr-reader</strong> package and integrate below for live camera scanning.
                The scanned JSON string goes into the <code>/api/tickets/scan</code> endpoint.
              </p>
            </div>
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
              {`// Example integration:\nimport { QrReader } from 'react-qr-reader';\n<QrReader onResult={(result) => {\n  if (result) scanTicket(result.getText());\n}} />`}
            </div>
          </div>

          {/* Manual paste */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>⌨️ Manual / Paste QR Data</h3>
            <form onSubmit={handleManual} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Paste QR Payload (JSON string)</label>
                <textarea className="form-control" rows={5} placeholder='{"ticketId":"...","studentId":"...","eventId":"...","eventTitle":"..."}' value={manualInput} onChange={(e) => setManualInput(e.target.value)} required style={{ fontFamily: 'monospace', fontSize: '0.82rem', resize: 'vertical' }} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Validating...' : '✅ Validate Ticket'}
              </button>
            </form>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="card fade-in" style={{ marginTop: '1.5rem', maxWidth: 900, border: `2px solid ${result.success ? 'var(--success)' : 'var(--danger)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.5rem' }}>{result.success ? '✅' : '❌'}</div>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: result.success ? 'var(--success)' : 'var(--danger)', marginBottom: 4 }}>
                  {result.success ? 'Entry Approved!' : 'Entry Denied'}
                </h2>
                {!result.success && <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{result.message}</p>}
              </div>
            </div>

            {result.student && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Name</div>
                  <div style={{ fontWeight: 600 }}>{result.student.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Roll No.</div>
                  <div>{result.student.rollNumber || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Department</div>
                  <div>{result.student.department || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Email</div>
                  <div style={{ fontSize: '0.85rem' }}>{result.student.email}</div>
                </div>
              </div>
            )}

            {result.event && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                Event: <strong style={{ color: 'var(--gray-700)' }}>{result.event.title}</strong>
              </div>
            )}

            <button className="btn btn-secondary btn-sm" onClick={reset} style={{ marginTop: '1rem' }}>
              ↩ Scan Another
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
