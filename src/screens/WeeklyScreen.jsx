import { useState } from 'react'
import { storage } from '../lib/storage'
import { loadTasks, saveTasks, getWorkflow } from '../lib/tasks'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const y = d.getUTCFullYear()
  const yearStart = new Date(Date.UTC(y, 0, 1))
  const wk = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${y}-W${wk.toString().padStart(2, '0')}`
}

// Reference: W25 of 2026 = Week A. Alternates every week.
function autoWeekType(weekKey) {
  const [yr, wk] = weekKey.split('-W').map(Number)
  const diff = (yr - 2026) * 52 + (wk - 25)
  return Math.abs(diff) % 2 === 0 ? 'A' : 'B'
}

// 0=Mon…3=Thu maps to Day 1–4; weekend = -1
function todayIndex() {
  const day = new Date().getDay()
  return day >= 1 && day <= 4 ? day - 1 : -1
}

function lsGet(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)) }

// ── Schedule definition ───────────────────────────────────────────────────────

const DAYS_A = [
  {
    name: 'Deep Work',
    sub: 'Dissertation + IP',
    timeEst: '3–4 hr',
    icon: '🎓',
    workflow: 'diss-protocol',
    tasks: [
      { text: 'One dissertation move toward next open checklist item', nav: 'dissertation' },
      { text: 'IP development — build the framework or argument behind this cycle\'s premise', nav: 'ideas' },
      { text: 'Review Roadmap: are gates on track?', nav: 'roadmap' },
    ],
  },
  {
    name: 'Record',
    sub: 'Week A — flagship',
    timeEst: '2–3 hr',
    icon: '🎙️',
    workflow: 'record',
    tasks: [
      { text: 'Pick this cycle\'s one core question or premise — log it in Ideas', nav: 'ideas' },
      { text: 'Prep the guest: read their material, write a one-page brief + 8–10 custom questions', nav: 'create' },
      { text: 'Record long-form — genuinely curious, let it breathe, no script' },
    ],
  },
  {
    name: 'Capture',
    sub: 'Post-record + short-form',
    timeEst: '1–2 hr',
    icon: '📥',
    workflow: 'capture',
    tasks: [
      { text: '10–15 min capture: notes on what struck you as useful or new from the conversation', nav: 'bank' },
      { text: 'Ship 2–3 short-form posts (drive each to email list)' },
      { text: 'Stage show notes while the episode is fresh', nav: 'create' },
    ],
  },
  {
    name: 'Relationships',
    sub: 'Network + review',
    timeEst: '1–2 hr',
    icon: '🤝',
    workflow: 'connect',
    tasks: [
      { text: '3–5 relationship actions: comment, DM, or voice note to a contact', nav: 'contacts' },
      { text: 'Pitch as guest on one adjacent show' },
      { text: 'Add one recurring audience/guest problem to Patterns Log', nav: 'contacts' },
      { text: '10-min weekly review: DiP move done? Content shipped? List growing? Firewall hold?', nav: 'dissertation' },
    ],
  },
]

const DAYS_B = [
  {
    name: 'Deep Work',
    sub: 'Dissertation + IP',
    timeEst: '3–4 hr',
    icon: '🎓',
    workflow: 'diss-protocol',
    tasks: [
      { text: 'One dissertation move toward next open checklist item', nav: 'dissertation' },
      { text: 'IP development — refine the argument from this cycle\'s recording', nav: 'ideas' },
      { text: 'Review Roadmap: are gates on track?', nav: 'roadmap' },
    ],
  },
  {
    name: 'Write',
    sub: 'Week B — newsletter',
    timeEst: '2–3 hr',
    icon: '✍️',
    workflow: 'write',
    tasks: [
      { text: 'Write newsletter from transcript + capture notes (800–1,500 words)', nav: 'create' },
      { text: 'Publish on fixed day — no exceptions; drive to email list' },
      { text: 'Expand show notes into a light blog post', nav: 'create' },
    ],
  },
  {
    name: 'Slice',
    sub: 'Clip engine + distribute',
    timeEst: '2 hr',
    icon: '✂️',
    workflow: 'slice',
    tasks: [
      { text: 'Run Clip, Short & Title Engine: cut 1–2 long clips (2–19 min)', nav: 'create' },
      { text: 'Cut 3–4+ shorts (<60 s) — surface more candidates than you\'ll use', nav: 'create' },
      { text: 'Ship 2–3 short-form posts; stage remaining clips in scheduling queue' },
    ],
  },
  {
    name: 'Relationships',
    sub: 'Network + review',
    timeEst: '1–2 hr',
    icon: '🤝',
    workflow: 'connect',
    tasks: [
      { text: '3–5 relationship actions: comment, DM, or voice note to a contact', nav: 'contacts' },
      { text: 'Pitch as guest on one adjacent show' },
      { text: 'Add one recurring audience/guest problem to Patterns Log', nav: 'contacts' },
      { text: '10-min weekly review: DiP move done? Content shipped? List growing? Firewall hold?', nav: 'dissertation' },
    ],
  },
]

const NAV_LABELS = {
  ideas: 'Ideas',
  create: 'Create',
  roadmap: 'Launch Plan',
  bank: 'Bank',
  contacts: 'Contacts',
  dissertation: 'Dissertation',
}

// ── Quick capture ─────────────────────────────────────────────────────────────

function QuickCapture() {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    const t = text.trim()
    if (!t) return
    storage.setBoard([{
      id: Date.now(),
      type: 'capture',
      bucket: 'lens',
      title: t.slice(0, 80) + (t.length > 80 ? '…' : ''),
      text: t,
      source: 'Weekly capture',
      date: new Date().toISOString(),
    }, ...storage.getBoard()])
    setText('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mt-4 border border-[#1e3a5f] rounded-xl px-5 py-4 bg-[#0d1829] flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-white">Quick capture</p>
        <p className="text-xs text-[#4a6080] mt-0.5">Observation, reframe, or seed — saved to Ideas board.</p>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save() }}
        placeholder="What struck you as useful or new..."
        rows={3}
        className="w-full bg-[#0a1628] border border-[#2a4070] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a6090] transition-colors"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#3a5070]">Cmd+Enter to save</span>
        <button
          onClick={save}
          disabled={!text.trim()}
          className="px-4 py-2 bg-[#c5a028] text-[#071020] text-sm font-semibold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saved ? '✓ Saved' : 'Save →'}
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function WeeklyScreen({ onNavigate }) {
  const weekKey = isoWeek()
  const today = todayIndex()

  const [cycle, setCycle] = useState(() => lsGet(`ll-cycle-${weekKey}`, autoWeekType(weekKey)))

  function toggleCycle() {
    const next = cycle === 'A' ? 'B' : 'A'
    setCycle(next)
    lsSet(`ll-cycle-${weekKey}`, next)
  }

  const [progress, setProgress] = useState(() => {
    const all = storage.getWeekProgress()
    return all[weekKey] || {}
  })

  function toggle(key) {
    setProgress(prev => {
      const next = { ...prev, [key]: !prev[key] }
      const all = storage.getWeekProgress()
      storage.setWeekProgress({ ...all, [weekKey]: next })
      return next
    })
  }

  function resetWeek() {
    const all = storage.getWeekProgress()
    delete all[weekKey]
    storage.setWeekProgress(all)
    setProgress({})
  }

  // Tasks pulled in from Next Up (inWeek && !done)
  const [tasks, setTasks] = useState(loadTasks)
  const injected = tasks.filter(t => t.inWeek && !t.done)

  function completeInjected(id) {
    const next = tasks.map(t => t.id === id ? { ...t, done: true } : t)
    setTasks(next)
    saveTasks(next)
  }
  function removeFromWeek(id) {
    const next = tasks.map(t => t.id === id ? { ...t, inWeek: false } : t)
    setTasks(next)
    saveTasks(next)
  }

  const days = cycle === 'A' ? DAYS_A : DAYS_B
  const totalTasks = days.reduce((s, d) => s + d.tasks.length, 0)
  const doneTasks = days.reduce((s, d, di) => s + d.tasks.filter((_, ti) => progress[`d${di}t${ti}`]).length, 0)
  const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0">

        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-white tracking-tight">Weekly Engine</h1>
              <button
                onClick={toggleCycle}
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase border transition-all ${
                  cycle === 'A'
                    ? 'bg-[#1a1800] border-[#c5a028] text-[#c5a028]'
                    : 'bg-[#0f2040] border-[#5DCAA5] text-[#5DCAA5]'
                }`}
              >
                Week {cycle} {cycle === 'A' ? '· Record' : '· Write & Slice'}
              </button>
            </div>
            <p className="text-xs text-[#4a6080] mt-1 font-mono">
              {weekKey.replace('-W', ' · W')} &nbsp;·&nbsp; {doneTasks}/{totalTasks} tasks &nbsp;·&nbsp; {pct}%
            </p>
          </div>
          <button
            onClick={resetWeek}
            className="text-xs text-slate-600 hover:text-slate-300 border border-[#1e3a5f] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
          >
            Reset week
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-1.5 rounded-full bg-[#0d1829] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: pct === 100 ? '#1D9E75' : '#c5a028' }}
          />
        </div>

        {/* 4 day cards */}
        <div className="overflow-x-auto pb-2">
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(4, minmax(190px, 1fr))', minWidth: '800px' }}>
            {days.map((day, di) => {
              const isToday = di === today
              const allDone = day.tasks.every((_, ti) => progress[`d${di}t${ti}`])

              return (
                <div key={di} className={`flex flex-col rounded-xl border overflow-hidden transition-all ${
                  isToday
                    ? 'border-[#c5a028] shadow-[0_0_0_1px_rgba(197,160,40,0.12)]'
                    : allDone
                    ? 'border-[#1D9E75]/40'
                    : 'border-[#1e3a5f]'
                }`}>
                  {/* Card header */}
                  <div className={`px-4 py-3 border-b ${
                    isToday ? 'bg-[#1a1800] border-[#c5a028]/25' : 'bg-[#0d1829] border-[#1e3a5f]'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base">{day.icon}</span>
                      {isToday && <span className="text-[10px] text-[#c5a028] font-semibold uppercase tracking-widest">Today</span>}
                      {allDone && !isToday && <span className="text-[10px] text-[#1D9E75] font-semibold uppercase tracking-widest">Done ✓</span>}
                    </div>
                    <p className={`text-sm font-semibold mt-1 leading-tight ${isToday ? 'text-[#c5a028]' : allDone ? 'text-slate-500' : 'text-white'}`}>
                      {day.name}
                    </p>
                    <p className="text-[11px] text-[#4a6080] mt-0.5">{day.sub}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-block text-[10px] text-slate-600 bg-[#0a1628] border border-[#1e3a5f] px-2 py-0.5 rounded-full font-mono">
                        {day.timeEst}
                      </span>
                      {day.workflow && (
                        <button
                          onClick={() => onNavigate('workflows', day.workflow)}
                          className="text-[10px] text-[#5DCAA5]/70 hover:text-[#5DCAA5] transition-colors"
                        >
                          workflow →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className={`flex flex-col px-3 py-3 gap-2.5 flex-1 ${isToday ? 'bg-[#0f1510]' : 'bg-[#0a1220]'}`}>
                    {day.tasks.map((task, ti) => {
                      const key = `d${di}t${ti}`
                      const checked = !!progress[key]
                      return (
                        <div key={ti} className="flex items-start gap-2">
                          <button
                            onClick={() => toggle(key)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              checked
                                ? 'bg-[#c5a028] border-[#c5a028]'
                                : isToday
                                ? 'border-[#c5a028]/40 hover:border-[#c5a028]'
                                : 'border-[#2a4070] hover:border-[#4a6090]'
                            }`}
                          >
                            {checked && <span className="text-[#071020] text-[9px] leading-none font-black">✓</span>}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${checked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                              {task.text}
                            </p>
                            {task.nav && NAV_LABELS[task.nav] && (
                              <button
                                onClick={() => onNavigate(task.nav)}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#c5a028]/50 hover:text-[#c5a028] transition-colors"
                              >
                                <span>→</span>
                                <span>{NAV_LABELS[task.nav]}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Added this week — pulled from Next Up */}
        {injected.length > 0 && (
          <div className="mt-5 border border-[#5DCAA5]/30 rounded-xl bg-[#0d1829] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#5DCAA5]/20 bg-[#5DCAA5]/8 flex items-center gap-2">
              <span className="text-[#5DCAA5] text-xs font-bold uppercase tracking-wider">Added this week</span>
              <span className="text-[10px] text-[#4a6080]">from Next Up</span>
            </div>
            <div className="px-3 py-3 flex flex-col gap-2.5">
              {injected.map(t => {
                const wf = t.workflow ? getWorkflow(t.workflow) : null
                return (
                  <div key={t.id} className="flex items-start gap-2.5">
                    <button
                      onClick={() => completeInjected(t.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#2a4070] hover:border-[#5DCAA5] flex items-center justify-center shrink-0 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{t.text}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {wf && (
                          <button
                            onClick={() => onNavigate('workflows', t.workflow)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#5DCAA5]/70 hover:text-[#5DCAA5] transition-colors"
                          >
                            <span>{wf.icon}</span>
                            <span>{wf.title} →</span>
                          </button>
                        )}
                        <button
                          onClick={() => removeFromWeek(t.id)}
                          className="text-[10px] text-[#3a5070] hover:text-[#7a9ab5] transition-colors"
                        >
                          remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cycle legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-[#4a6080]">
            <span className="w-2 h-2 rounded-full bg-[#c5a028] inline-block" />
            Week A: Pick premise → Prep guest → Record → Capture
          </div>
          <div className="flex items-center gap-2 text-xs text-[#4a6080]">
            <span className="w-2 h-2 rounded-full bg-[#5DCAA5] inline-block" />
            Week B: Deep work → Write newsletter → Clip engine → Relationships
          </div>
        </div>

        <QuickCapture />

      </div>
    </div>
  )
}
