import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'
import XPBar from '../components/XPBar'
import DailyTip from '../components/DailyTip'
import api from '../services/api'

const LEVEL_META = {
  1:{name:'Personal Device Security', icon:'💻', color:'#00b8ff'},
  2:{name:'Email & Communication',    icon:'📧', color:'#00e676'},
  3:{name:'Malware Defense',          icon:'🦠', color:'#ffd600'},
  4:{name:'Network Security',         icon:'🌐', color:'#ff9100'},
  5:{name:'Advanced Cyber Defense',   icon:'🔐', color:'#e040fb'},
  6:{name:'Global Attack Simulation', icon:'💀', color:'#ff1744'},
}

function AnimCounter({ value, duration=800 }) {
  const [disp, setDisp] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const end = Number(value)||0
    if (prev.current===end) return
    const start=prev.current, t0=Date.now()
    const tick=()=>{
      const p=Math.min((Date.now()-t0)/duration,1)
      const ease=1-Math.pow(1-p,3)
      setDisp(Math.floor(start+(end-start)*ease))
      if(p<1) requestAnimationFrame(tick)
      else { setDisp(end); prev.current=end }
    }
    requestAnimationFrame(tick)
  }, [value, duration])
  return <>{disp.toLocaleString()}</>
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [achiev, setAchiev] = useState([])
  const [board,  setBoard]  = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get('/achievements/').then(r=>setAchiev(r.data.filter(a=>a.unlocked).slice(0,4))).catch(()=>{}),
      api.get('/leaderboard/?limit=5').then(r=>setBoard(r.data)).catch(()=>{}),
    ]).finally(()=>setLoaded(true))
  }, [user])

  if (!user) return null
  const lvl  = Math.min(user.level, 6)
  const meta = LEVEL_META[lvl]
  const myRank = board.find(e=>e.username===user.username)?.rank

  const Card = ({ children, style={} }) => (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'20px 24px', ...style }}>{children}</div>
  )

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar />
      <div style={{ padding:'28px 32px', maxWidth:1200, margin:'0 auto' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, color:'var(--accent)', letterSpacing:2 }}>AGENT DASHBOARD</h1>
            <p style={{ color:'var(--text-dim)', fontSize:13, marginTop:4 }}>
              Welcome back, <strong style={{ color:'var(--text)' }}>{user.avatar} {user.username}</strong>
              {myRank && <span style={{ marginLeft:10 }} className="badge badge-gold">#{myRank} Global</span>}
            </p>
          </div>
          <button className="btn-green" onClick={()=>navigate('/levels')}>▶ PLAY NOW</button>
        </div>

        <DailyTip />

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:20 }}>
          {[
            { label:'LEVEL',        value:user.level,       color:'var(--accent)' },
            { label:'TOTAL XP',     value:user.xp,          color:'var(--gold)' },
            { label:'TOTAL SCORE',  value:user.total_score, color:'var(--green)' },
            { label:'ACHIEVEMENTS', value:achiev.length,    color:'var(--purple)' },
          ].map(s=>(
            <div key={s.label} className="stat-card" style={{ animation:'fadeIn .4s ease' }}>
              <div className="stat-val" style={{ color:s.color }}><AnimCounter value={s.value}/></div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <Card style={{ marginBottom:20 }}>
          <div className="section-label">XP PROGRESS</div>
          <XPBar xp={user.xp} level={user.level} animated />
        </Card>

        <div className="grid-2" style={{ gap:20 }}>

          <Card style={{ borderColor:`${meta.color}40`, animation:'fadeIn .4s ease' }}>
            <div className="section-label">CURRENT MISSION</div>
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:48, filter:`drop-shadow(0 0 12px ${meta.color})` }}>{meta.icon}</div>
              <div>
                <div style={{ fontFamily:'var(--font-head)', color:meta.color, fontSize:11, letterSpacing:1, marginBottom:4 }}>LEVEL {lvl}</div>
                <div style={{ fontSize:15, fontWeight:600 }}>{meta.name}</div>
                <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:4 }}>
                  {lvl < 6 ? `${6-lvl} level${6-lvl>1?'s':''} remaining` : '🏆 All levels reached!'}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <button className="btn-primary" onClick={()=>navigate(`/level/${lvl}`)}>▶ PLAY LEVEL {lvl}</button>
              <button className="btn-ghost" onClick={()=>navigate('/levels')}>ALL LEVELS</button>
            </div>
          </Card>

          <Card style={{ animation:'fadeIn .45s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="section-label" style={{ marginBottom:0 }}>RECENT ACHIEVEMENTS</div>
              <button onClick={()=>navigate('/achievements')} style={{ fontSize:11, color:'var(--accent)', background:'transparent', border:'none', cursor:'pointer', marginBottom:12 }}>View All →</button>
            </div>
            {!loaded ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[1,2,3].map(i=><div key={i} className="skeleton" style={{ height:44, borderRadius:8 }}/>)}
              </div>
            ) : achiev.length===0 ? (
              <div className="empty-state" style={{ padding:'20px 0' }}>
                <div className="empty-icon">🏅</div>
                <div className="empty-title">NO ACHIEVEMENTS YET</div>
                <div style={{ fontSize:12, color:'var(--text-dim)' }}>Complete levels to earn medals!</div>
              </div>
            ) : achiev.map((a,i)=>(
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', background:'rgba(255,214,0,.05)', border:'1px solid rgba(255,214,0,.13)', borderRadius:8, marginBottom:7, animation:`fadeIn .35s ${i*.06}s ease both` }}>
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{a.title}</div>
                  <div style={{ fontSize:11, color:'var(--gold)' }}>+{a.pts_reward} pts</div>
                </div>
                <span style={{ color:'var(--green)', fontSize:12 }}>✓</span>
              </div>
            ))}
          </Card>

          <Card style={{ animation:'fadeIn .5s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div className="section-label" style={{ marginBottom:0 }}>TOP AGENTS</div>
              <button onClick={()=>navigate('/leaderboard')} style={{ fontSize:11, color:'var(--accent)', background:'transparent', border:'none', cursor:'pointer' }}>View All →</button>
            </div>
            {board.length===0 ? (
              <div style={{ color:'var(--text-dim)', fontSize:13 }}>No rankings yet.</div>
            ) : board.map((e,i)=>{
              const isMe = e.username===user.username
              const rc = ['#ffd600','#b0bec5','#bf7c3a'][i]||'var(--text-dim)'
              return (
                <div key={e.rank} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', borderRadius:8, marginBottom:5, background:isMe?'rgba(0,184,255,.08)':'transparent', border:`1px solid ${isMe?'rgba(0,184,255,.25)':'transparent'}`, animation:`fadeIn .35s ${i*.06}s ease both` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontFamily:'var(--font-head)', fontSize:11, color:rc, width:20 }}>#{e.rank}</span>
                    <span style={{ fontSize:14 }}>{e.avatar}</span>
                    <span style={{ fontSize:13, color:isMe?'var(--accent)':'var(--text)' }}>{e.username}{isMe&&' (you)'}</span>
                  </div>
                  <span style={{ fontFamily:'var(--font-head)', color:'var(--green)', fontSize:12 }}>{e.total_score.toLocaleString()}</span>
                </div>
              )
            })}
          </Card>

          <Card style={{ animation:'fadeIn .55s ease' }}>
            <div className="section-label">QUICK ACCESS</div>
            {[
              { label:'🎮 Level Select', sub:'Choose your next mission',                   path:'/levels' },
              { label:'🏅 Achievements', sub:`${achiev.length} unlocked`,                  path:'/achievements' },
              { label:'📊 Leaderboard',  sub:myRank?`You are ranked #${myRank}`:'Top agents', path:'/leaderboard' },
              { label:'⚙ Settings',      sub:'Profile & preferences',                      path:'/settings' },
            ].map((item,i)=>(
              <button key={item.path} onClick={()=>navigate(item.path)}
                style={{ width:'100%', padding:'11px 14px', background:'rgba(0,0,0,.2)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:8, textAlign:'left', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'var(--transition)', marginBottom:8, animation:`fadeIn .35s ${i*.07}s ease both` }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.background='rgba(0,184,255,.04)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='rgba(0,0,0,.2)' }}
              >
                <div>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:1 }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'var(--text-dim)' }}>{item.sub}</div>
                </div>
                <span style={{ color:'var(--text-dim)', fontSize:14 }}>→</span>
              </button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
