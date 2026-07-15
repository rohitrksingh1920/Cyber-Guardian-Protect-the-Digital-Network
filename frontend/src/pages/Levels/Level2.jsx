import { useState, useEffect, useRef } from 'react'
import Topbar from '../../components/Topbar'
import ResultModal from '../../components/ResultModal'
import api from '../../services/api'

const EMAILS = [
  {
    difficulty: 'EASY',
    from: 'security@paypa1.com',
    subject: 'URGENT: Your account is suspended!',
    body: "Dear Customer, Your PayPal account has been suspended. Click here immediately to restore access or your account will be deleted in 24 hours.",
    isPhishing: true,
    inspect: { domain:'paypa1.com', links:['http://paypa1-login.com/verify'], ip:'185.220.101.47', attachments:'None' },
    clue: "'paypa1.com' uses number 1 instead of letter L — classic typosquatting! The link also goes to a fake domain.",
    tip: 'Always check sender domain carefully. "paypa1" ≠ "paypal". Hover links before clicking.',
    cyberTip: 'Typosquatting is when attackers register domains one character off from real brands.',
  },
  {
    difficulty: 'EASY',
    from: 'order-update@amazon.com',
    subject: 'Your Amazon order has been shipped',
    body: 'Hi, your order #302-5581204-2938610 has been shipped and will arrive by Thursday. Track your package at amazon.com/orders.',
    isPhishing: false,
    inspect: { domain:'amazon.com', links:['https://amazon.com/orders'], ip:'205.251.242.103', attachments:'None' },
    clue: 'Official amazon.com domain. Links go to amazon.com only. Contains a real order number. No urgency or threats.',
    tip: 'Legitimate shipping emails contain real order numbers and only link to the official site.',
    cyberTip: 'Verify the domain matches the company exactly. amazon.com is safe; amazon-support.net is not.',
  },
  {
    difficulty: 'MEDIUM',
    from: 'support@micros0ft-security.net',
    subject: 'Windows Defender Alert: Critical Virus Detected!',
    body: 'WARNING! Our system detected TROJAN.WIN32.REDLINE on your computer. Call our Microsoft Certified technicians IMMEDIATELY at 1-800-642-7676.',
    isPhishing: true,
    inspect: { domain:'micros0ft-security.net', links:['tel:18006427676'], ip:'91.108.4.100', attachments:'None' },
    clue: "Fake domain (micros0ft uses '0' not 'o') on .net not .com. Microsoft NEVER cold-contacts you about viruses by phone.",
    tip: 'Tech support scams use scare tactics + phone numbers. Microsoft will never call you about a virus.',
    cyberTip: 'Tech support scams cost victims over $1 billion per year. Never call numbers from unsolicited emails.',
  },
  {
    difficulty: 'MEDIUM',
    from: 'no-reply@slack.com',
    subject: 'Unrecognized sign-in to your workspace',
    body: "Someone signed in to YourWorkspace from Chrome on Windows (IP: 185.220.101.47, Russia). If this wasn't you, secure your account at slack.com/account.",
    isPhishing: false,
    inspect: { domain:'slack.com', links:['https://slack.com/account/settings'], ip:'54.192.44.100', attachments:'None' },
    clue: 'Official slack.com domain. Contains specific IP + location. Link goes to slack.com/account. No password request.',
    tip: 'Legitimate security alerts contain specific details (IP, location, device) and link to the real site.',
    cyberTip: 'When in doubt, navigate directly to the service (slack.com) rather than clicking email links.',
  },
  {
    difficulty: 'HARD',
    from: 'hr@yourcompany.internal',
    subject: 'Annual Bonus — Confirm Bank Details ASAP',
    body: 'Congratulations! You have been selected for an annual performance bonus. Please reply with your bank account number and IFSC code so we can process the transfer before Friday.',
    isPhishing: true,
    inspect: { domain:'yourcompany.internal', links:['None'], ip:'Unknown', attachments:'None' },
    clue: 'Legitimate HR systems NEVER request bank details via email. This is spear-phishing targeting employees.',
    tip: "Even if the sender looks internal, verify unusual requests by calling HR directly. Never send bank details via email.",
    cyberTip: 'Business Email Compromise (BEC) costs companies $50+ billion annually. Always verify money/data requests by phone.',
  },
  {
    difficulty: 'HARD',
    from: 'security@google.com',
    subject: 'Critical security alert for your Google Account',
    body: "We detected a sign-in to your Google Account from Samsung Galaxy S24, Bangalore, India (IP: 103.45.22.10). If this wasn't you, check your account at myaccount.google.com/security.",
    isPhishing: false,
    inspect: { domain:'google.com', links:['https://myaccount.google.com/security'], ip:'172.217.14.100', attachments:'None' },
    clue: 'Official google.com sender. Contains specific device, city and IP. Links only to myaccount.google.com.',
    tip: 'Google really sends these alerts. The key is the link goes to myaccount.google.com — a real Google domain.',
    cyberTip: 'Google, Microsoft and Apple all send real security alerts. The safe way is to navigate to the site yourself to verify.',
  },
]

