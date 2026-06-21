import { useState, useEffect } from 'react'

const STATUS_META = {
  'not-started': { label:'Not started', color:'#D85A30', bg:'#D85A3022' },
  'in-progress':  { label:'In progress', color:'#BA7517', bg:'#BA751722' },
  'done':         { label:'Done',        color:'#1D9E75', bg:'#1D9E7522' },
}
const STATUS_CYCLE = ['not-started','in-progress','done']
function nextStatus(s) { return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s)+1) % 3] }

const TERMS = [
  {id:'t1',label:'Y1 Fall',   start:new Date(2025,7,1), end:new Date(2025,11,31),courses:'858 Quant · 893 Leadership',             dip:'(done)'},
  {id:'t2',label:'Y1 Spring', start:new Date(2026,0,1), end:new Date(2026,4,31), courses:'859 Qual · 905 Equitable Practice',      dip:'(done) — seeded Ch.1 PoP work'},
  {id:'t3',label:'Y1 Summer', start:new Date(2026,4,1), end:new Date(2026,7,31), courses:'956 Applied Quant · 834 Org Theory',     dip:'Draft interview protocol; seed Ch.1 org-context'},
  {id:'t4',label:'Y2 Fall',   start:new Date(2026,7,1), end:new Date(2026,11,31),courses:'914 Applied Qual · 920 Change Leadership',dip:'Build + pilot protocol in 914; systems map in 920'},
  {id:'t5',label:'Y2 Spring', start:new Date(2027,0,1), end:new Date(2027,4,31), courses:'785 Program Eval · 875 Design Thinking', dip:'🚩 Topic-lock gate (~Mar 2027)'},
  {id:'t6',label:'Y2 Summer', start:new Date(2027,4,1), end:new Date(2027,7,31), courses:'HR Management · Data-Informed Decisions', dip:'Ch.3 design firming; IRB prep'},
  {id:'t7',label:'Y3 Fall',   start:new Date(2027,7,1), end:new Date(2027,11,31),courses:'Implementation Science · Capstone I',    dip:'🚩 Comprehensive Exams'},
  {id:'t8',label:'Y3 Spring', start:new Date(2028,0,1), end:new Date(2028,4,31), courses:'Advanced Leadership · Capstone II',     dip:'🚩 Proposal Defense'},
  {id:'t9',label:'Y3 Summer', start:new Date(2028,4,1), end:new Date(2028,7,31), courses:'Capstone III',                          dip:'🚩 Final Defense → Doctor'},
]

const DEFAULT_GATES = [
  {id:'G1',name:'PE pathway confirmed with faculty',                             status:'in-progress',note:'Chair conversation needed — target Aug 2026'},
  {id:'G2',name:'PoP + RQ settled; construct (3–4 buckets) locked',             status:'in-progress',note:'PoP settled in coursework; faculty lock + construct still open'},
  {id:'G3',name:'Access broadened (graduates + cadre + leadership + docs)',      status:'done',       note:'Cleared — multi-source access confirmed'},
  {id:'G4',name:'Data sources expanded (cadre + leadership + docs added)',       status:'in-progress',note:'Still being added alongside protocol work'},
]

