// src/components/Spinner.jsx
export default function Spinner({ size = 20, color = 'var(--b500)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid var(--border-1)`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin .75s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export function FullLoader({ message = 'Processing...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20, padding:60 }}>
      <div style={{ position:'relative', width:52, height:52 }}>
        <div style={{
          position:'absolute', inset:0,
          border:'2.5px solid var(--border-1)',
          borderTop:'2.5px solid var(--b500)',
          borderRadius:'50%', animation:'spin .9s linear infinite',
        }} />
        <div style={{
          position:'absolute', inset:10,
          border:'2.5px solid var(--border-1)',
          borderTop:'2.5px solid var(--rg500)',
          borderRadius:'50%', animation:'spin 1.4s linear infinite reverse',
        }} />
      </div>
      <div style={{ color:'var(--text-muted)', fontSize:14, fontWeight:500 }}>{message}</div>
    </div>
  );
}