function InspectPanel({ email, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, backdropFilter:'blur(6px)' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--accent)', borderRadius:12, padding:'28px 32px', maxWidth:460, width:'90%', animation:'pop .3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <span style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:13, letterSpacing:2 }}>🔍 EMAIL INSPECTION</span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'var(--text-dim)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        {[
          { label:'Sender Domain', val:email.inspect.domain, flag: email.isPhishing },
          { label:'Embedded Links', val:email.inspect.links.join('\n'), flag: email.isPhishing },
          { label:'Server IP',     val:email.inspect.ip,    flag: false },
          { label:'Attachments',   val:email.inspect.attachments, flag: false },
        ].map(row=>(
          <div key={row.label} style={{ padding:'10px 0', borderBottom:'1px solid rgba(26,53,96,.3)' }}>
            <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:'var(--font-head)', letterSpacing:1, marginBottom:4 }}>{row.label}</div>
            <div style={{ fontSize:13, color: row.flag ? 'var(--red)' : 'var(--green)', fontFamily:'monospace', wordBreak:'break-all' }}>{row.val}</div>
          </div>
        ))}
        <div style={{ marginTop:14, fontSize:12, color:'var(--text-dim)', lineHeight:1.6 }}>
          💡 Hover over links before clicking. Check domain spelling carefully.
        </div>
      </div>
    </div>
  )
}

function DifficultyBadge({ level }) {
  const colors = { EASY:'var(--green)', MEDIUM:'var(--gold)', HARD:'var(--red)' }
  return (
    <span style={{ fontSize:10, padding:'2px 10px', borderRadius:20, fontFamily:'var(--font-head)', letterSpacing:1, background:`${colors[level]}15`, border:`1px solid ${colors[level]}`, color:colors[level] }}>
      {level}
    </span>
  )
}

