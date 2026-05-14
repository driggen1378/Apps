import { useState, useRef, useEffect, forwardRef } from 'react'

const planData = {
  "meta": {
    "title": "USAFWS-Credentialed Solo Practice — 15-Month Launch",
    "window": "May 2026 – Jul 2027 (15 months)",
    "capacity": "15–20 hrs/wk (realistic load)",
    "primary_icp": "OD Manager / Org Effectiveness · Tech/AI/SaaS + Gov/Defense",
    "secondary_icp": "Finance · Energy · Healthcare · Manufacturing",
    "target": "Job offer signed + dissertation topic locked + LLC live",
    "months": [
      {"n":1,"label":"May","year":"26"},{"n":2,"label":"Jun","year":"26"},{"n":3,"label":"Jul","year":"26"},
      {"n":4,"label":"Aug","year":"26"},{"n":5,"label":"Sep","year":"26"},{"n":6,"label":"Oct","year":"26"},
      {"n":7,"label":"Nov","year":"26"},{"n":8,"label":"Dec","year":"26"},{"n":9,"label":"Jan","year":"27"},
      {"n":10,"label":"Feb","year":"27"},{"n":11,"label":"Mar","year":"27"},{"n":12,"label":"Apr","year":"27"},
      {"n":13,"label":"May","year":"27"},{"n":14,"label":"Jun","year":"27"},{"n":15,"label":"Jul","year":"27"}
    ]
  },
  "workstreams": [
    {"id":"job","name":"Job Search","barColor":"#85B7EB","barBg":"#112842"},
    {"id":"llc","name":"LLC & Brand","barColor":"#5DCAA5","barBg":"#0F2E25"},
    {"id":"diss","name":"Dissertation","barColor":"#EF9F27","barBg":"#2F2208"}
  ],
  "tasks": [
    {"id":"A1","name":"Submit applications (5–10/wk)","ws":"job","start":1,"duration":6,"label":"apply"},
    {"id":"A2","name":"Convert to interviews","ws":"job","start":2,"duration":5,"label":"screen→interview"},
    {"id":"A3","name":"Close an offer (DP1)","ws":"job","start":4,"duration":4,"label":"close","linked_assumptions":["A16"]},
    {"id":"B1","name":"Form LLC + banking + domain","ws":"llc","start":1,"duration":1,"label":"setup","linked_assumptions":["A13"]},
    {"id":"B2","name":"LinkedIn 3×/wk + ICP commenting","ws":"llc","start":1,"duration":15,"label":"content","linked_assumptions":["A9"]},
    {"id":"B3","name":"Informational interviews (1–2/wk)","ws":"llc","start":2,"duration":8,"label":"network","linked_assumptions":["A16"]},
    {"id":"B4","name":"Dissertation-adjacent IP artifacts","ws":"llc","start":4,"duration":12,"label":"IP artifacts","linked_assumptions":["A11"]},
    {"id":"C1","name":"Chair conversations","ws":"diss","start":9,"duration":3,"label":"chair","linked_assumptions":["A15","A7"]},
    {"id":"C2","name":"Lock topic + form committee","ws":"diss","start":11,"duration":1,"label":"topic lock","linked_assumptions":["A15"]},
    {"id":"C3","name":"IRB protocol + data collection prep","ws":"diss","start":12,"duration":3,"label":"IRB","linked_assumptions":["A7"]},
    {"id":"C4","name":"UNC coursework (continuous)","ws":"diss","start":1,"duration":15,"label":"coursework"}
  ],
  "assumptions": [
    {
      "id":"A16",
      "category":"Job Search",
      "claim":"Resume positions credibly for OD Manager roles in target market",
      "evidence_quality":"weak",
      "plan_elements_affected":"Entire job-first strategy; timeline to DP1",
      "justification":"USAFWS credential + doctoral program + Metrea W-2 makes a plausible case. Civilian L&D vocabulary, HRIS/LMS platform fluency, and people-analytics KPIs are gaps that may show in screening.",
      "fail_signal":"Zero recruiter responses after 30+ submissions → resume signal weaker than estimated. Zero interviews after 50+ → screening filter catching something specific.",
      "reassessment_trigger":"After 30 submissions for response rate; after 50 for interview conversion.",
      "linked_tasks":["A1","A2","A3","B3"]
    },
    {
      "id":"A14",
      "category":"Job Search",
      "claim":"USAFWS credential reads as background (not discount) once inside a tech/defense firm",
      "evidence_quality":"moderate",
      "plan_elements_affected":"Target vertical selection; positioning during interviews",
      "justification":"Job-first entry sidesteps the credential discount: you are being hired as an employee, not selling solo into a discounting market. Once inside, the credential reads as background; what gets evaluated is the work product.",
      "fail_signal":"Recruiters consistently flag the military credential as a mismatch signal despite tailored positioning.",
      "reassessment_trigger":"After first 10 recruiter conversations — note any pattern of credential-as-discount feedback.",
      "linked_tasks":["A1","A2"]
    },
    {
      "id":"A13",
      "category":"Foundational",
      "claim":"Cash runway covers the job-search window without income pressure",
      "evidence_quality":"weak",
      "plan_elements_affected":"Every timeline element; pivot triggers; force-compress decision",
      "justification":"Plan built assuming runway holds. If Metrea ends or compresses, the force-compress trigger fires: take any L&D/OD-adjacent role for cash.",
      "fail_signal":"Cash anxiety surfaces before an offer lands. Detection: user reports runway below 3 months.",
      "reassessment_trigger":"Revisit within 30 days of plan kickoff. Compute actual runway now.",
      "notes":"Most fragile assumption. Naming it explicitly is the minimum protection.",
      "linked_tasks":["B1"]
    },
    {
      "id":"A9",
      "category":"Content & Brand",
      "claim":"LinkedIn content compounds to reliable inbound by M6–M12",
      "evidence_quality":"weak",
      "plan_elements_affected":"Content cadence (B2); network-building during job-first years",
      "justification":"Consistent LinkedIn content at 3×/wk + ICP commenting compounds to at least 3 ICP DMs/month by M12 — conditional on applied-insight quality, not generic-credential content.",
      "fail_signal":"Zero inbound DMs from target buyers despite 12 months of consistent 3×/wk posting → content is generic-credentialed, rebuild around dissertation-adjacent insight.",
      "reassessment_trigger":"Month 6 for early signal; Month 12 for compounding evidence.",
      "linked_tasks":["B2"]
    },
    {
      "id":"A11",
      "category":"Long Arc",
      "claim":"B2B2C credentialing body is the $1M/year path (years 15–20)",
      "evidence_quality":"moderate",
      "plan_elements_affected":"Year-2+ strategy; dissertation IP shape; partner-organization targeting",
      "justification":"Project-based consulting math doesn't pencil for $1M solo. The paths are: owned credentialing body (Coughlin model), productized IP + speaking/licensing, or retainer-anchored advisory at $20–30K/mo. Job-first arc builds toward one of these. Dissertation is the IP that makes any defensible.",
      "fail_signal":"T3 reached and no credentialing partner interest after explicit outreach → pivot to retainer-anchored advisory or productized IP + speaking.",
      "reassessment_trigger":"Annual, at each plan-anniversary review.",
      "linked_tasks":["B4"]
    },
    {
      "id":"A15",
      "category":"Dissertation",
      "claim":"Debrief phenomenology is the right dissertation framing",
      "evidence_quality":"moderate",
      "plan_elements_affected":"Dissertation direction (C1, C2); IP shape; year-2 commercial extension",
      "justification":"Weighted decision matrix across 7 criteria scores debrief at 3.85 vs. institutional at 3.60. Debrief is discrete and teachable; institutional thesis requires sustained access no longer available post-active-duty.",
      "fail_signal":"Chair enthusiasm for institutional framing AND willingness to broker access. OR: lukewarm reception from 2 consecutive chairs.",
      "reassessment_trigger":"First chair conversation (M9). Topic-lock deadline at Capstone Seminar 1 (M11).",
      "linked_tasks":["C1","C2"]
    },
    {
      "id":"A7",
      "category":"Dissertation",
      "claim":"Dissertation co-anchors with practice via IRB firewall",
      "evidence_quality":"moderate",
      "plan_elements_affected":"Chair conversations (C1); IRB protocol (C3); discovery interview population",
      "justification":"Subjects (USAFWS instructor alumni) and clients/network contacts are structurally non-overlapping populations under Federal Common Rule 45 CFR 46.",
      "fail_signal":"Chair raises subject/client overlap. OR: UNC IRB flags dual-role conflict.",
      "reassessment_trigger":"First chair conversation (M9), then at IRB submission.",
      "linked_tasks":["C1","C3"]
    }
  ],
  "milestones": [
    {"id":"DP1","name":"Decision Point 1 — Job offer received","month":5,"criteria":"Signed offer letter. Surface outside-practice/moonlighting policy before signing. Get it in writing. Workstream B shifts to 'build solo readiness inside the role.'"},
    {"id":"DP2","name":"Decision Point 2 — Sustained no-offer signal","month":7,"criteria":"Triggered if A1 or A2 fail conditions hit after candidate-defined volume. Hard reassessment: compress requirements, activate solo-bootstrap branch, or bridge income."},
    {"id":"MS1","name":"Month 3 checkpoint","month":3,"criteria":"≥15 applications submitted. First recruiter responses processed. LinkedIn at steady posting cadence. LLC formation initiated."},
    {"id":"MS2","name":"Month 6 checkpoint","month":6,"criteria":"≥1 interview pipeline active at manager level or beyond. ≥5 informational interviews completed. LinkedIn: visible engagement from target-vertical contacts."},
    {"id":"MS3","name":"Dissertation chair (M9–M11)","month":10,"criteria":"Chair conversation with positive signal on debrief phenomenology direction. Committee identified. Topic lock before Capstone Seminar 1 (M11)."},
    {"id":"MS4","name":"T1 — Role landed in target market","month":7,"criteria":"Trigger T1 fires. Vocabulary, network density, and internal proof access begin accruing. Solo transition now governed by T1→T2→T3 sequence."},
    {"id":"MS5","name":"IRB protocol submitted","month":15,"criteria":"IRB protocol drafted with subject/client firewall pre-registered. Methodology defended internally with chair. Target IRB approval by fall 2027."}
  ]
}

