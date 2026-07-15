import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Topbar({ showBack=false, backTo=null, backLabel='BACK' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleBack = () => backTo ? navigate(backTo) : navigate(-1)

  const NavLink = ({ to, label }) => {
    const active = location.pathname === to
    return (
      <Link to={to} style={{ fontSize:10, fontFamily:'var(--font-head)', letterSpacing:1.5, color:active?'var(--accent)':'var(--text-dim)', paddingBottom:2, borderBottom:active?'1px solid var(--accent)':'1px solid transparent', transition:'var(--transition)', whiteSpace:'nowrap' }}
        onMouseEnter={e=>{ if(!active) e.target.style.color='var(--text)' }}
        onMouseLeave={e=>{ if(!active) e.target.style.color='var(--text-dim)' }}
      >{label}</Link>
    )
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns: showBack ? 'auto 1fr auto' : '1fr auto 1fr', alignItems:'center', padding:'0 24px', height:57, background: scrolled?'rgba(4,13,28,.99)':'rgba(4,13,28,.97)', borderBottom:`1px solid ${scrolled?'var(--border2)':'var(--border)'}`, position:'sticky', top:0, zIndex:100, backdropFilter:'blur(14px)', boxShadow: scrolled?'0 2px 20px rgba(0,0,0,.4)':'none', transition:'all .3s ease' }}>

      {showBack ? (
        <button className="back-btn" onClick={handleBack} style={{ marginBottom:0 }}>← {backLabel}</button>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          {user && <><NavLink to="/dashboard" label="DASHBOARD"/><NavLink to="/levels" label="PLAY"/><NavLink to="/leaderboard" label="RANKS"/></>}
        </div>
      )}

      <Link to={user?'/dashboard':'/'} style={{ gridColumn:showBack?2:2, display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'var(--font-head)', fontSize:13, fontWeight:700, color:'var(--accent)', letterSpacing:2, textDecoration:'none', transition:'var(--transition)' }}
        onMouseEnter={e=>e.currentTarget.style.textShadow='0 0 15px var(--accent)'}
        onMouseLeave={e=>e.currentTarget.style.textShadow='none'}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        CYBER GUARDIAN
      </Link>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:10 }}>
        {user ? (
          <>
            <span style={{ fontSize:11, color:'var(--text-dim)', whiteSpace:'nowrap' }}>LV<span style={{ color:'var(--accent)' }}>{user.level}</span> {user.avatar} {user.username}</span>
            <Link to="/settings">
              <button style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text-dim)', width:32, height:32, borderRadius:6, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', transition:'var(--transition)' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-dim)'}}
              >⚙</button>
            </Link>
            <button onClick={()=>{logout();navigate('/')}} style={{ padding:'5px 12px', background:'transparent', border:'1px solid var(--red)', color:'var(--red)', fontFamily:'var(--font-head)', fontSize:9, letterSpacing:1, borderRadius:5, transition:'var(--transition)' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,23,68,.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >LOGOUT</button>
          </>
        ) : (
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn-ghost" onClick={()=>navigate('/login')}>LOGIN</button>
            <button className="btn-primary" onClick={()=>navigate('/register')}>REGISTER</button>
          </div>
        )}
      </div>
    </div>
  )
}
