import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'

function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  const label = ['Weak','Fair','Good','Strong'][score-1] || ''
  const color = ['var(--red)','var(--orange)','var(--gold)','var(--green)'][score-1] || 'var(--border)'
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:4, marginBottom:3 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i < score ? color : 'var(--border)', transition:'background .3s' }}/>
        ))}
      </div>
      {label && <span style={{ fontSize:11, color, fontFamily:'var(--font-head)', letterSpacing:1 }}>{label}</span>}
    </div>
  )
}

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form,    setForm]    = useState({ username:'', email:'', password:'', confirm:'' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.username.length < 3)               return setError('Username must be at least 3 characters')
    if (form.password !== form.confirm)          return setError('Passwords do not match')
    if (form.password.length < 6)               return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 57px)', padding:20 }}>
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:14, padding:'40px 48px', width:'100%', maxWidth:460, boxShadow:'0 0 60px rgba(0,184,255,.08)', animation:'pop .3s cubic-bezier(0.34,1.56,0.64,1)' }}>

          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:8, filter:'drop-shadow(0 0 12px var(--green))' }}>🛡️</div>
            <h2 style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:20, letterSpacing:2 }}>JOIN THE FORCE</h2>
            <p style={{ color:'var(--text-dim)', fontSize:12, marginTop:4 }}>Create your agent profile</p>
          </div>

          {error && (
            <div style={{ background:'rgba(255,23,68,.1)', border:'1px solid rgba(255,23,68,.4)', borderRadius:8, padding:'10px 14px', marginBottom:18, fontSize:13, color:'var(--red)', display:'flex', alignItems:'center', gap:8, animation:'fadeIn .2s ease' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Username */}
            <div>
              <label className="input-label">USERNAME</label>
              <input type="text" value={form.username} placeholder="Your agent codename"
                onChange={e => setForm({...form, username: e.target.value})}
                required autoFocus className="input-field"
              />
            </div>

            {/* Email */}
            <div>
              <label className="input-label">EMAIL</label>
              <input type="email" value={form.email} placeholder="agent@example.com"
                onChange={e => setForm({...form, email: e.target.value})}
                required className="input-field"
              />
            </div>

            {/* Password */}
            <div>
              <label className="input-label">PASSWORD</label>
              <input type="password" value={form.password} placeholder="••••••••••"
                onChange={e => setForm({...form, password: e.target.value})}
                required className="input-field"
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm */}
            <div>
              <label className="input-label">CONFIRM PASSWORD</label>
              <input type="password" value={form.confirm} placeholder="••••••••••"
                onChange={e => setForm({...form, confirm: e.target.value})}
                required className="input-field"
                style={{ borderColor: form.confirm && form.confirm !== form.password ? 'var(--red)' : form.confirm && form.confirm === form.password ? 'var(--green)' : 'var(--border)' }}
              />
              {form.confirm && form.confirm === form.password && (
                <div style={{ fontSize:11, color:'var(--green)', marginTop:4 }}>✓ Passwords match</div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-green"
              style={{ marginTop:6, padding:'13px', fontSize:13, width:'100%', opacity: loading?.6:1 }}
            >
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <span className="loading-spinner" style={{ width:16, height:16, borderWidth:2, borderTopColor:'#000' }}/>
                  CREATING AGENT...
                </span>
              ) : '▶ DEPLOY AGENT'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--text-dim)' }}>
            Already an agent?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