const WS_MAP = Object.fromEntries(planData.workstreams.map(w => [w.id, w]))
const ASSUME_MAP = Object.fromEntries(planData.assumptions.map(a => [a.id, a]))

const EQ_COLORS = {
  strong:   '#1D9E75',
  moderate: '#BA7517',
  weak:     '#D85A30',
}

function eqColor(q) { return EQ_COLORS[q] || '#888' }

function Tooltip({ text, x, y, visible }) {
  if (!visible) return null
  return (
    <div
      style={{
        position: 'fixed',
        left: x + 12,
        top: y - 8,
        zIndex: 1000,
        background: '#0a1628',
        border: '1px solid #1e3a5f',
        borderRadius: 8,
        padding: '8px 12px',
        pointerEvents: 'none',
        maxWidth: 260,
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{text.name}</div>
      <div style={{ color: '#6a80a0', fontSize: 11, marginTop: 2 }}>{text.ws}</div>
      <div style={{ color: '#c5a028', fontSize: 11, marginTop: 2 }}>{text.range}</div>
      {text.assumCount > 0 && (
        <div style={{ color: '#7a9ab5', fontSize: 11, marginTop: 2 }}>{text.assumCount} linked assumption{text.assumCount > 1 ? 's' : ''}</div>
      )}
    </div>
  )
}

export default function Roadmap() {
  const [selectedTask, setSelectedTask]       = useState(null)
  const [selectedAssumId, setSelectedAssumId] = useState(null)
  const [assumFilter, setAsumFilter]          = useState('all')
  const [tooltip, setTooltip]                 = useState({ visible: false, x: 0, y: 0, text: {} })
  const [expandedMilestone, setExpandedMilestone] = useState(null)
  const assumRefs = useRef({})

  const months = planData.meta.months

  function isDimmed(task) {
    if (!selectedAssumId) return false
    const linkedTasks = ASSUME_MAP[selectedAssumId]?.linked_tasks || []
    return !linkedTasks.includes(task.id)
  }

  function handleBarClick(task) {
    setSelectedTask(task)
    setSelectedAssumId(null)
  }

  function handleAssumClick(assumId) {
    setSelectedAssumId(prev => prev === assumId ? null : assumId)
    setSelectedTask(null)
  }

  function jumpToAssum(assumId) {
    setSelectedAssumId(assumId)
    setSelectedTask(null)
    setTimeout(() => {
      const el = assumRefs.current[assumId]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const filteredAssumptions = planData.assumptions.filter(a => {
    if (assumFilter === 'all') return true
    return a.evidence_quality === assumFilter
  })

  const tasksByWs = {}
  planData.workstreams.forEach(ws => {
    tasksByWs[ws.id] = planData.tasks.filter(t => t.ws === ws.id)
  })

  function handleBarMouseEnter(e, task) {
    const ws = WS_MAP[task.ws]
    const startMonth = months[task.start - 1]
    const endMonth = months[task.start + task.duration - 2]
    const assumCount = (task.linked_assumptions || []).length
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      text: {
        name: task.name,
        ws: ws?.name || task.ws,
        range: `M${task.start}–M${task.start + task.duration - 1} (${startMonth?.label} '${startMonth?.year} – ${endMonth?.label} '${endMonth?.year})`,
        assumCount,
      }
    })
  }

  function handleBarMouseMove(e) {
    setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
  }

  function handleBarMouseLeave() {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  return (
    <div className="flex flex-col bg-[#0a1628] text-white overflow-y-auto h-full">
      <Tooltip {...tooltip} />

      {/* Header strip */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e3a5f]">
        <h2 className="text-base font-bold text-white mb-3">{planData.meta.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Window',   value: planData.meta.window },
            { label: 'Capacity', value: planData.meta.capacity },
            { label: 'Primary',  value: planData.meta.primary_icp },
            { label: 'Target',   value: planData.meta.target },
          ].map(item => (
            <div key={item.label} className="bg-[#071020] border border-[#1e3a5f] rounded-lg px-3 py-2">
              <div className="text-[#4a6080] text-xs mb-0.5">{item.label}</div>
              <div className="text-white text-xs font-medium leading-snug">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gantt chart */}
      <div className="shrink-0 px-6 pt-4 pb-2">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 + 224 }}>

            {/* Month header */}
            <div className="flex" style={{ marginLeft: 224 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', width: '100%' }}>
                {months.map(m => (
                  <div key={m.n} className="text-center border-l border-[#1e3a5f] first:border-l-0" style={{ borderBottom: '1px solid #1e3a5f' }}>
                    <div className="text-[#c5a028] text-xs font-bold py-1">{m.label}</div>
                    <div className="text-[#4a6080] text-xs pb-1">'{m.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workstream rows */}
            {planData.workstreams.map(ws => {
              const wsTasks = tasksByWs[ws.id] || []
              return (
                <div key={ws.id}>
                  <div className="flex items-center" style={{ borderTop: '1px solid #1e3a5f', background: '#071020' }}>
                    <div style={{ width: 224, minWidth: 224 }} className="px-3 py-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ws.barColor }}>{ws.name}</span>
                    </div>
                    <div style={{ flex: 1 }} />
                  </div>

                  {wsTasks.map(task => {
                    const isSelected = selectedTask?.id === task.id
                    const dimmed = isDimmed(task)
                    const leftPct = ((task.start - 1) / 15 * 100)
                    const widthPct = (task.duration / 15 * 100)
                    const assumCount = (task.linked_assumptions || []).length

                    return (
                      <div key={task.id} className="flex items-center" style={{ borderTop: '1px solid #112040', minHeight: 40 }}>
                        <div style={{ width: 224, minWidth: 224 }} className="px-3 py-2 flex items-center gap-1.5">
                          <span
                            className="text-xs leading-snug cursor-pointer"
                            style={{ color: isSelected ? '#fff' : '#7a9ab5' }}
                            onClick={() => handleBarClick(task)}
                          >
                            {task.name}
                          </span>
                          {assumCount > 0 && (
                            <span className="text-[10px] text-[#c5a028] shrink-0">({assumCount})</span>
                          )}
                        </div>

                        <div style={{ flex: 1, position: 'relative', height: 40 }}>
                          <div style={{
                            position: 'absolute', inset: 0,
                            display: 'grid',
                            gridTemplateColumns: 'repeat(15, 1fr)',
                          }}>
                            {months.map(m => (
                              <div key={m.n} style={{ borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none' }} />
                            ))}
                          </div>

                          <div
                            style={{
                              position: 'absolute',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                              height: 26,
                              background: ws.barBg,
                              borderRadius: 6,
                              border: isSelected ? `2px solid ${ws.barColor}` : `1px solid ${ws.barColor}33`,
                              opacity: dimmed ? 0.25 : 1,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              paddingLeft: 8,
                              paddingRight: 4,
                              overflow: 'hidden',
                              transition: 'opacity 0.2s, border 0.15s',
                              boxShadow: isSelected ? `0 0 8px ${ws.barColor}55` : 'none',
                            }}
                            onClick={() => handleBarClick(task)}
                            onMouseEnter={e => handleBarMouseEnter(e, task)}
                            onMouseMove={handleBarMouseMove}
                            onMouseLeave={handleBarMouseLeave}
                          >
                            <span style={{
                              color: ws.barColor,
                              fontSize: 10,
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>{task.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Milestones row */}
            <div className="flex items-center" style={{ borderTop: '1px solid #1e3a5f', minHeight: 48 }}>
              <div style={{ width: 224, minWidth: 224 }} className="px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5a028]">Milestones</span>
              </div>
              <div style={{ flex: 1, position: 'relative', height: 48 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(15, 1fr)',
                }}>
                  {months.map(m => (
                    <div key={m.n} style={{ borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none' }} />
                  ))}
                </div>

                {planData.milestones.map(ms => {
                  const leftPct = ((ms.month - 1) / 15 * 100) + (1 / 15 * 50)
                  return (
                    <div
                      key={ms.id}
                      title={ms.name}
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: '50%',
                        width: 12,
                        height: 12,
                        background: '#c5a028',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        cursor: 'pointer',
                        zIndex: 2,
                      }}
                      onClick={() => setExpandedMilestone(prev => prev === ms.id ? null : ms.id)}
                    />
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Two-column panel */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">

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

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080]">Assumptions Register</h3>
            <div className="flex gap-1">
              {['all','moderate','weak'].map(f => (
                <button
                  key={f}
                  onClick={() => setAsumFilter(f)}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    background: assumFilter === f ? '#1e3a5f' : 'transparent',
                    color: assumFilter === f ? '#fff' : '#4a6080',
                    border: `1px solid ${assumFilter === f ? '#2a5080' : '#1e3a5f'}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredAssumptions.map(a => (
              <AssumptionCard
                key={a.id}
                assumption={a}
                isSelected={selectedAssumId === a.id}
                onClick={() => handleAssumClick(a.id)}
                ref={el => assumRefs.current[a.id] = el}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div className="shrink-0 px-6 pb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">Milestones & Decision Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planData.milestones.map(ms => {
            const isDP = ms.id.startsWith('DP')
            const isExpanded = expandedMilestone === ms.id
            return (
              <div
                key={ms.id}
                className="bg-[#071020] border rounded-lg px-4 py-3 cursor-pointer transition-colors"
                style={{ borderColor: isExpanded ? '#c5a028' : isDP ? '#c5a02855' : '#1e3a5f' }}
                onClick={() => setExpandedMilestone(prev => prev === ms.id ? null : ms.id)}
              >
                <div className="flex items-start gap-2">
                  <span style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    background: '#c5a028',
                    transform: 'rotate(45deg)',
                    marginTop: 4,
                    flexShrink: 0,
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
  const ws = WS_MAP[task.ws]
  const months = planData.meta.months
  const startMonth = months[task.start - 1]
  const endMonth = months[task.start + task.duration - 2]
  const linkedAssumptions = (task.linked_assumptions || []).map(id => ASSUME_MAP[id]).filter(Boolean)

  return (
    <div className="bg-[#071020] border border-[#1e3a5f] rounded-xl px-4 py-4 flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: ws?.barColor }}>{ws?.name}</span>
          <span className="text-[#4a6080] text-xs">·</span>
          <span className="text-[#c5a028] text-xs font-medium">M{task.start}–M{task.start + task.duration - 1}</span>
        </div>
        <p className="text-white text-sm font-semibold">{task.name}</p>
        <p className="text-[#6a80a0] text-xs mt-1">
          {startMonth?.label} '{startMonth?.year} – {endMonth?.label} '{endMonth?.year} · {task.duration} month{task.duration !== 1 ? 's' : ''}
        </p>
      </div>

      {linkedAssumptions.length > 0 && (
        <div>
          <p className="text-[#4a6080] text-xs mb-2 font-medium uppercase tracking-wider">Linked Assumptions</p>
          <div className="flex flex-col gap-1.5">
            {linkedAssumptions.map(a => (
              <button
                key={a.id}
                onClick={() => onJumpToAssumption(a.id)}
                className="flex items-start gap-2 text-left hover:bg-[#0f2040] rounded-lg px-2 py-1.5 transition-colors"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full shrink-0 mt-0.5"
                  style={{ background: eqColor(a.evidence_quality) }}
                />
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
    <div
      ref={ref}
      onClick={onClick}
      className="bg-[#071020] border rounded-xl px-4 py-3 cursor-pointer transition-all flex flex-col gap-2"
      style={{
        borderColor: isSelected ? '#c5a028' : '#1e3a5f',
        boxShadow: isSelected ? '0 0 0 1px #c5a02855' : 'none',
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full shrink-0 mt-1"
          style={{ background: eqColor(a.evidence_quality) }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[#c5a028] text-xs font-bold">{a.id}</span>
            <span className="text-[#4a6080] text-xs">{a.category}</span>
            <span
              className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
              style={{
                color: eqColor(a.evidence_quality),
                background: eqColor(a.evidence_quality) + '22',
              }}
            >
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
        </div>
      )}
    </div>
  )
})
