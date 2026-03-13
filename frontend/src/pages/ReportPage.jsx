// src/pages/ReportPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, TrendingUp, BarChart2, PieChart as PieIcon, Table, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PALETTE = ['#14b8a6','#6baed6','#34d399','#a78bfa','#f59e0b','#5eead4','#93c6e4','#6ee7b7','#c4b5fd','#fbbf24'];
const METRIC_LABELS = { sharpe:'Sharpe', sortino:'Sortino', calmar:'Calmar', cagr:'CAGR', volatility:'Volatility', max_drawdown:'Max Drawdown', benchmark_sharpe:'Benchmark' };
function quality(key, v) {
  if (!v && v !== 0) return null;
  if (key === 'sharpe'||key==='sortino') return v>2?'excellent':v>1?'good':v>0?'average':'poor';
  if (key === 'max_drawdown') return v>-0.1?'excellent':v>-0.2?'good':v>-0.35?'average':'poor';
  if (key === 'cagr') return v>0.15?'excellent':v>0.08?'good':v>0?'average':'poor';
  return null;
}
const qColor = { excellent:'var(--m400)', good:'var(--t400)', average:'var(--amber)', poor:'var(--coral)' };

function ExecutiveSummary({ result }) {
  const sorted = Object.entries(result.allocation||{})
    .map(([t,w]) => ({ t, w })).sort((a,b) => b.w-a.w);
  const top = sorted[0];
  const qs  = result.quantstats || {};
  const sharpe = qs.sharpe;
  const grade = sharpe > 2 ? 'A+' : sharpe > 1 ? 'B+' : sharpe > 0 ? 'C' : 'D';
  const gradeColor = sharpe > 2 ? 'var(--m400)' : sharpe > 1 ? 'var(--t400)' : sharpe > 0 ? 'var(--amber)' : 'var(--coral)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'flex-start' }}>
        <div>
          <div className="section-label">Portfolio Overview</div>
          <h2 className="font-display" style={{ fontSize:22, fontWeight:800, color:'var(--white)', marginBottom:8 }}>
            {result.algorithm} Portfolio · {result.n_assets} Assets
          </h2>
          <p style={{ fontSize:13, color:'var(--n400)', lineHeight:1.7 }}>
            Trained with <strong style={{ color:'var(--n200)' }}>{result.total_timesteps?.toLocaleString()} timesteps</strong> on tickers: <strong style={{ color:'var(--t400)' }}>{result.tickers?.join(', ')}</strong>.
            The dominant holding is <strong style={{ color:'var(--t300)' }}>{top?.t}</strong> at <strong style={{ color:'var(--t300)' }}>{((top?.w||0)*100).toFixed(1)}%</strong>.
            Evaluated against Nifty 50 (^NSEI) using QuantStats.
          </p>
        </div>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:11, color:'var(--n600)', marginBottom:6, fontWeight:600 }}>Portfolio Grade</div>
          <div className="font-display" style={{ fontSize:64, fontWeight:900, color:gradeColor, lineHeight:1, filter:`drop-shadow(0 0 20px ${gradeColor}60)` }}>{grade}</div>
          <div style={{ fontSize:11, color:'var(--n700)', marginTop:4 }}>Based on Sharpe Ratio</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
        {[
          { label:'Top Holding',  value: top?.t,  sub:`${((top?.w||0)*100).toFixed(1)}% allocated`, color:'var(--t400)' },
          { label:'Algorithm',   value: result.algorithm, sub:'stable-baselines3',   color:'var(--s400)' },
          { label:'Sharpe Ratio', value: sharpe?.toFixed(3)??'—', sub:sharpe>1?'Above benchmark':'Below benchmark', color: sharpe>1 ? 'var(--m400)' : 'var(--amber)' },
          { label:'CAGR',         value: qs.cagr ? `${(qs.cagr*100).toFixed(1)}%` : '—', sub:'Annual growth rate', color:'var(--m400)' },
          { label:'Max Drawdown', value: qs.max_drawdown ? `${(qs.max_drawdown*100).toFixed(1)}%` : '—', sub:'Worst peak-to-trough', color: qs.max_drawdown > -0.2 ? 'var(--t400)' : 'var(--coral)' },
          { label:'Volatility',   value: qs.volatility ? `${(qs.volatility*100).toFixed(1)}%` : '—', sub:'Annualised std dev', color:'var(--amber)' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="metric-card" style={{ borderColor:`${color}20` }}>
            <div style={{ fontSize:10, color:'var(--n600)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>{label}</div>
            <div className="stat-number stat-med" style={{ color, marginBottom:3 }}>{value||'—'}</div>
            <div style={{ fontSize:11, color:'var(--n700)' }}>{sub}</div>
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
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div className="card" style={{ padding:24 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Allocation Donut</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {chartData.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]} opacity={0.9}/>)}
              </Pie>
              <Tooltip formatter={(v)=>[`${(v*100).toFixed(2)}%`,'Weight']} contentStyle={{ background:'rgba(5,13,13,0.97)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:12 }} />
              <Legend formatter={v=><span style={{fontSize:12,color:'var(--n400)'}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding:24 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>Allocation Bars</div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {sorted.map(({t,w},i) => {
              const pct = (w*100);
              return (
                <div key={t}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span className="tag" style={{ fontSize:11 }}>{t}</span>
                    <span className="stat-number" style={{ fontSize:20, color:PALETTE[i%PALETTE.length] }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="alloc-bar-track">
                    <div className="alloc-bar-fill" style={{ width:`${pct}%`, background:PALETTE[i%PALETTE.length], opacity:0.85 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {result.pie_chart_base64 && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div className="font-display" style={{ fontWeight:700, fontSize:15 }}>Backend Matplotlib Chart</div>
            <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'var(--t400)' }}>
              <Download size={13}/> Server-rendered PNG
            </div>
          </div>
          <img src={`data:image/png;base64,${result.pie_chart_base64}`} alt="Portfolio Allocation"
            style={{ maxWidth:'100%', maxHeight:440, borderRadius:14, display:'block', margin:'0 auto', filter:'brightness(0.95)' }} />
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
            <div key={k} className="metric-card" style={{ background: q ? `${qColor[q]}08` : undefined }}>
              <div style={{ fontSize:10, color:'var(--n600)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>{METRIC_LABELS[k]||k}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div className="stat-number stat-med" style={{ color: q ? qColor[q] : 'var(--t400)' }}>{displayVal}</div>
                {q && <span className={`badge q-${q}`} style={{ fontSize:10 }}>{q}</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ padding:24 }}>
        <div className="section-label">All Metrics</div>
        <table className="data-table">
          <thead><tr><th>Metric</th><th>Value</th><th>%</th><th>Quality</th></tr></thead>
          <tbody>
            {Object.entries(qs).map(([k,v]) => {
              const q = quality(k,v);
              const pctVal = ['cagr','volatility','max_drawdown'].includes(k) && v !== null ? `${(v*100).toFixed(2)}%` : '—';
              return (
                <tr key={k}>
                  <td style={{ fontWeight:600}}>{METRIC_LABELS[k]||k}</td>
                  <td><span className="mono" style={{ color:'var(--t400)' }}>{v?.toFixed(6)??'—'}</span></td>
                  <td style={{ color:'var(--n400)' }}>{pctVal}</td>
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
      <div style={{ width:72, height:72, borderRadius:18, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <FileText size={30} color="var(--m700)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:800, color:'var(--n200)', marginBottom:8 }}>No Report Yet</h2>
        <p style={{ color:'var(--n600)', fontSize:14, marginBottom:20 }}>Run the pipeline to generate a full report</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 26px', fontSize:15, borderRadius:12 }}>→ Go to Pipeline</button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.6px' }}>
            <span className="grad-teal">Full Portfolio</span> Report
          </h1>
          <p style={{ color:'var(--n600)', fontSize:13, marginTop:4 }}>
            {result.algorithm} · {result.tickers?.join(', ')} · {result.total_timesteps?.toLocaleString()} timesteps
          </p>
        </div>
        <span className="badge badge-ok" style={{ padding:'6px 14px', fontSize:11 }}>
          ✓ Pipeline Complete
        </span>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, background:'rgba(5,13,13,0.6)', border:'1px solid var(--b1)', borderRadius:14, padding:5 }}>
        {TABS.map(({ id, icon:Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer',
              fontWeight:600, fontSize:13, fontFamily:"'Inter',sans-serif",
              background: tab===id ? 'linear-gradient(135deg,rgba(20,184,166,0.15),rgba(107,174,214,0.08))' : 'transparent',
              color: tab===id ? 'var(--t400)' : 'var(--n600)',
              boxShadow: tab===id ? 'inset 0 0 20px rgba(20,184,166,0.05), 0 0 0 1px rgba(20,184,166,0.2)' : 'none',
              transition:'all .22s',
            }}>
            <Icon size={15}/> {label}
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
      <div className="card" style={{ padding:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, color:'var(--n700)', marginBottom:4 }}>Model saved at</div>
          <div className="mono" style={{ fontSize:12, color:'var(--t400)' }}>{result.model_path||'models/rl_portfolio_model.zip'}</div>
        </div>
        <ChevronRight size={16} color="var(--n700)" />
      </div>
    </div>
  );
}
