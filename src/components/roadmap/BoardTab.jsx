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

// ── Shared sub-components ──────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1 bg-[#2a2d3e] rounded-full overflow-hidden">
        <div className="h-full bg-slate-400 rounded-full transition-all duration-500"
          style={{ width: `${value || 0}%` }} />
      </div>
      <span className="text-xs text-slate-600 font-mono w-7 text-right">{value || 0}%</span>
    </div>
  )
}

function TagList({ tags = [] }) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map(t => (
        <span key={t} className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
      ))}
    </div>
  )
}

// ── Objective column ───────────────────────────────────────────────────────────

function ObjColumn({ obj, onEdit, onDelete, onAddKR }) {
  return (
    <div className="flex flex-col h-full p-4 gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600 font-mono mb-0.5">{obj.id}</p>
          <p className="text-sm font-semibold text-white leading-snug">{obj.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(obj)}
            className="text-slate-600 hover:text-slate-300 transition-colors px-1">✎</button>
          <button onClick={() => onDelete(obj.id)}
            className="text-slate-700 hover:text-red-400 transition-colors px-1">✕</button>
        </div>
      </div>
      {obj.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{obj.description}</p>
      )}
      <TagList tags={obj.tags} />
      {obj.dueDate && <p className="text-xs text-slate-600 mt-auto pt-2">Due {obj.dueDate}</p>}
      <ProgressBar value={obj.progress} />
      <button onClick={() => onAddKR(obj)}
        className="mt-1 text-xs text-slate-600 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2 py-1 rounded transition-all text-left">
        + Key Result
      </button>
    </div>
  )
}

// ── Key Result column ──────────────────────────────────────────────────────────

function KRColumn({ kr, onEdit, onDelete, onAddTarget }) {
  return (
    <div className="flex flex-col h-full p-3 gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600 font-mono mb-0.5">{kr.id}</p>
          <p className="text-xs font-semibold text-slate-200 leading-snug">{kr.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onAddTarget(kr)}
            className="text-xs text-slate-600 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-1.5 py-0.5 rounded transition-all">
            T+
          </button>
          <button onClick={() => onEdit(kr)}
            className="text-slate-600 hover:text-slate-300 transition-colors px-1">✎</button>
          <button onClick={() => onDelete(kr.id)}
            className="text-slate-700 hover:text-red-400 transition-colors px-1">✕</button>
        </div>
      </div>
      {kr.description && (
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{kr.description}</p>
      )}
      <TagList tags={kr.tags} />
      {kr.dueDate && <p className="text-xs text-slate-600 mt-auto pt-1">Due {kr.dueDate}</p>}
      <ProgressBar value={kr.progress} />
    </div>
  )
}

// ── Target row ─────────────────────────────────────────────────────────────────

