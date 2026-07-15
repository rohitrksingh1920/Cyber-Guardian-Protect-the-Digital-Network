import { useEffect, useState } from 'react'
const XP_PER = 1000
export default function XPBar({ xp, level, animated=true }) {
  const current = xp % XP_PER
  const target  = (current / XP_PER) * 100
  const [width, setWidth] = useState(animated ? 0 : target)
  useEffect(() => {
    if (!animated) { setWidth(target); return }
    const t = setTimeout(() => setWidth(target), 120)
    return () => clearTimeout(t)
  }, [target, animated])
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-dim)', marginBottom:6, fontFamily:'var(--font-head)', letterSpacing:1 }}>
        <span style={{ color:'var(--accent)' }}>LEVEL {level}</span>
        <span>{current.toLocaleString()} / {XP_PER} XP</span>
      </div>
      <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${width}%`, background:'linear-gradient(90deg,var(--accent2),var(--accent),#00dfff)', borderRadius:4, transition:animated?'width .9s cubic-bezier(0.4,0,0.2,1)':'none', boxShadow:width>5?'0 0 12px var(--accent)':'none' }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-dim)', marginTop:3 }}>
        <span>Lv {level}</span>
        <span>{(XP_PER-current).toLocaleString()} XP to next level</span>
        <span>Lv {level+1}</span>
      </div>
    </div>
  )
}
