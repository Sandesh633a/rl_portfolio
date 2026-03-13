// src/pages/MetricsPage.jsx
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BarChart2, TrendingUp, TrendingDown, Shield, Activity, Percent, Zap, Info } from 'lucide-react';

const META = {
  sharpe:           { label:'Sharpe Ratio',     icon:TrendingUp,  color:'var(--t500)',  desc:'Return per unit of total risk. Measures how much excess return you get per unit of volatility.', bench:'>1.0 = Good · >2.0 = Excellent', formula:'(Return − RiskFree) / Std Dev' },
  sortino:          { label:'Sortino Ratio',    icon:Shield,      color:'var(--s400)',  desc:'Like Sharpe but only penalises downside volatility. Better measure for asymmetric return distributions.', bench:'>1.0 = Good · >2.0 = Great', formula:'(Return − RiskFree) / Downside Std Dev' },
  calmar:           { label:'Calmar Ratio',     icon:Activity,    color:'#a78bfa',      desc:'Annual return divided by maximum drawdown. Measures return relative to worst-case loss.', bench:'>0.5 = Acceptable · >1.0 = Good', formula:'CAGR / |Max Drawdown|' },
  cagr:             { label:'CAGR',             icon:TrendingUp,  color:'var(--m400)',  desc:'Compounded Annual Growth Rate — the constant rate at which investment would have grown each year.', bench:'Higher = Better · vs r.f. rate ~6%', formula:'(End/Start)^(1/Years) − 1' },
  volatility:       { label:'Volatility',       icon:Percent,     color:'var(--amber)', desc:'Annualised standard deviation of daily returns. High volatility = higher risk and wider return range.', bench:'<15% = Low · 15-25% = Medium · >25% = High', formula:'Std Dev × √252' },
  max_drawdown:     { label:'Max Drawdown',     icon:TrendingDown,color:'var(--coral)', desc:'The maximum observed loss from a peak to a trough. Represents the worst-case scenario an investor could have experienced.', bench:'>-10% = Good · -25% = Acceptable · <-40% = Risky', formula:'(Trough − Peak) / Peak' },
  benchmark_sharpe: { label:'Nifty 50 Sharpe',  icon:BarChart2,   color:'var(--n400)', desc:'The Sharpe Ratio of the Nifty 50 benchmark (^NSEI). Compare your portfolio to market performance.', bench:'Your Sharpe should exceed this', formula:'Applied to ^NSEI returns' },
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
const qColor = { excellent:'var(--m400)', good:'var(--t400)', average:'var(--amber)', poor:'var(--coral)' };

function RiskGauge({ value, min = -1, max = 3, color = 'var(--t500)', label }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const angle = -135 + (pct / 100) * 270;
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
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={8} strokeLinecap="round" />
        <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${pct > 50 ? 1 : 0} 1 ${nx} ${ny}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" opacity={0.85} style={{ filter:`drop-shadow(0 0 4px ${color})` }} />
        <circle cx={nx} cy={ny} r={5} fill={color} style={{ filter:`drop-shadow(0 0 6px ${color})` }} />
        <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.2)" />
        <text x={cx} y={cy+26} textAnchor="middle" fill={color} fontSize={15} fontWeight="800" fontFamily="'Sora',sans-serif">{value?.toFixed(2)??'—'}</text>
      </svg>
      <div style={{ fontSize:11, color:'var(--n600)', marginTop:-8 }}>{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background:'rgba(5,13,13,0.97)', border:'1px solid rgba(45,212,191,0.22)', borderRadius:12, padding:'10px 16px', boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
    <div style={{ fontWeight:700, color:'var(--n200)', marginBottom:4, fontSize:12 }}>{label}</div>
    {payload.map(p => <div key={p.name} style={{ color: p.value >= 0 ? 'var(--t400)' : 'var(--coral)', fontWeight:700, fontSize:14, fontFamily:"'Sora',sans-serif" }}>{p.value?.toFixed(4)}</div>)}
  </div>
) : null;

export default function MetricsPage({ result }) {
  const navigate = useNavigate();
  if (!result) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:20 }}>
      <div style={{ width:72, height:72, borderRadius:18, background:'rgba(107,174,214,0.08)', border:'1px solid rgba(107,174,214,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <BarChart2 size={30} color="var(--s700)" />
      </div>
      <div style={{ textAlign:'center' }}>
        <h2 className="font-display" style={{ fontSize:22, fontWeight:800, color:'var(--n200)', marginBottom:8 }}>No Metrics Yet</h2>
        <p style={{ color:'var(--n600)', fontSize:14, marginBottom:20 }}>Run the pipeline first to see risk metrics</p>
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/pipeline')} style={{ padding:'12px 26px', fontSize:15, borderRadius:12 }}>→ Go to Pipeline</button>
    </div>
  );

  const qs = result.quantstats || {};

  const barData = Object.entries(qs).filter(([,v]) => v !== null && typeof v === 'number')
    .map(([key, value]) => ({ metric: META[key]?.label || key, value: parseFloat(value.toFixed(4)), key }));

  const radarData = ['sharpe','sortino','calmar'].filter(k => qs[k] !== null && qs[k] !== undefined).map(k => ({
    metric: META[k]?.label, value: Math.max(0, Math.min(3, parseFloat(qs[k]) || 0))
  }));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

      {/* Header */}
      <div className="fade-up">
        <h1 className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.6px', marginBottom:4 }}>
          <span className="grad-teal">Risk &amp; Return</span> Metrics
        </h1>
        <p style={{ color:'var(--n600)', fontSize:14 }}>QuantStats evaluation · Benchmark: Nifty 50 (^NSEI) · {result.algorithm} · {result.n_assets} assets</p>
      </div>

      {/* Gauge row */}
      <div className="card fade-up" style={{ padding:'24px 32px' }}>
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
            <div key={key} className="metric-card card-3d fade-up" style={{ position:'relative', overflow:'hidden' }}>
              <div className="orb" style={{ width:80, height:80, top:-20, right:-20, background:`radial-gradient(circle,${m.color||'var(--t600)'}25,transparent 70%)` }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${m.color||'var(--t600)'}18`, border:`1px solid ${m.color||'var(--t600)'}28`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {m.icon && <m.icon size={16} color={m.color||'var(--t600)'} />}
                  </div>
                  {q && <span className={`badge q-${q}`} style={{ fontSize:10 }}>{q.toUpperCase()}</span>}
                </div>
                <div style={{ fontSize:11, color:'var(--n600)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{m.label||key}</div>
                <div className="stat-number stat-large" style={{ color:m.color||'var(--t400)', marginBottom:8 }}>
                  {val !== null ? (key==='cagr'||key==='volatility'||key==='max_drawdown' ? `${(val*100).toFixed(1)}%` : val.toFixed(4)) : '—'}
                </div>
                {m.bench && <div style={{ fontSize:10, color:'var(--n700)', marginBottom:6, lineHeight:1.5 }}>{m.bench}</div>}
                {m.formula && <div className="mono" style={{ fontSize:9.5, color:'var(--n700)', background:'rgba(255,255,255,0.04)', padding:'4px 8px', borderRadius:6 }}>{m.formula}</div>}
                {m.desc && <div style={{ fontSize:11, color:'var(--n600)', marginTop:8, lineHeight:1.6 }}>{m.desc}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar + Radar row */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
        <div className="card" style={{ padding:28 }}>
          <div className="font-display" style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Metrics Bar Chart</div>
          <div style={{ fontSize:12, color:'var(--n600)', marginBottom:20 }}>Green = positive (good) · Red = negative (bad) · hover for value</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top:5, right:10, left:0, bottom:50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="metric" tick={{ fill:'rgba(107,153,150,0.75)', fontSize:10 }} angle={-40} textAnchor="end" />
              <YAxis tick={{ fill:'rgba(107,153,150,0.75)', fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {barData.map((d,i) => <Cell key={i} fill={d.value>=0 ? 'var(--t600)' : 'var(--coral)'} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {radarData.length >= 3 ? (
          <div className="card" style={{ padding:28 }}>
            <div className="font-display" style={{ fontWeight:700, fontSize:16, marginBottom:4 }}>Risk Radar</div>
            <div style={{ fontSize:12, color:'var(--n600)', marginBottom:20 }}>Ratio comparison (capped at 3.0)</div>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(45,212,191,0.1)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:'var(--n400)', fontSize:11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 3]} tick={{ fill:'var(--n700)', fontSize:9 }} />
                <Radar dataKey="value" stroke="var(--t500)" fill="var(--t500)" fillOpacity={0.18} strokeWidth={2} dot={{ r:4, fill:'var(--t400)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card" style={{ padding:28 }}>
            <div className="section-label">Reading Your Results</div>
            {[
              { k:'Sharpe > 1',  good:true,  d:'Returns exceed risk taken — a good portfolio' },
              { k:'Sortino > 1', good:true,  d:'Better downside protection than raw Sharpe shows' },
              { k:'CAGR > 10%',  good:true,  d:'Outperforming typical fixed-income returns' },
              { k:'Drawdown < -20%', good:false, d:'Significant peak-to-trough loss — assess risk tolerance' },
            ].map(({ k, good, d }) => (
              <div key={k} style={{ display:'flex', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background: good ? 'var(--m500)' : 'var(--coral)', marginTop:5, flexShrink:0 }} />
                <div>
                  <div className="mono" style={{ fontSize:12, color: good ? 'var(--m400)' : 'var(--coral)', fontWeight:600 }}>{k}</div>
                  <div style={{ fontSize:11.5, color:'var(--n400)', marginTop:2, lineHeight:1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="card" style={{ padding:28 }}>
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
                    <div style={{ fontWeight:600, color:'var(--n200)', fontSize:13 }}>{m.label||key}</div>
                    {m.formula && <div className="mono" style={{ fontSize:9.5, color:'var(--n700)', marginTop:2 }}>{m.formula}</div>}
                  </td>
                  <td><span className="stat-number" style={{ fontSize:16, color:m.color||'var(--t400)' }}>{val !== null ? val.toFixed(4) : '—'}</span></td>
                  <td><span style={{ color:'var(--n400)', fontSize:13 }}>{pctVal}</span></td>
                  <td>{q && <span className={`badge q-${q}`}>{q}</span>}</td>
                  <td style={{ fontSize:12, color:'var(--n600)', maxWidth:260, lineHeight:1.5 }}>{m.desc}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
