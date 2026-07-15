import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Topbar from '../components/Topbar'

const LEVELS = [
  { id:1, name:'Personal Device Security', icon:'💻', color:'#00b8ff', desc:'Password safety, 2FA, safe browsing, recognizing phishing attempts.', mechanic:'8 MCQ Questions' },
  { id:2, name:'Email & Communication',    icon:'📧', color:'#00e676', desc:'Detect phishing emails, malicious links, secure communication.',      mechanic:'8 Email Classifications' },
  { id:3, name:'Malware Defense System',   icon:'🦠', color:'#ffd600', desc:'Viruses, malware detection, antivirus tools, system protection.',      mechanic:'12-File Scan' },
  { id:4, name:'Network Security Ops',     icon:'🌐', color:'#ff9100', desc:'Firewalls, intrusion detection, monitoring suspicious activity.',      mechanic:'Live Threat Defense' },
  { id:5, name:'Advanced Cyber Defense',   icon:'🔐', color:'#e040fb', desc:'Encryption, data protection, identity management.',                    mechanic:'Caesar Cipher Puzzles' },
  { id:6, name:'Global Attack Simulation', icon:'💀', color:'#ff1744', desc:'Large-scale cyber attacks — coordinate all defenses to survive.',     mechanic:'Boss Battle — 90s' },
]

export default function LevelSelect() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .35s ease' }}>
      <Topbar showBack backTo="/dashboard" backLabel="DASHBOARD" />
      <div style={{ padding:'28px 32px', maxWidth:1100, margin:'0 auto' }}>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:26, color:'var(--accent)', letterSpacing:3 }}>SELECT MISSION</h1>
          <p style={{ color:'var(--text-dim)', marginTop:8 }}>Choose your battleground — complete all 6 to become a Cyber Guardian</p>
        </div>

        {user && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--font-head)', fontSize:10, color:'var(--text-dim)', letterSpacing:2, whiteSpace:'nowrap' }}>OVERALL PROGRESS</span>
            <div style={{ flex:1, minWidth:150 }}>
              <div className="progress-track">
                <div className="progress-fill pf-accent" style={{ width:`${Math.min((user.level/6)*100,100)}%` }}/>
              </div>
            </div>
            <span style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:12, whiteSpace:'nowrap' }}>Level {Math.min(user.level,6)} / 6</span>
          </div>
        )}

        <div className="grid-3">
          {LEVELS.map((lvl, i) => {
            const isCurrent = user?.level === lvl.id
            return (
              <div key={lvl.id}
                onClick={() => navigate(`/level/${lvl.id}`)}
                style={{ background:'var(--bg-card)', border:`1px solid ${isCurrent?lvl.color:`${lvl.color}30`}`, borderRadius:12, padding:'26px 22px', cursor:'pointer', transition:'all .25s', position:'relative', overflow:'hidden', boxShadow:isCurrent?`0 0 20px ${lvl.color}25`:'none', animation:`fadeIn .4s ${i*.07}s ease both` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor=lvl.color; e.currentTarget.style.boxShadow=`0 8px 30px ${lvl.color}20` }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=isCurrent?lvl.color:`${lvl.color}30`; e.currentTarget.style.boxShadow=isCurrent?`0 0 20px ${lvl.color}25`:'none' }}
              >
                {isCurrent && (
                  <div style={{ position:'absolute', top:10, left:12 }}>
                    <span className="badge badge-accent" style={{ fontSize:9 }}>CURRENT</span>
                  </div>
                )}
                <div style={{ position:'absolute', top:12, right:14, fontFamily:'var(--font-head)', fontSize:10, color:lvl.color, letterSpacing:1 }}>LVL.{lvl.id}</div>
                <div style={{ position:'absolute', bottom:-30, right:-30, width:90, height:90, borderRadius:'50%', background:lvl.color, opacity:.08, filter:'blur(20px)', pointerEvents:'none' }}/>

                <div style={{ marginTop:isCurrent?18:0 }}>
                  <div style={{ fontSize:44, marginBottom:12, filter:`drop-shadow(0 0 10px ${lvl.color}60)` }}>{lvl.icon}</div>
                  <h3 style={{ fontFamily:'var(--font-head)', color:lvl.color, fontSize:12, letterSpacing:1, marginBottom:8 }}>{lvl.name}</h3>
                  <p style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.6, marginBottom:12 }}>{lvl.desc}</p>
                  <div style={{ fontSize:10, color:'var(--text-dim)', marginBottom:16, fontFamily:'var(--font-head)', letterSpacing:1 }}>⚙ {lvl.mechanic}</div>
                  <div style={{ padding:'7px 18px', background:`${lvl.color}18`, border:`1px solid ${lvl.color}`, color:lvl.color, fontFamily:'var(--font-head)', fontSize:10, letterSpacing:1, borderRadius:6, display:'inline-block' }}>
                    ▶ ENTER ZONE
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
