// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkHealth } from '../services/api';
import { Layers, TrendingUp, BarChart2, FileText, Activity, Server, ArrowRight, Cpu, Brain, Shield, Zap, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const makeSparkline = (seed, up) => Array.from({length:20}, (_, i) => ({
  v: Math.max(10, 50 + (up ? 1:-1) * i * 1.5 + Math.sin(i * seed) * 18 + Math.random() * 10)
}));

const SPARKLINES = {
  teal:  makeSparkline(0.8, true),
  steel: makeSparkline(1.2, true),
  mint:  makeSparkline(0.5, false),
  amber: makeSparkline(1.5, true),
};

function SparkCard({ color, val, label, sub, sparkData, icon: Icon }) {
  return (
    <div className="metric-card card-3d fade-up" style={{ position:'relative', overflow:'hidden' }}>
      <div className="orb" style={{ width:80, height:80, top:-20, right:-20, background:`radial-gradient(circle, ${color}30, transparent 70%)` }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, opacity:0.45 }}>
        <ResponsiveContainer width="100%" height={60}>
          <AreaChart data={sparkData} margin={{top:0,right:0,left:0,bottom:0}}>
            <Area type="monotone" dataKey="v" stroke={color} fill={`${color}20`} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Icon size={17} color={color} />
          </div>
          <span className="badge badge-info" style={{ fontSize:10, background:`${color}14`, color, borderColor:`${color}30` }}>LIVE</span>
        </div>
        <div className="stat-number stat-large" style={{ color, marginBottom:4 }}>{val}</div>
        <div style={{ fontWeight:600, fontSize:13, color:'var(--n200)', marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:11, color:'var(--n600)' }}>{sub}</div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Brain,    color:'var(--t600)', title:'DDPG Algorithm',        tags:['Actor-Critic','Off-Policy','Deterministic'], desc:'Deep Deterministic Policy Gradient for continuous portfolio actions.' },
  { icon: Shield,   color:'var(--s500)', title:'Softmax Normalization',  tags:['No Degenerate Splits','Smooth Gradients'],  desc:'Weights normalized via stable softmax, always sum to exactly 100%.' },
  { icon: Zap,      color:'var(--m500)', title:'Growth-Factor Rewards',  tags:['Meaningful Rewards','Diversified Learning'], desc:'Agent learns on daily-return growth factors (1+r/100) — real signals.' },
  { icon: Activity, color:'var(--amber)', title:'QuantStats Evaluation', tags:['Benchmark vs ^NSEI','Risk-Adjusted'],        desc:'Sharpe, Sortino, Calmar, CAGR, Volatility, Max Drawdown vs Nifty 50.' },
];

const WORKFLOW = [
  { n:1, label:'Enter Tickers',     color:'var(--t600)'  },
  { n:2, label:'Fetch yfinance',    color:'var(--s500)'  },
  { n:3, label:'Build Env',         color:'#a78bfa'      },
  { n:4, label:'Train DDPG',        color:'var(--m500)'  },
  { n:5, label:'Softmax Predict',   color:'var(--amber)' },
  { n:6, label:'QuantStats Eval',   color:'var(--coral)' },
];

