import { useState } from 'react'
import { storage } from '../lib/storage'

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const y = d.getUTCFullYear()
  const yearStart = new Date(Date.UTC(y, 0, 1))
  const wk = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${y}-W${wk.toString().padStart(2, '0')}`
}

// 0=Mon … 4=Fri, -1=weekend
function todayIndex() {
  const day = new Date().getDay()
  return day >= 1 && day <= 5 ? day - 1 : -1
}

const NAV_LABELS = { ideas: 'Ideas', create: 'Create', roadmap: 'Roadmap', archive: 'Archive' }

// ── Main component ─────────────────────────────────────────────────────────────

export default function WeeklyScreen({ onNavigate }) {
  const weekKey = isoWeek()
  const today = todayIndex()

  // Re-read schedule each render so settings changes are reflected immediately
  const schedule = storage.getSchedule()

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

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{schedule.title}</h1>
            <p className="text-xs text-[#4a6080] mt-0.5 font-mono">{weekKey.replace('-', ' · ')}</p>
          </div>
          <button onClick={resetWeek}
            className="text-xs text-slate-600 hover:text-slate-300 border border-[#1e3a5f] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
            Reset week
          </button>
        </div>

        {/* Day columns */}
        <div className="overflow-x-auto pb-2">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${schedule.days.length}, minmax(180px, 1fr))`, minWidth: `${schedule.days.length * 190}px` }}>
            {schedule.days.map((day, di) => {
              const isToday = di === today
              const allDone = day.tasks.length > 0 && day.tasks.every((_, ti) => progress[`d${di}t${ti}`])

              return (
                <div key={di} className={`flex flex-col rounded-xl border overflow-hidden transition-all ${
                  isToday
                    ? 'border-[#c5a028] shadow-[0_0_0_1px_rgba(197,160,40,0.15)]'
                    : 'border-[#1e3a5f]'
                }`}>
                  {/* Day header */}
                  <div className={`px-4 py-3 border-b ${isToday ? 'bg-[#1a1800] border-[#c5a028]/25' : 'bg-[#0d1829] border-[#1e3a5f]'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-600 font-mono">Day {di + 1}</p>
                      {isToday && <span className="text-[10px] text-[#c5a028] font-semibold uppercase tracking-widest">Today</span>}
                      {allDone && !isToday && <span className="text-[10px] text-green-500 font-semibold uppercase tracking-widest">Done</span>}
                    </div>
                    <p className={`text-sm font-semibold mt-0.5 leading-tight ${isToday ? 'text-[#c5a028]' : allDone ? 'text-slate-500' : 'text-white'}`}>
                      {day.name}
                    </p>
                    <span className="inline-block mt-1.5 text-xs text-slate-600 bg-[#0a1628] border border-[#1e3a5f] px-2 py-0.5 rounded-full">
                      {day.timeEst}
                    </span>
                  </div>

                  {/* Tasks */}
                  <div className={`flex flex-col px-3 py-3 gap-2.5 flex-1 ${isToday ? 'bg-[#0f1510]' : 'bg-[#0a1220]'}`}>
                    {day.tasks.map((task, ti) => {
                      const key = `d${di}t${ti}`
                      const checked = !!progress[key]
                      return (
                        <div key={ti} className="flex items-start gap-2">
                          <button onClick={() => toggle(key)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              checked
                                ? 'bg-[#c5a028] border-[#c5a028]'
                                : isToday
                                ? 'border-[#c5a028]/40 hover:border-[#c5a028]'
                                : 'border-[#2a4070] hover:border-[#4a6090]'
                            }`}>
                            {checked && <span className="text-[#071020] text-[9px] leading-none font-black">✓</span>}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${checked ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                              {task.text}
                            </p>
                            {task.nav && NAV_LABELS[task.nav] && (
                              <button onClick={() => onNavigate(task.nav)}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#c5a028]/50 hover:text-[#c5a028] transition-colors">
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

        {/* Weekly capture task */}
        {schedule.captureTask && (
          <div className="mt-3 flex items-center gap-3 border border-[#1e3a5f] rounded-xl px-5 py-4 bg-[#0d1829]">
            <button onClick={() => toggle('capture')}
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                progress.capture ? 'bg-[#c5a028] border-[#c5a028]' : 'border-[#2a4070] hover:border-[#c5a028]/60'
              }`}>
              {progress.capture && <span className="text-[#071020] text-[9px] leading-none font-black">✓</span>}
            </button>
            <p className={`text-sm flex-1 ${progress.capture ? 'line-through text-slate-600' : 'text-slate-300'}`}>
              {schedule.captureTask.text}
            </p>
            {schedule.captureTask.nav && NAV_LABELS[schedule.captureTask.nav] && (
              <button onClick={() => onNavigate(schedule.captureTask.nav)}
                className="inline-flex items-center gap-1.5 text-xs text-[#c5a028]/50 hover:text-[#c5a028] transition-colors shrink-0">
                <span>→</span>
                <span>{NAV_LABELS[schedule.captureTask.nav]}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
