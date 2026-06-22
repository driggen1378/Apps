import { useState } from 'react'
import { storage } from '../lib/storage'
import { loadTasks } from '../lib/tasks'

function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const y = d.getUTCFullYear()
  const yearStart = new Date(Date.UTC(y, 0, 1))
  const wk = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${y}-W${wk.toString().padStart(2, '0')}`
}

function autoWeekCycle(weekKey) {
  const [yr, wk] = weekKey.split('-W').map(Number)
  return Math.abs((yr - 2026) * 52 + (wk - 25)) % 2 === 0 ? 'A' : 'B'
}

// ── Goal data ────────────────────────────────────────────────────────────────

const CATS = {
  dissertation: { label: 'Dissertation', icon: '🎓', color: '#EF9F27', nav: 'dissertation' },
  media:        { label: 'Media',        icon: '🎙️', color: '#5DCAA5', nav: 'weekly'       },
  business:     { label: 'Business',     icon: '💼', color: '#9B7FD4', nav: 'contacts'     },
  gym:          { label: 'Gym & Health', icon: '🏋️', color: '#85B7EB', nav: null           },
}

const DEFAULT_GOALS = {
  dissertation: [
    { id: 'd1', text: 'PE pathway confirmed with faculty',         done: false },
    { id: 'd2', text: 'PoP + RQ settled; construct locked',        done: false },
    { id: 'd3', text: 'Draft critical-incident interview questions',done: false },
    { id: 'd4', text: 'G3 access gate cleared',                    done: true  },
  ],
  media: [
    { id: 'm1', text: 'Episode recorded this cycle (Week A)',       done: false },
    { id: 'm2', text: 'Newsletter sent this cycle (Week B)',        done: false },
    { id: 'm3', text: '3–4 shorts cut and queued',                 done: false },
    { id: 'm4', text: '3–5 relationship actions done',             done: false },
  ],
  business: [
    { id: 'b1', text: 'SOFt Skills framework drafted',             done: false },
    { id: 'b2', text: 'Dissertation defense completed',            done: false },
    { id: 'b3', text: 'First paid pilot identified',               done: false },
  ],
  gym: [
    { id: 'g1', text: 'Mon lift',                                  done: false },
    { id: 'g2', text: 'Wed lift',                                  done: false },
    { id: 'g3', text: 'Fri lift',                                  done: false },
    { id: 'g4', text: '7+ hrs sleep avg this week',                done: false },
  ],
}

// ── Ring component ───────────────────────────────────────────────────────────────

function GoalRing({ cat, goals, active, onClick }) {
  const { label, icon, color } = CATS[cat]
  const total = goals.length
  const done  = goals.filter(g => g.done).length
  const pct   = total > 0 ? done / total : 0
  const r     = 38
  const circ  = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
        active ? 'bg-[#0d1829]' : 'hover:bg-[#0a1628]'
      }`}
      style={active ? { outline: `1px solid ${color}44` } : {}}
    >
      <div className="relative" style={{ width: 84, height: 84 }}>
        <svg viewBox="0 0 96 96" width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle cx="48" cy="48" r={r} fill="none" stroke="#112040" strokeWidth="9" />
          {/* glow */}
          {pct > 0 && (
            <circle
              cx="48" cy="48" r={r}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              opacity="0.15"
            />
          )}
          {/* fill */}
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span className="text-[11px] font-bold leading-none" style={{ color }}>
            {Math.round(pct * 100)}%
          </span>
        </div>
      </div>
      <span className={`text-[10px] font-semibold transition-colors ${
        active ? 'text-white' : 'text-[#4a6080]'
      }`}>
        {label}
      </span>
    </button>
  )
}

// ── Expanded goals checklist ───────────────────────────────────────────────

