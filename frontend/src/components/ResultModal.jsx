import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i, left: Math.random()*100, delay: Math.random()*.8,
    color: ['var(--accent)','var(--green)','var(--gold)','var(--purple)','var(--orange)'][i%5],
    size: 5 + Math.random()*7,
  }))
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', borderRadius:14 }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position:'absolute', left:`${p.left}%`, top:-10, width:p.size, height:p.size, borderRadius:Math.random()>.5?'50%':'2px', background:p.color, animation:`cFall 1.3s ${p.delay}s ease-in forwards`, opacity:0 }}/>
      ))}
      <style>{`@keyframes cFall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(220px) rotate(400deg);opacity:0}}`}</style>
    </div>
  )
}

export default function ResultModal({ result, levelNum=null }) {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [visible, setVisible] = useState(false)
  const [xpAnim,  setXpAnim]  = useState(0)
  const MAX_LEVEL = 6

  useEffect(() => {
    if (!result) return
    refreshUser()
    setTimeout(() => setVisible(true), 50)
    const target = result.xp_earned || 0
    if (target === 0) return
    const step = Math.ceil(target / 45)
    let cur = 0
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target)
      setXpAnim(cur)
      if (cur >= target) clearInterval(iv)
    }, 28)
    return () => clearInterval(iv)
  }, [result]) // eslint-disable-line

  if (!result) return null
  const isLevelUp = result.level_up
  const hasAchiev = result.achievements_unlocked?.length > 0

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, backdropFilter:'blur(8px)', opacity:visible?1:0, transition:'opacity .2s ease' }}>
      <div style={{ background:'var(--bg-card2)', border:`1px solid ${isLevelUp?'var(--gold)':'var(--accent)'}`, borderRadius:14, padding:'40px 48px', maxWidth:500, width:'90%', textAlign:'center', position:'relative', overflow:'hidden', boxShadow:isLevelUp?'0 0 60px rgba(255,214,0,.2)':'0 0 60px rgba(0,184,255,.15)', transform:visible?'scale(1)':'scale(0.85)', transition:'transform .3s cubic-bezier(0.34,1.56,0.64,1)' }}>

        {(isLevelUp || hasAchiev) && <Confetti />}

        <div style={{ fontSize:56, marginBottom:12, animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          {isLevelUp ? '🎉' : hasAchiev ? '⭐' : '✅'}
        </div>

        <h2 style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:20, letterSpacing:2, marginBottom:10 }}>
          MISSION COMPLETE
        </h2>

        {isLevelUp && (
          <div style={{ background:'rgba(255,214,0,.1)', border:'1px solid var(--gold)', borderRadius:8, padding:'8px 16px', marginBottom:14, fontFamily:'var(--font-head)', color:'var(--gold)', fontSize:12, letterSpacing:1, animation:'pop .5s .15s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            ⬆ LEVEL UP! You are now Level {result.new_level}
          </div>
        )}

        <div style={{ fontFamily:'var(--font-head)', fontSize:40, color:'var(--gold)', marginBottom:8, textShadow:'0 0 20px var(--gold)' }}>
          +{xpAnim.toLocaleString()} XP
        </div>

        <div style={{ display:'flex', gap:20, justifyContent:'center', marginBottom:16, fontSize:12, color:'var(--text-dim)' }}>
          <div>Total XP <strong style={{ color:'var(--text)', fontFamily:'var(--font-head)' }}>{result.new_total_xp?.toLocaleString()}</strong></div>
          <div>Score <strong style={{ color:'var(--text)', fontFamily:'var(--font-head)' }}>{result.new_total_score?.toLocaleString()}</strong></div>
        </div>

        {hasAchiev && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:'var(--text-dim)', marginBottom:6, letterSpacing:1 }}>ACHIEVEMENTS UNLOCKED</div>
            {result.achievements_unlocked.map((a, i) => (
              <div key={a} style={{ background:'rgba(255,214,0,.09)', border:'1px solid rgba(255,214,0,.3)', borderRadius:7, padding:'6px 14px', fontSize:12, color:'var(--gold)', marginBottom:5, animation:`pop .4s ${.1+i*.1}s cubic-bezier(0.34,1.56,0.64,1) both` }}>
                🏅 {a}
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:8, flexWrap:'wrap' }}>
          <button className="btn-ghost" onClick={() => navigate('/levels')}>← LEVELS</button>
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>DASHBOARD</button>
          {levelNum && levelNum < MAX_LEVEL && (
            <button className="btn-primary" onClick={() => navigate(`/level/${levelNum + 1}`)}>
              NEXT LEVEL →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
