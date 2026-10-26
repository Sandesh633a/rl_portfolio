// src/pages/Dashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkHealth, getSession } from '../services/api';
import {
  Layers, TrendingUp, BarChart2, FileText, Activity, ArrowRight, Brain, Shield,
  Zap, ChevronRight, CheckCircle2, Clock, Globe, Server, Cpu, Lock, Eye,
  PieChart as PieIcon, ArrowUpRight, Sparkles, Database, LineChart, Target,
  Play, RefreshCw, Wifi, WifiOff
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from 'recharts';

/* ─── Sparkline generator ─── */
const makeSparkline = (seed, up, len = 24) =>
  Array.from({ length: len }, (_, i) => ({
    v: Math.max(8, 50 + (up ? 1 : -1) * i * 1.2 + Math.sin(i * seed) * 16 + Math.random() * 8),
  }));

/* ─── Animated counter hook ─── */
function useCounter(end, duration = 1200, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (end === null || end === undefined) return;
    let start = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(start + (end - start) * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return decimals > 0 ? val.toFixed(decimals) : Math.round(val);
}

/* ─── Live clock ─── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.02em' }}>
      {time.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

/* ─── Sparkline mini card ─── */
function SparkMetric({ icon: Icon, color, fill, value, label, sub, sparkData, delay = 0 }) {
  return (
    <div className="card card-elevated" style={{
      padding: '18px 20px', position: 'relative', overflow: 'hidden',
      animation: `fadeUp 0.4s ${delay}s cubic-bezier(0.23,1,0.32,1) both`,
    }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46, opacity: 0.3 }}>
        <ResponsiveContainer width="100%" height={46}>
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Area type="monotone" dataKey="v" stroke={color} fill={fill} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}10`, border: `1px solid ${color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
        </div>
        <div className="stat-number" style={{ fontSize: 22, color, marginBottom: 3, letterSpacing: '-0.03em' }}>{value}</div>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)', marginBottom: 1 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>{sub}</div>
      </div>
    </div>
  );
}

