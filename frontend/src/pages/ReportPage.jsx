// src/pages/ReportPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, TrendingUp, BarChart2, PieChart as PieIcon, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PALETTE = ['#89243a','#b4706e','#c9b592','#0284c7','#059669','#d97706','#a83249','#6b7280','#c44d63','#9a815e'];
const METRIC_LABELS = { sharpe:'Sharpe', sortino:'Sortino', calmar:'Calmar', cagr:'CAGR', volatility:'Volatility', max_drawdown:'Max Drawdown', benchmark_sharpe:'Benchmark' };
function quality(key, v) {
  if (!v && v !== 0) return null;
  if (key === 'sharpe'||key==='sortino') return v>2?'excellent':v>1?'good':v>0?'average':'poor';
  if (key === 'max_drawdown') return v>-0.1?'excellent':v>-0.2?'good':v>-0.35?'average':'poor';
  if (key === 'cagr') return v>0.15?'excellent':v>0.08?'good':v>0?'average':'poor';
  return null;
}
const qColor = { excellent:'var(--emerald)', good:'var(--sky)', average:'var(--amber)', poor:'var(--coral)' };

function ExecutiveSummary({ result }) {
  const sorted = Object.entries(result.allocation||{})
    .map(([t,w]) => ({ t, w })).sort((a,b) => b.w-a.w);
  const top = sorted[0];
  const qs  = result.quantstats || {};
  const sharpe = qs.sharpe;
  const grade = sharpe > 2 ? 'A+' : sharpe > 1 ? 'B+' : sharpe > 0 ? 'C' : 'D';
  const gradeColor = sharpe > 2 ? 'var(--emerald)' : sharpe > 1 ? 'var(--sky)' : sharpe > 0 ? 'var(--amber)' : 'var(--coral)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'flex-start' }}>
        <div>
          <div className="section-label">Portfolio Overview</div>
          <h2 className="font-display" style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>
            {result.algorithm} Portfolio · {result.n_assets} Assets
          </h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>
            Trained with <strong style={{ color:'var(--text-primary)' }}>{result.total_timesteps?.toLocaleString()} timesteps</strong> on tickers: <strong style={{ color:'var(--b600)' }}>{result.tickers?.join(', ')}</strong>.
            The dominant holding is <strong style={{ color:'var(--b500)' }}>{top?.t}</strong> at <strong style={{ color:'var(--b500)' }}>{((top?.w||0)*100).toFixed(1)}%</strong>.
            Evaluated against Nifty 50 (^NSEI) using QuantStats.
          </p>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:11, color:'var(--text-dim)', marginBottom:6, fontWeight:600 }}>Portfolio Grade</div>
          <div className="font-display" style={{ fontSize:58, fontWeight:800, color:gradeColor, lineHeight:1 }}>{grade}</div>
          <div style={{ fontSize:11, color:'var(--text-faint)', marginTop:4 }}>Based on Sharpe Ratio</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
        {[
          { label:'Top Holding',  value: top?.t,  sub:`${((top?.w||0)*100).toFixed(1)}% allocated`, color:'var(--b500)' },
          { label:'Algorithm',   value: result.algorithm, sub:'stable-baselines3',   color:'var(--sky)' },
          { label:'Sharpe Ratio', value: sharpe?.toFixed(3)??'—', sub:sharpe>1?'Above benchmark':'Below benchmark', color: sharpe>1 ? 'var(--emerald)' : 'var(--amber)' },
          { label:'CAGR',         value: qs.cagr ? `${(qs.cagr*100).toFixed(1)}%` : '—', sub:'Annual growth rate', color:'var(--emerald)' },
          { label:'Max Drawdown', value: qs.max_drawdown ? `${(qs.max_drawdown*100).toFixed(1)}%` : '—', sub:'Worst peak-to-trough', color: qs.max_drawdown > -0.2 ? 'var(--sky)' : 'var(--coral)' },
          { label:'Volatility',   value: qs.volatility ? `${(qs.volatility*100).toFixed(1)}%` : '—', sub:'Annualised std dev', color:'var(--amber)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="metric-card" style={{ borderColor:`${color}15` }}>
            <div style={{ fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>{label}</div>
            <div className="stat-number stat-med" style={{ color, marginBottom:3 }}>{value||'—'}</div>
            <div style={{ fontSize:11, color:'var(--text-faint)' }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllocationTab({ result }) {
  const sorted = Object.entries(result.allocation||{})
    .map(([t,w]) => ({t,w})).sort((a,b)=>b.w-a.w);
  const chartData = sorted.map(({t,w})=>({ name:t, value:parseFloat(w) }));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <div className="card" style={{ padding:22 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:14, marginBottom:18, color:'var(--text-primary)' }}>Allocation Donut</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {chartData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]} opacity={0.9}/>)}
              </Pie>
              <Tooltip formatter={(v)=>[`${(v*100).toFixed(2)}%`,'Weight']} contentStyle={{ background:'rgba(255,255,255,0.96)', border:'1px solid var(--border-2)', borderRadius:10 }} />
              <Legend formatter={v=><span style={{fontSize:12,color:'var(--text-secondary)'}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:22 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:14, marginBottom:18, color:'var(--text-primary)' }}>Allocation Bars</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sorted.map(({t,w},i) => {
              const pct = (w*100);
              return (
                <div key={t}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span className="tag" style={{ fontSize:11 }}>{t}</span>
                    <span className="stat-number" style={{ fontSize:18, color:PALETTE[i%PALETTE.length] }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="alloc-bar-track">
                    <div className="alloc-bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length], opacity:0.8 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {result.pie_chart_base64 && (
        <div className="card" style={{ padding:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div className="font-display" style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>Backend Matplotlib Chart</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--b500)' }}>
              <Download size={13}/> Server-rendered PNG
            </div>
          </div>
          <img src={`data:image/png;base64,${result.pie_chart_base64}`} alt="Portfolio Allocation"
            style={{ maxWidth:'100%', maxHeight:440, borderRadius:12, display:'block', margin:'0 auto' }} />
        </div>
      )}
    </div>
  );
}

function MetricsTab({ result }) {
  const qs = result.quantstats || {};
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
        {Object.entries(qs).map(([k, v]) => {
          const q = quality(k, v);
          const displayVal = ['cagr','volatility','max_drawdown'].includes(k) && v !== null ? `${(v*100).toFixed(2)}%` : v?.toFixed(4)??'—';
          return (
            <div key={k} className="metric-card" style={{ background: q ? `${qColor[q]}06` : undefined }}>
              <div style={{ fontSize:10, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:7 }}>{METRIC_LABELS[k]||k}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div className="stat-number stat-med" style={{ color: q ? qColor[q] : 'var(--b500)' }}>{displayVal}</div>
                {q && <span className={`badge q-${q}`} style={{ fontSize:10 }}>{q}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ padding:22 }}>
        <div className="section-label">All Metrics</div>
        <table className="data-table">
          <thead><tr><th>Metric</th><th>Value</th><th>%</th><th>Quality</th></tr></thead>
          <tbody>
            {Object.entries(qs).map(([k,v]) => {
              const q = quality(k,v);
              const pctVal = ['cagr','volatility','max_drawdown'].includes(k) && v !== null ? `${(v*100).toFixed(2)}%` : '—';
              return (
                <tr key={k}>
                  <td style={{ fontWeight:600 }}>{METRIC_LABELS[k]||k}</td>
                  <td><span className="mono" style={{ color:'var(--b500)' }}>{v?.toFixed(6)??'—'}</span></td>
                  <td style={{ color:'var(--text-muted)' }}>{pctVal}</td>
                  <td>{q && <span className={`badge q-${q}`}>{q}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [
  { id:'summary',   icon:FileText,  label:'Executive Summary' },
  { id:'allocation',icon:PieIcon,   label:'Allocation' },
  { id:'metrics',   icon:BarChart2, label:'QuantStats Metrics' },
];

export default function ReportPage({ result }) {
  const [tab, setTab] = useState('summary');
  const navigate = useNavigate();

  if (!result) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:20 }}>
      <div style={{ width:72, height:72, borderRadius:18, background:'rgba(5,150,105,0.06)', border:'1px solid rgba(5,150,105,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <FileText size={30} color="var(--emerald)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Report Yet</h2>
        <p style={{ color:'var(--text-dim)', fontSize:14, marginBottom:20 }}>Run the pipeline to generate a full report</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 24px', fontSize:14, borderRadius:10 }}>→ Go to Pipeline</button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
      <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.6px' }}>
            <span className="grad-burgundy">Full Portfolio</span> <span style={{ color:'var(--text-primary)' }}>Report</span>
          </h1>
          <p style={{ color:'var(--text-dim)', fontSize:13, marginTop:4 }}>
            {result.algorithm} · {result.tickers?.join(', ')} · {result.total_timesteps?.toLocaleString()} timesteps
          </p>
        </div>
        <span className="badge badge-ok" style={{ padding:'5px 12px', fontSize:11 }}>
          ✓ Pipeline Complete
        </span>
      </div>

      {/* Tab bar — macOS segmented control */}
      <div style={{ display:'flex', gap:4, background:'rgba(31,18,21,0.04)', border:'1px solid var(--border-1)', borderRadius:10, padding:3 }}>
        {TABS.map(({ id, icon:Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
              padding:'9px 14px', borderRadius:8, border:'none', cursor:'pointer',
              fontWeight:600, fontSize:13, fontFamily:"'Inter',-apple-system,sans-serif",
              background: tab===id ? '#fff' : 'transparent',
              color: tab===id ? 'var(--b600)' : 'var(--text-dim)',
              boxShadow: tab===id ? 'var(--shadow-sm)' : 'none',
              transition:'all .2s',
            }}>
            <Icon size={14}/> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fade-in">
        {tab==='summary'    && <ExecutiveSummary result={result} />}
        {tab==='allocation' && <AllocationTab    result={result} />}
        {tab==='metrics'    && <MetricsTab        result={result} />}
      </div>

      {/* Model path */}
      <div className="card" style={{ padding:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, color:'var(--text-faint)', marginBottom:3 }}>Model saved at</div>
          <div className="mono" style={{ fontSize:12, color:'var(--b500)' }}>{result.model_path||'models/rl_portfolio_model.zip'}</div>
        </div>
        <ChevronRight size={16} color="var(--text-faint)" />
      </div>
    </div>
  );
}
