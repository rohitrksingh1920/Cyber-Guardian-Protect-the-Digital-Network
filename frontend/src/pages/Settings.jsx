import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'
import XPBar from '../components/XPBar'
import api from '../services/api'
import { toast } from '../hooks/useToast'

const AVATARS = ['🛡️','⚡','🔐','🌐','🎯','🔥','💀','🦾','🤖','🕵️','🧠','👾','🏴‍☠️','🦅','🔮']

export default function Settings() {
  const { user, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  // Profile
  const [avatar,       setAvatar]       = useState(user?.avatar || '🛡️')
  const [schoolCode,   setSchoolCode]   = useState(user?.school_code || '')
  const [showOnBoard,  setShowOnBoard]  = useState(user?.show_on_leaderboard ?? true)

  // Gameplay preferences (stored in localStorage — not sent to backend)
  const [soundFX,      setSoundFX]      = useState(() => localStorage.getItem('cg-sfx') !== 'false')
  const [animations,   setAnimations]   = useState(() => localStorage.getItem('cg-anim') !== 'false')
  const [dailyTips,    setDailyTips]    = useState(() => localStorage.getItem('cg-tips') !== 'false')

  const [saving,       setSaving]       = useState(false)
  const [activeTab,    setActiveTab]    = useState('profile')
  const [resetConfirm, setResetConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar || '🛡️')
      setSchoolCode(user.school_code || '')
      setShowOnBoard(user.show_on_leaderboard ?? true)
    }
  }, [user])

  const save = async () => {
    setSaving(true)
    // Save gameplay prefs to localStorage
    localStorage.setItem('cg-sfx',  String(soundFX))
    localStorage.setItem('cg-anim', String(animations))
    localStorage.setItem('cg-tips', String(dailyTips))
    try {
      await api.put('/users/profile', {
        avatar,
        school_code: schoolCode.trim() || null,
        show_on_leaderboard: showOnBoard,
      })
      await refreshUser()
      toast.success('Settings Saved', 'Your profile has been updated.')
    } catch {
      toast.error('Save Failed', 'Could not save settings. Please try again.')
    } finally { setSaving(false) }
  }

  if (!user) return null

  const Toggle = ({ value, onChange, color = 'var(--accent)' }) => (
    <div onClick={() => onChange(!value)} style={{ width:50, height:28, borderRadius:14, background:value?color:'var(--border)', cursor:'pointer', position:'relative', transition:'background .25s', boxShadow:value?`0 0 12px ${color}50`:none, flexShrink:0 }}>
      <div style={{ width:22, height:22, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:value?25:3, transition:'left .25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }}/>
    </div>
  )

  const Row = ({ label, sub, children, danger }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid rgba(26,53,96,.3)', gap:16 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14, color:danger?'var(--red)':'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:2, lineHeight:1.5 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )

  const cardStyle = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'20px 24px', marginBottom:16 }
  const TABS = [
    { id:'profile',  label:'👤 Profile' },
    { id:'gameplay', label:'🎮 Gameplay' },
    { id:'stats',    label:'📊 Statistics' },
    { id:'privacy',  label:'🌐 Privacy' },
    { id:'danger',   label:'⚠ Danger Zone' },
  ]

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD"/>
      <div style={{ padding:'24px 32px', maxWidth:760, margin:'0 auto' }}>

        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, color:'var(--text)', letterSpacing:3 }}>⚙ SETTINGS</h1>
          <p style={{ color:'var(--text-dim)', marginTop:5, fontSize:13 }}>Customize your agent profile and experience</p>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding:'8px 16px', background:activeTab===t.id?'var(--accent2)':'transparent', border:`1px solid ${activeTab===t.id?'var(--accent2)':'var(--border)'}`, color:activeTab===t.id?'#fff':'var(--text-dim)', fontFamily:'var(--font-head)', fontSize:10, letterSpacing:1, borderRadius:6, cursor:'pointer', transition:'var(--transition)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ──────────────────────────── */}
        {activeTab === 'profile' && (
          <>
            {/* Current profile preview */}
            <div style={{ ...cardStyle, display:'flex', gap:20, alignItems:'center', marginBottom:16, background:'linear-gradient(135deg,rgba(0,85,204,.15),rgba(0,184,255,.07))', border:'1px solid rgba(0,184,255,.25)' }}>
              <div style={{ fontSize:52, filter:'drop-shadow(0 0 12px var(--accent))' }}>{avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:16, letterSpacing:1 }}>{user.username}</div>
                <div style={{ fontSize:12, color:'var(--text-dim)', margin:'4px 0 10px' }}>{user.email}</div>
                <XPBar xp={user.xp} level={user.level} animated={false}/>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:32, color:'var(--accent)' }}>Lv{user.level}</div>
                <div style={{ fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>LEVEL</div>
              </div>
            </div>

            {/* Avatar grid */}
            <div style={cardStyle}>
              <div className="section-label">CHOOSE AVATAR</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)} style={{ fontSize:26, width:52, height:52, borderRadius:10, border:`2px solid ${avatar===a?'var(--accent)':'var(--border)'}`, background:avatar===a?'rgba(0,184,255,.15)':'transparent', cursor:'pointer', transition:'var(--transition)', transform:avatar===a?'scale(1.12)':'scale(1)', boxShadow:avatar===a?'0 0 14px rgba(0,184,255,.4)':'none' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Username (display only) */}
            <div style={cardStyle}>
              <div className="section-label">ACCOUNT INFO</div>
              <Row label="Username" sub="Your public agent codename — contact support to change">
                <span style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:14 }}>{user.username}</span>
              </Row>
              <Row label="Email" sub="Your registered email address">
                <span style={{ fontSize:13, color:'var(--text-dim)' }}>{user.email}</span>
              </Row>
              <Row label="Member Since" sub="When you joined the Cyber Guardian force">
                <span style={{ fontSize:13, color:'var(--text-dim)' }}>{new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
              </Row>
            </div>
          </>
        )}

        {/* ── GAMEPLAY TAB ─────────────────────────── */}
        {activeTab === 'gameplay' && (
          <div style={cardStyle}>
            <div className="section-label">GAMEPLAY PREFERENCES</div>
            <Row label="Sound Effects" sub="In-game threat alert and action sounds">
              <Toggle value={soundFX} onChange={setSoundFX} color="var(--accent)"/>
            </Row>
            <Row label="Animations" sub="Page transitions, card animations, and visual effects">
              <Toggle value={animations} onChange={setAnimations} color="var(--accent)"/>
            </Row>
            <Row label="Daily Security Tips" sub="Show a cybersecurity tip on the dashboard each day">
              <Toggle value={dailyTips} onChange={setDailyTips} color="var(--green)"/>
            </Row>
            <div style={{ marginTop:16, padding:'12px 14px', background:'rgba(0,184,255,.06)', border:'1px solid rgba(0,184,255,.15)', borderRadius:8, fontSize:12, color:'var(--text-dim)', lineHeight:1.6 }}>
              💡 Gameplay preferences are saved locally on your device and apply instantly.
            </div>
          </div>
        )}

        {/* ── STATISTICS TAB ───────────────────────── */}
        {activeTab === 'stats' && (
          <>
            <div style={{ ...cardStyle, marginBottom:16 }}>
              <div className="section-label">YOUR STATISTICS</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Current Level',   val:user.level,                      color:'var(--accent)' },
                  { label:'Total XP',        val:user.xp.toLocaleString(),         color:'var(--gold)' },
                  { label:'Total Score',     val:user.total_score.toLocaleString(),color:'var(--green)' },
                  { label:'School Code',     val:user.school_code || 'Not set',    color:'var(--purple)' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-val" style={{ color:s.color, fontSize:22 }}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div className="section-label">LEVEL PROGRESS</div>
              <XPBar xp={user.xp} level={user.level} animated/>
              <div style={{ marginTop:16 }}>
                {[1,2,3,4,5,6].map(lvl => (
                  <div key={lvl} style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 0', borderBottom:'1px solid rgba(26,53,96,.2)' }}>
                    <span style={{ fontFamily:'var(--font-head)', fontSize:11, color:'var(--text-dim)', width:50 }}>LVL {lvl}</span>
                    <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:user.level >= lvl ? '100%' : '0%', background:user.level >= lvl ? 'var(--green)' : 'var(--border)', borderRadius:2, transition:'width .6s ease' }}/>
                    </div>
                    <span style={{ fontSize:12, color:user.level >= lvl?'var(--green)':'var(--text-dim)' }}>{user.level >= lvl ? '✓ Done' : 'Locked'}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PRIVACY TAB ──────────────────────────── */}
        {activeTab === 'privacy' && (
          <div style={cardStyle}>
            <div className="section-label">PRIVACY & COMMUNITY</div>
            <Row label="Show on Global Leaderboard" sub="Your username and score will be visible to all players worldwide">
              <Toggle value={showOnBoard} onChange={setShowOnBoard} color="var(--accent)"/>
            </Row>
            <Row label="School / Institution Code" sub={<>Join your school's private leaderboard. Ask your teacher for the code.<br/><span style={{ color:'var(--accent)', fontSize:11 }}>Example: KRMU2026, DPS2025, IITD2026</span></>}>
              <input value={schoolCode} onChange={e => setSchoolCode(e.target.value.toUpperCase())}
                placeholder="e.g. KRMU2026" maxLength={20}
                className="input-field"
                style={{ width:150, fontSize:13, fontFamily:'var(--font-head)', letterSpacing:2 }}
              />
            </Row>
            <div style={{ marginTop:16, padding:'12px 14px', background:'rgba(0,184,255,.06)', border:'1px solid rgba(0,184,255,.15)', borderRadius:8, fontSize:12, color:'var(--text-dim)', lineHeight:1.7 }}>
              🏫 <strong style={{ color:'var(--text)' }}>School Code</strong> allows your teacher or institution to view your progress on a private leaderboard. Only users with the same code can see each other.<br/>
              🔒 Your email is never shown publicly. Only your username and score appear on leaderboards.
            </div>
          </div>
        )}

        {/* ── DANGER ZONE TAB ──────────────────────── */}
        {activeTab === 'danger' && (
          <div style={{ ...cardStyle, borderColor:'rgba(255,23,68,.3)' }}>
            <div className="section-label" style={{ color:'var(--red)' }}>DANGER ZONE</div>
            <Row label="Reset All Progress" sub="Permanently wipe all scores, XP, achievements and level progress. This cannot be undone." danger>
              {!resetConfirm ? (
                <button className="btn-danger" onClick={() => setResetConfirm(true)}>RESET ALL</button>
              ) : (
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--red)' }}>Are you sure?</span>
                  <button className="btn-ghost" onClick={() => setResetConfirm(false)}>CANCEL</button>
                  <button className="btn-danger" onClick={() => { setResetConfirm(false); toast.info('Reset', 'Please contact support to reset your progress.') }}>CONFIRM</button>
                </div>
              )}
            </Row>
            <Row label="Sign Out" sub="Log out of your Cyber Guardian account on this device" danger>
              <button className="btn-danger" onClick={() => { logout(); navigate('/') }}>LOGOUT</button>
            </Row>
            <div style={{ marginTop:16, padding:'12px 14px', background:'rgba(255,23,68,.06)', border:'1px solid rgba(255,23,68,.2)', borderRadius:8, fontSize:12, color:'var(--text-dim)', lineHeight:1.6 }}>
              ⚠️ Actions in this section are permanent. Please think carefully before proceeding.
            </div>
          </div>
        )}

        {/* Save button (shown on all tabs except danger) */}
        {activeTab !== 'danger' && (
          <button onClick={save} disabled={saving} className="btn-primary" style={{ width:'100%', padding:'13px', fontSize:13, letterSpacing:2, marginTop:4, opacity:saving?.7:1 }}>
            {saving ? '⏳ SAVING...' : '💾 SAVE SETTINGS'}
          </button>
        )}
      </div>
    </div>
  )
}
