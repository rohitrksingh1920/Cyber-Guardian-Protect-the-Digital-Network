import { useState, useEffect } from 'react'

const TIPS = [
  { icon:'🔐', title:'Use a Password Manager', body:'Password managers generate and store unique strong passwords for every site. If one site is breached, your other accounts stay safe.' },
  { icon:'📧', title:'Hover Before You Click', body:"Always hover over email links to preview the real URL. Typosquatting like 'paypa1.com' is very common." },
  { icon:'🛡️', title:'Enable 2FA Everywhere', body:'Two-Factor Authentication blocks 99.9% of account hijacking attempts even when your password is stolen.' },
  { icon:'🔄', title:'Keep Software Updated', body:'Most malware exploits known vulnerabilities already patched. Enable auto-updates — it is the easiest security win.' },
  { icon:'🌐', title:'Use HTTPS Only', body:'Never enter credentials on HTTP sites. Look for the padlock icon. HTTP traffic is transmitted in plain text.' },
  { icon:'🦠', title:'Be Wary of .exe Files', body:"Executable files from unknown sources are the #1 malware delivery method. Never run software you didn't intentionally download." },
  { icon:'📱', title:'Lock Your Devices', body:'Use a PIN, fingerprint, or face unlock on all devices. Physical access without a lock means full data access in seconds.' },
  { icon:'☁️', title:'Back Up Your Data', body:'Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite. Ransomware has no power if you have clean offline backups.' },
  { icon:'🕵️', title:'Beware Social Engineering', body:'Attackers exploit trust, urgency, and authority. Always verify unusual requests through a separate channel.' },
  { icon:'🔑', title:'Principle of Least Privilege', body:'Never run software with more permissions than needed. Malware can only do what your user account allows.' },
]

export default function DailyTip() {
  const [tip,    setTip]    = useState(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const dayKey = Math.floor(Date.now() / 86400000)
    setTip(TIPS[dayKey % TIPS.length])
    setHidden(localStorage.getItem('cg-tip-dismissed') === String(dayKey))
  }, [])

  if (!tip || hidden) return null

  const dismiss = () => {
    localStorage.setItem('cg-tip-dismissed', String(Math.floor(Date.now()/86400000)))
    setHidden(true)
  }

  return (
    <div className="daily-tip">
      <span style={{ fontSize:28, flexShrink:0, filter:'drop-shadow(0 0 8px var(--accent))' }}>{tip.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--font-head)', fontSize:9, color:'var(--accent)', letterSpacing:2, marginBottom:4 }}>💡 DAILY SECURITY TIP</div>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{tip.title}</div>
        <div style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>{tip.body}</div>
      </div>
      <button onClick={dismiss} style={{ position:'absolute', top:10, right:12, background:'transparent', border:'none', color:'var(--text-dim)', fontSize:15, cursor:'pointer', opacity:.5, transition:'opacity .2s' }}
        onMouseEnter={e=>e.currentTarget.style.opacity='1'}
        onMouseLeave={e=>e.currentTarget.style.opacity='.5'}
      >✕</button>
    </div>
  )
}