function TargetRow({ target, onEdit, onDelete, onToggle, onIncrement, onDecrement }) {
  const isNumeric = (target.total || 0) > 0
  const done = isNumeric ? (target.current || 0) >= target.total : target.completed

  return (
    <div className={`flex flex-col p-3 transition-all ${done ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          {!isNumeric && (
            <button onClick={() => onToggle(target.id)}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                target.completed ? 'border-slate-500 bg-slate-600' : 'border-slate-600 hover:border-slate-400'
              }`}>
              {target.completed && <span className="text-white text-xs leading-none">✓</span>}
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-600 font-mono mb-0.5">{target.id}</p>
            <p className={`text-xs font-semibold leading-snug ${done && !isNumeric ? 'line-through text-slate-500' : 'text-white'}`}>
              {target.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(target)}
            className="text-slate-600 hover:text-slate-300 transition-colors px-1">✎</button>
          <button onClick={() => onDelete(target.id)}
            className="text-slate-700 hover:text-red-400 transition-colors px-1">✕</button>
        </div>
      </div>

      {target.description && (
        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 pl-6">{target.description}</p>
      )}
      <TagList tags={target.tags} />

      {isNumeric && (
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => onDecrement(target.id)}
            className="w-6 h-6 rounded border border-[#2a2d3e] hover:border-slate-500 flex items-center justify-center text-slate-500 hover:text-white transition-all select-none text-base leading-none">
            −
          </button>
          <span className="text-sm font-mono text-slate-200 min-w-[4rem] text-center">
            {target.current || 0} <span className="text-slate-600">of</span> {target.total}
          </span>
          <button onClick={() => onIncrement(target.id)}
            className="w-6 h-6 rounded border border-[#2a2d3e] hover:border-slate-500 flex items-center justify-center text-slate-500 hover:text-white transition-all select-none text-base leading-none">
            +
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {target.priority && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide ${PRIORITY_COLORS[target.priority]}`}>
            {PRIORITY_LABELS[target.priority]}
          </span>
        )}
        {target.status && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide ${STATUS_COLORS[target.status]}`}>
            {STATUS_LABELS[target.status]}
          </span>
        )}
        {target.track && (
          <span className={`text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide ${TRACK_COLORS[target.track]}`}>
            {TRACK_LABELS[target.track]}
          </span>
        )}
      </div>
      {target.dueDate && <p className="text-xs text-slate-600 mt-1.5">Due {target.dueDate}</p>}
      <ProgressBar value={target.progress} />
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

      {/* Controls */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#1e2130] shrink-0">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map(q => (
            <button key={q} onClick={() => setQuarter(q)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${
                quarter === q
                  ? 'bg-[#c5a028] border-[#c5a028] text-[#071020] font-semibold'
                  : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300 hover:border-slate-500'
              }`}>
              Q{q}
            </button>
          ))}
        </div>

        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="bg-transparent border border-[#2a2d3e] rounded-lg px-2 py-1 text-xs text-slate-400 focus:outline-none focus:border-slate-500 transition-colors">
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <span className="text-xs text-slate-600">
          {visibleObjectives.length} objective{visibleObjectives.length !== 1 ? 's' : ''}
        </span>

        <button onClick={() => openCreate('objective', null, null)}
          className="ml-auto text-xs text-slate-500 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
          + New Objective
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {visibleObjectives.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 gap-2 text-center">
            <p className="text-sm text-slate-600">No objectives for Q{quarter} {year}.</p>
            <p className="text-xs text-slate-700">Use Chat to generate OKRs, or add one manually above.</p>
          </div>
        )}

        {visibleObjectives.map(obj => {
          const objKRs = keyResults.filter(kr => kr.objectiveId === obj.id)

          return (
            <div key={obj.id} className="flex border border-[#1e2130] rounded-xl overflow-hidden">

              {/* Objective — spans full height */}
              <div className="w-56 shrink-0 border-r border-[#1e2130] bg-[#141620]">
                <ObjColumn
                  obj={obj}
                  onEdit={o => openEdit('objective', o)}
                  onDelete={deleteObjective}
                  onAddKR={o => openCreate('keyResult', o.id, o.title)}
                />
              </div>

              {/* KRs + Targets */}
              <div className="flex-1 min-w-0 flex flex-col divide-y divide-[#1e2130]">
                {objKRs.length === 0 && (
                  <div className="flex items-center py-8 px-4 text-xs text-slate-700">
                    No key results —&nbsp;
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
                      {/* KR — spans height of all its targets */}
                      <div className="w-52 shrink-0 border-r border-[#1e2130] bg-[#0f1117]">
                        <KRColumn
                          kr={kr}
                          onEdit={k => openEdit('keyResult', k)}
                          onDelete={deleteKeyResult}
                          onAddTarget={k => openCreate('target', k.id, k.title)}
                        />
                      </div>

                      {/* Targets */}
                      <div className="flex-1 flex flex-col divide-y divide-[#1e2130]">
                        {krTargets.length === 0 && (
                          <div className="flex items-center py-6 px-4 text-xs text-slate-700">
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
  )
}