const DEFAULT_CHAPTERS = [
  {
    id:'ch1', name:'Ch.1 — Foundations of Inquiry', status:'not-started',
    items:[
      {id:'1.1', text:'Clear PoP statement: what, why, who, how it shows up', done:false},
      {id:'1.2', text:'How PoP exists beyond local context (Geerts: ~$60B/yr, low transfer)', done:false},
      {id:'1.3', text:'Evidence (not opinion) the PoP matters — employer surveys, soft-skill-gap research', done:false},
      {id:'1.4', text:"Why it's important — impact on people; confirmed as a need by others", done:false},
      {id:'1.5', text:"How it's human-centered", done:false},
      {id:'1.6', text:'Org/field context (SOF/USAFWS, defense/technical sector)', done:false},
      {id:'1.7', text:'Relevant demographics and environment', done:false},
      {id:'1.8', text:'Key stakeholders and dynamics', done:false},
      {id:'1.9', text:'External influences (policy, technology) shaping the PoP', done:false},
      {id:'1.10',text:'How PoP functions across the field (people, process, culture)', done:false},
      {id:'1.11',text:'Past/current initiatives — or their absence', done:false},
      {id:'1.12',text:'Specific problem statement that follows', done:false},
      {id:'1.13',text:'Research questions aligned to PoP and pathway', done:false},
      {id:'1.14',text:'Questions practical given access', done:false},
      {id:'1.15',text:'Ch.1 summary; preview Ch.2', done:false},
    ],
  },
  {
    id:'ch2', name:'Ch.2 — Systems Analysis, Literature, Positionality', status:'not-started',
    items:[
      {id:'2.1', text:'Restated problem statement all factors link to', done:false},
      {id:'2.2', text:'4–6 evidence-based contributing factors', done:false},
      {id:'2.3', text:'How each connects to systemic dynamics', done:false},
      {id:'2.4', text:'Visual systems map', done:false},
      {id:'2.5', text:'Human-centered, asset-based lens', done:false},
      {id:'2.6', text:'Recent peer-reviewed literature per factor', done:false},
      {id:'2.7', text:'Seminal sources for grounding', done:false},
      {id:'2.8', text:'Synthesis by theme', done:false},
      {id:'2.9', text:'2–3 paragraphs per factor connecting literature to PoP', done:false},
      {id:'2.10',text:'Critical causal analysis of what keeps the PoP in place', done:false},
      {id:'2.11',text:"Theoretical/conceptual framework(s) — Senge's five disciplines", done:false},
      {id:'2.12',text:'How the framework ties to design', done:false},
      {id:'2.13',text:'Positionality — personal background', done:false},
      {id:'2.14',text:'Professional background (SOF, USAFWS) and lens', done:false},
      {id:'2.15',text:'Biases/assumptions and reflexivity', done:false},
      {id:'2.16',text:'Trust/sensitivity with participants, power dynamics', done:false},
      {id:'2.17',text:'Ch.2 summary bridging to Ch.3', done:false},
    ],
  },
  {
    id:'ch3', name:'Ch.3 — Research Design and Action Plan', status:'not-started',
    items:[
      {id:'3.1', text:'Restated purpose and problem statement', done:false},
      {id:'3.2', text:'Pathway (Program Evaluation) introduced and tied to scholarship', done:false},
      {id:'3.3', text:'Why PE fits PoP and questions', done:false},
      {id:'3.4', text:'Step-by-step action plan, replicable', done:false},
      {id:'3.5', text:'Data collection: methods + why; sample; critical-incident protocol', done:false},
      {id:'3.6', text:'Timeline table (from §5.2 Gantt feed)', done:false},
      {id:'3.7', text:'Stakeholder engagement, diverse perspectives', done:false},
      {id:'3.8', text:'Limitations (access, time, bias, sample) + mitigation', done:false},
      {id:'3.9', text:'Data analysis plan per data type', done:false},
      {id:'3.10',text:'IRB-ready ethics section', done:false},
    ],
  },
  {
    id:'ch4', name:'Ch.4 — Findings, Implications, Leadership Learning', status:'not-started',
    items:[
      {id:'4.1',text:'Results tied to each research question', done:false},
      {id:'4.2',text:'Findings interpreted via systems analysis, literature, framework', done:false},
      {id:'4.3',text:'Implications (human-centered leadership, human-skills development)', done:false},
      {id:'4.4',text:'Actionable recommendations', done:false},
      {id:'4.5',text:'Reflection on leadership learning as a scholar-practitioner', done:false},
    ],
  },
]

const DEFAULT_ACTIONS = [
  {id:'a1',text:'Send Gene Coughlin chair-role write-up',              due:'2026-06-30',done:false},
  {id:'a2',text:'Decide Gene October event RSVP (South Dakota)',       due:'2026-08-01',done:false},
  {id:'a3',text:'Draft critical-incident interview questions',          due:'2026-09-01',done:false},
  {id:'a4',text:'Confirm PE pathway — first EDUC 914 conversation',   due:'2026-09-15',done:false},
]

function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def } catch { return def } }
function save(key, val)  { try { localStorage.setItem(key, JSON.stringify(val)) }   catch {} }

