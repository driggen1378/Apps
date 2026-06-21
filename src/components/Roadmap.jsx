import { useState, useRef, forwardRef } from 'react'

const TOTAL_MONTHS = 37

const planData = {
  meta: {
    title: "SOFt Skills — Brand Strategy v4",
tml window: "Aug 2025 – Aug 2028 (3 years)",
    apex: "Invest in your personal development and philosophy",
    arms: "EdD dissertation · Media (podcast + newsletter) · Business (parked until study lands)",
    firewall: "Market the question, not the answer — 11.5",
    months: [
      {n:1,label:"Aug",year:"25"},{n:2,label:"Sep",year:"25"},{n:3,label:"Oct",year:"25"},{n:4,label:"Nov",year:"25"},{n:5,label:"Dec",year:"25"},
      {n:6,label:"Jan",year:"26"},{n:7,label:"Feb",year:"26"},{n:8,label:"Mar",year:"26"},{n:9,label:"Apr",year:"26"},{n:10,label:"May",year:"26"},
      {n:11,label:"Jun",year:"26"},{n:12,label:"Jul",year:"26"},{n:13,label:"Aug",year:"26"},{n:14,label:"Sep",year:"26"},{n:15,label:"Oct",year:"26"},
      {n:16,label:"Nov",year:"26"},{n:17,label:"Dec",year:"26"},
      {n:18,label:"Jan",year:"27"},{n:19,label:"Feb",year:"27"},{n:20,label:"Mar",year:"27"},{n:21,label:"Apr",year:"27"},{n:22,label:"May",year:"27"},
      {n:23,label:"Jun",year:"27"},{n:24,label:"Jul",year:"27"},{n:25,label:"Aug",year:"27"},{n:26,label:"Sep",year:"27"},{n:27,label:"Oct",year:"27"},
      {n:28,label:"Nov",year:"27"},{n:29,label:"Dec",year:"27"},
      {n:30,label:"Jan",year:"28"},{n:31,label:"Feb",year:"28"},{n:32,label:"Mar",year:"28"},{n:33,label:"Apr",year:"28"},{n:34,label:"May",year:"28"},
      {n:35,label:"Jun",year:"28"},{n:36,label:"Jul",year:"28"},{n:37,label:"Aug",year:"28"},
    ],
  },
  workstreams: [
    {id:"diss",  name:"A · Dissertation (DiP)", barColor:"#EF9F27", barBg:"#2F2208"},
    {id:"media", name:"B · Media",              barColor:"#5DCAA5", barBg:"#0F2E25"},
    {id:"biz",   name:"C · Business (parked)",  barColor:"#9B7FD4", barBg:"#1A1030"},
  ],
  tasks: [
    {id:"D1",  name:"Y1 coursework — 858 Quant · 893 Leadership · 859 Qual · 905 Equitable Practice", ws:"diss", start:1,  duration:10, label:"Y1 courses"},
    {id:"D2",  name:"Y1 Summer — 956 Applied Quant · 834 Org Theory; seed Ch.1 PoP work",             ws:"diss", start:11, duration:3,  label:"Y1 summer"},
    {id:"D3",  name:"Draft critical-incident interview protocol",                                        ws:"diss", start:11, duration:4,  label:"interview protocol", linked_assumptions:["S2","S3"]},
    {id:"D4",  name:"Y2 Fall — 914 Applied Qual · 920 Change Leadership; build + pilot protocol",       ws:"diss", start:13, duration:5,  label:"Y2 Fall (914/920)", linked_assumptions:["S1","S2"]},
    {id:"D5",  name:"Ch.1 — Foundations of Inquiry (PoP, RQ, org context)",                            ws:"diss", start:14, duration:9,  label:"Ch.1 draft"},
    {id:"D6",  name:"Y2 Spring — 785 Program Evaluation · 875 Design Thinking; topic-lock gate",       ws:"diss", start:18, duration:5,  label:"Y2 Spring (785/875)", linked_assumptions:["S1"]},
    {id:"D7",  name:"Ch.2 — Systems map + lit review (Senge lens)",                                    ws:"diss", start:14, duration:10, label:"Ch.2 lit"},
    {id:"D8",  name:"Ch.3 — Research design (PE action plan, IRB-ready ethics)",                        ws:"diss", start:18, duration:12, label:"Ch.3 design", linked_assumptions:["S1"]},
    {id:"D9",  name:"IRB prep + submission (formal interviews wait for proposal approval)",              ws:"diss", start:21, duration:13, label:"IRB prep", linked_assumptions:["S4"]},
    {id:"D10", name:"Y2 Summer — HR Mgmt · Data-Informed; Y3 Fall — Impl. Science · Capstone I",       ws:"diss", start:23, duration:7,  label:"Y2 Sum / Y3 Fall"},
    {id:"D11", name:"Conduct interviews — graduates, cadre, leadership (post-IRB)",                     ws:"diss", start:26, duration:6,  label:"interviews", linked_assumptions:["S2","S3","S4"]},
    {id:"D12", name:"Coding + thematic analysis → mechanism model",                                     ws:"diss", start:30, duration:5,  label:"analysis", linked_assumptions:["S2","S3"]},
    {id:"D13", name:"Y3 Spring — Advanced Leadership · Capstone II",                                    ws:"diss", start:30, duration:5,  label:"Y3 Spring"},
    {id:"D14", name:"Ch.4 — Findings, implications, recommendations",                                   ws:"diss", start:30, duration:8,  label:"Ch.4 findings"},
    {id:"D15", name:"Y3 Summer — Capstone III · Final Defense → Doctor",                               ws:"diss", start:35, duration:3,  label:"Cap.III · Defense"},
    {id:"M1",  name:"Stand up show + newsletter + landing page",                                         ws:"media", start:11, duration:2,  label:"launch setup"},
    {id:"M2",  name:"Fortnightly podcast + matched newsletter cadence (§5.4)",                          ws:"media", start:13, duration:25, label:"fortnightly cadence", linked_assumptions:["S5","S6"]},
    {id:"M3",  name:"Email list — primary compounding asset (watch reply rate, not open rate)",         ws:"media", start:11, duration:27, label:"list growth", linked_assumptions:["S5","S6"]},
    {id:"M4",  name:"Clip, Short & Title Engine per episode — Eden MCP (§5.10)",                        ws:"media", start:13, duration:25, label:"clip + title engine", linked_assumptions:["S5"]},
    {id:"M5",  name:"Ramp to weekly cadence once editor in place (Y3 target)",                          ws:"media", start:25, duration:13, label:"→ weekly"},
    {id:"B1",  name:"Gene Coughlin: chair-role write-up (owe him this — Jun 2026)",                     ws:"biz", start:11, duration:1,  label:"Gene write-up", linked_assumptions:["S8"]},
    {id:"B2",  name:"Gene: October event RSVP — decide by Aug 2026 (South Dakota)",                     ws:"biz", start:13, duration:1,  label:"Oct event?", linked_assumptions:["S8"]},
    {id:"B3",  name:"Patterns/problems log + light market scan (RBLP, AAR tools, pricing)",             ws:"biz", start:11, duration:27, label:"patterns log", linked_assumptions:["S7","S8"]},
    {id:"B4",  name:"Demand tests — only if list is real; practice framing, not 'the method' (11.5)",   ws:"biz", start:24, duration:14, label:"demand tests (gated)", linked_assumptions:["S7"]},
  ],
  assumptions: [
    {
      id:"S1", category:"Dissertation",
      claim:"Faculty confirm Program Evaluation as the pathway (G1 gate)",
      evidence_quality:"moderate",
      plan_elements_affected:"Ch.3 design, topic-lock gate (~Mar 2027), all downstream chapters",
      justification:"PE asks 'does this program work, and how?' — best fit for WIC. RCA diagnoses a broken thing (WIC isn't broken). DT designs for an unmet need at outside orgs (no site access). Chair conversation clears G1.",
      fail_signal:"Faculty steer to RCA or DT; lukewarm reception from two consecutive chairs. Fall to backup framing: construct = leadership capabilities (same data, same mechanism — just what sits in the construct slot flips).",
      reassessment_trigger:"First chair conversation after Aug 2026. If G1 not cleared by Dec 2026, escalate immediately.",
      linked_tasks:["D3","D4","D6","D8"],
    },
    {
      id:"S2", category:"Dissertation",
      claim:"Mechanism holds: required expert-to-novice teaching → leadership output (no opt-out)",
      evidence_quality:"moderate",
      plan_elements_affected:"PoP, RQ, construct — the entire study's spine",
      justification:"Strongest pattern from early interviews. School's own frame is build/teach/lead. Lit gap confirmed (no existing study isolates required no-opt-out teaching as the leadership engine). But this is a pattern to confirm in interviews, not a settled fact.",
      fail_signal:"Interview data shows build/lead louder than teach; expert-to-novice not the primary forcing function; participants describe it as surface, not develop.",
      reassessment_trigger:"Pilot in EDUC 914 (Fall 2026). Run 'which of these showed up most for you' pass. Full re-check post-IRB interviews.",
      linked_tasks:["D3","D4","D11","D12"],
    },
    {
      id:"S3", category:"Dissertation",
      claim:"Critical-incident protocol yields specific data — not just general impressions",
      evidence_quality:"weak",
      plan_elements_affected:"Ch.3 protocol design; Ch.4 validity; scope of org-level claim",
      justification:"Protocol anchors memory with specific debrief episodes (what the instructor did in what order; what the WUG changed after; when it clicked). Better than general impressions, but still retrospective self-report with memory and selection effects (§2.3).",
      fail_signal:"Pilot participants recall only generalities; critical incidents don't surface across multiple respondents; data too thin for triangulation.",
      reassessment_trigger:"Pilot interviews in EDUC 914 (Fall 2026). Adjust before IRB submission if data quality is low.",
      linked_tasks:["D3","D11","D12"],
    },
    {
      id:"S4", category:"Dissertation",
      claim:"Multi-source access holds: graduates + cadre + leadership + documents (G3 ✅ cleared)",
      evidence_quality:"strong",
      plan_elements_affected:"Org-level claim strength; triangulation; G4 data-sources gate",
      justification:"G3 already cleared — access broadened. Prior instructor interviews = background; re-ask at org level. Multi-role data enables org-level triangulation (§2.2).",
      fail_signal:"Cadre or leadership access revoked post-IRB; gate closes before data collection begins.",
      reassessment_trigger:"Confirm with chair before IRB submission. Re-check if command changes.",
      linked_tasks:["D9","D11"],
    },
    {
      id:"S5", category:"Media",
      claim:"Fortnightly cadence maintainable at 8–12 hr/wk alongside full dissertation load",
      evidence_quality:"weak",
      plan_elements_affected:"All media milestones; list growth rate; demand test viability",
      justification:"Weekly Engine (§5.9) is designed for this load — dissertation block wins ties. No evidence yet of actual capacity at concurrent course + protocol + cadence load.",
      fail_signal:"Episodes go unrecorded for 4+ consecutive weeks; cadence breaks during Y2 Fall heavy load (Sep–Dec 2026).",
      reassessment_trigger:"First semester with both course load and cadence running (Aug–Dec 2026). Dec 2026 self-AAR is the hard check.",
      linked_tasks:["M2","M3","M4"],
    },
    {
      id:"S6", category:"Media",
      claim:"Email list reaches ~300–500 by mid-2027; ~750–1,500 by mid-2029",
      evidence_quality:"weak",
      plan_elements_affected:"Phase 1 foundation; demand test timing (2027); Phase 2 offer viability (post-study)",
      justification:"Starting near zero. Growth depends on guest reach, content resonance, and consistency — all unproven at launch. Monthly checkpoints in §5.7 are the early signal.",
      fail_signal:"List below 150 by Dec 2026. Below 300 by Mar 2027 (topic-lock gate). Watch reply rate + repeat listens — not open rate (Apple Mail inflates it).",
      reassessment_trigger:"Monthly review in weekly engine. Hard checkpoints: Dec 2026 (list ~150–300) and Mar 2027 (list ~250–400).",
      linked_tasks:["M2","M3"],
    },
    {
      id:"S7", category:"Business",
      claim:"Business stays parked until study lands — firewall (11.5) holds throughout",
      evidence_quality:"strong",
      plan_elements_affected:"All business decisions; Gene partnership scope; cert lane (Phase 3)",
      justification:"Market the question, not the answer. Publishing unearned conclusions bends findings. Small demand tests allowed in 2027 only if list is real — framed as a practice, never 'the validated method.' (§11.5, §11.6). Business un-parks at Part 4 Phase 2 after Final Defense.",
      fail_signal:"Any offer claims a proven method or settled research conclusion before Aug 2028. Sponsorship deal makes media read as RBLP marketing.",
      reassessment_trigger:"Quarterly firewall check in §10.1 weekly review guardrail. First legitimate business ramp begins Summer 2028.",
      linked_tasks:["B3","B4"],
    },
    {
      id:"S8", category:"Business",
      claim:"Gene Coughlin's four roles (chair/sponsor/partner/incumbent) stay separable (§8.3)",
      evidence_quality:"weak",
      plan_elements_affected:"Research independence; brand neutrality; any formal agreement",
      justification:"Confirmed third (external) chair. EdD, USMC vet, RBLP founder ($3M+ revenue). Four roles in one person concentrate influence over research, brand, and independence. Three questions (§8.4) must be answered before any formal deal.",
      fail_signal:"'Partnership' means your work attributed to RBLP. Editorial strings on content. Chair role entangles with business interests.",
      reassessment_trigger:"Before any formal agreement. Answer §8.4 questions. Keep Oct event decision separate from chair relationship.",
      linked_tasks:["B1","B2","B3"],
    },
  ],
  milestones: [
    {id:"G3",  name:"G3 ✅ Access broadened (graduates + cadre + leadership + docs)", month:11, criteria:"Jun 2026: G3 cleared — widened access confirmed. Multi-source data enables org-level claim (§2.2). G1/G2/G4 still open: pathway not yet faculty-confirmed, construct not locked, sources still being added."},
    {id:"MS1", name:"Launch: show + newsletter + list live",                          month:12, criteria:"Jul 2026: first episodes recorded; email list live; fortnightly cadence started. Run §5.6 workflow. Content board (Excel) started."},
    {id:"G1",  name:"G1: PE pathway confirmed with faculty",                          month:13, criteria:"Aug 2026: faculty confirm Program Evaluation as pathway; G1 cleared. Start EDUC 914. Critical-incident protocol piloted in-course."},
    {id:"MS2", name:"Protocol done; pilot starts; list ~50–150",                      month:14, criteria:"Sep 2026: critical-incident protocol drafted + piloted in EDUC 914. Start Ch.1. List ~50–150. Gene Oct event decision finalized."},
    {id:"MS3", name:"Ch.1 draft done; list ~150–300",                                month:17, criteria:"Dec 2026: Chapter 1 foundations draft complete. Pilot complete — tested guide + sampling plan. Ch.2 building. Quarter review: top 3 audience problems."},
    {id:"TL",  name:"🚩 Topic-lock gate — G2 closes (~Mar 2027)",                    month:20, criteria:"Mar 2027: construct, PoP, and pathway locked + faculty-approved (closes G1/G2). All downstream chapters and IRB depend on this. List ~250–400."},
    {id:"MS4", name:"Ch.1/Ch.2 done; list ~300–500",                                 month:22, criteria:"May 2027: Chapters 1 and 2 complete. Ch.3 underway. IRB prep active. Decide if a tiny demand test is warranted (only if engagement is real)."},
    {id:"MS5", name:"IRB submitted; demand test if list is real",                     month:24, criteria:"Summer 2027: Ch.3 firmed; IRB submitted. First small demand test only if list is real — short coaching or paid talk, framed as a practice, NOT 'the method' (firewall 11.5)."},
    {id:"CX",  name:"🚩 Comprehensive Exams · Capstone I",                           month:29, criteria:"Fall 2027: Comps. Committee/chair assigned. Capstone I. Hold/ramp content cadence. Refine offer idea from demand-test feedback (no scaling)."},
    {id:"PD",  name:"🚩 Proposal Defense · Capstone II",                             month:34, criteria:"Spring 2028: Proposal Defense. Post-IRB interviews active. Capstone II. Hold media cadence."},
    {id:"FD",  name:"🚩 Final Defense → Doctor",                                     month:37, criteria:"Aug 2028: Analysis → Ch.4 complete → Final Defense → Doctor. Part 4 Phase 2 (real offers) un-parks. Media continues. Business ramp begins."},
  ],
}

