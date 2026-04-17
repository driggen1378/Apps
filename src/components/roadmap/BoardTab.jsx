import { useState } from 'react'
import ItemModal from './ItemModal'
import { TAG_COLORS, PRIORITY_COLORS, STATUS_COLORS, TRACK_COLORS, PRIORITY_LABELS, STATUS_LABELS, TRACK_LABELS } from './constants'

// ── Quarter helpers ────────────────────────────────────────────────────────────

function currentQuarter() {
  return Math.floor(new Date().getMonth() / 3) + 1
}
function currentYear() {
  return new Date().getFullYear()
}
function dateInQuarter(dateStr, q, year) {
  if (!dateStr) return true
  const d = new Date(dateStr)
  return d.getFullYear() === year && Math.floor(d.getMonth() / 3) + 1 === q
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-[#2a2d3e] rounded-full overflow-hidden">
        <div className="h-full bg-slate-400 rounded-full transition-all duration-500"
          style={{ width: `${value || 0}%` }} />
      </div>
      <span className="text-xs text-slate-500 font-mono w-8 text-right">{value || 0}%</span>
    </div>
  )
}

function TagList({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {tags.map(t => (
        <span key={t} className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
      ))}
    </div>
  )
}

// ── Objective column ───────────────────────────────────────────────────────────

