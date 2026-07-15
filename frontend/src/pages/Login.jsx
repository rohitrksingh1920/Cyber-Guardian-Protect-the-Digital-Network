import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ username:'', password:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 57px)', padding:20 }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'40px 48px', width:'100%', maxWidth:440, boxShadow:'0 0 60px rgba(0,184,255,.08)', animation:'pop .3s cubic-bezier(0.34,1.56,0.64,1)' }}>

          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:8, filter:'drop-shadow(0 0 12px var(--accent))' }}>🛡️</div>
            <h2 style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:20, letterSpacing:2 }}>AGENT LOGIN</h2>
            <p style={{ color:'var(--text-dim)', fontSize:12, marginTop:4 }}>Enter the system to continue your mission</p>
          </div>

          {error && (
            <div style={{ background:'rgba(255,23,68,.1)', border:'1px solid rgba(255,23,68,.4)', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:13, color:'var(--red)', display:'flex', alignItems:'center', gap:8, animation:'fadeIn .2s ease' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label className="input-label">USERNAME</label>
              <input type="text" value={form.username} placeholder="Your agent name"
                onChange={e=>setForm({...form, username:e.target.value})}
                required autoFocus className="input-field"
              />
            </div>
            <div>
              <label className="input-label">PASSWORD</label>
              <input type="password" value={form.password} placeholder="••••••••••"
                onChange={e=>setForm({...form, password:e.target.value})}
                required className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ marginTop:8, padding:'13px', fontSize:13, letterSpacing:2, width:'100%', opacity:loading?.6:1 }}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <span className="loading-spinner" style={{ width:16, height:16, borderWidth:2 }}/>
                  AUTHENTICATING...
                </span>
              ) : '▶ ENTER SYSTEM'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }}/><span style={{ fontSize:11, color:'var(--text-dim)' }}>OR</span><div style={{ flex:1, height:1, background:'var(--border)' }}/>
          </div>

          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-dim)' }}>
            No account? <Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Register as Agent</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
