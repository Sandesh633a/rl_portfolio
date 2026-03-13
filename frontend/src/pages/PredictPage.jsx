// src/pages/PredictPage.jsx
import { useState } from 'react';
import { getPrediction } from '../services/api';
import TickerInput from '../components/TickerInput';
import { FullPageLoader } from '../components/Spinner';
import { Cpu, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ef4444','#ec4899','#f97316','#84cc16','#14b8a6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(13,31,60,0.95)', border: '1px solid rgba(99,179,237,0.2)', borderRadius: 10, padding: '10px 14px' }}>
        <div style={{ fontWeight: 700, color: '#f0f9ff', marginBottom: 4 }}>{payload[0].name}</div>
        <div style={{ color: '#93c5fd', fontSize: 13 }}>{(payload[0].value * 100).toFixed(2)}%</div>
      </div>
    );
  }
  return null;
};

export default function PredictPage() {
  const [tickers, setTickers] = useState([]);
  const [algorithm, setAlgorithm] = useState('DDPG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async () => {
    if (tickers.length < 3) { setError('Please add at least 3 tickers.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await getPrediction(tickers, algorithm);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Have you trained the model first?');
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? Object.entries(result.allocation).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(4)) }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#10b98118', border: '1px solid #10b98130', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={18} color="#10b981" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Portfolio Prediction</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Get the DDPG agent's recommended portfolio allocation weights for your selected assets.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'flex-start' }}>
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 4 }}>Select Assets</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>These must match the tickers used during training</div>
          <TickerInput tickers={tickers} onChange={setTickers} disabled={loading} />

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {['DDPG', 'PPO'].map(alg => (
              <button key={alg} onClick={() => !loading && setAlgorithm(alg)}
                className={algorithm === alg ? 'btn-primary' : 'btn-ghost'}
                style={{ borderRadius: 10, padding: '8px 20px', fontSize: 13 }}>{alg}</button>
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 14 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handlePredict}
            disabled={loading || tickers.length < 3}
            style={{ marginTop: 20, width: '100%', borderRadius: 12, padding: '13px 20px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Predicting...</>
              : <><Cpu size={16} /> Get Allocation</>
            }
          </button>
        </div>

        {/* Hint panel */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How It Works</div>
          {[
            'Rebuilds env from fresh training data',
            'Loads the saved DDPG model',
            'Resets environment to step 0',
            'Agent observes current state',
            'Returns normalized allocation weights',
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none', fontSize: 12, color: '#94a3b8', alignItems: 'flex-start' }}>
              <TrendingUp size={12} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      {loading && <FullPageLoader message="Asking the DDPG agent for portfolio allocation..." />}

      {result && !loading && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div style={{ fontWeight: 700, fontSize: 16, color: '#34d399' }}>Allocation Generated</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Pie Chart */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 16 }}>Portfolio Allocation Chart</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${(value * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Weights Table */}
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 16 }}>Allocation Weights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(result.allocation)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ticker, weight], i) => (
                    <div key={ticker}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div className="ticker-tag" style={{ fontSize: 12 }}>{ticker}</div>
                        <div className="font-mono" style={{ color: COLORS[i % COLORS.length], fontWeight: 700, fontSize: 14 }}>
                          {(weight * 100).toFixed(2)}%
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${weight * 100}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Raw action */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Raw action vector</div>
            <div className="font-mono" style={{ fontSize: 12, color: '#6ee7b7', wordBreak: 'break-all', letterSpacing: '0.5px' }}>
              [{result.action?.map(a => a.toFixed(6)).join(', ')}]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
