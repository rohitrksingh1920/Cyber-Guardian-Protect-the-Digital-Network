import { useState, useEffect, useRef } from 'react'
import Topbar from '../../components/Topbar'
import ResultModal from '../../components/ResultModal'
import RunnerStage from '../../components/RunnerStage'
import api from '../../services/api'

// ── Quiz questions with rich feedback ──────────────────────────────────────
const QUESTIONS = [
  {
    question: 'Which password is the STRONGEST?',
    options: ['admin123', 'password1', 'R@h!t#2026!!', '12345678'],
    correct: 2,
    correct_detail: {
      label: 'R@h!t#2026!!',
      checks: ['✔ Uppercase letters', '✔ Lowercase letters', '✔ Numbers', '✔ Special symbols', '✔ 12+ characters long'],
      tip: 'Strong passwords combining all four character types are exponentially harder to crack.',
    },
    wrong_tip: 'admin123, password1, 12345678 are among the most commonly used passwords — hackers try these first.',
  },
  {
    question: 'What does 2FA (Two-Factor Authentication) protect against?',
    options: ['Slow internet', 'A stolen password being enough to log in', 'Computer viruses', 'Company data leaks'],
    correct: 1,
    correct_detail: {
      label: 'Stolen password alone',
      checks: ['✔ Requires something you know (password)', '✔ AND something you have (phone/app)', '✔ Attacker needs both to succeed'],
      tip: '2FA blocks over 99.9% of automated credential attacks — even with a leaked password.',
    },
    wrong_tip: '2FA does not protect from viruses or slow internet. It specifically stops stolen passwords from being used alone.',
  },
  {
    question: 'You get an email: "Your account was hacked — reset here." What do you do?',
    options: ['Click the link immediately', 'Ignore it', 'Open a NEW browser tab and go to the website directly', 'Reply asking if it is real'],
    correct: 2,
    correct_detail: {
      label: 'Open a new tab and navigate directly',
      checks: ['✔ Never trust email links', '✔ Phishers clone login pages perfectly', '✔ Type the URL yourself'],
      tip: 'This technique is called "direct navigation" — the gold standard for avoiding phishing.',
    },
    wrong_tip: 'Clicking links in suspicious emails is the #1 way people get phished. Replying can also confirm your email is active.',
  },
  {
    question: 'Which is the WORST password habit?',
    options: ['Using a password manager', 'Using 2FA on all accounts', 'Using the same password on every website', 'Changing your password after a breach'],
    correct: 2,
    correct_detail: {
      label: 'Same password everywhere',
      checks: ['✔ One breach exposes ALL accounts', '✔ Called "credential stuffing" attack', '✔ Hackers test leaked passwords on 100s of sites'],
      tip: 'Password reuse is one of the top causes of account takeovers. Use unique passwords per site.',
    },
    wrong_tip: 'Password managers and 2FA are good habits. Changing after a breach is also correct. Reuse is always the worst choice.',
  },
  {
    question: 'What is a "password salt"?',
    options: ['A way to make passwords longer', 'A random value added before hashing to defeat rainbow table attacks', 'A type of password encryption', 'A hint stored with your password'],
    correct: 1,
    correct_detail: {
      label: 'Random value added before hashing',
      checks: ['✔ Even identical passwords hash differently', '✔ Defeats precomputed rainbow table attacks', '✔ Industry standard in secure databases'],
      tip: 'Without salting, two users with "password123" would have identical hashes — a huge vulnerability.',
    },
    wrong_tip: 'Salting is not encryption or length extension. It prevents attackers from using lookup tables of precomputed hashes.',
  },
]

