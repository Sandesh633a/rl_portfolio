// src/pages/MetricsPage.jsx
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BarChart2, TrendingUp, TrendingDown, Shield, Activity, Percent, Zap } from 'lucide-react';

const META = {
  sharpe:           { label:'Sharpe Ratio',     icon:TrendingUp,  color:'var(--b500)',    desc:'Return per unit of total risk. Measures how much excess return you get per unit of volatility.', bench:'>1.0 = Good · >2.0 = Excellent', formula:'(Return − RiskFree) / Std Dev' },
  sortino:          { label:'Sortino Ratio',    icon:Shield,      color:'var(--sky)',     desc:'Like Sharpe but only penalises downside volatility. Better measure for asymmetric return distributions.', bench:'>1.0 = Good · >2.0 = Great', formula:'(Return − RiskFree) / Downside Std Dev' },
  calmar:           { label:'Calmar Ratio',     icon:Activity,    color:'var(--v700)',    desc:'Annual return divided by maximum drawdown. Measures return relative to worst-case loss.', bench:'>0.5 = Acceptable · >1.0 = Good', formula:'CAGR / |Max Drawdown|' },
  cagr:             { label:'CAGR',             icon:TrendingUp,  color:'var(--emerald)', desc:'Compounded Annual Growth Rate — the constant rate at which investment would have grown each year.', bench:'Higher = Better · vs r.f. rate ~6%', formula:'(End/Start)^(1/Years) − 1' },
  volatility:       { label:'Volatility',       icon:Percent,     color:'var(--amber)',   desc:'Annualised standard deviation of daily returns. High volatility = higher risk and wider return range.', bench:'<15% = Low · 15-25% = Medium · >25% = High', formula:'Std Dev × √252' },
  max_drawdown:     { label:'Max Drawdown',     icon:TrendingDown,color:'var(--coral)',   desc:'The maximum observed loss from a peak to a trough. Represents the worst-case scenario an investor could have experienced.', bench:'>-10% = Good · -25% = Acceptable · <-40% = Risky', formula:'(Trough − Peak) / Peak' },
  benchmark_sharpe: { label:'Nifty 50 Sharpe',  icon:BarChart2,   color:'var(--s500)',    desc:'The Sharpe Ratio of the Nifty 50 benchmark (^NSEI). Compare your portfolio to market performance.', bench:'Your Sharpe should exceed this', formula:'Applied to ^NSEI returns' },
};

function quality(key, v) {
  if (v === null || v === undefined) return null;
  if (key === 'sharpe' || key === 'sortino') return v>2 ? 'excellent' : v>1 ? 'good' : v>0 ? 'average' : 'poor';
  if (key === 'calmar') return v>1 ? 'excellent' : v>0.5 ? 'good' : v>0 ? 'average' : 'poor';
  if (key === 'cagr')   return v>0.15 ? 'excellent' : v>0.08 ? 'good' : v>0 ? 'average' : 'poor';
  if (key === 'volatility') return v<0.12 ? 'excellent' : v<0.2 ? 'good' : v<0.3 ? 'average' : 'poor';
  if (key === 'max_drawdown') return v>-0.1 ? 'excellent' : v>-0.2 ? 'good' : v>-0.35 ? 'average' : 'poor';
  return null;
}