export default function Dashboard({ result }) {
  const [health, setHealth] = useState(null);
  const [ping, setPing]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t0 = Date.now();
    checkHealth()
      .then(() => { setHealth(true); setPing(Date.now()-t0); })
      .catch(() => setHealth(false));
  }, []);

  const cards = [
    { to:'/pipeline', icon:Layers,     color:'var(--t600)',  label:'Run Pipeline',  desc:'One-shot: tickers → train → predict → evaluate → report' },
    { to:'/results',  icon:TrendingUp, color:'var(--s500)',  label:'Allocation',    desc:'View DDPG-recommended portfolio weights' },
    { to:'/evaluate', icon:BarChart2,  color:'#a78bfa',      label:'Risk Metrics',  desc:'Sharpe, Sortino, CAGR, Max Drawdown' },
    { to:'/report',   icon:FileText,   color:'var(--m500)',  label:'Full Report',   desc:'Charts + metrics + calculator' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:32 }}>

      {/* HERO */}
      <div className="card fade-up" style={{ padding:'40px 42px', position:'relative', overflow:'hidden', background:'linear-gradient(135deg,rgba(13,148,136,0.2) 0%,rgba(10,20,20,0.9) 60%)', borderColor:'rgba(20,184,166,0.2)' }}>
        <div className="orb orb-teal" style={{ width:300, height:300, top:-80, left:-60 }} />
        <div className="orb orb-steel" style={{ width:200, height:200, bottom:-60, right:-40 }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span className="badge badge-info" style={{ fontSize:10, padding:'3px 10px' }}>RL Portfolio Engine v2.0</span>
            <span className="badge badge-ok" style={{ fontSize:10, padding:'3px 10px' }}>
              {health === null ? 'Checking...' : health ? `Backend Online · ${ping}ms` : 'Backend Offline'}
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize:46, fontWeight:900, letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:14 }}>
            <span className="grad-ocean">Ocean RL · </span>
            <span style={{ color:'var(--white)' }}>Portfolio</span>
            <br/>
            <span style={{ color:'var(--white)' }}>Management </span>
            <span className="grad-teal">Engine</span>
          </h1>
          <p style={{ fontSize:16, color:'var(--n200)', maxWidth:520, lineHeight:1.7, marginBottom:24 }}>
            Deep Reinforcement Learning meets quantitative finance. The DDPG agent learns
            optimal portfolio allocations from historical market data, evaluated with
            institutional-grade QuantStats metrics.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 24px', fontSize:15, borderRadius:12 }}>
              <Layers size={17} /> Start Pipeline <ChevronRight size={15} />
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/results')} style={{ padding:'12px 24px', fontSize:15, borderRadius:12 }}>
              <TrendingUp size={17} /> View Last Results
            </button>
          </div>
        </div>
      </div>

      {/* Last run banner */}
      {result && (
        <div className="card fade-up" style={{ padding:'16px 24px', borderColor:'rgba(16,185,129,0.3)', background:'rgba(16,185,129,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <CheckCircle2 size={20} color="var(--m500)" />
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'var(--m400)' }}>
                Last Run: {result.tickers?.join(' · ')}
              </div>
              <div style={{ fontSize:12, color:'var(--n600)', marginTop:2 }}>
                {result.algorithm} · {result.total_timesteps?.toLocaleString()} timesteps · {result.n_assets} assets
              </div>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/results')} style={{ padding:'8px 16px', fontSize:13, borderRadius:9 }}>
            View Allocation <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Spark cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
        <SparkCard icon={Brain}    color="var(--t500)"  val="DDPG"     label="Algorithm"       sub="Deep Deterministic Policy Gradient"   sparkData={SPARKLINES.teal}  />
        <SparkCard icon={Shield}   color="var(--s400)"  val="100%"     label="Weight Coverage"  sub="Softmax ensures all weights sum to 1"  sparkData={SPARKLINES.steel} />
        <SparkCard icon={Activity} color="var(--m400)"  val="7+"       label="Metrics"          sub="Sharpe, Sortino, Calmar, CAGR…"        sparkData={SPARKLINES.mint}  />
        <SparkCard icon={Clock}    color="var(--amber)" val="50 steps" label="Prediction Mode"  sub="Averaged for stability"                sparkData={SPARKLINES.amber} />
      </div>

      {/* Quick access */}
      <div>
        <div className="section-label">Quick Access</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14 }}>
          {cards.map(({ to, icon:Icon, color, label, desc }) => (
            <div key={to} className="card card-3d fade-up" onClick={() => navigate(to)}
              style={{ padding:24, cursor:'pointer', borderColor:`${color}18` }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${color}15`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <Icon size={20} color={color} />
              </div>
              <div className="font-display" style={{ fontWeight:700, fontSize:15, color:'var(--white)', marginBottom:6 }}>{label}</div>
              <div style={{ fontSize:12, color:'var(--n600)', lineHeight:1.6, marginBottom:14 }}>{desc}</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, color, fontSize:12, fontWeight:600 }}>
                Open <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="card" style={{ padding:'28px 32px' }}>
        <div className="section-label">Automated Pipeline Flow</div>
        <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:0 }}>
          {WORKFLOW.map(({ n, label, color }, i) => (
            <div key={n} style={{ display:'flex', alignItems:'center' }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, minWidth:100, padding:'0 8px' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`${color}16`, border:`2px solid ${color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:16, color, fontFamily:"'Sora', sans-serif" }}>
                  {n}
                </div>
                <div style={{ textAlign:'center', fontSize:12, fontWeight:700, color:'var(--n200)' }}>{label}</div>
              </div>
              {i < WORKFLOW.length-1 && <div className="pipe-line" />}
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <div className="section-label">Core Technology</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {FEATURES.map(({ icon:Icon, color, title, desc, tags }) => (
            <div key={title} className="card fade-up" style={{ padding:22 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, border:`1px solid ${color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Icon size={17} color={color} />
                </div>
                <div className="font-display" style={{ fontWeight:700, fontSize:13, color:'var(--n200)' }}>{title}</div>
              </div>
              <p style={{ fontSize:12.5, color:'var(--n400)', lineHeight:1.7, marginBottom:12 }}>{desc}</p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {tags.map(t => <span key={t} className="badge badge-info" style={{ background:`${color}12`, color, borderColor:`${color}25`, fontSize:10 }}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Reference */}
      <div className="card" style={{ padding:'24px 28px' }}>
        <div className="section-label">Backend API Reference</div>
        <table className="data-table">
          <thead>
            <tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Use</th></tr>
          </thead>
          <tbody>
            {[
              { m:'GET',  p:'/health',           d:'Backend health check',             u:'Monitor' },
              { m:'POST', p:'/pipeline/run',     d:'Full one-shot pipeline',            u:'⭐ Primary' },
              { m:'GET',  p:'/pipeline/session', d:'Last pipeline results',             u:'Cache' },
              { m:'POST', p:'/train',            d:'Train DDPG/PPO agent',              u:'Manual' },
              { m:'POST', p:'/predict',          d:'Softmax-normalized allocation',     u:'Manual' },
              { m:'POST', p:'/evaluate',         d:'QuantStats vs Nifty 50',            u:'Manual' },
              { m:'POST', p:'/report/generate',  d:'Full report + pie chart',           u:'Manual' },
            ].map(({ m, p, d, u }) => (
              <tr key={p}>
                <td><span className={`badge ${m==='GET'?'badge-ok':'badge-info'}`}>{m}</span></td>
                <td><span className="mono" style={{ fontSize:12, color:'var(--t400)' }}>{p}</span></td>
                <td style={{ color:'var(--n400)' }}>{d}</td>
                <td>{u.includes('⭐') ? <span className="badge badge-gold">{u}</span> : <span style={{ fontSize:12, color:'var(--n600)' }}>{u}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