export default function Level2() {
  const [current,     setCurrent]     = useState(0)
  const [selected,    setSelected]    = useState(null) // null | false | true
  const [lives,       setLives]       = useState(3)
  const [score,       setScore]       = useState(0)
  const [correct,     setCorrect]     = useState(0)
  const [timer,       setTimer]       = useState(22)
  const [showInspect, setShowInspect] = useState(false)
  const [feedback,    setFeedback]    = useState(null)
  const [result,      setResult]      = useState(null)
  const [showReport,  setShowReport]  = useState(false)
  const [startTime]                   = useState(Date.now())
  const timesRef    = useRef([])
  const questionStart = useRef(Date.now())

  useEffect(() => {
    if (selected !== null) return
    if (timer <= 0) { handleAnswer(null); return }
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, selected])

  const handleAnswer = (isPhishing) => {
    if (selected !== null) return
    const elapsed = Math.round((Date.now() - questionStart.current) / 1000)
    timesRef.current.push(elapsed)
    setSelected(isPhishing)
    const email = EMAILS[current]
    const isCorrect = isPhishing === email.isPhishing
    if (isCorrect) {
      const pts = 150 + timer * 8
      setScore(s => s + pts)
      setCorrect(c => c + 1)
      setFeedback({ ok: true, msg: `✅ Correct! +${pts} pts` })
    } else {
      setLives(l => l - 1)
      setFeedback({ ok: false, msg: isPhishing === null ? '⏰ Time up!' : '❌ Wrong!' })
    }
  }

  const handleNext = () => {
    setFeedback(null)
    setSelected(null)
    setShowInspect(false)
    if (lives <= (selected !== EMAILS[current]?.isPhishing ? 1 : 0)) {
      finishLevel()
      return
    }
    if (current + 1 >= EMAILS.length) {
      setShowReport(true)
    } else {
      setCurrent(c => c + 1)
      setTimer(22)
      questionStart.current = Date.now()
    }
  }

  const finishLevel = async (fromReport = false) => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const accuracy = Math.round((correct / EMAILS.length) * 100)
    try {
      const { data } = await api.post('/game/level/submit', { level: 2, score, accuracy, time_taken: timeTaken, difficulty: 'agent' })
      setResult(data)
    } catch {
      setResult({ xp_earned: 0, new_level: 1, achievements_unlocked: [], level_up: false, new_total_xp: 0, new_total_score: 0 })
    }
  }

  const avgTime = timesRef.current.length > 0
    ? Math.round(timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length)
    : 0
  const phishSkill = correct >= 6 ? 'Expert' : correct >= 4 ? 'Advanced' : correct >= 2 ? 'Intermediate' : 'Beginner'

  const email = EMAILS[current]

  return (
    <div style={{ minHeight: '100vh', animation: 'fadeIn .3s ease' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS" />
      {result && <ResultModal result={result} levelNum={2} />}
      {showInspect && <InspectPanel email={email} onClose={() => setShowInspect(false)} />}

      {/* Final Report */}
      {showReport && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, backdropFilter:'blur(8px)' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--green)', borderRadius:14, padding:'40px 48px', maxWidth:480, width:'90%', textAlign:'center', animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ fontSize:44, marginBottom:12 }}>📧</div>
            <div style={{ fontFamily:'var(--font-head)', color:'var(--green)', fontSize:18, letterSpacing:2, marginBottom:20 }}>MISSION COMPLETE</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[
                { label:'Emails Checked',  val: EMAILS.length,   color:'var(--accent)' },
                { label:'Correct',         val: correct,          color:'var(--green)' },
                { label:'Accuracy',        val: `${Math.round((correct/EMAILS.length)*100)}%`, color:'var(--gold)' },
                { label:'Avg React Time',  val: `${avgTime}s`,    color:'var(--purple)' },
                { label:'Lives Remaining', val: `${'❤️'.repeat(lives)}`, color:'var(--red)' },
                { label:'Phishing Skill',  val: phishSkill,       color:'var(--accent)' },
              ].map(s => (
                <div key={s.label} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'12px' }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:18, color:s.color, marginBottom:3 }}>{s.val}</div>
                  <div style={{ fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowReport(false); finishLevel(true) }}
              style={{ padding:'12px 32px', background:'var(--accent2)', color:'#fff', fontFamily:'var(--font-head)', fontSize:12, letterSpacing:2, borderRadius:7, border:'none', cursor:'pointer' }}>
              COLLECT XP →
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: '24px 32px', maxWidth: 820, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', color: '#00e676', fontSize: 14, letterSpacing: 2 }}>📧 LEVEL 2 — PHISHING HUNT</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Email {current + 1} of {EMAILS.length}</span>
              <DifficultyBadge level={email.difficulty} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-head)', letterSpacing: 1 }}>LIVES</div>
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, color: timer <= 8 ? 'var(--red)' : '#00e676', transition: 'color .3s' }}>
              {String(timer).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-track" style={{ marginBottom: 16 }}>
          <div className="progress-fill pf-green" style={{ width: `${(current / EMAILS.length) * 100}%` }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'var(--font-head)', color: 'var(--gold)', fontSize: 13 }}>SCORE: {score.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>✅ {correct} correct</span>
        </div>

        {/* Email card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14, animation: 'fadeIn .3s ease' }}>
          <div style={{ background: 'rgba(0,0,0,.3)', padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '65px 1fr', gap: '4px 8px', fontSize: 13 }}>
              <span style={{ color: 'var(--text-dim)' }}>From:</span>
              <strong style={{ color: selected !== null ? (email.isPhishing ? 'var(--red)' : 'var(--green)') : 'var(--text)' }}>{email.from}</strong>
              <span style={{ color: 'var(--text-dim)' }}>Subject:</span>
              <span>{email.subject}</span>
            </div>
          </div>
          <div style={{ padding: '18px 24px', lineHeight: 1.75, fontSize: 14 }}>{email.body}</div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,.15)' }}>
            <button onClick={() => setShowInspect(true)}
              style={{ padding: '6px 16px', background: 'rgba(0,184,255,.1)', border: '1px solid rgba(0,184,255,.3)', color: 'var(--accent)', fontSize: 12, fontFamily: 'var(--font-head)', letterSpacing: 1, borderRadius: 6, cursor: 'pointer' }}>
              🔍 INSPECT EMAIL
            </button>
          </div>
        </div>

        {/* Feedback (shown after answering) */}
        {feedback && (
          <div style={{ background: feedback.ok ? 'rgba(0,230,118,.08)' : 'rgba(255,23,68,.08)', border: `1px solid ${feedback.ok ? 'rgba(0,230,118,.4)' : 'rgba(255,23,68,.4)'}`, borderRadius: 10, padding: '14px 18px', marginBottom: 14, animation: 'fadeIn .3s ease' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, color: feedback.ok ? 'var(--green)' : 'var(--red)', marginBottom: 8 }}>{feedback.msg}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 }}><strong>Why:</strong> {email.clue}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 12px', background: 'rgba(0,184,255,.06)', borderRadius: 6, borderLeft: '3px solid var(--accent)' }}>
              💡 <strong>Cyber Tip:</strong> {email.cyberTip}
            </div>
            <button onClick={handleNext} style={{ marginTop: 12, padding: '8px 20px', background: 'var(--accent2)', color: '#fff', fontFamily: 'var(--font-head)', fontSize: 11, letterSpacing: 1, borderRadius: 6, border: 'none', cursor: 'pointer' }}>
              NEXT EMAIL →
            </button>
          </div>
        )}

        {/* Verdict buttons (hidden while showing feedback) */}
        {!feedback && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: '✅ SAFE EMAIL', value: false, bg: 'rgba(0,230,118,.1)', border: 'var(--green)', color: 'var(--green)' },
              { label: '🎣 PHISHING!',  value: true,  bg: 'rgba(255,23,68,.1)', border: 'var(--red)',   color: 'var(--red)' },
            ].map(btn => (
              <button key={btn.label} onClick={() => handleAnswer(btn.value)} disabled={selected !== null}
                style={{ padding: '18px', background: btn.bg, border: `2px solid ${btn.border}`, color: btn.color, fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: 2, borderRadius: 10, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >{btn.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