function GoalsList({ cat, goals, onToggle, onNavigate }) {
  const { label, icon, color, nav } = CATS[cat]
  const done = goals.filter(g => g.done).length

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: color + '44' }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: color + '12' }}>
        <span>{icon}</span>
        <span className="text-xs font-bold text-white flex-1">{label}</span>
        <span className="text-[10px] font-medium" style={{ color }}>{done}/{goals.length}</span>
        {nav && (
          <button
            onClick={() => onNavigate(nav)}
            className="text-[10px] px-2 py-0.5 rounded-full border transition-colors hover:text-white"
            style={{ borderColor: color + '55', color }}
          >
            → open
          </button>
        )}
      </div>
      <div className="bg-[#0a1220] px-3 py-2 flex flex-col gap-2">
        {goals.map(g => (
          <label key={g.id} className="flex items-start gap-2 cursor-pointer group">
            <button
              onClick={e => { e.preventDefault(); onToggle(cat, g.id) }}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                g.done ? 'border-transparent' : 'border-[#2a4070] group-hover:border-[#4a6090]'
              }`}
              style={g.done ? { background: color } : {}}
            >
              {g.done && <span className="text-[#071020] text-[9px] leading-none font-black">✓</span>}
            </button>
            <span className={`text-xs leading-relaxed transition-colors ${
              g.done ? 'line-through text-[#2a4070]' : 'text-slate-300 group-hover:text-white'
            }`}>
              {g.text}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// ── Area card ───────────────────────────────────────────────────────────────────

function AreaCard({ title, icon, color, meta, nav, nextUp, onNavigate, onDblClick }) {
  return (
    <div
      onClick={() => nav && onNavigate(nav)}
      onDoubleClick={onDblClick}
      className={`border border-[#1e3a5f] rounded-2xl bg-[#0d1829] p-4 flex flex-col gap-3 transition-all group ${
        nav ? 'cursor-pointer hover:border-[#2a5080] hover:bg-[#0f1f38]' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider leading-tight flex-1">{title}</span>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      </div>
      <div className="flex flex-col gap-1.5 flex-1">
        {meta.map((m, i) => (
          <div key={i} className="flex items-center justify-between gap-2 min-w-0">
            <span className="text-[11px] text-[#4a6080] truncate">{m.label}</span>
            <span
              className="text-[11px] font-semibold shrink-0"
              style={{ color: m.color || '#7a9ab5' }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
      {/* Next up */}
      <div
        className="flex items-start gap-1.5 pt-2 border-t border-[#112040]"
        onClick={e => { e.stopPropagation(); onNavigate('next') }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 mt-px" style={{ color }}>Next</span>
        <span className="text-[11px] text-slate-400 leading-snug line-clamp-2 hover:text-white transition-colors">
          {nextUp || 'All clear ✓'}
        </span>
      </div>
    </div>
  )
}

// ── Overall progress ring ────────────────────────────────────────────────────

function OverallRing({ pct }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)
  const color = pct === 1 ? '#1D9E75' : '#c5a028'

  return (
    <div className="relative" style={{ width: 72, height: 72 }}>
      <svg viewBox="0 0 72 72" width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="#112040" strokeWidth="7" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none" style={{ color }}>
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[9px] text-[#3a5070] leading-none mt-0.5">goals</span>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────────

export default function CommandCenterScreen({ onNavigate }) {
  const weekKey = isoWeek()
  const weekCycle = load(`ll-cycle-${weekKey}`, autoWeekCycle(weekKey))

  const [goals, setGoals] = useState(() => load('ll-goals', DEFAULT_GOALS))
  const [activeCat, setActiveCat] = useState(null)

  function toggleGoal(cat, id) {
    setGoals(prev => {
      const next = {
        ...prev,
        [cat]: prev[cat].map(g => g.id === id ? { ...g, done: !g.done } : g),
      }
      save('ll-goals', next)
      return next
    })
  }

  function handleRingClick(cat) {
    setActiveCat(prev => prev === cat ? null : cat)
  }

  // Live data pulls
  const dissGates    = load('diss_gates', [])
  const dissActions  = load('diss_actions', [])
  const contacts     = load('contacts_list', [])
  const weekProgress = storage.getWeekProgress()[weekKey] || {}
  const weekDone     = Object.values(weekProgress).filter(Boolean).length

  // Next Up — top pending task per category
  const tasks = loadTasks()
  const pendingByCat = c => tasks.filter(t => t.cat === c && !t.done)
  const nextUp = c => pendingByCat(c)[0]?.text || null

  const gatesDone   = dissGates.filter(g => g.status === 'done').length
  const openActions = dissActions.filter(a => !a.done).length
  const mediaGoalsDone = goals.media.filter(g => g.done).length

  // Overall %
  const allGoals   = Object.values(goals).flat()
  const totalDone  = allGoals.filter(g => g.done).length
  const overallPct = allGoals.length > 0 ? totalDone / allGoals.length : 0

  const CARDS = [
    {
      title: 'Vision & Goals',
      icon: '🎯',
      color: '#c5a028',
      nav: 'dissertation',
      nextUp: nextUp('dissertation'),
      meta: [
        { label: 'Research gates',   value: `${gatesDone}/${dissGates.length}`,    color: gatesDone === dissGates.length ? '#1D9E75' : '#EF9F27' },
        { label: 'Open actions',     value: `${openActions} open`,                  color: openActions > 0 ? '#D85A30' : '#1D9E75' },
        { label: 'Overall goals',    value: `${Math.round(overallPct * 100)}%`,    color: '#c5a028' },
      ],
    },
    {
      title: 'Content OS',
      icon: '🎙️',
      color: '#5DCAA5',
      nav: 'weekly',
      nextUp: nextUp('media'),
      meta: [
        { label: 'This week',        value: `Week ${weekCycle} · ${weekCycle === 'A' ? 'Record' : 'Write & Slice'}`, color: '#5DCAA5' },
        { label: 'Daily tasks done', value: `${weekDone} checked` },
        { label: 'Media goals',      value: `${mediaGoalsDone}/${goals.media.length}` },
      ],
    },
    {
      title: 'Product & Client',
      icon: '💼',
      color: '#9B7FD4',
      nav: 'contacts',
      nextUp: nextUp('business'),
      meta: [
        { label: 'Status',           value: 'Pre-launch',          color: '#9B7FD4' },
        { label: 'Firewall',         value: 'Active — DiP first',  color: '#D85A30' },
        { label: 'Contacts',         value: `${contacts.length} in CRM` },
      ],
    },
    {
      title: 'Personal OS',
      icon: '⚡',
      color: '#85B7EB',
      nav: null,
      nextUp: nextUp('gym'),
      meta: [
        {
          label: 'Gym this week',
          value: `${goals.gym.filter(g => ['g1','g2','g3'].includes(g.id) && g.done).length}/3 sessions`,
          color: goals.gym.filter(g => ['g1','g2','g3'].includes(g.id) && g.done).length >= 3 ? '#1D9E75' : '#85B7EB',
        },
        {
          label: 'Sleep',
          value: goals.gym.find(g => g.id === 'g4')?.done ? '✓ On track' : 'Track tonight',
          color: goals.gym.find(g => g.id === 'g4')?.done ? '#1D9E75' : '#4a6080',
        },
        { label: 'Workload cap', value: '≤ 12 hr / wk on brand' },
      ],
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Command Center</h1>
            <p className="text-xs text-[#4a6080] mt-0.5 font-mono">
              {weekKey.replace('-W', ' · W')} &nbsp;·&nbsp; Week {weekCycle} &nbsp;·&nbsp; {Math.round(overallPct * 100)}% complete
            </p>
          </div>
          <OverallRing pct={overallPct} />
        </div>

        {/* Body */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Left: 2×2 area cards */}
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CARDS.map((card, i) => (
              <AreaCard
                key={i}
                {...card}
                onNavigate={onNavigate}
                onDblClick={() => {
                  const cat = ['dissertation', 'media', 'business', 'gym'][i]
                  setActiveCat(prev => prev === cat ? null : cat)
                }}
              />
            ))}
          </div>

          {/* Right: rings + expanded goals */}
          <div className="lg:w-60 shrink-0 flex flex-col gap-4">

            {/* Ring grid */}
            <div className="border border-[#1e3a5f] rounded-2xl bg-[#0d1829] p-3">
              <p className="text-[10px] uppercase tracking-widest text-[#2a4070] font-semibold mb-3 px-1">
                Goal rings — click to expand
              </p>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(CATS).map(cat => (
                  <GoalRing
                    key={cat}
                    cat={cat}
                    goals={goals[cat] || []}
                    active={activeCat === cat}
                    onClick={() => handleRingClick(cat)}
                  />
                ))}
              </div>
            </div>

            {/* Expanded goals */}
            {activeCat && (
              <GoalsList
                cat={activeCat}
                goals={goals[activeCat] || []}
                onToggle={toggleGoal}
                onNavigate={onNavigate}
              />
            )}

            {!activeCat && (
              <div className="text-[11px] text-[#2a4070] text-center py-2">
                Click a ring to see goals
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
