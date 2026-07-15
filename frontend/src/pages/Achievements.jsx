import { useEffect, useState } from 'react'
import Topbar from '../components/Topbar'
import api from '../services/api'

export default function Achievements() {
  const [achiev,  setAchiev]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    api.get('/achievements/')
      .then(r => setAchiev(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unlocked  = achiev.filter(a =>  a.unlocked)
  const locked    = achiev.filter(a => !a.unlocked)
  const totalPts  = unlocked.reduce((s, a) => s + a.pts_reward, 0)
  const displayed = filter==='unlocked' ? unlocked : filter==='locked' ? locked : achiev
  const pct       = achiev.length > 0 ? Math.round((unlocked.length/achiev.length)*100) : 0

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD" />
      <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:26, color:'var(--accent)', letterSpacing:3 }}>🏅 ACHIEVEMENTS</h1>
          <p style={{ color:'var(--text-dim)', marginTop:8 }}>Medals earned in the field</p>
        </div>

        {/* Stats */}
        <div className="grid-3" style={{ marginBottom:20 }}>
          {[
            { label:'Unlocked',      value:unlocked.length,          color:'var(--accent)' },
            { label:'Locked',        value:locked.length,            color:'var(--text-dim)' },
            { label:'Points Earned', value:totalPts.toLocaleString(),color:'var(--green)' },
          ].map(s=>(
            <div key={s.label} className="stat-card">
              <div className="stat-val" style={{ color:s.color, fontSize:32 }}>{s.value}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'16px 20px', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-dim)', fontFamily:'var(--font-head)', letterSpacing:1, marginBottom:8 }}>
            <span>COMPLETION</span>
            <span style={{ color:pct===100?'var(--green)':'var(--accent)' }}>{pct}%</span>
          </div>
          <div className="progress-track" style={{ height:8 }}>
            <div className="progress-fill pf-accent" style={{ width:`${pct}%` }}/>
          </div>
          {pct===100 && (
            <div style={{ textAlign:'center', marginTop:10, fontFamily:'var(--font-head)', color:'var(--green)', fontSize:11, letterSpacing:1 }}>
              🏆 ALL ACHIEVEMENTS UNLOCKED!
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
          {[['all','All'], ['unlocked','Unlocked ✓'], ['locked','Locked']].map(([val,label])=>(
            <button key={val} onClick={()=>setFilter(val)} style={{ padding:'7px 18px', background:filter===val?'var(--accent2)':'transparent', border:`1px solid ${filter===val?'var(--accent2)':'var(--border)'}`, color:filter===val?'#fff':'var(--text-dim)', fontFamily:'var(--font-head)', fontSize:10, letterSpacing:1, borderRadius:6, cursor:'pointer', transition:'var(--transition)' }}>
              {label}
            </button>
          ))}
          <span style={{ marginLeft:'auto', fontSize:12, color:'var(--text-dim)' }}>{displayed.length} shown</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="page-loading">
            <div className="loading-spinner"/>
            <div className="page-loading-text">LOADING MEDALS...</div>
          </div>
        ) : displayed.length===0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏅</div>
            <div className="empty-title">{filter==='unlocked'?'NO ACHIEVEMENTS YET':'ALL ACHIEVED!'}</div>
            <div style={{ fontSize:13, color:'var(--text-dim)' }}>
              {filter==='unlocked'?'Complete levels to earn your first achievement!':'You\'ve earned every achievement!'}
            </div>
          </div>
        ) : (
          <div className="grid-3">
            {displayed.map((a,i)=>(
              <div key={a.id}
                style={{ background:'var(--bg-card)', border:`1px solid ${a.unlocked?'rgba(0,184,255,.35)':'var(--border)'}`, borderRadius:10, padding:'18px 20px', display:'flex', gap:14, alignItems:'flex-start', opacity:a.unlocked?1:0.45, transition:'var(--transition)', animation:`fadeIn .35s ${Math.min(i*.04,.5)}s ease both`, cursor:'default' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}
              >
                <div style={{ fontSize:30, filter:a.unlocked?'none':'grayscale(1)', flexShrink:0 }}>{a.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                    {a.title}
                    {a.unlocked && <span style={{ color:'var(--green)', fontSize:12 }}>✓</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.5, marginBottom:8 }}>{a.description}</div>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:11, color:a.unlocked?'var(--gold)':'var(--text-dim)' }}>
                    +{a.pts_reward} pts
                  </div>
                  {a.unlocked && a.unlocked_at && (
                    <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:3 }}>
                      {new Date(a.unlocked_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
