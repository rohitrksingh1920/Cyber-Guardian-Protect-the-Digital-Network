import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Home() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const canvasRef = useRef(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(()=>{
    api.get('/leaderboard/?limit=10').then(r=>setLeaderboard(r.data)).catch(()=>setLeaderboard([
      {rank:1,username:'ShadowByte',avatar:'🛡️',level:6,total_score:12450},
      {rank:2,username:'CyberNova', avatar:'⚡',level:5,total_score:9870},
      {rank:3,username:'DataDefender',avatar:'🔒',level:5,total_score:8650},
    ]))
  },[])

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext('2d')
    const resize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight }
    resize(); window.addEventListener('resize',resize)
    const cols=Math.floor(canvas.width/18), drops=Array(cols).fill(1)
    const chars='01アイウエオABCDEF'
    const iv=setInterval(()=>{
      ctx.fillStyle='rgba(4,13,28,0.04)'; ctx.fillRect(0,0,canvas.width,canvas.height)
      ctx.fillStyle='#00b8ff22'; ctx.font='13px monospace'
      drops.forEach((y,i)=>{ const ch=chars[Math.floor(Math.random()*chars.length)]; ctx.fillText(ch,i*18,y*18); if(y*18>canvas.height&&Math.random()>.975)drops[i]=0; drops[i]++ })
    },50)
    return ()=>{ clearInterval(iv); window.removeEventListener('resize',resize) }
  },[])

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>8)
    window.addEventListener('scroll',fn,{passive:true}); return ()=>window.removeEventListener('scroll',fn)
  },[])

  const rankColor=r=>r===1?'#ffd600':r===2?'#b0bec5':r===3?'#bf7c3a':'var(--text-dim)'

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}/>

      {/* Topbar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', padding:'0 24px', height:57, background:scrolled?'rgba(4,13,28,.99)':'rgba(4,13,28,.97)', borderBottom:`1px solid ${scrolled?'var(--border2)':'var(--border)'}`, position:'sticky', top:0, zIndex:100, backdropFilter:'blur(14px)', boxShadow:scrolled?'0 2px 20px rgba(0,0,0,.4)':'none', transition:'all .3s ease' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <Link to="/how-to-play" style={{ fontSize:10, fontFamily:'var(--font-head)', color:'var(--text-dim)', letterSpacing:1.5, transition:'color .2s' }} onMouseEnter={e=>e.target.style.color='var(--text)'} onMouseLeave={e=>e.target.style.color='var(--text-dim)'}>HOW TO PLAY</Link>
          <Link to="/leaderboard" style={{ fontSize:10, fontFamily:'var(--font-head)', color:'var(--text-dim)', letterSpacing:1.5, transition:'color .2s' }} onMouseEnter={e=>e.target.style.color='var(--text)'} onMouseLeave={e=>e.target.style.color='var(--text-dim)'}>LEADERBOARD</Link>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, fontFamily:'var(--font-head)', fontSize:13, fontWeight:700, color:'var(--accent)', letterSpacing:2 }}>🛡️ CYBER GUARDIAN</div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          {user ? (
            <>
              <span style={{ fontSize:11, color:'var(--text-dim)', display:'flex', alignItems:'center' }}>{user.avatar} {user.username}</span>
              <button className="btn-primary" onClick={()=>navigate('/dashboard')} style={{ padding:'6px 14px', fontSize:10 }}>DASHBOARD</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={()=>navigate('/login')}>LOGIN</button>
              <button className="btn-primary" onClick={()=>navigate('/register')}>REGISTER</button>
            </>
          )}
        </div>
      </div>

      <div style={{ position:'relative', zIndex:1, display:'flex', minHeight:'calc(100vh - 57px)' }}>
        {/* Hero */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 60px', gap:22 }}>
          <div style={{ fontSize:68, filter:'drop-shadow(0 0 24px var(--accent))', animation:'pop .5s cubic-bezier(0.34,1.56,0.64,1)' }}>🛡️</div>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:'clamp(46px,8vw,88px)', fontWeight:900, textAlign:'center', lineHeight:1, color:'var(--accent)', textShadow:'0 0 40px var(--accent2)', animation:'fadeIn .5s ease' }}>CYBER<br/>GUARDIAN</h1>
          <p style={{ letterSpacing:4, color:'var(--text-dim)', fontSize:12, textAlign:'center' }}>PROTECT THE DIGITAL NETWORK</p>
          <div style={{ background:'rgba(10,24,52,.85)', border:'1px solid var(--border)', borderRadius:8, padding:'18px 28px', textAlign:'center', maxWidth:460 }}>
            <p style={{ color:'var(--text)', lineHeight:1.75 }}>Hackers are everywhere. Threats are real.<br/>Be smart. Be secure. <span style={{ color:'var(--accent)', fontWeight:600 }}>Be the Guardian.</span></p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:460 }}>
            <button className="btn-green" onClick={()=>navigate(user?'/levels':'/register')} style={{ padding:'15px', fontSize:14, letterSpacing:2, boxShadow:'0 0 24px rgba(0,230,118,.35)' }}>
              ▶ {user?'START GAME':'PLAY NOW — FREE'}
            </button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={()=>navigate('/achievements')} style={{ padding:'12px', background:'transparent', border:'1px solid var(--border)', color:'var(--gold)', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer', transition:'var(--transition)' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.background='rgba(255,214,0,.05)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='transparent'}}>🏅 ACHIEVEMENTS</button>
              <button onClick={()=>navigate('/how-to-play')} style={{ padding:'12px', background:'transparent', border:'1px solid var(--border)', color:'var(--text)', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer', transition:'var(--transition)' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.background='rgba(0,184,255,.04)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='transparent'}}>ℹ HOW TO PLAY</button>
            </div>
          </div>
          {user&&<button onClick={()=>navigate('/dashboard')} style={{ fontSize:12, color:'var(--accent)', background:'transparent', border:'none', cursor:'pointer', letterSpacing:1 }}>→ Open Dashboard</button>}
        </div>

        {/* Leaderboard panel */}
        <div style={{ width:380, borderLeft:'1px solid var(--border)', padding:'24px 18px', background:'rgba(4,13,28,.75)', overflowY:'auto', backdropFilter:'blur(8px)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:13, letterSpacing:2 }}>📊 LEADERBOARD</h3>
            <button onClick={()=>navigate('/leaderboard')} style={{ fontSize:10, color:'var(--text-dim)', background:'transparent', border:'none', cursor:'pointer', fontFamily:'var(--font-head)', letterSpacing:1 }}>VIEW ALL →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'38px 1fr auto', gap:'0 8px', marginBottom:10, fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>
            <span>RANK</span><span>AGENT</span><span>SCORE</span>
          </div>
          {leaderboard.map((entry,i)=>(
            <div key={entry.rank} style={{ display:'grid', gridTemplateColumns:'38px 1fr auto', alignItems:'center', gap:'0 8px', padding:'9px 8px', borderBottom:'1px solid rgba(26,53,96,.4)', animation:`fadeIn .3s ${i*.05}s ease both` }}>
              <div style={{ width:26, height:26, borderRadius:'50%', border:`2px solid ${rankColor(entry.rank)}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-head)', fontSize:11, color:rankColor(entry.rank) }}>{entry.rank}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>{entry.username}</div>
                <div style={{ fontSize:10, color:'var(--text-dim)' }}>Level {entry.level}</div>
              </div>
              <div style={{ fontFamily:'var(--font-head)', color:'var(--green)', fontSize:13 }}>{entry.total_score.toLocaleString()}</div>
            </div>
          ))}
          {leaderboard.length===0&&<div style={{ textAlign:'center', color:'var(--text-dim)', fontSize:12, padding:'32px 0' }}>No agents ranked yet.<br/>Be the first!</div>}
          <div style={{ marginTop:14, textAlign:'center', fontSize:11, color:'var(--text-dim)' }}>Scores updated in real-time</div>
        </div>
      </div>

      <div style={{ position:'relative', zIndex:1, textAlign:'center', padding:'14px', borderTop:'1px solid var(--border)', fontSize:12, color:'var(--text-dim)' }}>
        🛡️ Learn. Defend. Secure the future. — IDEAS 4.0 Innovation Showcase
      </div>
    </div>
  )
}
