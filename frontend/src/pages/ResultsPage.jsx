// src/pages/ResultsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cpu, RefreshCw, CheckCircle2, IndianRupee, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';

const PALETTE = ['#14b8a6','#6baed6','#34d399','#a78bfa','#f59e0b','#5eead4','#93c6e4','#6ee7b7','#c4b5fd','#fbbf24'];

const PieTip = ({ active, payload }) => active && payload?.length ? (
  <div style={{ background:'rgba(5,13,13,0.97)', border:'1px solid rgba(45,212,191,0.25)', borderRadius:14, padding:'12px 18px', boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
    <div style={{ fontWeight:800, color:'var(--white)', fontSize:15, marginBottom:4 }}>{payload[0].name}</div>
    <div className="stat-number stat-large" style={{ color:'var(--t400)' }}>{(payload[0].value * 100).toFixed(2)}%</div>
    <div style={{ fontSize:11, color:'var(--n600)', marginTop:4 }}>of total portfolio</div>
  </div>
) : null;

function RupeeCalculator({ allocation, tickers }) {
  const [budget, setBudget] = useState(100000);
  const entries = Object.entries(allocation || {}).sort(([,a],[,b]) => b-a);
  const presets = [10000, 50000, 100000, 500000, 1000000];

  return (
    <div className="card fade-up-3" style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IndianRupee size={20} color="var(--amber)" />
        </div>
        <div>
          <div className="font-display" style={{ fontWeight:800, fontSize:16, color:'var(--white)' }}>Investment Calculator</div>
          <div style={{ fontSize:12, color:'var(--n600)' }}>How to split your investment using DDPG allocation</div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {presets.map(p => (
          <button key={p} onClick={() => setBudget(p)}
            className={budget === p ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ borderRadius:9, padding:'6px 14px', fontSize:12 }}>
            ₹{p >= 100000 ? `${p/100000}L` : `${p/1000}K`}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
        <span style={{ color:'var(--n600)', fontSize:14 }}>₹</span>
        <input type="number" value={budget} onChange={e => setBudget(Math.max(0, parseInt(e.target.value)||0))}
          className="field" style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700 }} />
      </div>

      {/* Breakdown table */}
      <table className="data-table" style={{ borderRadius:12, overflow:'hidden' }}>
        <thead>
          <tr>
            <th>Ticker</th><th>Allocation</th><th>Amount (₹)</th><th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([ticker, w], i) => {
            const pct = (w * 100).toFixed(2);
            const amt = (w * budget).toFixed(0);
            return (
              <tr key={ticker}>
                <td><span className="tag" style={{ fontSize:12 }}>{ticker}</span></td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div className="bar-track" style={{ width:60, height:5 }}>
                      <div className="bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length] }} />
                    </div>
                    <span className="mono" style={{ color:PALETTE[i%PALETTE.length], fontWeight:700 }}>{pct}%</span>
                  </div>
                </td>
                <td>
                  <span className="font-display" style={{ fontWeight:800, fontSize:15, color:'var(--white)' }}>
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </span>
                </td>
                <td style={{ fontSize:11, color:'var(--n600)' }}>
                  Invest {pct}% of ₹{budget.toLocaleString('en-IN')} in {ticker}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'var(--n600)', fontSize:13 }}>Total Investment</span>
        <span className="font-display" style={{ fontWeight:900, fontSize:18, color:'var(--m400)' }}>
          ₹{budget.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}

export default function ResultsPage({ result }) {
  const navigate = useNavigate();

  if (!result) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:20 }}>
      <div style={{ width:80, height:80, borderRadius:20, background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Cpu size={34} color="var(--t700)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:800, color:'var(--n200)', marginBottom:8 }}>No Results Yet</h2>
        <p style={{ color:'var(--n600)', fontSize:14, marginBottom:20 }}>Run the pipeline first to see portfolio allocation</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 26px', fontSize:15, borderRadius:12 }}>
        → Go to Pipeline
      </button>
    </div>
  );

  const getPct = (ticker, w) => result.allocation_pct?.[ticker] ?? parseFloat((w*100).toFixed(2));
  const entries = Object.entries(result.allocation || {});
  const sorted = entries.map(([t,w]) => ({ ticker:t, weight:w, pct:getPct(t,w) })).sort((a,b)=>b.pct-a.pct);
  const chartData = entries.map(([name, value]) => ({ name, value: parseFloat(value) }));
  const totalPct = sorted.reduce((s,r) => s+r.pct, 0).toFixed(1);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.6px' }}>
            <span className="grad-teal">Portfolio Allocation</span>
          </h1>
          <p style={{ color:'var(--n600)', fontSize:13, marginTop:4 }}>
            {result.algorithm} · {result.n_assets} assets · {result.total_timesteps?.toLocaleString()} timesteps · Softmax-normalized
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div className="card" style={{ padding:'10px 18px', display:'flex', alignItems:'center', gap:8, borderColor:'rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={16} color="var(--m500)" />
            <div>
              <div style={{ fontSize:10, color:'var(--n600)' }}>Total Allocated</div>
              <div className="stat-number stat-med" style={{ color:'var(--m400)' }}>{totalPct}%</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/pipeline')} style={{ padding:'10px 16px', fontSize:13, borderRadius:10 }}>
            <RefreshCw size={14} /> Re-run
          </button>
        </div>
      </div>

      {/* Big pct cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
        {sorted.map(({ ticker, pct }, i) => (
          <div key={ticker} className="metric-card card-3d fade-up" style={{ borderColor:`${PALETTE[i%PALETTE.length]}22`, position:'relative', overflow:'hidden' }}>
            <div className="orb" style={{ width:80, height:80, top:-20, right:-20, background:`radial-gradient(circle,${PALETTE[i%PALETTE.length]}25,transparent 70%)` }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span className="tag" style={{ fontSize:10, padding:'2px 8px' }}>{ticker}</span>
                <span style={{ fontSize:11, color:'var(--n600)', fontWeight:600 }}>#{i+1}</span>
              </div>
              <div className="stat-number" style={{ fontSize:36, color:PALETTE[i%PALETTE.length], lineHeight:1, marginBottom:4 }}>
                {pct.toFixed(1)}
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                <span style={{ fontSize:14, color:'var(--n600)', fontWeight:700 }}>%</span>
                <span style={{ fontSize:10, color:'var(--n700)', marginLeft:4 }}>of portfolio</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Donut */}
        <div className="card fade-up" style={{ padding:28 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Allocation Distribution</div>
          <div style={{ fontSize:12, color:'var(--n600)', marginBottom:20 }}>Recommended weight per asset · hover for details</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${(value*100).toFixed(1)}%`} labelLine={false}
                strokeWidth={0}>
                {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]} opacity={0.9} />)}
              </Pie>
              <Tooltip content={<PieTip />} />
              <Legend formatter={(v) => <span style={{ fontSize:12, color:'var(--n400)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weight bars */}
        <div className="card fade-up-2" style={{ padding:28 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Weight Breakdown</div>
          <div style={{ fontSize:12, color:'var(--n600)', marginBottom:20 }}>Ranked from highest to lowest allocation</div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {sorted.map(({ ticker, pct }, i) => (
              <div key={ticker}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:3, background:PALETTE[i%PALETTE.length], flexShrink:0 }} />
                    <span className="tag" style={{ fontSize:11 }}>{ticker}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                    <span className="stat-number" style={{ fontSize:22, color:PALETTE[i%PALETTE.length] }}>{pct.toFixed(1)}</span>
                    <span style={{ fontSize:11, color:'var(--n600)', fontWeight:700 }}>%</span>
                  </div>
                </div>
                <div className="alloc-bar-track">
                  <div className="alloc-bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length], opacity:0.85 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--n600)' }}>Portfolio Coverage</span>
            <span className="stat-number stat-med" style={{ color:'var(--m400)' }}>{totalPct}%</span>
          </div>
        </div>
      </div>

      {/* Investment Calculator */}
      <RupeeCalculator allocation={result.allocation} tickers={result.tickers} />

      {/* Interpretation */}
      <div className="card fade-up" style={{ padding:28 }}>
        <div className="section-label">How to Interpret These Results</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {[
            { t:'What do percentages mean?', d:'Each percentage is the fraction of your total portfolio to invest in that stock. E.g. 40% means put 40% of your capital in that asset.', color:'var(--t600)' },
            { t:'Why does DDPG choose these weights?', d:'The agent learned from 20+ years of price history. Higher allocation = agent predicts higher risk-adjusted return for that asset.', color:'var(--s500)' },
            { t:'How reliable is this?', d:'Tested with QuantStats vs Nifty 50 benchmark. Weights are averaged over 50 env steps for stability. Re-train with more timesteps for better accuracy.', color:'var(--m500)' },
            { t:'When to rebalance?', d:'Run the pipeline periodically (weekly/monthly) to get fresh allocations as market conditions change.', color:'var(--amber)' },
          ].map(({ t, d, color }) => (
            <div key={t} className="callout callout-teal" style={{ borderColor:color }}>
              <div style={{ fontWeight:700, fontSize:12, color, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:12, color:'var(--n400)', lineHeight:1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw vector */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontSize:12, color:'var(--n600)', marginBottom:8 }}>🔢 Raw softmax action vector · Sum = {result.action?.reduce((s,a)=>s+a,0).toFixed(8)}</div>
        <div className="mono" style={{ fontSize:11, color:'var(--t300)', wordBreak:'break-all', lineHeight:1.8 }}>
          [{result.action?.map(a => a.toFixed(8)).join(', ')}]
        </div>
      </div>
    </div>
  );
}