// ── Mission Brief overlay ──────────────────────────────────────────────────
function MissionBrief({ onStart }) {
  const [countdown, setCountdown] = useState(5)
  useEffect(() => {
    if (countdown <= 0) { onStart(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])
  return (
    <div style={{ minHeight:'calc(100vh - 57px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid #00b8ff40', borderRadius:14, padding:'48px 56px', maxWidth:520, textAlign:'center', animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:11, color:'var(--accent)', letterSpacing:3, marginBottom:16 }}>MISSION 1</div>
        <div style={{ fontSize:48, marginBottom:12, filter:'drop-shadow(0 0 20px #00b8ff)' }}>🔐</div>
        <h2 style={{ fontFamily:'var(--font-head)', color:'#00b8ff', fontSize:22, letterSpacing:2, marginBottom:16 }}>PASSWORD FORTRESS</h2>
        <div style={{ background:'rgba(0,184,255,.06)', border:'1px solid rgba(0,184,255,.2)', borderRadius:10, padding:'16px 20px', marginBottom:20, textAlign:'left' }}>
          <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.75 }}>
            The company's password vault is under attack.<br/><br/>
            <span style={{ color:'#00e676' }}>🟢 Collect</span> strong passwords, password managers, MFA tokens and security keys.<br/>
            <span style={{ color:'var(--red)' }}>🔴 Avoid</span> weak passwords, malware, fake login pages, keyloggers and trojans.<br/><br/>
            <strong style={{ color:'var(--gold)' }}>Score 400 points</strong> to secure the vault and unlock the security quiz.
          </p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:24, fontSize:12 }}>
          {[['🟢','Strong Password','+15 pts'],['🟢','Password Manager','+20 pts'],['🟢','MFA Token','+18 pts'],['🟢','Security Key','+25 pts'],
            ['🔴','Weak Password','❌ -Life'],['🔴','Malware','❌ -Life'],['🔴','Fake Login Page','❌ -Life'],['🔴','Keylogger','❌ -Life']
          ].map(([icon,label,pts])=>(
            <div key={label} style={{ background:'rgba(0,0,0,.2)', borderRadius:6, padding:'6px 10px', display:'flex', gap:8, alignItems:'center' }}>
              <span>{icon}</span>
              <span style={{ color:'var(--text-dim)', flex:1 }}>{label}</span>
              <span style={{ fontFamily:'var(--font-head)', fontSize:10, color: pts.startsWith('+') ? 'var(--green)' : 'var(--red)' }}>{pts}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'var(--font-head)', color:'var(--text-dim)', fontSize:11, letterSpacing:1 }}>
          Starting in <span style={{ color:'var(--accent)', fontSize:18 }}>{countdown}</span>...
        </div>
        <button onClick={onStart} style={{ marginTop:14, padding:'10px 28px', background:'rgba(0,184,255,.15)', border:'1px solid #00b8ff', color:'#00b8ff', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer' }}>
          START NOW →
        </button>
      </div>
    </div>
  )
}

// ── Stats Screen after runner ──────────────────────────────────────────────
function StatsScreen({ runStats, onContinue }) {
  return (
    <div style={{ minHeight:'calc(100vh - 57px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--green)', borderRadius:14, padding:'40px 48px', maxWidth:480, textAlign:'center', animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 0 40px rgba(0,230,118,.15)' }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🔐</div>
        <div style={{ fontFamily:'var(--font-head)', color:'var(--green)', fontSize:18, letterSpacing:2, marginBottom:4 }}>VAULT SECURED!</div>
        <div style={{ color:'var(--text-dim)', fontSize:13, marginBottom:24 }}>Password Fortress Run — Complete</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
          {[
            { label:'Run Score',         val: runStats.score,         color:'var(--gold)' },
            { label:'Items Collected',   val: runStats.dataCollected, color:'var(--green)' },
            { label:'Lives Remaining',   val: `${runStats.lives} / 3`, color:'var(--accent)' },
            { label:'Run Bonus',         val: `+${runStats.score}`,    color:'var(--purple)' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'14px' }}>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, color:s.color, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'rgba(0,184,255,.07)', border:'1px solid rgba(0,184,255,.2)', borderRadius:8, padding:'12px 16px', marginBottom:20, fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>
          🔐 Vault secured with run bonus! Now answer <strong style={{ color:'var(--text)' }}>5 security questions</strong> to complete the mission.
        </div>
        <button onClick={onContinue} style={{ padding:'12px 32px', background:'var(--accent2)', color:'#fff', fontFamily:'var(--font-head)', fontSize:12, letterSpacing:2, borderRadius:7, border:'none', cursor:'pointer' }}>
          ▶ ENTER SECURITY QUIZ
        </button>
      </div>
    </div>
  )
}

// ── Rich feedback component ────────────────────────────────────────────────
function QuizFeedback({ q, selected, onNext }) {
  const isCorrect = selected === q.correct
  return (
    <div style={{ background:'var(--bg-card)', border:`1px solid ${isCorrect?'var(--green)':'var(--red)'}`, borderRadius:12, padding:'24px 28px', animation:'pop .3s cubic-bezier(0.34,1.56,0.64,1)', marginTop:16 }}>
      {isCorrect ? (
        <>
          <div style={{ fontFamily:'var(--font-head)', color:'var(--green)', fontSize:14, marginBottom:10 }}>✅ CORRECT!</div>
          <div style={{ fontFamily:'var(--font-head)', color:'var(--text)', fontSize:13, marginBottom:10 }}>{q.correct_detail.label}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:10 }}>
            {q.correct_detail.checks.map(c=>(
              <div key={c} style={{ fontSize:13, color:'var(--green)' }}>{c}</div>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.6, borderTop:'1px solid var(--border)', paddingTop:10 }}>{q.correct_detail.tip}</div>
        </>
      ) : (
        <>
          <div style={{ fontFamily:'var(--font-head)', color:'var(--red)', fontSize:14, marginBottom:10 }}>❌ INCORRECT</div>
          <div style={{ fontSize:13, color:'var(--text)', marginBottom:6 }}>
            <span style={{ color:'var(--red)' }}>{q.options[selected]}</span> — {q.wrong_tip}
          </div>
          <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:8, borderTop:'1px solid var(--border)', paddingTop:10 }}>
            ✅ Correct answer: <strong style={{ color:'var(--green)' }}>{q.options[q.correct]}</strong>
          </div>
        </>
      )}
      <button onClick={onNext} style={{ marginTop:14, padding:'9px 22px', background: isCorrect?'var(--green)':'rgba(255,23,68,.2)', border:`1px solid ${isCorrect?'var(--green)':'var(--red)'}`, color: isCorrect?'#000':'var(--red)', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer' }}>
        {isCorrect ? 'NEXT QUESTION →' : 'TRY NEXT QUESTION →'}
      </button>
    </div>
  )
}

// ── Final stats screen ──────────────────────────────────────────────────────
function FinalStats({ stats, onClose }) {
  const grade = stats.accuracy >= 100 ? 'S' : stats.accuracy >= 80 ? 'A' : stats.accuracy >= 60 ? 'B' : 'C'
  const gradeColor = grade==='S'?'var(--gold)':grade==='A'?'var(--green)':grade==='B'?'var(--accent)':'var(--red)'
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, backdropFilter:'blur(8px)' }}>
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--accent)', borderRadius:14, padding:'40px 48px', maxWidth:480, width:'90%', textAlign:'center', animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:80, color:gradeColor, textShadow:`0 0 30px ${gradeColor}`, marginBottom:8 }}>{grade}</div>
        <div style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:18, letterSpacing:2, marginBottom:4 }}>PASSWORD FORTRESS</div>
        <div style={{ color:'var(--text-dim)', fontSize:13, marginBottom:24 }}>Mission Complete</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {[
            { label:'Quiz Score',         val: stats.quizScore,              color:'var(--gold)' },
            { label:'Run Score',          val: stats.runScore,               color:'var(--green)' },
            { label:'Questions Correct',  val: `${stats.correct} / ${QUESTIONS.length}`, color:'var(--accent)' },
            { label:'Accuracy',           val: `${stats.accuracy}%`,         color:'var(--purple)' },
            { label:'Highest Combo',      val: `×${stats.maxCombo}`,         color:'var(--orange)' },
            { label:'Total Score',        val: stats.total,                  color:'var(--gold)' },
          ].map(s=>(
            <div key={s.label} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'12px' }}>
              <div style={{ fontFamily:'var(--font-head)', fontSize:18, color:s.color, marginBottom:3 }}>{s.val}</div>
              <div style={{ fontSize:10, color:'var(--text-dim)', letterSpacing:1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ padding:'12px 32px', background:'var(--accent2)', color:'#fff', fontFamily:'var(--font-head)', fontSize:12, letterSpacing:2, borderRadius:7, border:'none', cursor:'pointer' }}>
          COLLECT XP & CONTINUE →
        </button>
      </div>
    </div>
  )
}