function RiskGauge({ value, min = -1, max = 3, color = 'var(--b500)', label }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const r = 48;
  const cx = 60, cy = 60;
  const startAngle = -135 * (Math.PI/180);
  const endAngle   = 135  * (Math.PI/180);
  const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle),   y2 = cy + r * Math.sin(endAngle);
  const needleAngle = (-135 + (pct/100)*270) * (Math.PI/180);
  const nx = cx + 34 * Math.cos(needleAngle);
  const ny = cy + 34 * Math.sin(needleAngle);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={120} height={80} viewBox="0 0 120 100">
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} fill="none" stroke="var(--border-1)" strokeWidth={7} strokeLinecap="round" />
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${nx} ${ny}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.8} />
        <circle cx={nx} cy={ny} r={4.5} fill={color} />
        <circle cx={cx} cy={cy} r={3} fill="var(--border-2)" />
        <text x={cx} y={cy+26} textAnchor="middle" fill={color} fontSize={14} fontWeight="700" fontFamily="'DM Sans',sans-serif">{value?.toFixed(2)??'—'}</text>
      </svg>
      <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:-8 }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background:'rgba(255,255,255,0.96)', border:'1px solid var(--border-2)', borderRadius:10, padding:'10px 16px', boxShadow:'var(--shadow-lg)' }}>
    <div style={{ fontWeight:600, color:'var(--text-primary)', marginBottom:4, fontSize:12 }}>{label}</div>
    {payload.map(p => <div key={p.name} style={{ color: p.value >= 0 ? 'var(--emerald)' : 'var(--coral)', fontWeight:700, fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>{p.value?.toFixed(4)}</div>)}
  </div>
) : null;

export default function MetricsPage({ result }) {
  const navigate = useNavigate();
  if (!result) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:20 }}>
      <div style={{ width:72, height:72, borderRadius:18, background:'rgba(2,132,199,0.06)', border:'1px solid rgba(2,132,199,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <BarChart2 size={30} color="var(--sky)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8 }}>No Metrics Yet</h2>
        <p style={{ color:'var(--text-dim)', fontSize:14, marginBottom:20 }}>Run the pipeline first to see risk metrics</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 24px', fontSize:14, borderRadius:10 }}>→ Go to Pipeline</button>
    </div>
  );

  const qs = result.quantstats || {};

  const barData = Object.entries(qs).filter(([,v]) => v !== null && typeof v === 'number')
    .map(([key, value]) => ({ metric: META[key]?.label || key, value: parseFloat(value.toFixed(4)), key }));

  const radarData = ['sharpe','sortino','calmar'].filter(k => qs[k] !== null && qs[k] !== undefined).map(k => ({
    metric: META[k]?.label, value: Math.max(0, Math.min(3, parseFloat(qs[k]) || 0))
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22 }}>

      {/* Header */}
      <div className="fade-up">
        <h1 className="font-display" style={{ fontSize:26, fontWeight:800, letterSpacing:'-0.6px', marginBottom:4 }}>
          <span className="grad-burgundy">Risk & Return</span> <span style={{ color:'var(--text-primary)' }}>Metrics</span>
        </h1>
        <p style={{ color:'var(--text-dim)', fontSize:13 }}>QuantStats evaluation · Benchmark: Nifty 50 (^NSEI) · {result.algorithm} · {result.n_assets} assets</p>
      </div>

      {/* Gauge row */}
      <div className="card fade-up" style={{ padding:'22px 28px' }}>
        <div className="section-label">Risk Gauges</div>
        <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:24 }}>
          {['sharpe','sortino','calmar'].filter(k => qs[k] !== undefined && qs[k] !== null).map(k => (
            <RiskGauge key={k} value={qs[k]} label={META[k].label} color={META[k].color} />
          ))}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
        {Object.entries(qs).map(([key, val]) => {
          const m = META[key] || {};
          const q = quality(key, val);
          return (
            <div key={key} className="metric-card card-elevated fade-up" style={{ position:'relative', overflow:'hidden' }}>
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`${m.color||'var(--b500)'}10`, border:`1px solid ${m.color||'var(--b500)'}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {m.icon && <m.icon size={15} color={m.color||'var(--b500)'} />}
                  </div>
                  {q && <span className={`badge q-${q}`} style={{ fontSize:10 }}>{q.toUpperCase()}</span>}
                </div>
                <div style={{ fontSize:11, color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:5 }}>{m.label||key}</div>
                <div className="stat-number stat-large" style={{ color:m.color||'var(--b500)', marginBottom:6 }}>
                  {val !== null ? (key==='cagr'||key==='volatility'||key==='max_drawdown' ? `${(val*100).toFixed(1)}%` : val.toFixed(4)) : '—'}
                </div>
                {m.bench && <div style={{ fontSize:10, color:'var(--text-faint)', marginBottom:5, lineHeight:1.5 }}>{m.bench}</div>}
                {m.formula && <div className="mono" style={{ fontSize:9.5, color:'var(--text-faint)', background:'rgba(31,18,21,0.03)', padding:'3px 7px', borderRadius:5 }}>{m.formula}</div>}
                {m.desc && <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:6, lineHeight:1.6 }}>{m.desc}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar + Radar row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
        <div className="card" style={{ padding:26 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'var(--text-primary)' }}>Metrics Bar Chart</div>
          <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:18 }}>Green = positive (good) · Red = negative (bad) · hover for value</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top:5, right:10, left:0, bottom:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-0)" />
              <XAxis dataKey="metric" tick={{ fill:'var(--text-dim)', fontSize:10 }} angle={-40} textAnchor="end" />
              <YAxis tick={{ fill:'var(--text-dim)', fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[5,5,0,0]}>
                {barData.map((d,i) => <Cell key={i} fill={d.value>=0 ? 'var(--emerald)' : 'var(--coral)'} opacity={0.8} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {radarData.length >= 3 ? (
          <div className="card" style={{ padding:26 }}>
            <div className="font-display" style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'var(--text-primary)' }}>Risk Radar</div>
            <div style={{ fontSize:12, color:'var(--text-dim)', marginBottom:18 }}>Ratio comparison (capped at 3.0)</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:'var(--text-secondary)', fontSize:11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill:'var(--text-faint)', fontSize:9 }} />
                <Radar dataKey="value" stroke="var(--b500)" fill="var(--b500)" fillOpacity={0.12} strokeWidth={2} dot={{ r:4, fill:'var(--b400)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ padding:26 }}>
            <div className="section-label">Reading Your Results</div>
            {[
              { k:'Sharpe > 1',  good:true,  d:'Returns exceed risk taken — a good portfolio' },
              { k:'Sortino > 1', good:true,  d:'Better downside protection than raw Sharpe shows' },
              { k:'CAGR > 10%',  good:true,  d:'Outperforming typical fixed-income returns' },
              { k:'Drawdown < -20%', good:false, d:'Significant peak-to-trough loss — assess risk tolerance' },
            ].map(({ k, good, d }) => (
              <div key={k} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border-0)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: good ? 'var(--emerald)' : 'var(--coral)', marginTop:5, flexShrink:0 }} />
                <div>
                  <div className="mono" style={{ fontSize:12, color: good ? 'var(--emerald)' : 'var(--coral)', fontWeight:600 }}>{k}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, lineHeight:1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="card" style={{ padding:26 }}>
        <div className="section-label">Detailed Metrics Table</div>
        <table className="data-table">
          <thead>
            <tr><th>Metric</th><th>Value</th><th>As Percentage</th><th>Quality</th><th>Interpretation</th></tr>
          </thead>
          <tbody>
            {Object.entries(qs).map(([key, val]) => {
              const m = META[key] || {};
              const q = quality(key, val);
              const pctVal = (key==='cagr'||key==='volatility'||key==='max_drawdown') && val !== null ? `${(val*100).toFixed(2)}%` : '—';
              return (
                <tr key={key}>
                  <td>
                    <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>{m.label||key}</div>
                    {m.formula && <div className="mono" style={{ fontSize:9.5, color:'var(--text-faint)', marginTop:2 }}>{m.formula}</div>}
                  </td>
                  <td><span className="stat-number" style={{ fontSize:15, color:m.color||'var(--b500)' }}>{val !== null ? val.toFixed(4) : '—'}</span></td>
                  <td><span style={{ color:'var(--text-muted)', fontSize:13 }}>{pctVal}</span></td>
                  <td>{q && <span className={`badge q-${q}`}>{q}</span>}</td>
                  <td style={{ fontSize:12, color:'var(--text-dim)', maxWidth:260, lineHeight:1.5 }}>{m.desc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
