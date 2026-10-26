// src/pages/ResultsPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cpu, RefreshCw, CheckCircle2, IndianRupee, TrendingUp } from 'lucide-react';

const PALETTE = ['#89243a','#b4706e','#c9b592','#0284c7','#059669','#d97706','#a83249','#6b7280','#c44d63','#9a815e'];

const PieTip = ({ active, payload }) => active && payload?.length ? (
  <div style={{ background:'rgba(255,255,255,0.96)', border:'1px solid var(--border-2)', borderRadius:12, padding:'12px 18px', boxShadow:'var(--shadow-lg)' }}>
    <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14, marginBottom:4 }}>{payload[0].name}</div>
    <div className="stat-number stat-large" style={{ color:'var(--b600)' }}>{(payload[0].value * 100).toFixed(2)}%</div>
    <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:4 }}>of total portfolio</div>
  </div>
) : null;

function RupeeCalculator({ allocation, tickers }) {
  const [budget, setBudget] = useState(100000);
  const entries = Object.entries(allocation || {}).sort(([,a],[,b]) => b-a);
  const presets = [10000, 50000, 100000, 500000, 1000000];

  return (
    <div className="card fade-up-3" style={{ padding:26 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <IndianRupee size={18} color="var(--amber)" />
        </div>
        <div>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>Investment Calculator</div>
          <div style={{ fontSize:12, color:'var(--text-dim)' }}>How to split your investment using DDPG allocation</div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        {presets.map(p => (
          <button key={p} onClick={() => setBudget(p)}
            className={budget === p ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ borderRadius:8, padding:'6px 12px', fontSize:12 }}>
            ₹{p >= 100000 ? `${p/100000}L` : `${p/1000}K`}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
        <span style={{ color:'var(--text-dim)', fontSize:14 }}>₹</span>
        <input type="number" value={budget} onChange={e => setBudget(Math.max(0, parseInt(e.target.value)||0))}
          className="field" style={{ fontFamily:"'DM Sans',sans-serif", fontSize:18, fontWeight:700 }} />
      </div>

      {/* Breakdown table */}
      <table className="data-table" style={{ borderRadius:10, overflow:'hidden' }}>
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
                    <div className="bar-track" style={{ width:60, height:4 }}>
                      <div className="bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length] }} />
                    </div>
                    <span className="mono" style={{ color:PALETTE[i%PALETTE.length], fontWeight:600, fontSize:12 }}>{pct}%</span>
                  </div>
                </td>
                <td>
                  <span className="font-display" style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </span>
                </td>
                <td style={{ fontSize:11, color:'var(--text-dim)' }}>
                  Invest {pct}% of ₹{budget.toLocaleString('en-IN')} in {ticker}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop:12, padding:'10px 14px', borderRadius:10, background:'rgba(5,150,105,0.04)', border:'1px solid rgba(5,150,105,0.12)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ color:'var(--text-dim)', fontSize:13 }}>Total Investment</span>
        <span className="font-display" style={{ fontWeight:800, fontSize:17, color:'var(--emerald)' }}>
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
      <div style={{ width:72, height:72, borderRadius:18, background:'rgba(168,50,73,0.06)', border:'1px solid rgba(168,50,73,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Cpu size={30} color="var(--b400)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Results Yet</h2>
        <p style={{ color:'var(--text-dim)', fontSize:14, marginBottom:20 }}>Run the pipeline first to see portfolio allocation</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 24px', fontSize:14, borderRadius:10 }}>
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
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.6px' }}>
            <span className="grad-burgundy">Portfolio Allocation</span>
          </h1>
          <p style={{ color:'var(--text-dim)', fontSize:13, marginTop:4 }}>
            {result.algorithm} · {result.n_assets} assets · {result.total_timesteps?.toLocaleString()} timesteps · Softmax-normalized
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div className="card" style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:8, borderColor:'rgba(5,150,105,0.2)' }}>
            <CheckCircle2 size={16} color="var(--emerald)" />
            <div>
              <div style={{ fontSize:10, color:'var(--text-dim)' }}>Total Allocated</div>
              <div className="stat-number stat-med" style={{ color:'var(--emerald)' }}>{totalPct}%</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/pipeline')} style={{ padding:'10px 14px', fontSize:13, borderRadius:8 }}>
            <RefreshCw size={14} /> Re-run
          </button>
        </div>
      </div>

      {/* Big pct cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
        {sorted.map(({ ticker, pct }, i) => (
          <div key={ticker} className="metric-card card-elevated fade-up" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span className="tag" style={{ fontSize:10, padding:'2px 7px' }}>{ticker}</span>
                <span style={{ fontSize:11, color:'var(--text-dim)', fontWeight:600 }}>#{i+1}</span>
              </div>
              <div className="stat-number" style={{ fontSize:34, color:PALETTE[i%PALETTE.length], lineHeight:1, marginBottom:4 }}>
                {pct.toFixed(1)}
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                <span style={{ fontSize:13, color:'var(--text-dim)', fontWeight:600 }}>%</span>
                <span style={{ fontSize:10, color:'var(--text-faint)', marginLeft:4 }}>of portfolio</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Donut */}
        <div className="card fade-up" style={{ padding:26 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'var(--text-primary)' }}>Allocation Distribution</div>
          <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:18 }}>Recommended weight per asset · hover for details</div>
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={68} outerRadius={115} paddingAngle={3} dataKey="value"
                label={({ name, value }) => `${(value*100).toFixed(1)}%`} labelLine={false}
                strokeWidth={0}>
                {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i%PALETTE.length]} opacity={0.9} />)}
              </Pie>
              <Tooltip content={<PieTip />} />
              <Legend formatter={(v) => <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weight bars */}
        <div className="card fade-up-2" style={{ padding:26 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'var(--text-primary)' }}>Weight Breakdown</div>
          <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:18 }}>Ranked from highest to lowest allocation</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sorted.map(({ ticker, pct }, i) => (
              <div key={ticker}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:3, background:PALETTE[i%PALETTE.length], flexShrink:0 }} />
                    <span className="tag" style={{ fontSize:11 }}>{ticker}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                    <span className="stat-number" style={{ fontSize:20, color:PALETTE[i%PALETTE.length] }}>{pct.toFixed(1)}</span>
                    <span style={{ fontSize:11, color:'var(--text-dim)', fontWeight:600 }}>%</span>
                  </div>
                </div>
                <div className="alloc-bar-track">
                  <div className="alloc-bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length], opacity:0.8 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'var(--text-dim)' }}>Portfolio Coverage</span>
            <span className="stat-number stat-med" style={{ color:'var(--emerald)' }}>{totalPct}%</span>
          </div>
        </div>
      </div>

      {/* Investment Calculator */}
      <RupeeCalculator allocation={result.allocation} tickers={result.tickers} />

      {/* Interpretation */}
      <div className="card fade-up" style={{ padding:26 }}>
        <div className="section-label">How to Interpret These Results</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {[
            { t:'What do percentages mean?', d:'Each percentage is the fraction of your total portfolio to invest in that stock. E.g. 40% means put 40% of your capital in that asset.', color:'var(--b500)' },
            { t:'Why does DDPG choose these weights?', d:'The agent learned from 20+ years of price history. Higher allocation = agent predicts higher risk-adjusted return for that asset.', color:'var(--sky)' },
            { t:'How reliable is this?', d:'Tested with QuantStats vs Nifty 50 benchmark. Weights are averaged over 50 env steps for stability. Re-train with more timesteps for better accuracy.', color:'var(--emerald)' },
            { t:'When to rebalance?', d:'Run the pipeline periodically (weekly/monthly) to get fresh allocations as market conditions change.', color:'var(--amber)' },
          ].map(({ t, d, color }) => (
            <div key={t} className="callout callout-burgundy" style={{ borderColor:color }}>
              <div style={{ fontWeight:600, fontSize:12, color, marginBottom:5 }}>{t}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.65 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw vector */}
      <div className="card" style={{ padding:18 }}>
        <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:8 }}>🔢 Raw softmax action vector · Sum = {result.action?.reduce((s,a)=>s+a,0).toFixed(8)}</div>
        <div className="mono" style={{ fontSize:11, color:'var(--b500)', wordBreak:'break-all', lineHeight:1.8 }}>
          [{result.action?.map(a => a.toFixed(8)).join(', ')}]
        </div>
      </div>
    </div>
  );
}