function ObjColumn({ obj, onEdit, onDelete, onAddKR }) {
  return (
    <div className="flex flex-col p-5 gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600 font-mono mb-1">{obj.id}</p>
          <p className="text-base font-semibold text-white leading-snug">{obj.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          <button onClick={() => onEdit(obj)}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-white/5">✎</button>
          <button onClick={() => onDelete(obj.id)}
            className="text-slate-700 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10">✕</button>
        </div>
      </div>

      {obj.description && (
        <p className="text-sm text-slate-400 leading-relaxed">{obj.description}</p>
      )}
      <TagList tags={obj.tags} />
      {obj.dueDate && <p className="text-xs text-slate-600">Due {obj.dueDate}</p>}
      <ProgressBar value={obj.progress} />

      {/* Prominent Add KR button */}
      <button onClick={() => onAddKR(obj)}
        className="mt-auto flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-[#2a3a50] hover:border-[#4a6080] text-slate-600 hover:text-slate-300 text-sm transition-all">
        <span className="text-base leading-none">+</span>
        <span>Add Key Result</span>
      </button>
    </div>
  )
}

// ── Key Result column ──────────────────────────────────────────────────────────

function KRColumn({ kr, onEdit, onDelete, onAddTarget }) {
  return (
    <div className="flex flex-col p-4 gap-2 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600 font-mono mb-0.5">{kr.id}</p>
          <p className="text-sm font-semibold text-slate-100 leading-snug">{kr.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(kr)}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-white/5">✎</button>
          <button onClick={() => onDelete(kr.id)}
            className="text-slate-700 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10">✕</button>
        </div>
      </div>

      {kr.description && (
        <p className="text-xs text-slate-500 leading-relaxed">{kr.description}</p>
      )}
      <TagList tags={kr.tags} />
      {kr.dueDate && <p className="text-xs text-slate-600">Due {kr.dueDate}</p>}
      <ProgressBar value={kr.progress} />

      <button onClick={() => onAddTarget(kr)}
        className="mt-auto flex items-center gap-1.5 w-full px-3 py-1.5 rounded-lg border border-dashed border-[#2a3a50] hover:border-[#4a6080] text-slate-600 hover:text-slate-300 text-xs transition-all">
        <span className="leading-none">+</span>
        <span>Add Target</span>
      </button>
    </div>
  )
}

// ── Target row ─────────────────────────────────────────────────────────────────

function TargetRow({ target, onEdit, onDelete, onToggle, onIncrement, onDecrement }) {
  const isNumeric = (target.total || 0) > 0
  const done = isNumeric ? (target.current || 0) >= target.total : target.completed

  return (
    <div className={`px-4 py-3 transition-all ${done ? 'opacity-55' : ''}`}>
      {/* Title row */}
      <div className="flex items-center gap-2.5">
        {isNumeric ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onDecrement(target.id)}
              className="w-5 h-5 rounded border border-[#2a2d3e] hover:border-slate-400 flex items-center justify-center text-slate-500 hover:text-white transition-all select-none font-bold text-sm leading-none">
              −
            </button>
            <span className="text-sm font-mono text-slate-200 w-14 text-center tabular-nums">
              {target.current || 0}<span className="text-slate-600">/{target.total}</span>
            </span>
            <button onClick={() => onIncrement(target.id)}
              className="w-5 h-5 rounded border border-[#2a2d3e] hover:border-slate-400 flex items-center justify-center text-slate-500 hover:text-white transition-all select-none font-bold text-sm leading-none">
              +
            </button>
          </div>
        ) : (
          <button onClick={() => onToggle(target.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
              target.completed ? 'border-slate-500 bg-slate-600' : 'border-slate-600 hover:border-slate-400'
            }`}>
            {target.completed && <span className="text-white text-xs leading-none">✓</span>}
          </button>
        )}

        <p className={`flex-1 text-sm leading-snug min-w-0 ${done && !isNumeric ? 'line-through text-slate-500' : 'text-white'}`}>
          {target.title}
        </p>

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => onEdit(target)}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded hover:bg-white/5">✎</button>
          <button onClick={() => onDelete(target.id)}
            className="text-slate-700 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10">✕</button>
        </div>
      </div>

      {/* Meta row — only rendered if there's something to show */}
      {(target.priority !== 'medium' || target.status !== 'pending' || target.track !== 'on' || target.dueDate || target.tags?.length) && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-7">
          {target.priority && target.priority !== 'medium' && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${PRIORITY_COLORS[target.priority]}`}>
              {PRIORITY_LABELS[target.priority]}
            </span>
          )}
          {target.status && target.status !== 'pending' && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${STATUS_COLORS[target.status]}`}>
              {STATUS_LABELS[target.status]}
            </span>
          )}
          {target.track && target.track !== 'on' && (
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${TRACK_COLORS[target.track]}`}>
              {TRACK_LABELS[target.track]}
            </span>
          )}
          {target.tags?.map(t => (
            <span key={t} className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
          ))}
          {target.dueDate && <span className="text-xs text-slate-600">Due {target.dueDate}</span>}
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function BoardTab({ roadmap }) {
  const {
    objectives, keyResults, targets,
    addObjective, updateObjective, deleteObjective,
    addKeyResult, updateKeyResult, deleteKeyResult,
    addTarget, updateTarget, deleteTarget, toggleTarget,
    incrementTarget, decrementTarget,
    canUndo, undo,
  } = roadmap

  const [quarter, setQuarter] = useState(currentQuarter)
  const [year, setYear] = useState(currentYear)
  const [modal, setModal] = useState(null)

  function openCreate(type, parentId, parentLabel) {
    setModal({ type, item: null, parentId, parentLabel })
  }
  function openEdit(type, item) {
    setModal({ type, item, parentId: null, parentLabel: null })
  }
  function closeModal() { setModal(null) }

  function handleSave(formData) {
    if (!modal) return
    const { type, item, parentId } = modal
    if (type === 'objective') {
      item ? updateObjective(item.id, formData) : addObjective(formData)
    } else if (type === 'keyResult') {
      item ? updateKeyResult(item.id, formData) : addKeyResult({ ...formData, objectiveId: parentId })
    } else if (type === 'target') {
      item ? updateTarget(item.id, formData) : addTarget({ ...formData, keyResultId: parentId })
    }
    closeModal()
  }

  const visibleObjectives = objectives.filter(obj =>
    dateInQuarter(obj.dueDate, quarter, year) || (!obj.dueDate && !obj.startDate)
  )

  const allYears = [...new Set(
    objectives.map(o => o.dueDate ? new Date(o.dueDate).getFullYear() : null).filter(Boolean)
  )].sort()
  if (!allYears.includes(year)) allYears.push(year)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {modal && (
        <ItemModal
          type={modal.type}
          item={modal.item}
          parentLabel={modal.parentLabel}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* Controls bar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-[#1e2130] shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map(q => (
            <button key={q} onClick={() => setQuarter(q)}
              className={`text-sm px-3 py-1 rounded-full border transition-all ${
                quarter === q
                  ? 'bg-[#c5a028] border-[#c5a028] text-[#071020] font-semibold'
                  : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300 hover:border-slate-500'
              }`}>
              Q{q}
            </button>
          ))}
        </div>

        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-1 text-sm text-slate-400 focus:outline-none focus:border-slate-500 transition-colors">
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <span className="text-sm text-slate-600">
          {visibleObjectives.length} objective{visibleObjectives.length !== 1 ? 's' : ''}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={undo} disabled={!canUndo}
            className="text-sm text-slate-500 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5">
            ↩ Undo
          </button>
          <button onClick={() => openCreate('objective', null, null)}
            className="text-sm text-slate-300 hover:text-white bg-[#1a2a40] hover:bg-[#243550] border border-[#2a3a50] hover:border-[#4a6080] px-4 py-1.5 rounded-lg transition-all">
            + New Objective
          </button>
        </div>
      </div>

      {/* Scrollable board */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="min-w-[900px] px-6 py-5 flex flex-col gap-5">

          {visibleObjectives.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <p className="text-base text-slate-500">No objectives for Q{quarter} {year}.</p>
              <p className="text-sm text-slate-700">Use Chat to generate OKRs, or add one manually above.</p>
            </div>
          )}

          {visibleObjectives.map(obj => {
            const objKRs = keyResults.filter(kr => kr.objectiveId === obj.id)

            return (
              <div key={obj.id} className="flex border border-[#1e2a3a] rounded-2xl overflow-hidden shadow-lg">

                {/* Objective column — fixed width, stretches full height via flex */}
                <div className="w-72 shrink-0 border-r border-[#1e2a3a] bg-[#111827]">
                  <ObjColumn
                    obj={obj}
                    onEdit={o => openEdit('objective', o)}
                    onDelete={deleteObjective}
                    onAddKR={o => openCreate('keyResult', o.id, o.title)}
                  />
                </div>

                {/* KRs + Targets */}
                <div className="flex-1 min-w-0 flex flex-col divide-y divide-[#1a2535]">
                  {objKRs.length === 0 && (
                    <div className="flex items-center py-10 px-6 text-sm text-slate-700">
                      No key results yet —&nbsp;
                      <button onClick={() => openCreate('keyResult', obj.id, obj.title)}
                        className="text-slate-500 hover:text-white underline underline-offset-2 transition-colors">
                        add one
                      </button>
                    </div>
                  )}

                  {objKRs.map(kr => {
                    const krTargets = targets.filter(t => t.keyResultId === kr.id)

                    return (
                      <div key={kr.id} className="flex">

                        {/* KR column — spans all its targets */}
                        <div className="w-64 shrink-0 border-r border-[#1a2535] bg-[#0d1420]">
                          <KRColumn
                            kr={kr}
                            onEdit={k => openEdit('keyResult', k)}
                            onDelete={deleteKeyResult}
                            onAddTarget={k => openCreate('target', k.id, k.title)}
                          />
                        </div>

                        {/* Target rows */}
                        <div className="flex-1 flex flex-col divide-y divide-[#151e2d]">
                          {krTargets.length === 0 && (
                            <div className="flex items-center py-8 px-5 text-sm text-slate-700">
                              No targets —&nbsp;
                              <button onClick={() => openCreate('target', kr.id, kr.title)}
                                className="text-slate-500 hover:text-white underline underline-offset-2 transition-colors">
                                add one
                              </button>
                            </div>
                          )}
                          {krTargets.map(t => (
                            <TargetRow
                              key={t.id}
                              target={t}
                              onEdit={tgt => openEdit('target', tgt)}
                              onDelete={deleteTarget}
                              onToggle={toggleTarget}
                              onIncrement={incrementTarget}
                              onDecrement={decrementTarget}
                            />
                          ))}
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
    </div>
  )
}
