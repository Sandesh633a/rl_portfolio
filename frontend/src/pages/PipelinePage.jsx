// src/pages/PipelinePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runPipeline } from '../services/api';
import { X, Plus, Play, AlertCircle, ChevronRight, Zap, Brain, Database, BarChart2, Layers, CheckCircle2, Clock } from 'lucide-react';

const PRESETS = [
  { label: '🇮🇳 NSE Blue Chips', tickers: ['RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','WIPRO.NS'], desc: 'Top 5 Nifty 50 constituents' },
  { label: '🇺🇸 US Big Tech', tickers: ['AAPL','MSFT','GOOGL','AMZN','TSLA','META'], desc: 'FAANG + Tesla' },
  { label: '🌏 Diversified Asia-US', tickers: ['AAPL','RELIANCE.NS','TCS.NS','MSFT','INFY.NS','GOOGL'], desc: 'Cross-market mix' },
  { label: '🏦 NSE Finance', tickers: ['HDFCBANK.NS','ICICIBANK.NS','AXISBANK.NS','KOTAKBANK.NS'], desc: 'Indian banking sector' },
];

const STEPS = [
  { icon: Database, label: 'Fetch Training Data',    desc: 'yfinance, 2000 → now−2yr, in-memory', color:'var(--t600)'  },
  { icon: Layers,   label: 'Preprocess & Align',     desc: 'Date alignment, daily returns, NaN check', color:'var(--s500)' },
  { icon: Zap,      label: 'Build Trading Env',      desc: 'Growth-factor TradingEnv, Gym interface', color:'#a78bfa'    },
  { icon: Brain,    label: 'Train DDPG Agent',        desc: 'Actor-Critic, NormalActionNoise', color:'var(--m500)'  },
  { icon: Play,     label: 'Softmax Prediction',     desc: '50-step warm-up average', color:'var(--amber)'  },
  { icon: Database, label: 'Fetch Test Data',        desc: 'Recent 2yr window for evaluation', color:'var(--coral)'  },
  { icon: BarChart2,label: 'QuantStats Evaluation',  desc: 'Sharpe, Sortino, Calmar vs Nifty 50', color:'var(--t400)'  },
  { icon: CheckCircle2, label: 'Generate Report',    desc: 'Pie chart, base64 + full JSON', color:'var(--m400)'  },
];

