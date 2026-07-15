import { useState, useEffect, useRef } from 'react'
import Topbar from '../../components/Topbar'
import ResultModal from '../../components/ResultModal'
import api from '../../services/api'

const FILES = [
  { name:'quarterly_report.pdf',         icon:'📄', ext:'PDF',  cat:'Document',   isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — standard PDF from a trusted source.',                          hover:{ size:'284 KB', source:'Email attachment', signature:'Verified', created:'2 weeks ago' } },
  { name:'invoice_march_2024.xlsx',       icon:'📊', ext:'XLSX', cat:'Document',   isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — Excel spreadsheet. Safe if macros are disabled.',              hover:{ size:'128 KB', source:'Company portal', signature:'Verified', created:'1 month ago' } },
  { name:'free_vpn_setup.exe',            icon:'⚠️', ext:'EXE',  cat:'Executable', isMalware:true,  malwareType:'Trojan',    difficulty:'EASY',   reason:'MALWARE — unsigned .exe from unofficial source. Bundles a trojan.',   hover:{ size:'4.2 MB', source:'Unknown website', signature:'UNSIGNED', created:'Yesterday' } },
  { name:'resume_final_v3.docx',          icon:'📝', ext:'DOCX', cat:'Document',   isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — standard Word document.',                                      hover:{ size:'94 KB', source:'Email attachment', signature:'Verified', created:'3 days ago' } },
  { name:'movie_4K_crack.exe',            icon:'💀', ext:'EXE',  cat:'Executable', isMalware:true,  malwareType:'Ransomware',difficulty:'EASY',   reason:'MALWARE — pirated cracks are the #1 ransomware delivery method.',     hover:{ size:'12.6 MB', source:'Torrent site', signature:'UNSIGNED', created:'Today' } },
  { name:'photo_vacation.jpg',            icon:'🖼️', ext:'JPG',  cat:'Image',      isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — JPEG images cannot execute code.',                             hover:{ size:'3.1 MB', source:'Phone camera', signature:'Verified', created:'1 week ago' } },
  { name:'update_windows_URGENT.bat',     icon:'☠️', ext:'BAT',  cat:'Script',     isMalware:true,  malwareType:'Ransomware',difficulty:'MEDIUM', reason:'MALWARE — .bat scripts execute commands. Fake updates drop ransomware.',hover:{ size:'14 KB', source:'Email attachment', signature:'UNSIGNED', created:'Today' } },
  { name:'Invoice_2024.pdf.exe',          icon:'⚡', ext:'EXE',  cat:'Executable', isMalware:true,  malwareType:'Spyware',   difficulty:'MEDIUM', reason:'MALWARE — fake double extension! Looks like PDF but is .exe spyware.',  hover:{ size:'2.8 MB', source:'Email attachment', signature:'UNSIGNED', created:'Today' } },
  { name:'company_logo_v2.png',           icon:'🎨', ext:'PNG',  cat:'Image',      isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — standard PNG image.',                                          hover:{ size:'45 KB', source:'Design team', signature:'Verified', created:'2 months ago' } },
  { name:'bank_statement_viewer.scr',     icon:'🔑', ext:'SCR',  cat:'Executable', isMalware:true,  malwareType:'Keylogger', difficulty:'MEDIUM', reason:'MALWARE — .scr (screensaver) files execute as programs. Classic keylogger disguise.',hover:{ size:'1.9 MB', source:'Unknown email', signature:'UNSIGNED', created:'Today' } },
  { name:'presentation_q3_results.pptx',  icon:'📑', ext:'PPTX', cat:'Document',   isMalware:false, malwareType:null,        difficulty:'EASY',   reason:'Safe — standard PowerPoint presentation.',                            hover:{ size:'5.2 MB', source:'Company drive', signature:'Verified', created:'4 days ago' } },
  { name:'Zoom_Update_v5.msi',            icon:'📦', ext:'MSI',  cat:'Installer',  isMalware:true,  malwareType:'Adware',    difficulty:'HARD',   reason:'MALWARE — fake Zoom updater. Installs adware and steals credentials.', hover:{ size:'38.4 MB', source:'Unverified link', signature:'UNSIGNED', created:'Today' } },
]

const MALWARE_COLORS = { Trojan:'#ff1744', Ransomware:'#e040fb', Spyware:'#ff9100', Keylogger:'#ffd600', Adware:'#00b8ff' }
const DIFF_COLORS    = { EASY:'var(--green)', MEDIUM:'var(--gold)', HARD:'var(--red)' }

function AnalysisPopup({ file, action, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, backdropFilter:'blur(8px)' }}>
      <div style={{ background:'var(--bg-card)', border:`1px solid ${file.isMalware?'var(--red)':'var(--green)'}`, borderRadius:12, padding:'28px 32px', maxWidth:440, width:'90%', animation:'pop .3s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <span style={{ fontFamily:'var(--font-head)', fontSize:13, color: file.isMalware?'var(--red)':'var(--green)', letterSpacing:2 }}>
            ⚠ FILE ANALYSIS
          </span>
          <button onClick={onClose} style={{ background:'transparent', border:'none', color:'var(--text-dim)', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:'var(--font-head)', letterSpacing:1, marginBottom:3 }}>FILENAME</div>
          <div style={{ fontSize:14, fontWeight:600, wordBreak:'break-all' }}>{file.name}</div>
        </div>
        {[
          { label:'Extension', val:file.ext, flag: file.isMalware },
          { label:'Category',  val:file.cat, flag: false },
          { label:'Risk Level',val: file.isMalware ? 'HIGH' : 'LOW', flag: file.isMalware },
          { label:'Source',    val:file.hover.source, flag: file.hover.source.includes('Unknown')||file.hover.source.includes('Torrent') },
          { label:'Signature', val:file.hover.signature, flag: file.hover.signature==='UNSIGNED' },
          { label:'Downloaded',val:file.hover.created, flag: file.hover.created==='Today' },
        ].map(row=>(
          <div key={row.label} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(26,53,96,.3)' }}>
            <span style={{ fontSize:12, color:'var(--text-dim)' }}>{row.label}</span>
            <span style={{ fontSize:12, color: row.flag ? 'var(--red)' : 'var(--green)', fontFamily:'monospace', fontWeight:600 }}>{row.val}</span>
          </div>
        ))}
        {file.isMalware && (
          <div style={{ marginTop:14, background:'rgba(255,23,68,.08)', border:'1px solid rgba(255,23,68,.3)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--red)' }}>
            ⚠ {file.reason}
          </div>
        )}
        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <button onClick={onClose} style={{ flex:1, padding:'9px', background:'transparent', border:'1px solid var(--border)', color:'var(--text-dim)', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer' }}>IGNORE</button>
          <button onClick={()=>{ action(); onClose() }} style={{ flex:1, padding:'9px', background:'rgba(255,23,68,.15)', border:'1px solid var(--red)', color:'var(--red)', fontFamily:'var(--font-head)', fontSize:11, letterSpacing:1, borderRadius:6, cursor:'pointer' }}>🚩 QUARANTINE</button>
        </div>
      </div>
    </div>
  )
}

export default function Level3() {
  const [files]      = useState(() => [...FILES].sort(() => Math.random() - .5))
  const [flagged,     setFlagged]     = useState(new Set())
  const [submitted,   setSubmitted]   = useState(false)
  const [feedback,    setFeedback]    = useState(null)
  const [result,      setResult]      = useState(null)
  const [timer,       setTimer]       = useState(75)
  const [score,       setScore]       = useState(0)
  const [hoveredFile, setHoveredFile] = useState(null)
  const [analysisFile,setAnalysisFile]= useState(null)
  const [showReport,  setShowReport]  = useState(false)
  const [startTime]                   = useState(Date.now())
  const scanStart = useRef(Date.now())

  useEffect(() => {
    if (submitted) return
    if (timer <= 0) { handleSubmit(); return }
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, submitted])

  const toggle = (name) => {
    if (submitted) return
    setFlagged(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n })
  }

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    const malware = files.filter(f => f.isMalware).map(f => f.name)
    let caught = 0, missed = 0, fp = 0
    flagged.forEach(n => malware.includes(n) ? caught++ : fp++)
    malware.forEach(n => !flagged.has(n) && missed++)
    const pts = Math.max(0, caught * 200 - fp * 100 - missed * 50)
    const accuracy = malware.length > 0 ? (caught / malware.length) * 100 : 0
    setScore(pts)
    setFeedback({ caught, missed, fp, pts })
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    setTimeout(() => setShowReport(true), 1200)
    setTimeout(async () => {
      try {
        const { data } = await api.post('/game/level/submit', { level: 3, score: pts, accuracy, time_taken: timeTaken, difficulty: 'agent' })
        setResult(data)
      } catch {
        setResult({ xp_earned: 0, new_level: 1, achievements_unlocked: [], level_up: false, new_total_xp: 0, new_total_score: 0 })
      }
    }, 3000)
  }

  const malwareCount = files.filter(f => f.isMalware).length
  const scanTime = Math.floor((Date.now() - scanStart.current) / 1000)
  const rank = feedback
    ? (feedback.caught === malwareCount && feedback.fp === 0) ? 'A+'
    : (feedback.caught === malwareCount) ? 'A'
    : feedback.caught >= malwareCount * 0.75 ? 'B'
    : 'C'
    : '-'

  const fileStyle = (file) => {
    const isFlagged = flagged.has(file.name)
    if (!submitted) return { background: isFlagged ? 'rgba(255,214,0,.08)' : 'rgba(0,0,0,.2)', border: `1px solid ${isFlagged ? 'var(--gold)' : 'var(--border)'}` }
    if (file.isMalware && isFlagged)  return { background: 'rgba(0,230,118,.08)', border: '1px solid var(--green)' }
    if (file.isMalware && !isFlagged) return { background: 'rgba(255,23,68,.1)', border: '1px dashed var(--red)' }
    if (!file.isMalware && isFlagged) return { background: 'rgba(255,145,0,.08)', border: '1px solid var(--orange)' }
    return { background: 'rgba(0,230,118,.05)', border: '1px solid rgba(0,230,118,.25)' }
  }

  return (
    <div style={{ minHeight:'100vh', animation:'fadeIn .3s ease' }}>
      <Topbar showBack backTo="/levels" backLabel="LEVELS"/>
      {result && <ResultModal result={result} levelNum={3}/>}
      {analysisFile && <AnalysisPopup file={analysisFile} action={() => toggle(analysisFile.name)} onClose={() => setAnalysisFile(null)}/>}

      {/* End Report */}
      {showReport && feedback && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, backdropFilter:'blur(8px)' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--accent)', borderRadius:14, padding:'40px 48px', maxWidth:500, width:'90%', textAlign:'center', animation:'pop .4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ fontFamily:'var(--font-head)', fontSize:72, color: rank==='A+'?'var(--gold)':rank==='A'?'var(--green)':rank==='B'?'var(--accent)':'var(--red)', textShadow:`0 0 30px currentColor`, marginBottom:8 }}>{rank}</div>
            <div style={{ fontFamily:'var(--font-head)', color:'var(--accent)', fontSize:18, letterSpacing:2, marginBottom:4 }}>SCAN COMPLETE</div>
            <div style={{ color:'var(--text-dim)', fontSize:13, marginBottom:24 }}>Malware Hunter — Mission Report</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              {[
                { label:'Threats Found',   val:feedback.caught,   color:'var(--green)' },
                { label:'Missed',          val:feedback.missed,   color:'var(--red)' },
                { label:'False Positives', val:feedback.fp,       color:'var(--orange)' },
                { label:'Accuracy',        val:`${malwareCount>0?Math.round((feedback.caught/malwareCount)*100):0}%`, color:'var(--gold)' },
                { label:'Scan Time',       val:`${Math.min(75-timer,75)}s`, color:'var(--accent)' },
                { label:'Score',           val:feedback.pts,      color:'var(--gold)' },
              ].map(s=>(
                <div key={s.label} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'12px' }}>
                  <div style={{ fontFamily:'var(--font-head)', fontSize:20, color:s.color, marginBottom:3 }}>{s.val}</div>
                  <div style={{ fontSize:9, color:'var(--text-dim)', letterSpacing:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {feedback.missed > 0 && (
              <div style={{ background:'rgba(255,23,68,.08)', border:'1px solid rgba(255,23,68,.3)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--red)', marginBottom:14, textAlign:'left' }}>
                <strong>Missed threats:</strong> {files.filter(f=>f.isMalware&&!flagged.has(f.name)).map(f=>`${f.name} (${f.malwareType})`).join(', ')}
              </div>
            )}
            <div style={{ background:'rgba(0,184,255,.06)', border:'1px solid rgba(0,184,255,.2)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'var(--text-dim)', marginBottom:16, textAlign:'left' }}>
              <strong style={{ color:'var(--accent)' }}>New Malware Learned:</strong> {[...new Set(files.filter(f=>f.isMalware).map(f=>f.malwareType))].join(', ')}
            </div>
            <div style={{ fontSize:11, color:'var(--text-dim)', animation:'pulse 1.5s infinite' }}>Submitting score...</div>
          </div>
        </div>
      )}

      <div style={{ padding:'24px 32px', maxWidth:920, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <h2 style={{ fontFamily:'var(--font-head)', color:'#ffd600', fontSize:14, letterSpacing:2 }}>🦠 LEVEL 3 — MALWARE HUNTER</h2>
            <div style={{ color:'var(--text-dim)', fontSize:12, marginTop:4 }}>
              Flag malicious files · {flagged.size} flagged · {malwareCount} threats hidden in {files.length} files
            </div>
          </div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:32, color:timer<=15?'var(--red)':'#ffd600', transition:'color .3s' }}>
            {String(timer).padStart(2,'0')}
          </div>
        </div>

        <div className="progress-track" style={{ marginBottom:14 }}>
          <div className="progress-fill pf-gold" style={{ width:`${submitted?100:(timer/75)*100}%` }}/>
        </div>

        <div style={{ background:'rgba(255,214,0,.07)', border:'1px solid rgba(255,214,0,.25)', borderRadius:8, padding:'10px 16px', fontSize:13, color:'var(--gold)', marginBottom:14 }}>
          ⚠️ Click to flag 🚩 · Click flagged to unflag · Hover for details · Right-click or tap 🔬 for full analysis · False positives cost points!
        </div>

        {/* File grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {files.map(file => {
            const isFlagged = flagged.has(file.name)
            const isHovered = hoveredFile === file.name
            return (
              <div key={file.name}
                onClick={() => !submitted && toggle(file.name)}
                onMouseEnter={() => setHoveredFile(file.name)}
                onMouseLeave={() => setHoveredFile(null)}
                style={{ ...fileStyle(file), borderRadius:8, padding:'12px 14px', cursor:submitted?'default':'pointer', display:'flex', alignItems:'flex-start', gap:12, transition:'var(--transition)', userSelect:'none', position:'relative' }}
              >
                <span style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{file.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:2, wordBreak:'break-all' }}>{file.name}</div>
                  <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, color:'var(--text-dim)' }}>{file.cat}</span>
                    {!submitted && <span style={{ fontSize:9, padding:'1px 7px', borderRadius:10, background:`${DIFF_COLORS[file.difficulty]}15`, border:`1px solid ${DIFF_COLORS[file.difficulty]}`, color:DIFF_COLORS[file.difficulty], fontFamily:'var(--font-head)' }}>{file.difficulty}</span>}
                  </div>
                  {/* Hover info */}
                  {isHovered && !submitted && (
                    <div style={{ marginTop:6, fontSize:11, color:'var(--text-dim)', lineHeight:1.5, animation:'fadeIn .15s ease' }}>
                      <div>📦 Size: {file.hover.size}</div>
                      <div>🌐 Source: <span style={{ color: file.hover.source.includes('Unknown')||file.hover.source.includes('Torrent') ? 'var(--red)' : 'var(--green)' }}>{file.hover.source}</span></div>
                      <div>🔏 Signature: <span style={{ color: file.hover.signature==='UNSIGNED'?'var(--red)':'var(--green)' }}>{file.hover.signature}</span></div>
                      <div>🕐 Created: <span style={{ color: file.hover.created==='Today'?'var(--gold)':'var(--text-dim)' }}>{file.hover.created}</span></div>
                    </div>
                  )}
                  {/* Revealed after submit */}
                  {submitted && (
                    <div style={{ marginTop:5, fontSize:11, lineHeight:1.4 }}>
                      {file.isMalware && (
                        <span style={{ color:MALWARE_COLORS[file.malwareType]||'var(--red)', fontFamily:'var(--font-head)', fontSize:10 }}>
                          ☠ {file.malwareType}
                        </span>
                      )}
                      <div style={{ color: file.isMalware?'var(--red)':'var(--green)', marginTop:3 }}>{file.reason}</div>
                    </div>
                  )}
                </div>
                {/* Flag indicator */}
                <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'flex-end' }}>
                  {isFlagged && !submitted && <span style={{ fontSize:16 }}>🚩</span>}
                  {submitted && (
                    <span style={{ fontSize:11, fontFamily:'var(--font-head)', color: file.isMalware&&isFlagged?'var(--green)':file.isMalware&&!isFlagged?'var(--red)':!file.isMalware&&isFlagged?'var(--orange)':'var(--green)' }}>
                      {file.isMalware&&isFlagged?'✅CAUGHT':file.isMalware&&!isFlagged?'💀MISSED':!file.isMalware&&isFlagged?'⚠FP':'✅SAFE'}
                    </span>
                  )}
                  {/* Analysis button */}
                  {!submitted && (
                    <button onClick={e => { e.stopPropagation(); setAnalysisFile(file) }}
                      style={{ fontSize:10, padding:'2px 7px', background:'rgba(0,184,255,.1)', border:'1px solid rgba(0,184,255,.3)', color:'var(--accent)', borderRadius:4, cursor:'pointer', fontFamily:'var(--font-head)', letterSpacing:1 }}>
                      🔬
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {feedback && (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 20px', marginBottom:14, display:'flex', gap:20, flexWrap:'wrap', fontSize:13 }}>
            <span style={{ color:'var(--green)' }}>✅ Caught: <strong>{feedback.caught}</strong></span>
            <span style={{ color:'var(--red)' }}>💀 Missed: <strong>{feedback.missed}</strong></span>
            <span style={{ color:'var(--orange)' }}>⚠️ False+: <strong>{feedback.fp}</strong></span>
            <span style={{ fontFamily:'var(--font-head)', color:'var(--gold)' }}>+{feedback.pts} pts</span>
          </div>
        )}

        {!submitted && (
          <button onClick={handleSubmit} className="btn-green" style={{ width:'100%', padding:'14px', fontSize:13, letterSpacing:2 }}>
            🔍 SUBMIT SCAN RESULTS ({flagged.size} flagged)
          </button>
        )}
      </div>
    </div>
  )
}
