// src/pages/EvaluatePage.jsx
import { useState } from 'react';
import { evaluateModel } from '../services/api';
import TickerInput from '../components/TickerInput';
import { FullPageLoader } from '../components/Spinner';
import StatCard from '../components/StatCard';
import { BarChart2, CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Shield, Activity, Percent } from 'lucide-react';

const METRIC_META = {
  sharpe:             { label: 'Sharpe Ratio',        icon: TrendingUp,  color: '#10b981', desc: 'Risk-adjusted return. >1 is good, >2 is great.' },
  sortino:            { label: 'Sortino Ratio',        icon: Shield,      color: '#3b82f6', desc: 'Like Sharpe but only penalizes downside volatility.' },
  calmar:             { label: 'Calmar Ratio',         icon: Activity,    color: '#8b5cf6', desc: 'Annual return divided by max drawdown.' },
  cagr:               { label: 'CAGR',                 icon: TrendingUp,  color: '#06b6d4', desc: 'Compound Annual Growth Rate.' },
  volatility:         { label: 'Volatility',           icon: Percent,     color: '#f59e0b', desc: 'Annualized standard deviation of returns.' },
  max_drawdown:       { label: 'Max Drawdown',         icon: TrendingDown,color: '#ef4444', desc: 'Largest peak-to-trough decline.' },
  benchmark_sharpe:   { label: 'Benchmark Sharpe',     icon: BarChart2,   color: '#94a3b8', desc: 'Nifty 50 Sharpe ratio for comparison.' },
};

function getMetricQuality(key, value) {
  if (value === null || value === undefined) return null;
  if (key === 'sharpe' || key === 'sortino') {
    if (value > 2) return 'excellent';
    if (value > 1) return 'good';
    if (value > 0) return 'average';
    return 'poor';
  }
  if (key === 'max_drawdown') return value > -0.2 ? 'good' : value > -0.4 ? 'average' : 'poor';
  return null;
}

const qualityColor = { excellent: '#10b981', good: '#06b6d4', average: '#f59e0b', poor: '#ef4444' };

export default function EvaluatePage() {
  const [tickers, setTickers] = useState([]);
  const [algorithm, setAlgorithm] = useState('DDPG');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (tickers.length < 3) { setError('Please add at least 3 tickers.'); return; }
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await evaluateModel(tickers, algorithm);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Evaluation failed. Have you trained the model first?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div className="fade-in-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f59e0b18', border: '1px solid #f59e0b30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={18} color="#f59e0b" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Model Evaluation</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Evaluate your trained model on recent market data using QuantStats metrics and compare against the Nifty 50 benchmark.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0', marginBottom: 4 }}>Select Assets</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Use the same tickers as during training</div>
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
            onClick={handleEvaluate}
            disabled={loading || tickers.length < 3}
            style={{ marginTop: 20, width: '100%', borderRadius: 12, padding: '13px 20px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Evaluating...</>
              : <><BarChart2 size={16} /> Run Evaluation</>
            }
          </button>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Test Data Range</div>
          {[
            { label: 'Test End', value: 'Today − 10 days' },
            { label: 'Test Start', value: 'Today − 2 years' },
            { label: 'Benchmark', value: 'Nifty 50 (^NSEI)' },
            { label: 'Library', value: 'QuantStats' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span className="font-mono" style={{ color: '#fbbf24', fontSize: 12 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && <FullPageLoader message="Downloading test data & running QuantStats evaluation..." />}

      {result && !loading && (
        <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={20} color="#10b981" />
            <div style={{ fontWeight: 700, fontSize: 16, color: '#34d399' }}>Evaluation Complete</div>
          </div>

          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {Object.entries(result.quantstats || {}).map(([key, value]) => {
              const meta = METRIC_META[key] || {};
              const quality = getMetricQuality(key, value);
              return (
                <div key={key} className="glass-card" style={{ padding: '18px 20px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {meta.label || key}
                    </div>
                    {quality && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: qualityColor[quality], background: `${qualityColor[quality]}15`, border: `1px solid ${qualityColor[quality]}30`, borderRadius: 6, padding: '1px 7px', textTransform: 'uppercase' }}>
                        {quality}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: meta.color || '#60a5fa', fontVariantNumeric: 'tabular-nums' }}>
                    {value !== null ? value.toFixed(4) : '—'}
                  </div>
                  {meta.desc && <div style={{ fontSize: 11, color: '#475569', marginTop: 6, lineHeight: 1.5 }}>{meta.desc}</div>}
                </div>
              );
            })}
          </div>

          {/* Allocation */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 16 }}>Portfolio Allocation Used</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(result.allocation || {}).map(([ticker, weight]) => (
                <div key={ticker} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="ticker-tag" style={{ fontSize: 12 }}>{ticker}</span>
                  <span className="font-mono" style={{ color: '#60a5fa', fontWeight: 700 }}>{(weight * 100).toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