/* ─── macOS window preview card ─── */
function WindowPreview({ title, icon: Icon, color, children, onClick }) {
  return (
    <div className="window-chrome" onClick={onClick}
      style={{ cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.23,1,0.32,1)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
      <div className="window-titlebar">
        <div className="traffic-dots">
          <div className="traffic-dot dot-red" style={{ width: 8, height: 8 }} />
          <div className="traffic-dot dot-yellow" style={{ width: 8, height: 8 }} />
          <div className="traffic-dot dot-green" style={{ width: 8, height: 8 }} />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon size={13} color={color} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        </div>
      </div>
      <div style={{ padding: '16px 18px', minHeight: 120 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Feature row ─── */
function FeatureRow({ icon: Icon, color, title, desc, tags, index }) {
  return (
    <div style={{
      display: 'flex', gap: 16, padding: '18px 0',
      borderBottom: '1px solid var(--border-0)',
      animation: `fadeUp 0.35s ${0.05 * index}s cubic-bezier(0.23,1,0.32,1) both`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: `${color}08`, border: `1px solid ${color}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div className="font-display" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</div>
          <ArrowUpRight size={14} color="var(--text-faint)" />
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 8 }}>{desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {tags.map(t => (
            <span key={t} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 5,
              background: `${color}06`, color, border: `1px solid ${color}12`,
              fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Pipeline step pill ─── */
function PipelineStep({ n, label, color, active }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: active ? color : `${color}08`,
        border: `1.5px solid ${active ? color : `${color}20`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 13,
        color: active ? '#fff' : color,
        transition: 'all 0.3s',
        boxShadow: active ? `0 4px 12px ${color}30` : 'none',
      }}>
        {n}
      </div>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, maxWidth: 80 }}>{label}</span>
    </div>
  );
}

/* ─── Connector line ─── */
function Connector() {
  return (
    <div style={{
      flex: 1, height: 1.5, minWidth: 12,
      background: 'linear-gradient(90deg, var(--border-2), var(--border-0))',
      alignSelf: 'flex-start', marginTop: 18,
    }} />
  );
}

/* ─── Main Dashboard ─── */
export default function Dashboard({ result }) {
  const [health, setHealth] = useState(null);
  const [ping, setPing]     = useState(null);
  const [session, setSession] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  // Fetch health + last session on mount
  useEffect(() => {
    const t0 = Date.now();
    checkHealth()
      .then(() => { setHealth(true); setPing(Date.now() - t0); })
      .catch(() => setHealth(false));

    getSession()
      .then(res => setSession(res.data))
      .catch(() => {});
  }, []);

  // Auto-animate pipeline steps
  useEffect(() => {
    const iv = setInterval(() => setActiveStep(p => (p + 1) % 6), 2000);
    return () => clearInterval(iv);
  }, []);

  const lastRun = result || session;

  // Build mini allocation chart from last run data
  const allocData = lastRun?.allocation
    ? Object.entries(lastRun.allocation).map(([name, value]) => ({ name, value: parseFloat(value) }))
    : null;

  const ALLOC_COLORS = ['#89243a', '#b4706e', '#c9b592', '#0284c7', '#059669', '#d97706', '#a83249', '#6b7280', '#c44d63', '#9a815e'];

  const pipelineSteps = [
    { n: 1, label: 'Select Assets', color: 'var(--b500)' },
    { n: 2, label: 'Fetch Data', color: 'var(--rg600)' },
    { n: 3, label: 'Build Env', color: 'var(--v700)' },
    { n: 4, label: 'Train Agent', color: 'var(--sky)' },
    { n: 5, label: 'Predict', color: 'var(--emerald)' },
    { n: 6, label: 'Evaluate', color: 'var(--amber)' },
  ];

  const techFeatures = [
    { icon: Brain, color: 'var(--b500)', title: 'Deep Deterministic Policy Gradient', desc: 'Actor-Critic architecture with continuous action spaces. The agent simultaneously learns a Q-value function and a deterministic policy for optimal portfolio weights.', tags: ['Actor-Critic', 'Off-Policy', 'Continuous Actions', 'NormalActionNoise'] },
    { icon: Shield, color: 'var(--sky)', title: 'Softmax Weight Normalization', desc: 'All portfolio weights are passed through a stable softmax layer, guaranteeing they always sum to exactly 100%. No degenerate splits or negative weights.', tags: ['Σ=1.0 Guaranteed', 'No Short Selling', 'Smooth Gradients'] },
    { icon: Zap, color: 'var(--emerald)', title: 'Growth-Factor Reward Signal', desc: 'Instead of raw returns, the agent learns from daily growth factors (1 + r/100). This provides meaningful, scale-invariant reward signals for diversified learning.', tags: ['Scale-Invariant', 'Daily Returns', 'Diversification Incentive'] },
    { icon: BarChart2, color: 'var(--amber)', title: 'QuantStats Evaluation Suite', desc: 'Institutional-grade backtesting against Nifty 50 (^NSEI). Produces Sharpe, Sortino, Calmar, CAGR, Volatility, and Maximum Drawdown metrics.', tags: ['vs Nifty 50', 'Risk-Adjusted', '7+ Metrics'] },
    { icon: Database, color: 'var(--rg600)', title: 'yfinance Market Data Pipeline', desc: 'Fetches historical OHLCV data from Yahoo Finance. Training window from 2000 to present−2yr. Test window uses the most recent 2 years.', tags: ['20+ Years History', 'Auto Date Alignment', 'NaN Handling'] },
    { icon: Target, color: 'var(--v700)', title: '50-Step Averaged Prediction', desc: 'Final portfolio weights are averaged over 50 environment steps to reduce variance and produce stable, reliable allocation recommendations.', tags: ['Variance Reduction', 'Warm-up Phase', 'Stable Output'] },
  ];

  const quickActions = [
    { to: '/pipeline', icon: Layers, color: 'var(--b500)', label: 'Run Pipeline', desc: 'End-to-end: select assets → train → predict → evaluate → report', badge: 'Primary' },
    { to: '/results', icon: TrendingUp, color: 'var(--sky)', label: 'Portfolio Allocation', desc: 'View DDPG-recommended weights, donut chart, and investment calculator' },
    { to: '/evaluate', icon: BarChart2, color: 'var(--emerald)', label: 'Risk & Return', desc: 'Sharpe, Sortino, Calmar ratios with gauge visualizations' },
    { to: '/report', icon: FileText, color: 'var(--amber)', label: 'Full Report', desc: 'Executive summary, allocation charts, and complete metrics' },
  ];

  const apiEndpoints = [
    { m: 'GET', p: '/health', d: 'Backend health check', u: 'Monitor' },
    { m: 'POST', p: '/pipeline/run', d: 'Full one-shot pipeline', u: '⭐ Primary' },
    { m: 'GET', p: '/pipeline/session', d: 'Last pipeline results', u: 'Cache' },
    { m: 'GET', p: '/pipeline/tickers', d: 'Last tickers used', u: 'Cache' },
    { m: 'POST', p: '/train', d: 'Train DDPG/PPO agent', u: 'Manual' },
    { m: 'POST', p: '/predict', d: 'Softmax-normalized allocation', u: 'Manual' },
    { m: 'POST', p: '/evaluate', d: 'QuantStats vs Nifty 50', u: 'Manual' },
    { m: 'POST', p: '/report/generate', d: 'Full report + pie chart', u: 'Manual' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ═══════════ TOP BAR — Status strip ═══════════ */}
      <div className="fade-up" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderRadius: 10,
        background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-1)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {health === true ? <Wifi size={13} color="var(--emerald)" /> : health === false ? <WifiOff size={13} color="var(--coral)" /> : <div className="spin-anim" style={{ width: 13, height: 13, border: '1.5px solid var(--border-2)', borderTop: '1.5px solid var(--b500)', borderRadius: '50%' }} />}
            <span style={{ fontSize: 11, fontWeight: 600, color: health === true ? 'var(--emerald)' : health === false ? 'var(--coral)' : 'var(--text-dim)' }}>
              {health === null ? 'Connecting…' : health ? 'Backend Online' : 'Offline'}
            </span>
            {ping && <span className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>{ping}ms</span>}
          </div>
          <div style={{ width: 1, height: 14, background: 'var(--border-1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Server size={11} color="var(--text-dim)" />
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>localhost:8000</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>v2.0.0</span>
          <div style={{ width: 1, height: 14, background: 'var(--border-1)' }} />
          <LiveClock />
        </div>
      </div>

      {/* ═══════════ HERO — Landing section ═══════════ */}
      <div className="fade-up" style={{
        position: 'relative', overflow: 'hidden', borderRadius: 16,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(168,50,73,0.04) 40%, rgba(201,181,146,0.06) 80%, rgba(255,255,255,0.7) 100%)',
        border: '1px solid var(--border-1)',
        padding: '48px 48px 44px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Subtle decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,50,73,0.06), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,181,146,0.08), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 6,
                background: 'rgba(168,50,73,0.08)', color: 'var(--b600)',
                border: '1px solid rgba(168,50,73,0.12)',
              }}>Meridian Platform</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                background: health ? 'rgba(5,150,105,0.08)' : 'rgba(217,119,6,0.08)',
                color: health ? 'var(--emerald)' : 'var(--amber)',
                border: `1px solid ${health ? 'rgba(5,150,105,0.15)' : 'rgba(217,119,6,0.15)'}`,
              }}>
                {health ? '● System Ready' : '○ Connecting…'}
              </span>
            </div>
            <h1 className="font-display" style={{
              fontSize: 44, fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 1.08, marginBottom: 16,
            }}>
              <span style={{ color: 'var(--text-primary)' }}>Dynamic Asset</span><br />
              <span className="grad-warm">Allocation Engine</span>
            </h1>
            <p style={{
              fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480,
              lineHeight: 1.75, marginBottom: 28,
            }}>
              Harness deep reinforcement learning to construct optimal portfolios.
              Our DDPG agent analyses 20+ years of market history and produces
              institutional-grade allocations evaluated against the Nifty 50 benchmark.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/pipeline')}
                style={{ padding: '13px 26px', fontSize: 14, borderRadius: 11, fontWeight: 700 }}>
                <Play size={15} fill="currentColor" /> Launch Pipeline <ChevronRight size={14} />
              </button>
              {lastRun && (
                <button className="btn btn-secondary" onClick={() => navigate('/results')}
                  style={{ padding: '13px 26px', fontSize: 14, borderRadius: 11 }}>
                  <Eye size={15} /> View Last Results
                </button>
              )}
            </div>
          </div>

          {/* Right side — mini allocation preview or logo mark */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            {allocData ? (
              <div style={{ position: 'relative' }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={allocData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {allocData.map((_, i) => <Cell key={i} fill={ALLOC_COLORS[i % ALLOC_COLORS.length]} opacity={0.85} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${(v * 100).toFixed(1)}%`, 'Weight']}
                      contentStyle={{ background: 'rgba(255,255,255,0.96)', border: '1px solid var(--border-2)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div className="stat-number" style={{ fontSize: 20, color: 'var(--b600)' }}>{lastRun.n_assets || Object.keys(lastRun.allocation).length}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-faint)', fontWeight: 600 }}>ASSETS</div>
                </div>
              </div>
            ) : (
              <div style={{
                width: 160, height: 160, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(168,50,73,0.06), rgba(201,181,146,0.08))',
                border: '1px solid var(--border-1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Activity size={32} color="var(--b400)" strokeWidth={1.5} />
                <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.06em' }}>READY</span>
              </div>
            )}
            {lastRun && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>Last run</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--b500)', fontWeight: 600 }}>
                  {lastRun.algorithm} · {lastRun.tickers?.length || lastRun.n_assets} assets
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ LAST RUN BANNER ═══════════ */}
      {lastRun && (
        <div className="fade-up" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          padding: '12px 20px', borderRadius: 10,
          background: 'rgba(5,150,105,0.04)', border: '1px solid rgba(5,150,105,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--emerald)' }}>
                Pipeline Complete — {lastRun.tickers?.join(' · ')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
                {lastRun.algorithm} · {lastRun.total_timesteps?.toLocaleString()} timesteps ·
                Sharpe: {lastRun.quantstats?.sharpe?.toFixed(2) ?? '—'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/results')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 7 }}>
              Allocation <ArrowRight size={11} />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/evaluate')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 7 }}>
              Metrics <ArrowRight size={11} />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/report')} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 7 }}>
              Report <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ KPI SPARKLINE ROW ═══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <SparkMetric icon={Brain}    color="var(--b500)"    fill="rgba(168,50,73,0.08)" value="DDPG" label="Algorithm" sub="Deep Deterministic Policy Gradient" sparkData={makeSparkline(0.8, true)} delay={0} />
        <SparkMetric icon={Shield}   color="var(--sky)"     fill="rgba(2,132,199,0.08)" value="100%" label="Weight Coverage" sub="Softmax guarantees Σ = 1.0" sparkData={makeSparkline(1.2, true)} delay={0.05} />
        <SparkMetric icon={Activity} color="var(--emerald)" fill="rgba(5,150,105,0.08)" value="7+"   label="Risk Metrics" sub="Sharpe · Sortino · Calmar · CAGR" sparkData={makeSparkline(0.5, true)} delay={0.1} />
        <SparkMetric icon={Clock}    color="var(--amber)"   fill="rgba(217,119,6,0.08)" value="50"   label="Prediction Steps" sub="Averaged for stability" sparkData={makeSparkline(1.5, true)} delay={0.15} />
      </div>

      {/* ═══════════ macOS WINDOW PREVIEWS — Quick access ═══════════ */}
      <div>
        <div className="section-label">Quick Access</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {quickActions.map(({ to, icon: Icon, color, label, desc, badge }) => (
            <WindowPreview key={to} title={label} icon={Icon} color={color} onClick={() => navigate(to)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${color}08`, border: `1px solid ${color}12`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={17} color={color} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{label}</span>
                    {badge && <span className="badge badge-info" style={{ fontSize: 9 }}>{badge}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color, fontSize: 12, fontWeight: 600, marginTop: 14 }}>
                Open <ArrowRight size={12} />
              </div>
            </WindowPreview>
          ))}
        </div>
      </div>

      {/* ═══════════ PIPELINE FLOW — Animated ═══════════ */}
      <div className="card card-elevated" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 4 }}>How It Works</div>
            <div className="font-display" style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Automated Pipeline Flow</div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/pipeline')}
            style={{ padding: '8px 16px', fontSize: 12, borderRadius: 8 }}>
            <Play size={13} fill="currentColor" /> Start Pipeline
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', gap: 0, padding: '8px 0' }}>
          {pipelineSteps.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <PipelineStep {...step} active={i === activeStep} />
              {i < pipelineSteps.length - 1 && <Connector />}
            </div>
          ))}
        </div>
        <div className="callout callout-burgundy" style={{ marginTop: 18, fontSize: 12 }}>
          <strong>One-click automation:</strong> Enter your tickers and the entire pipeline executes automatically —
          data fetching, environment construction, DDPG training, softmax prediction, QuantStats evaluation,
          and report generation — all in a single API call.
        </div>
      </div>

      {/* ═══════════ TWO-COLUMN: TECH + SESSION ═══════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: lastRun ? '1.2fr 1fr' : '1fr', gap: 20 }}>

        {/* Core Technology */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={14} color="var(--b500)" />
            <div className="section-label" style={{ marginBottom: 0 }}>Core Technology</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>
            Built on stable-baselines3 with custom Gym environments
          </div>
          {techFeatures.map((feat, i) => (
            <FeatureRow key={feat.title} {...feat} index={i} />
          ))}
        </div>

        {/* Session Insights (if available) */}
        {lastRun && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top allocation */}
            <div className="card card-elevated" style={{ padding: '22px 24px' }}>
              <div className="section-label">Latest Allocation</div>
              {Object.entries(lastRun.allocation || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([ticker, w], i) => {
                  const pct = (w * 100);
                  return (
                    <div key={ticker} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 2, background: ALLOC_COLORS[i] }} />
                          <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{ticker}</span>
                        </div>
                        <span className="stat-number" style={{ fontSize: 16, color: ALLOC_COLORS[i] }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="alloc-bar-track">
                        <div className="alloc-bar-fill" style={{ width: `${pct}%`, background: ALLOC_COLORS[i], opacity: 0.75 }} />
                      </div>
                    </div>
                  );
                })}
              <button className="btn btn-ghost" onClick={() => navigate('/results')}
                style={{ width: '100%', marginTop: 4, fontSize: 12, borderRadius: 8 }}>
                Full Allocation Details <ArrowRight size={12} />
              </button>
            </div>

            {/* Key metrics */}
            {lastRun.quantstats && (
              <div className="card" style={{ padding: '22px 24px' }}>
                <div className="section-label">Key Metrics</div>
                {[
                  { k: 'Sharpe Ratio', v: lastRun.quantstats.sharpe?.toFixed(3), color: 'var(--b500)' },
                  { k: 'Sortino Ratio', v: lastRun.quantstats.sortino?.toFixed(3), color: 'var(--sky)' },
                  { k: 'CAGR', v: lastRun.quantstats.cagr ? `${(lastRun.quantstats.cagr * 100).toFixed(1)}%` : '—', color: 'var(--emerald)' },
                  { k: 'Max Drawdown', v: lastRun.quantstats.max_drawdown ? `${(lastRun.quantstats.max_drawdown * 100).toFixed(1)}%` : '—', color: 'var(--coral)' },
                  { k: 'Volatility', v: lastRun.quantstats.volatility ? `${(lastRun.quantstats.volatility * 100).toFixed(1)}%` : '—', color: 'var(--amber)' },
                ].map(({ k, v, color }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-0)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{k}</span>
                    <span className="stat-number" style={{ fontSize: 14, color }}>{v ?? '—'}</span>
                  </div>
                ))}
                <button className="btn btn-ghost" onClick={() => navigate('/evaluate')}
                  style={{ width: '100%', marginTop: 10, fontSize: 12, borderRadius: 8 }}>
                  Full Risk Analysis <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* Config */}
            <div className="card" style={{ padding: '18px 22px' }}>
              <div className="section-label">Configuration</div>
              {[
                { k: 'Algorithm', v: lastRun.algorithm || 'DDPG' },
                { k: 'Timesteps', v: lastRun.total_timesteps?.toLocaleString() || '5,000' },
                { k: 'Assets', v: `${lastRun.n_assets || lastRun.tickers?.length || '—'}` },
                { k: 'Train Window', v: '2000 → Today−2yr' },
                { k: 'Benchmark', v: '^NSEI (Nifty 50)' },
              ].map(({ k, v }) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-0)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-dim)' }}>{k}</span>
                  <span className="mono" style={{ color: 'var(--b600)', fontSize: 11, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ API REFERENCE — macOS terminal style ═══════════ */}
      <div className="window-chrome">
        <div className="window-titlebar">
          <div className="traffic-dots">
            <div className="traffic-dot dot-red" style={{ width: 8, height: 8 }} />
            <div className="traffic-dot dot-yellow" style={{ width: 8, height: 8 }} />
            <div className="traffic-dot dot-green" style={{ width: 8, height: 8 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Globe size={12} color="var(--text-dim)" />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>API Reference — localhost:8000</span>
          </div>
        </div>
        <div style={{ padding: '4px 22px 22px' }}>
          <table className="data-table">
            <thead>
              <tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Usage</th></tr>
            </thead>
            <tbody>
              {apiEndpoints.map(({ m, p, d, u }) => (
                <tr key={p}>
                  <td><span className={`badge ${m === 'GET' ? 'badge-ok' : 'badge-info'}`} style={{ fontSize: 10 }}>{m}</span></td>
                  <td><span className="mono" style={{ fontSize: 11, color: 'var(--b600)' }}>{p}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d}</td>
                  <td>{u.includes('⭐') ? <span className="badge badge-gold" style={{ fontSize: 10 }}>{u}</span> : <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{u}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ FOOTER ═══════════ */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 0', borderTop: '1px solid var(--border-0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--b600), var(--b400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={11} color="#fff" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Meridian</span>
          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>Dynamic Asset Allocation Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-faint)' }}>
          <span>Stable-Baselines3</span>
          <span>·</span>
          <span>QuantStats</span>
          <span>·</span>
          <span>yfinance</span>
          <span>·</span>
          <span>FastAPI</span>
        </div>
      </div>
    </div>
  );
}
