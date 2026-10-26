// src/components/StatCard.jsx

export default function StatCard({ label, value, unit = '', icon: Icon, color = 'var(--b500)', trend, subtitle }) {
  return (
    <div className="metric-card fade-up" style={{ padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        {Icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `${color}12`,
            border: `1px solid ${color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={color} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <div className="stat-number" style={{ fontSize: 24, color }}>
          {typeof value === 'number' ? value.toFixed(4) : (value ?? '—')}
        </div>
        {unit && <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{unit}</div>}
      </div>

      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{subtitle}</div>
      )}
    </div>
  );
}
