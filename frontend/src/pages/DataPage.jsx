// src/pages/DataPage.jsx
import { useState } from 'react';
import { downloadData } from '../services/api';
import TickerInput from '../components/TickerInput';
import { FullPageLoader } from '../components/Spinner';
import { Database, CheckCircle2, AlertCircle, RefreshCw, TrendingDown } from 'lucide-react';

export default function DataPage() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    if (tickers.length < 3) { setError('Please add at least 3 tickers.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await downloadData(tickers);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Download failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#06b6d418', border: '1px solid #06b6d430', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={18} color="#06b6d4" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Data Download</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Download historical stock data from Yahoo Finance. Existing data is automatically replaced to keep your disk clean.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main Panel */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 6, fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>Select Stock Tickers</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Add 3–10 Yahoo Finance ticker symbols</div>
          <TickerInput tickers={tickers} onChange={setTickers} disabled={loading} />

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 14 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={loading || tickers.length < 3}
            style={{ marginTop: 20, width: '100%', borderRadius: 12, padding: '13px 20px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Downloading...</> : <><Database size={16} /> Download Fresh Data</>}
          </button>
        </div>

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Data Parameters</div>
            {[
              { label: 'Start Date', value: '2000-01-01' },
              { label: 'End Date', value: 'Today − 2 years' },
              { label: 'Interval', value: '1 Day' },
              { label: 'Source', value: 'Yahoo Finance' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{label}</span>
                <span className="font-mono" style={{ color: '#93c5fd' }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(245,158,11,0.2)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <TrendingDown size={15} color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>Data Replace Policy</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Existing CSV files are <strong style={{ color: '#fbbf24' }}>deleted first</strong>, then fresh data is downloaded. No duplicate files ever accumulate on disk.
            </p>
          </div>
        </div>
      </div>

      {/* Result */}
      {loading && <FullPageLoader message="Downloading data from Yahoo Finance..." />}

      {result && !loading && (
        <div className="glass-card fade-in-up" style={{ padding: 28, borderColor: 'rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div style={{ fontWeight: 700, fontSize: 16, color: '#34d399' }}>Download Complete</div>
            <div className="badge-success" style={{ borderRadius: 8, padding: '2px 10px', fontSize: 12 }}>{result.shares_downloaded} shares</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {Object.entries(result.rows_per_share || {}).map(([name, rows]) => (
              <div key={name} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div className="ticker-tag" style={{ marginBottom: 8, fontSize: 12 }}>{tickers[parseInt(name.replace('share',''))-1]}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>{rows.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>trading days</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