// ── Main Level1 component ──────────────────────────────────────────────────
export default function Level1() {
  const [stage, setStage] = useState('brief')   // brief | runner | runstats | quiz | finalstats
  const [runStats,  setRunStats]  = useState(null)
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [result,    setResult]    = useState(null)
  const [showFinal, setShowFinal] = useState(false)

  const scoreRef   = useRef(0)
  const correctRef = useRef(0)
  const comboRef   = useRef(0)
  const maxComboRef = useRef(0)
  const startRef   = useRef(null)

  const handleSelect = (idx) => {
    if (selected !== null) return
    setSelected(idx)
    const isCorrect = idx === QUESTIONS[current].correct
    if (isCorrect) {
      comboRef.current++
      maxComboRef.current = Math.max(maxComboRef.current, comboRef.current)
      const comboBonus = comboRef.current > 1 ? comboRef.current * 20 : 0
      scoreRef.current += 100 + comboBonus
      correctRef.current++
    } else {
      comboRef.current = 0
    }
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    setSelected(null)
    if (current + 1 >= QUESTIONS.length) {
      // Show final stats before submitting
      setShowFinal(true)
    } else {
      setCurrent(c => c + 1)
    }
  }

  const submitLevel = async () => {
    setShowFinal(false)
    const timeTaken = Math.floor((Date.now() - startRef.current) / 1000)
    const accuracy  = Math.round((correctRef.current / QUESTIONS.length) * 100)
    const total     = scoreRef.current + (runStats?.score || 0)
    try {
      const { data } = await api.post('/game/level/submit', { level:1, score:total, accuracy, time_taken:timeTaken, difficulty:'agent' })
      setResult(data)
    } catch {
      setResult({ xp_earned:0, new_level:1, achievements_unlocked:[], level_up:false, new_total_xp:0, new_total_score:0 })
    }
  }

  const q = stage === 'quiz' ? QUESTIONS[current] : null

  // ── Stage: Mission Brief ─────────────────────────
  if (stage === 'brief') return (
    <div style={{ minHeight:'100vh' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      <MissionBrief onStart={() => setStage('runner')}/>
    </div>
  )

  // ── Stage: Runner ────────────────────────────────
  if (stage === 'runner') return (
    <div style={{ minHeight:'100vh' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      <div style={{ padding:'20px 16px', display:'flex', justifyContent:'center' }}>
        <RunnerStage
          levelId={1} color="#00b8ff"
          label="💻 PASSWORD FORTRESS: RUN"
          targetScore={400}
          onComplete={(stats) => {
            setRunStats(stats)
            setStage('runstats')
          }}
        />
      </div>
    </div>
  )

  // ── Stage: Run Stats ─────────────────────────────
  if (stage === 'runstats') return (
    <div style={{ minHeight:'100vh' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      <StatsScreen runStats={runStats} onContinue={() => { startRef.current = Date.now(); setStage('quiz') }}/>
    </div>
  )

  // ── Stage: Final Stats ───────────────────────────
  if (showFinal) return (
    <div style={{ minHeight:'100vh' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      {result && <ResultModal result={result} levelNum={1}/>}
      <FinalStats
        stats={{
          quizScore: scoreRef.current,
          runScore: runStats?.score || 0,
          correct: correctRef.current,
          accuracy: Math.round((correctRef.current / QUESTIONS.length) * 100),
          maxCombo: maxComboRef.current,
          total: scoreRef.current + (runStats?.score || 0),
        }}
        onClose={submitLevel}
      />
    </div>
  )

  // ── Stage: Quiz ──────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .3s ease' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      {result && <ResultModal result={result} levelNum={1}/>}
      <div style={{ padding:'24px 32px', maxWidth:720, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-head)', color:'#00b8ff', fontSize:14, letterSpacing:2 }}>🔐 SECURITY CHECKPOINT</h2>
            <div style={{ color:'var(--text-dim)', fontSize:12, marginTop:3 }}>
              Password Security — Question {current+1} of {QUESTIONS.length}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            {comboRef.current > 1 && (
              <div style={{ fontFamily:'var(--font-head)', color:'var(--orange)', fontSize:14, animation:'fadeIn .2s ease' }}>
                🔥 COMBO ×{comboRef.current}
              </div>
            )}
            <div style={{ fontFamily:'var(--font-head)', color:'var(--gold)', fontSize:13 }}>
              SCORE: {scoreRef.current}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-dim)', marginBottom:4, fontFamily:'var(--font-head)', letterSpacing:1 }}>
            <span>PROGRESS</span><span>{Math.round((current/QUESTIONS.length)*100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill pf-accent" style={{ width:`${(current/QUESTIONS.length)*100}%` }}/>
          </div>
        </div>

        {/* Question */}
        {!showFeedback && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'24px 28px', marginTop:16, animation:'fadeIn .3s ease' }}>
            <p style={{ fontSize:16, lineHeight:1.65, marginBottom:22 }}>{q.question}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => handleSelect(i)}
                  style={{ padding:'13px 18px', borderRadius:8, border:'1px solid var(--border)', cursor:'pointer', fontSize:14, textAlign:'left', transition:'all .2s', background:'rgba(0,0,0,.2)', color:'var(--text)', display:'flex', alignItems:'center', gap:10 }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='rgba(0,184,255,.07)' }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='rgba(0,0,0,.2)' }}
                >
                  <span style={{ fontFamily:'var(--font-head)', fontSize:11, color:'var(--text-dim)', minWidth:18 }}>{['A','B','C','D'][i]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rich feedback */}
        {showFeedback && q && <QuizFeedback q={q} selected={selected} onNext={handleNext}/>}
      </div>
    </div>
  )
}
