// src/pages/TrainPage.jsx
import { useState } from 'react';
import { trainAgent } from '../services/api';
import TickerInput from '../components/TickerInput';
import { FullPageLoader } from '../components/Spinner';
import { Brain, CheckCircle2, AlertCircle, Settings, Zap, Shield } from 'lucide-react';

const ALGORITHMS = [
  { id: 'DDPG', name: 'DDPG', desc: 'Deep Deterministic Policy Gradient. Best for continuous action spaces like portfolio allocation.', recommended: true },
  { id: 'PPO',  name: 'PPO',  desc: 'Proximal Policy Optimization. More stable training but may require more timesteps.', recommended: false },
];

export default function TrainPage() {
  const [tickers, setTickers] = useState([]);
  const [algorithm, setAlgorithm] = useState('DDPG');
  const [timesteps, setTimesteps] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTrain = async () => {
    if (tickers.length < 3) { setError('Please add at least 3 tickers.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await trainAgent(tickers, algorithm, timesteps);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Training failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#8b5cf618', border: '1px solid #8b5cf630', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} color="#8b5cf6" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Train Agent</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Train a Deep Reinforcement Learning agent (DDPG/PPO) on historical stock data to learn optimal portfolio allocations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Tickers */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 4 }}>Portfolio Assets</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Select 3–10 stocks for the portfolio</div>
            <TickerInput tickers={tickers} onChange={setTickers} disabled={loading} />
          </div>

          {/* Algorithm */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={16} color="#8b5cf6" /> Algorithm
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ALGORITHMS.map(algo => (
                <div
                  key={algo.id}
                  onClick={() => !loading && setAlgorithm(algo.id)}
                  style={{
                    padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                    border: `1px solid ${algorithm === algo.id ? '#8b5cf680' : 'rgba(99,179,237,0.1)'}`,
                    background: algorithm === algo.id ? 'rgba(139,92,246,0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${algorithm === algo.id ? '#8b5cf6' : '#334155'}`, background: algorithm === algo.id ? '#8b5cf6' : 'transparent', transition: 'all 0.2s' }} />
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>{algo.name}</span>
                    {algo.recommended && <span className="badge-info" style={{ borderRadius: 6, padding: '1px 8px', fontSize: 11 }}>Recommended</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, marginLeft: 28 }}>{algo.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timesteps */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} color="#f59e0b" /> Training Timesteps
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {[1000, 5000, 10000, 25000].map(t => (
                <button
                  key={t}
                  onClick={() => !loading && setTimesteps(t)}
                  className={timesteps === t ? 'btn-primary' : 'btn-ghost'}
                  style={{ borderRadius: 8, padding: '7px 16px', fontSize: 13 }}
                >
                  {t.toLocaleString()}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range" min={100} max={50000} step={100}
                value={timesteps}
                onChange={e => setTimesteps(parseInt(e.target.value))}
                disabled={loading}
                style={{ flex: 1, accentColor: '#8b5cf6' }}
              />
              <div className="font-mono" style={{ color: '#a78bfa', fontWeight: 700, fontSize: 15, minWidth: 70, textAlign: 'right' }}>
                {timesteps.toLocaleString()}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 14 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleTrain}
            disabled={loading || tickers.length < 3}
            style={{ borderRadius: 12, padding: '14px 20px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Training...</>
              : <><Brain size={16} /> Start Training</>
            }
          </button>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Training Pipeline</div>
            {[
              'Download historical data (2000 → now−2yr)',
              'Preprocess & align dates',
              'Normalize prices (MinMaxScaler)',
              'Build TradingEnv (OpenAI Gym)',
              `Initialize ${algorithm} agent`,
              `Train for ${timesteps.toLocaleString()} timesteps`,
              'Save model to models/',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ padding: 20, borderColor: 'rgba(139,92,246,0.2)' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <Shield size={14} color="#8b5cf6" />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>Note</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Training can take several minutes depending on timesteps. The model is automatically saved as <code style={{ color: '#c4b5fd', background: 'rgba(139,92,246,0.1)', padding: '1px 5px', borderRadius: 4 }}>ddpg_portfolio_management.zip</code>.
            </p>
          </div>
        </div>
      </div>

      {loading && <FullPageLoader message={`Training ${algorithm} agent for ${timesteps.toLocaleString()} timesteps...`} />}

      {result && !loading && (
        <div className="glass-card fade-in-up" style={{ padding: 28, borderColor: 'rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div style={{ fontWeight: 700, fontSize: 16, color: '#34d399' }}>Training Complete!</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
            {[
              { label: 'Algorithm', value: result.algorithm },
              { label: 'Timesteps', value: result.total_timesteps?.toLocaleString() },
              { label: 'Assets', value: result.n_assets },
              { label: 'Obs Shape', value: `[${result.observation_space_shape?.join(', ')}]` },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>{label}</div>
                <div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Model saved at: </span>
            <span className="font-mono" style={{ fontSize: 12, color: '#6ee7b7' }}>{result.model_path}</span>
          </div>
        </div>
      )}
    </div>
  );
}