const WS_MAP     = Object.fromEntries(planData.workstreams.map(w => [w.id, w]))
const ASSUME_MAP = Object.fromEntries(planData.assumptions.map(a => [a.id, a]))

const EQ_COLORS = { strong:'#1D9E75', moderate:'#BA7517', weak:'#D85A30' }
function eqColor(q) { return EQ_COLORS[q] || '#888' }

const planStart = new Date(2025, 7, 1).getTime()
const planEnd   = new Date(2028, 7, 31).getTime()

function Tooltip({ text, x, y, visible }) {
  if (!visible) return null
  return (
    <div style={{
      position:'fixed', left:x+12, top:y-8, zIndex:1000,
      background:'#0a1628', border:'1px solid #1e3a5f', borderRadius:8,
      padding:'8px 12px', pointerEvents:'none', maxWidth:280,
      boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{color:'#fff',fontSize:12,fontWeight:600}}>{text.name}</div>
      <div style={{color:'#6a80a0',fontSize:11,marginTop:2}}>{text.ws}</div>
      <div style={{color:'#c5a028',fontSize:11,marginTop:2}}>{text.range}</div>
      {text.assumCount > 0 && (
        <div style={{color:'#7a9ab5',fontSize:11,marginTop:2}}>
          {text.assumCount} linked assumption{text.assumCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default function Roadmap() {
  const [selectedTask,       setSelectedTask]       = useState(null)
  const [selectedAssumId,    setSelectedAssumId]    = useState(null)
  const [assumFilter,        setAsumFilter]         = useState('all')
  const [tooltip,            setTooltip]            = useState({visible:false,x:0,y:0,text:{}})
  const [expandedMilestone,  setExpandedMilestone]  = useState(null)
  const assumRefs = useRef({})

  const months    = planData.meta.months
  const todayPct  = Math.min(100, Math.max(0, (Date.now() - planStart) / (planEnd - planStart) * 100))

  function isDimmed(task) {
    if (!selectedAssumId) return false
    const linked = ASSUME_MAP[selectedAssumId]?.linked_tasks || []
    return !linked.includes(task.id)
  }

  function handleBarClick(task)      { setSelectedTask(task); setSelectedAssumId(null) }
  function handleAssumClick(assumId) { setSelectedAssumId(prev => prev === assumId ? null : assumId); setSelectedTask(null) }

  function jumpToAssum(assumId) {
    setSelectedAssumId(assumId); setSelectedTask(null)
    setTimeout(() => {
      const el = assumRefs.current[assumId]
      if (el) el.scrollIntoView({behavior:'smooth', block:'nearest'})
    }, 50)
  }

  const filteredAssumptions = planData.assumptions.filter(a =>
    assumFilter === 'all' ? true : a.evidence_quality === assumFilter
  )

  const tasksByWs = {}
  planData.workstreams.forEach(ws => { tasksByWs[ws.id] = planData.tasks.filter(t => t.ws === ws.id) })

  function handleBarMouseEnter(e, task) {
    const ws         = WS_MAP[task.ws]
    const startM     = months[task.start - 1]
    const endM       = months[Math.min(task.start + task.duration - 2, TOTAL_MONTHS - 1)]
    const assumCount = (task.linked_assumptions || []).length
    setTooltip({visible:true, x:e.clientX, y:e.clientY, text:{
      name:task.name, ws:ws?.name || task.ws,
      range:`M${task.start}–M${task.start+task.duration-1} (${startM?.label} '${startM?.year} – ${endM?.label} '${endM?.year})`,
      assumCount,
    }})
  }
  function handleBarMouseMove(e)  { setTooltip(prev => ({...prev,x:e.clientX,y:e.clientY})) }
  function handleBarMouseLeave()  { setTooltip(prev => ({...prev,visible:false})) }

  const gridCols = `repeat(${TOTAL_MONTHS}, 1fr)`
  const minW     = 1800 + 224

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0a1628] text-white overflow-auto">
      <Tooltip {...tooltip} />

      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e3a5f]">
        <h2 className="text-base font-bold text-white mb-3">{planData.meta.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:'Window',   value:planData.meta.window},
            {label:'Apex',     value:planData.meta.apex},
            {label:'Arms',     value:planData.meta.arms},
            {label:'Firewall', value:planData.meta.firewall},
          ].map(item => (
            <div key={item.label} className="bg-[#071020] border border-[#1e3a5f] rounded-lg px-3 py-2">
              <div className="text-[#4a6080] text-xs mb-0.5">{item.label}</div>
              <div className="text-white text-xs font-medium leading-snug">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 px-6 pt-4 pb-2">
        <div className="overflow-x-auto">
          <div style={{minWidth: minW}}>

            <div className="flex" style={{marginLeft:224}}>
              <div style={{display:'grid', gridTemplateColumns:gridCols, width:'100%'}}>
                {months.map(m => (
                  <div key={m.n} className="text-center border-l border-[#1e3a5f] first:border-l-0"
                       style={{borderBottom:'1px solid #1e3a5f'}}>
                    <div className="text-[#c5a028] text-[10px] font-bold py-1">{m.label}</div>
                    <div className="text-[#4a6080] text-[9px] pb-1">'{m.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {planData.workstreams.map(ws => {
              const wsTasks = tasksByWs[ws.id] || []
              return (
                <div key={ws.id}>
                  <div className="flex items-center" style={{borderTop:'1px solid #1e3a5f', background:'#071020'}}>
                    <div style={{width:224, minWidth:224}} className="px-3 py-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{color:ws.barColor}}>{ws.name}</span>
                    </div>
                    <div style={{flex:1}} />
                  </div>
                  {wsTasks.map(task => {
                    const isSelected = selectedTask?.id === task.id
                    const dimmed     = isDimmed(task)
                    const leftPct    = (task.start - 1) / TOTAL_MONTHS * 100
                    const widthPct   = task.duration / TOTAL_MONTHS * 100
                    const assumCount = (task.linked_assumptions || []).length
                    return (
                      <div key={task.id} className="flex items-center"
                           style={{borderTop:'1px solid #112040', minHeight:40}}>
                        <div style={{width:224, minWidth:224}} className="px-3 py-2 flex items-center gap-1.5">
                          <span className="text-xs leading-snug cursor-pointer"
                                style={{color: isSelected ? '#fff' : '#7a9ab5'}}
                                onClick={() => handleBarClick(task)}>
                            {task.name}
                          </span>
                          {assumCount > 0 && (
                            <span className="text-[10px] text-[#c5a028] shrink-0">({assumCount})</span>
                          )}
                        </div>
                        <div style={{flex:1, position:'relative', height:40}}>
                          <div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:gridCols}}>
                            {months.map(m => (
                              <div key={m.n} style={{borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none'}} />
                            ))}
                          </div>
                          <div style={{
                            position:'absolute', left:`${todayPct}%`,
                            top:0, bottom:0, width:1,
                            background:'rgba(255,255,255,0.12)', zIndex:3, pointerEvents:'none',
                          }} />
                          <div
                            style={{
                              position:'absolute', top:'50%', transform:'translateY(-50%)',
                              left:`${leftPct}%`, width:`${widthPct}%`,
                              height:26, background:ws.barBg, borderRadius:6,
                              border: isSelected ? `2px solid ${ws.barColor}` : `1px solid ${ws.barColor}33`,
                              opacity: dimmed ? 0.22 : 1, cursor:'pointer',
                              display:'flex', alignItems:'center', paddingLeft:8, paddingRight:4,
                              overflow:'hidden', transition:'opacity 0.2s, border 0.15s',
                              boxShadow: isSelected ? `0 0 8px ${ws.barColor}55` : 'none',
                            }}
                            onClick={() => handleBarClick(task)}
                            onMouseEnter={e => handleBarMouseEnter(e, task)}
                            onMouseMove={handleBarMouseMove}
                            onMouseLeave={handleBarMouseLeave}
                          >
                            <span style={{
                              color:ws.barColor, fontSize:9, fontWeight:600,
                              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                            }}>{task.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            <div className="flex items-center" style={{borderTop:'1px solid #1e3a5f', minHeight:48}}>
              <div style={{width:224, minWidth:224}} className="px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5a028]">Gates &amp; Milestones</span>
              </div>
              <div style={{flex:1, position:'relative', height:48}}>
                <div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:gridCols}}>
                  {months.map(m => (
                    <div key={m.n} style={{borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none'}} />
                  ))}
                </div>
                <div style={{
                  position:'absolute', left:`${todayPct}%`,
                  top:0, bottom:0, width:1,
                  background:'rgba(255,255,255,0.12)', zIndex:3, pointerEvents:'none',
                }} />
                {planData.milestones.map(ms => {
                  const leftPct = ((ms.month - 1) / TOTAL_MONTHS * 100) + (1 / TOTAL_MONTHS * 50)
                  const isGate  = ['TL','CX','PD','FD'].includes(ms.id)
                  return (
                    <div key={ms.id} title={ms.name}
                         style={{
                           position:'absolute', left:`${leftPct}%`, top:'50%',
                           width:12, height:12,
                           background: isGate ? '#ff6b6b' : '#c5a028',
                           transform:'translate(-50%, -50%) rotate(45deg)',
                           cursor:'pointer', zIndex:2,
                         }}
                         onClick={() => setExpandedMilestone(prev => prev === ms.id ? null : ms.id)}
                    />
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <div style={{width:12,height:1,background:'rgba(255,255,255,0.25)'}} />
            <span className="text-[10px] text-[#4a6080]">today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{width:10,height:10,background:'#c5a028',transform:'rotate(45deg)'}} />
            <span className="text-[10px] text-[#4a6080]">checkpoint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{width:10,height:10,background:'#ff6b6b',transform:'rotate(45deg)'}} />
            <span className="text-[10px] text-[#4a6080]">gate / exam</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080]">Task Detail</h3>
          {selectedTask ? (
            <TaskDetail task={selectedTask} onJumpToAssumption={jumpToAssum} />
          ) : (
            <div className="flex-1 bg-[#071020] border border-[#1e3a5f] rounded-xl flex items-center justify-center py-12">
              <p className="text-[#344a60] text-sm text-center">Click a Gantt bar to see details</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080]">Assumptions Register</h3>
            <div className="flex gap-1">
              {['all','strong','moderate','weak'].map(f => (
                <button key={f} onClick={() => setAsumFilter(f)}
                        className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                        style={{
                          background: assumFilter === f ? '#1e3a5f' : 'transparent',
                          color:      assumFilter === f ? '#fff' : '#4a6080',
                          border:     `1px solid ${assumFilter === f ? '#2a5080' : '#1e3a5f'}`,
                        }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {filteredAssumptions.map(a => (
              <AssumptionCard key={a.id} assumption={a}
                              isSelected={selectedAssumId === a.id}
                              onClick={() => handleAssumClick(a.id)}
                              ref={el => assumRefs.current[a.id] = el} />
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">Gates &amp; Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planData.milestones.map(ms => {
            const isGate     = ['TL','CX','PD','FD'].includes(ms.id)
            const isExpanded = expandedMilestone === ms.id
            return (
              <div key={ms.id}
                   className="bg-[#071020] border rounded-lg px-4 py-3 cursor-pointer transition-colors"
                   style={{borderColor: isExpanded ? '#c5a028' : isGate ? '#ff6b6b55' : '#1e3a5f'}}
                   onClick={() => setExpandedMilestone(prev => prev === ms.id ? null : ms.id)}>
                <div className="flex items-start gap-2">
                  <span style={{
                    display:'inline-block', width:10, height:10,
                    background: isGate ? '#ff6b6b' : '#c5a028',
                    transform:'rotate(45deg)', marginTop:4, flexShrink:0,
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[#c5a028] text-xs font-bold shrink-0">{ms.id}</span>
                      <span className="text-white text-xs font-medium truncate">{ms.name}</span>
                      <span className="text-[#4a6080] text-xs shrink-0 ml-auto">M{ms.month}</span>
                    </div>
                    {isExpanded && (
                      <p className="text-[#6a80a0] text-xs mt-2 leading-relaxed">{ms.criteria}</p>
                    )}
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

function TaskDetail({ task, onJumpToAssumption }) {
  const ws           = WS_MAP[task.ws]
  const months       = planData.meta.months
  const startM       = months[task.start - 1]
  const endM         = months[Math.min(task.start + task.duration - 2, TOTAL_MONTHS - 1)]
  const linkedAssums = (task.linked_assumptions || []).map(id => ASSUME_MAP[id]).filter(Boolean)
  return (
    <div className="bg-[#071020] border border-[#1e3a5f] rounded-xl px-4 py-4 flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{color:ws?.barColor}}>{ws?.name}</span>
          <span className="text-[#4a6080] text-xs">·</span>
          <span className="text-[#c5a028] text-xs font-medium">M{task.start}–M{task.start+task.duration-1}</span>
        </div>
        <p className="text-white text-sm font-semibold">{task.name}</p>
        <p className="text-[#6a80a0] text-xs mt-1">
          {startM?.label} '{startM?.year} – {endM?.label} '{endM?.year} · {task.duration} month{task.duration !== 1 ? 's' : ''}
        </p>
      </div>
      {linkedAssums.length > 0 && (
        <div>
          <p className="text-[#4a6080] text-xs mb-2 font-medium uppercase tracking-wider">Linked Assumptions</p>
          <div className="flex flex-col gap-1.5">
            {linkedAssums.map(a => (
              <button key={a.id} onClick={() => onJumpToAssumption(a.id)}
                      className="flex items-start gap-2 text-left hover:bg-[#0f2040] rounded-lg px-2 py-1.5 transition-colors">
                <span className="inline-block w-2 h-2 rounded-full shrink-0 mt-0.5"
                      style={{background:eqColor(a.evidence_quality)}} />
                <div>
                  <span className="text-[#7a9ab5] text-xs font-bold">{a.id}</span>
                  <span className="text-[#6a80a0] text-xs ml-1">{a.claim}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const AssumptionCard = forwardRef(function AssumptionCard({ assumption, isSelected, onClick }, ref) {
  const a = assumption
  return (
    <div ref={ref} onClick={onClick}
         className="bg-[#071020] border rounded-xl px-4 py-3 cursor-pointer transition-all flex flex-col gap-2"
         style={{
           borderColor: isSelected ? '#c5a028' : '#1e3a5f',
           boxShadow:   isSelected ? '0 0 0 1px #c5a02855' : 'none',
         }}>
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 rounded-full shrink-0 mt-1"
              style={{background:eqColor(a.evidence_quality)}} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[#c5a028] text-xs font-bold">{a.id}</span>
            <span className="text-[#4a6080] text-xs">{a.category}</span>
            <span className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
                  style={{color:eqColor(a.evidence_quality), background:eqColor(a.evidence_quality)+'22'}}>
              {a.evidence_quality}
            </span>
          </div>
          <p className="text-white text-xs font-medium leading-snug">{a.claim}</p>
        </div>
      </div>
      {isSelected && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[#1e3a5f]">
          <div>
            <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Fail Signal</p>
            <p className="text-[#D85A30] text-xs leading-relaxed">{a.fail_signal}</p>
          </div>
          <div>
            <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Reassessment Trigger</p>
            <p className="text-[#6a80a0] text-xs leading-relaxed">{a.reassessment_trigger}</p>
          </div>
          {a.justification && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Justification</p>
              <p className="text-[#5a7090] text-xs leading-relaxed">{a.justification}</p>
            </div>
          )}
          {a.linked_tasks && a.linked_tasks.length > 0 && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Linked Tasks</p>
              <div className="flex flex-wrap gap-1">
                {a.linked_tasks.map(tid => (
                  <span key={tid} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e3a5f] text-[#7a9ab5]">{tid}</span>
                ))}
              </div>
            </div>
          )}
          {a.plan_elements_affected && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Affects</p>
              <p className="text-[#5a7090] text-xs leading-relaxed">{a.plan_elements_affected}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
