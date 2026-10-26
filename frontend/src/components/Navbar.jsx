// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, TrendingUp, BarChart2, FileText, Zap, Activity } from 'lucide-react';

const links = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',    sub: 'Overview & status' },
  { to: '/pipeline', icon: Layers,          label: 'Run Pipeline', sub: 'Train & predict' },
  { to: '/results',  icon: TrendingUp,      label: 'Allocation',   sub: 'Portfolio weights' },
  { to: '/evaluate', icon: BarChart2,       label: 'Risk Metrics', sub: 'Performance analysis' },
  { to: '/report',   icon: FileText,        label: 'Full Report',  sub: 'Complete summary' },
];

export default function Navbar() {
  return (
    <aside style={{
      background: 'var(--bg-sidebar)',
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      borderRight: '1px solid var(--border-1)',
      width: 240,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* macOS window chrome */}
      <div style={{ padding: '16px 18px 0' }}>
        <div className="traffic-dots" style={{ marginBottom: 20 }}>
          <div className="traffic-dot dot-red" />
          <div className="traffic-dot dot-yellow" />
          <div className="traffic-dot dot-green" />
        </div>
      </div>

      {/* Logo */}
      <div style={{ padding: '0 18px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--b600), var(--b400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(137,36,58,0.25)',
          }}>
            <Activity size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display" style={{ fontWeight:700, fontSize:14, color:'var(--text-primary)', letterSpacing:'-0.3px', lineHeight:1.2 }}>
              Meridian
            </div>
            <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:1, letterSpacing:'0.03em', fontWeight:500 }}>
              Asset Allocation
            </div>
          </div>
        </div>
        <div className="line-grad-h" style={{ marginTop:16 }} />
      </div>

      {/* Navigation */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1, padding:'0 10px' }}>
        <div className="section-label" style={{ padding:'0 6px', marginBottom:8 }}>Navigation</div>
        {links.map(({ to, icon: Icon, label, sub }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} style={{ flexShrink:0 }} />
            <div>
              <div style={{ fontSize:13, fontWeight:500, lineHeight:1.2 }}>{label}</div>
              <div style={{ fontSize:10, color:'var(--text-faint)', marginTop:1 }}>{sub}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Bottom info */}
      <div style={{ padding:'0 14px 18px' }}>
        <div className="line-grad-h" style={{ marginBottom: 14 }} />
        <div style={{ padding:'12px 12px', borderRadius:10, background:'rgba(168,50,73,0.04)', border:'1px solid rgba(168,50,73,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
            <Zap size={11} color="var(--b500)" />
            <span style={{ fontSize:10, fontWeight:600, color:'var(--b600)', letterSpacing:'0.04em', textTransform:'uppercase' }}>Engine</span>
          </div>
          <div className="mono" style={{ fontSize:10.5, color:'var(--text-muted)' }}>localhost:8000</div>
          <div className="line-grad-h" style={{ margin:'8px 0' }} />
          <div style={{ fontSize:10, color:'var(--text-dim)', lineHeight:1.7 }}>
            <div>DDPG · Softmax Allocation</div>
            <div>QuantStats · yfinance</div>
            <div>Stable-Baselines3</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