export default function DissertationScreen() {
  const [gates,     setGates]     = useState(() => load('diss_gates',    DEFAULT_GATES))
  const [chapters,  setChapters]  = useState(() => load('diss_chapters', DEFAULT_CHAPTERS))
  const [actions,   setActions]   = useState(() => load('diss_actions',  DEFAULT_ACTIONS))
  const [expanded,  setExpanded]  = useState(null)
  const [newText,   setNewText]   = useState('')
  const [newDue,    setNewDue]    = useState('')

  useEffect(() => save('diss_gates',    gates),    [gates])
  useEffect(() => save('diss_chapters', chapters), [chapters])
  useEffect(() => save('diss_actions',  actions),  [actions])

  const now         = Date.now()
  const currentTerm = TERMS.find(t => now >= t.start && now <= t.end)

  function cycleGate(id) {
    setGates(p => p.map(g => g.id===id ? {...g,status:nextStatus(g.status)} : g))
  }
  function cycleChapter(id,e) {
    e.stopPropagation()
    setChapters(p => p.map(c => c.id===id ? {...c,status:nextStatus(c.status)} : c))
  }
  function toggleItem(chId,itemId) {
    setChapters(p => p.map(c => c.id!==chId ? c : {
      ...c, items:c.items.map(i => i.id===itemId ? {...i,done:!i.done} : i)
    }))
  }
  function toggleAction(id) { setActions(p => p.map(a => a.id===id ? {...a,done:!a.done} : a)) }
  function deleteAction(id) { setActions(p => p.filter(a => a.id!==id)) }
  function addAction() {
    if (!newText.trim()) return
    setActions(p => [...p, {id:Date.now().toString(), text:newText.trim(), due:newDue, done:false}])
    setNewText(''); setNewDue('')
  }

  const open   = actions.filter(a => !a.done)
  const closed = actions.filter(a =>  a.done)

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a1628] text-white overflow-auto">

      {/* Term banner */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e3a5f]">
        <h2 className="text-base font-bold mb-2">Dissertation Tracker</h2>
        {currentTerm ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#EF9F27] text-[#0a1628] text-xs font-bold px-2 py-0.5 rounded">
              {currentTerm.label} — now
            </span>
            <span className="text-[#7a9ab5] text-xs">{currentTerm.courses}</span>
            <span className="text-[#4a6080] text-xs">·</span>
            <span className="text-white text-xs font-medium">DiP: {currentTerm.dip}</span>
          </div>
        ) : (
          <p className="text-[#4a6080] text-xs">Outside term window — see Roadmap for full timeline.</p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-6 py-5 flex flex-col gap-7">

        {/* Gates */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">Research Gates — click to cycle status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gates.map(g => {
              const s = STATUS_META[g.status]
              return (
                <div key={g.id} onClick={() => cycleGate(g.id)}
                     className="bg-[#071020] border border-[#1e3a5f] rounded-xl px-4 py-3 cursor-pointer hover:border-[#2a5080] transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#c5a028] text-xs font-bold">{g.id}</span>
                    <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded"
                          style={{color:s.color,background:s.bg}}>{s.label}</span>
                  </div>
                  <p className="text-white text-xs font-medium leading-snug">{g.name}</p>
                  <p className="text-[#4a6080] text-[11px] mt-1">{g.note}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Chapters */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">Chapter Checklist</h3>
          <div className="flex flex-col gap-2">
            {chapters.map(ch => {
              const done  = ch.items.filter(i=>i.done).length
              const total = ch.items.length
              const pct   = total ? Math.round(done/total*100) : 0
              const isOpen = expanded === ch.id
              const s = STATUS_META[ch.status]
              return (
                <div key={ch.id} className="bg-[#071020] border border-[#1e3a5f] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#0a1e3a] transition-colors"
                       onClick={() => setExpanded(isOpen ? null : ch.id)}>
                    <span className="text-[#6a80a0] text-sm w-4 shrink-0">{isOpen ? '▾' : '▸'}</span>
                    <span className="text-white text-xs font-semibold flex-1">{ch.name}</span>
                    <span className="text-[#4a6080] text-[10px] shrink-0">{done}/{total}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded cursor-pointer shrink-0"
                          style={{color:s.color,background:s.bg}}
                          onClick={e => cycleChapter(ch.id,e)}>{s.label}</span>
                  </div>
                  <div style={{height:2, background:'#112040'}}>
                    <div style={{height:2, width:`${pct}%`, background:'#EF9F27', transition:'width 0.3s'}} />
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-2 flex flex-col gap-1.5 border-t border-[#0f1f35]">
                      {ch.items.map(item => (
                        <label key={item.id} className="flex items-start gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={item.done}
                                 onChange={() => toggleItem(ch.id, item.id)}
                                 className="mt-0.5 shrink-0 accent-[#EF9F27]" />
                          <span className="text-[11px] leading-snug"
                                style={{color:item.done?'#344a60':'#c5d5e8',
                                        textDecoration:item.done?'line-through':'none'}}>
                            <span className="text-[#4a6080] mr-1.5">{item.id}</span>{item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Open actions */}
        <section className="pb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">Open Actions</h3>
          <div className="flex flex-col gap-2">
            {open.map(a => (
              <div key={a.id} className="flex items-start gap-3 bg-[#071020] border border-[#1e3a5f] rounded-lg px-4 py-3">
                <input type="checkbox" checked={false} onChange={() => toggleAction(a.id)}
                       className="mt-0.5 accent-[#EF9F27] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{a.text}</p>
                  {a.due && <p className="text-[#4a6080] text-[10px] mt-0.5">due {a.due}</p>}
                </div>
                <button onClick={() => deleteAction(a.id)}
                        className="text-[#344a60] hover:text-[#D85A30] text-xs shrink-0">✕</button>
              </div>
            ))}
            {closed.map(a => (
              <div key={a.id} className="flex items-start gap-3 bg-[#071020] border border-[#112040] rounded-lg px-4 py-2 opacity-40">
                <input type="checkbox" checked={true} onChange={() => toggleAction(a.id)}
                       className="mt-0.5 accent-[#EF9F27] shrink-0" />
                <p className="text-[#4a6080] text-xs line-through">{a.text}</p>
              </div>
            ))}

            {/* Add row */}
            <div className="flex gap-2 mt-1">
              <input type="text" placeholder="Add action…" value={newText}
                     onChange={e => setNewText(e.target.value)}
                     onKeyDown={e => e.key==='Enter' && addAction()}
                     className="flex-1 bg-[#071020] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-white placeholder-[#344a60] focus:outline-none focus:border-[#EF9F27]" />
              <input type="date" value={newDue}
                     onChange={e => setNewDue(e.target.value)}
                     className="bg-[#071020] border border-[#1e3a5f] rounded-lg px-3 py-2 text-xs text-[#7a9ab5] focus:outline-none focus:border-[#EF9F27]" />
              <button onClick={addAction}
                      className="bg-[#EF9F27] text-[#0a1628] text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#d08a1a] transition-colors">
                Add
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