function AlgoCard({ algo, selected, onClick }) {
  const data = {
    DDPG: { title:'DDPG', sub:'Deep Deterministic Policy Gradient', tags:['Continuous Actions','Actor-Critic','Off-Policy'], desc:'Best for continuous action spaces like portfolio allocation. Combines Q-learning with policy gradient. Uses action noise for exploration.' },
    PPO:  { title:'PPO',  sub:'Proximal Policy Optimization',        tags:['On-Policy','Clip Objective','Stable Training'], desc:'More stable training with proximal policy updates. Good fallback if DDPG diverges. Slightly slower for continuous actions.' },
  }[algo];
  return (
    <div onClick={onClick} style={{
      flex:1, padding:'16px 18px', borderRadius:14, cursor:'pointer',
      border:`1px solid ${selected ? 'rgba(20,184,166,0.45)' : 'rgba(45,212,191,0.08)'}`,
      background: selected ? 'rgba(20,184,166,0.08)' : 'rgba(5,13,13,0.6)',
      transition:'all .25s cubic-bezier(0.23,1,0.32,1)',
      transform: selected ? 'translateY(-2px)' : 'none',
      boxShadow: selected ? '0 8px 24px rgba(20,184,166,0.15)' : 'none',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
        <div style={{
          width:20, height:20, borderRadius:'50%', border:`2px solid ${selected ? 'var(--t500)' : 'rgba(255,255,255,0.15)'}`,
          background: selected ? 'var(--t600)' : 'transparent',
          display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s',
        }}>
          {selected && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--bg-0)' }} />}
        </div>
        <span className="font-display" style={{ fontWeight:800, fontSize:15, color: selected ? 'var(--t400)' : 'var(--n200)' }}>{data.title}</span>
        {algo === 'DDPG' && <span className="badge badge-info" style={{ fontSize:9 }}>Recommended</span>}
      </div>
      <div style={{ fontSize:11, color:'var(--n600)', marginBottom:8, fontWeight:600 }}>{data.sub}</div>
      <p style={{ fontSize:12, color:'var(--n400)', lineHeight:1.6, marginBottom:10 }}>{data.desc}</p>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {data.tags.map(t => <span key={t} className="badge" style={{ fontSize:9, background:'rgba(255,255,255,0.05)', color:'var(--n400)', border:'1px solid rgba(255,255,255,0.08)' }}>{t}</span>)}
      </div>
    </div>
  );
}

export default function PipelinePage({ onResult }) {
  const [tickers, setTickers]   = useState([]);
  const [input, setInput]       = useState('');
  const [algo, setAlgo]         = useState('DDPG');
  const [steps, setSteps]       = useState(5000);
  const [loading, setLoading]   = useState(false);
  const [stepIdx, setStepIdx]   = useState(-1);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) return;
    setStepIdx(0);
    const iv = setInterval(() => setStepIdx(p => {
      if (p >= STEPS.length - 1) { clearInterval(iv); return p; }
      return p + 1;
    }), Math.max(1200, (steps / STEPS.length) * 200));
    return () => clearInterval(iv);
  }, [loading, steps]);

  const addTicker = () => {
    const t = input.trim().toUpperCase();
    if (!t || tickers.includes(t) || tickers.length >= 10) return;
    setTickers(p => [...p, t]); setInput('');
  };

  const run = async () => {
    if (tickers.length < 3) { setError('Add at least 3 tickers.'); return; }
    setError(''); setLoading(true); setDone(false);
    try {
      const res = await runPipeline(tickers, algo, steps);
      onResult(res.data);
      setDone(true);
      setTimeout(() => navigate('/results'), 1200);
    } catch (e) {
      setError(e.response?.data?.detail || 'Pipeline failed. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  if (loading || done) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:60, gap:40 }}>
      {/* 3D loader rings */}
      <div style={{ position:'relative', width:100, height:100 }}>
        <div style={{ position:'absolute', inset:0, border:'3px solid rgba(20,184,166,0.12)', borderTop:'3px solid var(--t500)', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <div style={{ position:'absolute', inset:12, border:'3px solid rgba(107,174,214,0.12)', borderTop:'3px solid var(--s500)', borderRadius:'50%', animation:'spin 1.6s linear infinite reverse' }} />
        <div style={{ position:'absolute', inset:24, border:'2px solid rgba(16,185,129,0.12)', borderTop:'2px solid var(--m500)', borderRadius:'50%', animation:'spin 2s linear infinite' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Brain size={18} color="var(--t500)" style={{ animation:'pulse 1.5s infinite' }} />
        </div>
      </div>

      <div style={{ textAlign:'center' }}>
        <h2 className="font-display grad-teal" style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>
          {done ? '🎉 Pipeline Complete!' : 'Running Full Pipeline'}
        </h2>
        <p style={{ color:'var(--n600)', fontSize:14 }}>
          {done ? 'Redirecting to results...' : `Training ${algo} · ${steps.toLocaleString()} timesteps · ${tickers.length} assets`}
        </p>
      </div>

      {/* Step cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, width:'100%', maxWidth:620 }}>
        {STEPS.map(({ icon:Icon, label, desc, color }, i) => {
          const isDone   = stepIdx > i || done;
          const isActive = stepIdx === i && !done;
          return (
            <div key={i} className="card" style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12,
              borderColor: isDone ? 'rgba(16,185,129,0.3)' : isActive ? 'rgba(20,184,166,0.35)' : 'rgba(45,212,191,0.06)',
              background: isDone ? 'rgba(16,185,129,0.06)' : isActive ? 'rgba(20,184,166,0.08)' : undefined,
              transition:'all .5s',
            }}>
              <div className={`step-circle ${isDone ? 'step-done' : isActive ? 'step-active' : 'step-wait'}`} style={{ width:30, height:30, fontSize:12 }}>
                {isDone ? '✓' : i+1}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:12, color: isDone ? 'var(--m400)' : isActive ? 'var(--t300)' : 'var(--n700)' }}>{label}</div>
                <div style={{ fontSize:10, color:'var(--n700)', marginTop:1 }}>{desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Header */}
      <div className="fade-up">
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
          <div style={{ width:52, height:52, borderRadius:15, background:'rgba(20,184,166,0.12)', border:'1px solid rgba(20,184,166,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={24} color="var(--t500)" />
          </div>
          <div>
            <h1 className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.5px' }}>
              <span className="grad-teal">Run Full Pipeline</span>
            </h1>
            <p style={{ color:'var(--n600)', fontSize:14 }}>Enter tickers once — the entire AI pipeline runs automatically</p>
          </div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:22, alignItems:'flex-start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Ticker Input */}
          <div className="card fade-up" style={{ padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div className="font-display" style={{ fontWeight:700, fontSize:16, color:'var(--white)', marginBottom:3 }}>1. Select Stock Tickers</div>
                <div style={{ fontSize:13, color:'var(--n600)' }}>Minimum 3, maximum 10 — any Yahoo Finance symbol</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div className="stat-number" style={{ fontSize:28, color: tickers.length < 3 ? 'var(--amber)' : 'var(--t400)', lineHeight:1 }}>{tickers.length}</div>
                <div style={{ fontSize:10, color:'var(--n600)', marginTop:2 }}>/ 10 ticker{tickers.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <input className="field" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTicker()}
                placeholder="Type ticker (e.g. RELIANCE.NS or AAPL) and press Enter" />
              <button className="btn btn-primary" onClick={addTicker} disabled={tickers.length >= 10} style={{ padding:'11px 18px', fontSize:13, borderRadius:11, whiteSpace:'nowrap' }}>
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Tickers */}
            {tickers.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:16 }}>
                {tickers.map((t, idx) => (
                  <span key={t} className="tag" style={{ fontSize:12 }}>
                    <span style={{ color:'var(--n600)', fontSize:10, marginRight:2 }}>#{idx+1}</span>
                    {t}
                    <button onClick={() => setTickers(p => p.filter(x => x !== t))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t400)', display:'flex', padding:0 }}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Progress bar */}
            <div className="alloc-bar-track" style={{ marginBottom: tickers.length === 0 ? 16 : 0 }}>
              <div className="alloc-bar-fill bar-teal" style={{ width:`${tickers.length * 10}%` }} />
            </div>

            {/* Presets */}
            {tickers.length === 0 && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--n600)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.07em' }}>Quick Presets</div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {PRESETS.map(p => (
                    <div key={p.label} onClick={() => setTickers(p.tickers)}
                      className="card" style={{ padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', flex:1 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--n200)' }}>{p.label}</div>
                        <div style={{ fontSize:11, color:'var(--n600)', marginTop:2 }}>{p.desc} · {p.tickers.length} stocks</div>
                      </div>
                      <div style={{ display:'flex', gap:5 }}>
                        {p.tickers.slice(0,3).map(t => <span key={t} className="tag" style={{ fontSize:10, padding:'2px 7px' }}>{t}</span>)}
                        {p.tickers.length > 3 && <span style={{ fontSize:10, color:'var(--n600)', alignSelf:'center' }}>+{p.tickers.length-3}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Algorithm */}
          <div className="card fade-up-2" style={{ padding:28 }}>
            <div className="font-display" style={{ fontWeight:700, fontSize:16, color:'var(--white)', marginBottom:4 }}>2. Choose Algorithm</div>
            <div style={{ fontSize:13, color:'var(--n600)', marginBottom:18 }}>Both use stable-baselines3 under the hood</div>
            <div style={{ display:'flex', gap:12 }}>
              <AlgoCard algo="DDPG" selected={algo==='DDPG'} onClick={() => setAlgo('DDPG')} />
              <AlgoCard algo="PPO"  selected={algo==='PPO'}  onClick={() => setAlgo('PPO')}  />
            </div>
          </div>

          {/* Timesteps */}
          <div className="card fade-up-3" style={{ padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div className="font-display" style={{ fontWeight:700, fontSize:16, color:'var(--white)', marginBottom:3 }}>3. Training Timesteps</div>
                <div style={{ fontSize:13, color:'var(--n600)' }}>More steps = better policy, longer runtime</div>
              </div>
              <div className="num-highlight">
                <span className="stat-number stat-med grad-teal">{steps.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
              {[
                { v:1000,  l:'1K',  sub:'~30s' },
                { v:5000,  l:'5K',  sub:'~2min' },
                { v:10000, l:'10K', sub:'~4min' },
                { v:25000, l:'25K', sub:'~10min' },
              ].map(({ v, l, sub }) => (
                <button key={v} onClick={() => setSteps(v)}
                  className={steps === v ? 'btn btn-primary' : 'btn btn-ghost'}
                  style={{ borderRadius:10, padding:'8px 16px', fontSize:13, flex:1 }}>
                  <span style={{ fontWeight:800 }}>{l}</span>
                  <span style={{ fontSize:10, opacity:0.7 }}> {sub}</span>
                </button>
              ))}
            </div>
            <input type="range" min={100} max={50000} step={100} value={steps} onChange={e => setSteps(parseInt(e.target.value))} style={{ width:'100%' }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, fontSize:11, color:'var(--n700)' }}>
              <span>100</span><span>Fast ◀────────────▶ Accurate</span><span>50,000</span>
            </div>

            <div className="callout callout-teal" style={{ marginTop:16, fontSize:12 }}>
              <strong>Recommendation:</strong> Start with <strong>5,000</strong> timesteps. For Indian stocks (Nifty), increase to 10–25K for more stable allocations. DDPG typically converges within 5K steps for a 5-asset portfolio.
            </div>
          </div>

          {error && (
            <div className="callout callout-red fade-up" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <AlertCircle size={16} color="var(--coral)" style={{ flexShrink:0 }} /> {error}
            </div>
          )}

          <button className="btn btn-primary fade-up-4" onClick={run} disabled={tickers.length < 3}
            style={{ padding:'16px 22px', fontSize:17, width:'100%', borderRadius:14, fontFamily:"'Sora',sans-serif", letterSpacing:'-0.3px' }}>
            <Play size={19} fill="currentColor" />
            Run Full Pipeline&nbsp;—&nbsp;{algo}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="card" style={{ padding:22 }}>
            <div className="section-label">Automated Steps</div>
            {STEPS.map(({ icon:Icon, label, desc, color }, i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'9px 0', borderBottom: i < STEPS.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems:'flex-start' }}>
                <div style={{ width:28, height:28, borderRadius:8, background:`${color}14`, border:`1px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={13} color={color} />
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--n200)' }}>{label}</div>
                  <div style={{ fontSize:10.5, color:'var(--n700)', marginTop:1, lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding:18, borderColor:'rgba(20,184,166,0.2)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--t400)', marginBottom:8 }}>🔧 Prediction Fix Applied</div>
            <p style={{ fontSize:11.5, color:'var(--n400)', lineHeight:1.7 }}>
              <strong style={{ color:'var(--n200)' }}>Softmax normalization</strong> in <code style={{ color:'var(--t300)', background:'rgba(20,184,166,0.1)', padding:'0 4px', borderRadius:4 }}>act()</code> + <strong style={{ color:'var(--n200)' }}>growth-factor rewards</strong> ensure genuine diversification. 
              Weights are averaged over <strong style={{ color:'var(--n200)' }}>50 warm-up steps</strong> for stability.
            </p>
          </div>

          <div className="card" style={{ padding:18 }}>
            <div className="section-label">Config Summary</div>
            {[
              { k:'Train start',  v:'2000-01-01' },
              { k:'Train end',    v:'Today − 2yr' },
              { k:'Test window',  v:'Today − 2yr → −10d' },
              { k:'Benchmark',    v:'^NSEI (Nifty 50)' },
              { k:'Env type',     v:'Growth-Factor Gym' },
              { k:'Prediction',   v:`50-step Softmax Avg` },
            ].map(({ k, v }) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12 }}>
                <span style={{ color:'var(--n600)' }}>{k}</span>
                <span className="mono" style={{ color:'var(--t400)', fontSize:11 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
