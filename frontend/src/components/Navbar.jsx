// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, TrendingUp, BarChart2, FileText, Waves, Zap, Info } from 'lucide-react';

const links = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard',    sub: 'Overview & status' },
  { to: '/pipeline', icon: Layers,          label: 'Run Pipeline', sub: 'Auto train & predict' },
  { to: '/results',  icon: TrendingUp,      label: 'Allocation',   sub: 'Portfolio weights' },
  { to: '/evaluate', icon: BarChart2,       label: 'Risk Metrics', sub: 'QuantStats analysis' },
  { to: '/report',   icon: FileText,        label: 'Full Report',  sub: 'Complete summary' },
];

// Animated ocean wave SVG
const WaveIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="url(#navGrad)" />
    <path d="M6 20 Q10 15 14 20 Q18 25 22 20 Q26 15 30 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M6 14 Q10 9 14 14 Q18 19 22 14 Q26 9 30 14" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.5"/>
    <defs>
      <linearGradient id="navGrad" x1="0" y1="0" x2="36" y2="36">
        <stop offset="0%" stopColor="#0d9488" />
        <stop offset="100%" stopColor="#14b8a6" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  return (
    <aside style={{
      background: 'linear-gradient(180deg, rgba(8,18,18,0.98) 0%, rgba(5,13,13,0.97) 100%)',
      backdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(45,212,191,0.08)',
      width: 220,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 10px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Decorative orb */}
      <div className="orb orb-teal" style={{ width:120, height:120, top:-40, left:-40, position:'absolute' }} />

      {/* Logo */}
      <div style={{ padding: '4px 8px 22px', marginBottom: 6, position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:11 }}>
          <div className="float-anim"><WaveIcon /></div>
          <div>
            <div className="font-display" style={{ fontWeight:800, fontSize:15, color:'var(--white)', letterSpacing:'-0.4px', lineHeight:1.1 }}>
              RL Portfolio
            </div>
            <div style={{ fontSize:10, color:'var(--n600)', marginTop:2, letterSpacing:'0.05em' }}>
              OCEAN ENGINE v2.0
            </div>
          </div>
        </div>
        <div className="line-grad-h" style={{ marginTop:18 }} />
      </div>

      {/* Navigation */}
      <nav style={{ display:'flex', flexDirection:'column', gap:2, flex:1, position:'relative', zIndex:1 }}>
        <div className="section-label" style={{ padding:'0 6px' }}>Navigation</div>
        {links.map(({ to, icon: Icon, label, sub }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} style={{ flexShrink:0 }} />
            <div>
              <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>{label}</div>
              <div style={{ fontSize:10, color:'var(--n700)', marginTop:1 }}>{sub}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Bottom info */}
      <div style={{ borderTop:'1px solid rgba(45,212,191,0.07)', paddingTop:16, position:'relative', zIndex:1 }}>
        <div style={{ padding:'12px 10px', borderRadius:12, background:'rgba(20,184,166,0.05)', border:'1px solid rgba(20,184,166,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <Zap size={11} color="var(--t600)" />
            <span style={{ fontSize:10, fontWeight:700, color:'var(--t600)', letterSpacing:'0.06em',textTransform:'uppercase' }}>Backend</span>
          </div>
          <div className="mono" style={{ fontSize:11, color:'var(--m400)' }}>localhost:8000</div>
          <div className="line-grad-h" style={{ margin:'8px 0' }} />
          <div style={{ fontSize:10, color:'var(--n700)', lineHeight:1.7 }}>
            <div>DDPG · Softmax Allocation</div>
            <div>QuantStats · yfinance</div>
            <div>Growth-Factor Rewards</div>
          </div>
        </div>
        <div style={{ marginTop:10, padding:'6px', textAlign:'center' }}>
          <div style={{ fontSize:10, color:'var(--n700)' }}>Built with Stable-Baselines3</div>
        </div>
      </div>
    </aside>
  );
}
