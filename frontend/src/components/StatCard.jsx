// src/components/StatCard.jsx

export default function StatCard({ label, value, unit = '', icon: Icon, color = '#3b82f6', trend, subtitle }) {
  const isPositive = typeof value === 'number' ? value >= 0 : true;

  return (
    <div className="glass-card fade-in-up" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}20`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={color} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <div className="stat-value" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(4) : (value ?? '—')}
        </div>
        {unit && <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{unit}</div>}
      </div>

      {subtitle && (
        <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{subtitle}</div>
      )}
    </div>
  );
}
