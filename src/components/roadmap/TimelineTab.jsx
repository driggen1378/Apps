import { useRef, useState } from 'react'
import { ZOOM_CELL_WIDTH, GANTT_ROW_HEIGHT, GANTT_LABEL_WIDTH, TAG_COLORS } from './constants'

// ── Time helpers ──────────────────────────────────────────────────────────────

function startOfWeek(d) {
  const dt = new Date(d)
  const day = dt.getDay()
  dt.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
  dt.setHours(0, 0, 0, 0)
  return dt
}
function startOfMonth(d) {
  const dt = new Date(d); dt.setDate(1); dt.setHours(0, 0, 0, 0); return dt
}
function startOfQuarter(d) {
  const dt = new Date(d)
  dt.setMonth(Math.floor(dt.getMonth() / 3) * 3, 1)
  dt.setHours(0, 0, 0, 0)
  return dt
}
function addWeeks(d, n) { const dt = new Date(d); dt.setDate(dt.getDate() + n * 7); return dt }
function addMonths(d, n) { const dt = new Date(d); dt.setMonth(dt.getMonth() + n); return dt }
function addQuarters(d, n) { return addMonths(d, n * 3) }

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const Q_LABEL = ['Q1', 'Q2', 'Q3', 'Q4']

function getColumns(timelineStart, timelineEnd, zoom) {
  const cols = []
  let cur

  if (zoom === 'weeks') {
    cur = startOfWeek(timelineStart)
    while (cur < timelineEnd) {
      const next = addWeeks(cur, 1)
      const weekNum = Math.ceil((cur - new Date(cur.getFullYear(), 0, 1)) / 604800000)
      cols.push({ label: `W${weekNum}`, sublabel: `${MONTH_SHORT[cur.getMonth()]} ${cur.getDate()}`, start: new Date(cur), end: next })
      cur = next
    }
  } else if (zoom === 'months') {
    cur = startOfMonth(timelineStart)
    while (cur < timelineEnd) {
      const next = addMonths(cur, 1)
      cols.push({ label: MONTH_SHORT[cur.getMonth()], sublabel: String(cur.getFullYear()), start: new Date(cur), end: next })
      cur = next
    }
  } else { // quarters
    cur = startOfQuarter(timelineStart)
    while (cur < timelineEnd) {
      const next = addQuarters(cur, 1)
      cols.push({ label: Q_LABEL[Math.floor(cur.getMonth() / 3)], sublabel: String(cur.getFullYear()), start: new Date(cur), end: next })
      cur = next
    }
  }
  return cols
}

// Group columns into upper-header groups
function getUpperHeaders(cols, zoom) {
  if (zoom === 'weeks') {
    // Group by month
    const groups = []
    for (const col of cols) {
      const key = `${MONTH_SHORT[col.start.getMonth()]} ${col.start.getFullYear()}`
      if (!groups.length || groups[groups.length - 1].label !== key) {
        groups.push({ label: key, count: 1 })
      } else {
        groups[groups.length - 1].count++
      }
    }
    return groups
  } else if (zoom === 'months') {
    // Group by year
    const groups = []
    for (const col of cols) {
      const key = String(col.start.getFullYear())
      if (!groups.length || groups[groups.length - 1].label !== key) {
        groups.push({ label: key, count: 1 })
      } else {
        groups[groups.length - 1].count++
      }
    }
    return groups
  } else {
    // Group by year
    const groups = []
    for (const col of cols) {
      const key = String(col.start.getFullYear())
      if (!groups.length || groups[groups.length - 1].label !== key) {
        groups.push({ label: key, count: 1 })
      } else {
        groups[groups.length - 1].count++
      }
    }
    return groups
  }
}

function barStyle(startDate, dueDate, timelineStart, timelineEnd, cellWidth, colCount) {
  if (!startDate || !dueDate) return null
  const totalMs = timelineEnd - timelineStart
  const totalPx = colCount * cellWidth
  if (totalMs <= 0) return null
  const s = Math.max(new Date(startDate) - timelineStart, 0)
  const e = Math.min(new Date(dueDate) - timelineStart, totalMs)
  if (e <= s) return null
  return {
    left: Math.round((s / totalMs) * totalPx),
    width: Math.max(Math.round(((e - s) / totalMs) * totalPx), 6),
  }
}

