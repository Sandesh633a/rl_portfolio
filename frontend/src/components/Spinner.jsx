// src/components/Spinner.jsx
export default function Spinner({ size = 22, color = 'var(--teal-500)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.08)`,
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
      <div style={{ position:'relative', width:60, height:60 }}>
        <div style={{
          position:'absolute', inset:0,
          border:'3px solid rgba(20,184,166,0.1)',
          borderTop:'3px solid var(--teal-600)',
          borderRadius:'50%', animation:'spin .9s linear infinite',
        }} />
        <div style={{
          position:'absolute', inset:9,
          border:'3px solid rgba(107,174,214,0.1)',
          borderTop:'3px solid var(--steel-500)',
          borderRadius:'50%', animation:'spin 1.4s linear infinite reverse',
        }} />
      </div>
      <div style={{ color:'var(--gray-400)', fontSize:14, fontWeight:500 }}>{message}</div>
    </div>
  );
}