// ── Row types ─────────────────────────────────────────────────────────────────

const ROW_STYLES = {
  objective: { bg: 'bg-slate-600', label: 'text-white font-semibold', indent: 0 },
  keyResult: { bg: 'bg-blue-700', label: 'text-slate-200 font-medium', indent: 16 },
  target:    { bg: 'bg-green-700', label: 'text-slate-300', indent: 32 },
}

function GanttRow({ row, timelineStart, timelineEnd, cellWidth, colCount, totalPx, collapsed, onToggle }) {
  const style = ROW_STYLES[row.type]
  const bar = barStyle(row.startDate, row.dueDate, timelineStart, timelineEnd, cellWidth, colCount)

  return (
    <div className="flex shrink-0 border-b border-[#1a1d2e] group"
      style={{ height: GANTT_ROW_HEIGHT }}>

      {/* Label */}
      <div className="shrink-0 flex items-center gap-2 px-3 border-r border-[#1a1d2e] overflow-hidden bg-[#0f1117]"
        style={{ width: GANTT_LABEL_WIDTH, paddingLeft: style.indent + 12 }}>
        {row.type !== 'target' && (
          <button onClick={() => onToggle(row.id)}
            className="text-slate-700 hover:text-slate-400 transition-colors text-xs leading-none shrink-0 w-3">
            {collapsed ? '▶' : '▼'}
          </button>
        )}
        <span className={`text-xs truncate ${style.label}`}>{row.title}</span>
        {row.tags?.[0] && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full border capitalize shrink-0 ${TAG_COLORS[row.tags[0]] || ''}`}>
            {row.tags[0]}
          </span>
        )}
      </div>

      {/* Bar area */}
      <div className="flex-1 relative overflow-hidden" style={{ width: totalPx }}>
        {/* Grid lines */}
        {Array.from({ length: colCount }).map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-r border-[#1a1d2e]"
            style={{ left: (i + 1) * cellWidth - 1 }} />
        ))}

        {/* Today line */}
        {(() => {
          const todayMs = Date.now() - timelineStart
          const totalMs = timelineEnd - timelineStart
          if (todayMs >= 0 && todayMs <= totalMs) {
            const x = Math.round((todayMs / totalMs) * totalPx)
            return <div className="absolute top-0 bottom-0 w-px bg-amber-500/60 z-10" style={{ left: x }} />
          }
        })()}

        {/* Bar */}
        {bar && (
          <div className={`absolute top-1/2 -translate-y-1/2 rounded ${style.bg} opacity-80 group-hover:opacity-100 transition-opacity`}
            style={{ left: bar.left, width: bar.width, height: 20 }}
            title={`${row.title} · ${row.startDate} → ${row.dueDate}`}>
            <span className="text-white text-xs px-1.5 leading-5 truncate block" style={{ lineHeight: '20px' }}>
              {bar.width > 60 ? row.title : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TimelineTab({ roadmap }) {
  const { objectives, keyResults, targets } = roadmap
  const [zoom, setZoom] = useState('months')
  const [collapsed, setCollapsed] = useState({}) // id -> bool
  const scrollRef = useRef(null)
  const cellWidth = ZOOM_CELL_WIDTH[zoom]

  // Determine timeline range from all items with dates
  const allDates = [...objectives, ...keyResults, ...targets]
    .filter(i => i.startDate && i.dueDate)
    .flatMap(i => [new Date(i.startDate), new Date(i.dueDate)])

  const now = new Date()
  const rawStart = allDates.length ? new Date(Math.min(...allDates)) : new Date(now.getFullYear(), 0, 1)
  const rawEnd = allDates.length
    ? new Date(Math.max(...allDates))
    : new Date(now.getFullYear() + 1, 11, 31)

  // Snap boundaries outward
  const snapStart = zoom === 'quarters' ? startOfQuarter(rawStart) : zoom === 'months' ? startOfMonth(rawStart) : startOfWeek(rawStart)
  const snapEnd = zoom === 'quarters'
    ? addQuarters(startOfQuarter(rawEnd), 1)
    : zoom === 'months'
    ? addMonths(startOfMonth(rawEnd), 1)
    : addWeeks(startOfWeek(rawEnd), 1)

  const columns = getColumns(snapStart, snapEnd, zoom)
  const upperHeaders = getUpperHeaders(columns, zoom)
  const timelineStart = snapStart.getTime()
  const timelineEnd = snapEnd.getTime()
  const totalPx = columns.length * cellWidth

  function toggleCollapsed(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Build flat row list
  const rows = []
  for (const obj of objectives) {
    rows.push({ ...obj, type: 'objective' })
    if (!collapsed[obj.id]) {
      const krs = keyResults.filter(kr => kr.objectiveId === obj.id)
      for (const kr of krs) {
        rows.push({ ...kr, type: 'keyResult' })
        if (!collapsed[kr.id]) {
          const tgts = targets.filter(t => t.keyResultId === kr.id)
          for (const tgt of tgts) {
            rows.push({ ...tgt, type: 'target' })
          }
        }
      }
    }
  }

  const UPPER_H = 28
  const LOWER_H = 28

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[#1e2130] shrink-0">
        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Zoom</span>
        {['quarters', 'months', 'weeks'].map(z => (
          <button key={z} onClick={() => setZoom(z)}
            className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
              zoom === z ? 'border-white text-white bg-white/8' : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300'
            }`}>
            {z}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-slate-600 inline-block" /> Objective</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-blue-700 inline-block" /> Key Result</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded bg-green-700 inline-block" /> Target</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-amber-500 inline-block" /> Today</span>
        </div>
      </div>

      {objectives.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-600">No items with dates. Add objectives in the Board tab first.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto" ref={scrollRef}>
          <div className="flex" style={{ minWidth: GANTT_LABEL_WIDTH + totalPx }}>

            {/* Sticky label column */}
            <div className="shrink-0 sticky left-0 z-20 bg-[#0f1117]" style={{ width: GANTT_LABEL_WIDTH }}>
              {/* Upper header spacer */}
              <div className="border-b border-[#2a2d3e] bg-[#0c0e18]" style={{ height: UPPER_H }} />
              {/* Lower header spacer */}
              <div className="border-b border-[#2a2d3e] bg-[#0c0e18]" style={{ height: LOWER_H }}>
                <span className="text-xs text-slate-600 px-3 leading-7 block">Item</span>
              </div>
            </div>

            {/* Scrollable chart area */}
            <div className="flex-1" style={{ width: totalPx }}>
              {/* Upper header: years / quarters / months */}
              <div className="flex border-b border-[#2a2d3e] bg-[#0c0e18] sticky top-0 z-10"
                style={{ height: UPPER_H }}>
                {upperHeaders.map((g, i) => (
                  <div key={i} className="border-r border-[#2a2d3e] flex items-center px-2 overflow-hidden shrink-0"
                    style={{ width: g.count * cellWidth, height: UPPER_H }}>
                    <span className="text-xs text-slate-400 font-medium truncate">{g.label}</span>
                  </div>
                ))}
              </div>

              {/* Lower header: quarters / months / weeks */}
              <div className="flex border-b border-[#2a2d3e] bg-[#0c0e18] sticky z-10"
                style={{ height: LOWER_H, top: UPPER_H }}>
                {columns.map((col, i) => (
                  <div key={i} className="border-r border-[#1a1d2e] flex flex-col items-center justify-center shrink-0 overflow-hidden"
                    style={{ width: cellWidth, height: LOWER_H }}>
                    <span className="text-xs text-slate-400 font-medium leading-tight">{col.label}</span>
                    {col.sublabel && zoom === 'weeks' && (
                      <span className="text-xs text-slate-700 leading-tight">{col.sublabel}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {rows.map(row => (
                <GanttRow
                  key={row.id}
                  row={row}
                  timelineStart={timelineStart}
                  timelineEnd={timelineEnd}
                  cellWidth={cellWidth}
                  colCount={columns.length}
                  totalPx={totalPx}
                  collapsed={!!collapsed[row.id]}
                  onToggle={toggleCollapsed}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
