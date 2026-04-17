import { useState } from 'react'
import ItemModal from './ItemModal'
import { TAG_COLORS, PRIORITY_COLORS, STATUS_COLORS, TRACK_COLORS, PRIORITY_LABELS, STATUS_LABELS, TRACK_LABELS } from './constants'

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
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tags.map(t => (
        <span key={t} className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
      ))}
    </div>
  )
}

function ObjCard({ obj, selected, onSelect, onEdit, onDelete, onAddKR }) {
  return (
    <div onClick={() => onSelect(obj.id)}
      className={`flex flex-col bg-[#141620] border rounded-xl px-4 py-3 cursor-pointer transition-all ${
        selected ? 'border-white' : 'border-[#2a2d3e] hover:border-slate-500'
      }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-600 font-mono mb-0.5">{obj.id}</p>
          <p className="text-sm font-semibold text-white leading-snug">{obj.title}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onAddKR(obj) }}
            className="text-xs text-slate-600 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-1.5 py-0.5 rounded transition-all">
            KR +
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit(obj) }}
            className="text-slate-600 hover:text-slate-300 transition-colors px-1">✎</button>
          <button onClick={e => { e.stopPropagation(); onDelete(obj.id) }}
            className="text-slate-700 hover:text-red-400 transition-colors px-1">✕</button>
        </div>
      </div>
      {obj.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{obj.description}</p>}
      <TagList tags={obj.tags} />
      {obj.dueDate && <p className="text-xs text-slate-600 mt-1.5">Due {obj.dueDate}</p>}
      <ProgressBar value={obj.progress} />
    </div>
  )
}

function KRCard({ kr, selected, onSelect, onEdit, onDelete, onAddTarget, objTitle }) {
  return (
    <div>
      {objTitle && <p className="text-xs text-slate-700 font-mono mb-1 px-1">{objTitle}</p>}
      <div onClick={() => onSelect(kr.id)}
        className={`flex flex-col bg-[#141620] border rounded-xl px-4 py-3 cursor-pointer transition-all ${
          selected ? 'border-white' : 'border-[#2a2d3e] hover:border-slate-500'
        }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-600 font-mono mb-0.5">{kr.id}</p>
            <p className="text-sm font-semibold text-white leading-snug">{kr.title}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={e => { e.stopPropagation(); onAddTarget(kr) }}
              className="text-xs text-slate-600 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-1.5 py-0.5 rounded transition-all">
              T +
            </button>
            <button onClick={e => { e.stopPropagation(); onEdit(kr) }}
              className="text-slate-600 hover:text-slate-300 transition-colors px-1">✎</button>
            <button onClick={e => { e.stopPropagation(); onDelete(kr.id) }}
              className="text-slate-700 hover:text-red-400 transition-colors px-1">✕</button>
          </div>
        </div>
        {kr.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{kr.description}</p>}
        <TagList tags={kr.tags} />
        {kr.dueDate && <p className="text-xs text-slate-600 mt-1.5">Due {kr.dueDate}</p>}
        <ProgressBar value={kr.progress} />
      </div>
    </div>
  )
}

function TargetCard({ target, onEdit, onDelete, onToggle, krTitle }) {
  return (
    <div>
      {krTitle && <p className="text-xs text-slate-700 font-mono mb-1 px-1 truncate">{krTitle}</p>}
      <div className={`flex flex-col bg-[#141620] border rounded-xl px-4 py-3 transition-all ${
        target.completed ? 'border-[#1e2130] opacity-60' : 'border-[#2a2d3e]'
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <button onClick={() => onToggle(target.id)}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                target.completed ? 'border-slate-500 bg-slate-600' : 'border-slate-600 hover:border-slate-400'
              }`}>
              {target.completed && <span className="text-white text-xs leading-none">✓</span>}
            </button>
            <div className="min-w-0">
              <p className="text-xs text-slate-600 font-mono mb-0.5">{target.id}</p>
              <p className={`text-sm font-semibold leading-snug ${target.completed ? 'line-through text-slate-500' : 'text-white'}`}>
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

        {target.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 ml-6">{target.description}</p>}
        <TagList tags={target.tags} />

        {/* Status badges */}
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
    </div>
  )
}

export default function BoardTab({ roadmap }) {
  const {
    objectives, keyResults, targets,
    addObjective, updateObjective, deleteObjective,
    addKeyResult, updateKeyResult, deleteKeyResult,
    addTarget, updateTarget, deleteTarget, toggleTarget,
  } = roadmap

  const [selObj, setSelObj] = useState(null)
  const [selKR, setSelKR] = useState(null)
  const [modal, setModal] = useState(null) // { type, item, parentId, parentLabel }

  function selectObj(id) {
    setSelObj(prev => prev === id ? null : id)
    setSelKR(null)
  }
  function selectKR(id) {
    setSelKR(prev => prev === id ? null : id)
  }

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

  const visibleKRs = selObj ? keyResults.filter(kr => kr.objectiveId === selObj) : keyResults
  const visibleTargets = selKR
    ? targets.filter(t => t.keyResultId === selKR)
    : selObj
    ? targets.filter(t => keyResults.find(kr => kr.objectiveId === selObj && kr.id === t.keyResultId))
    : targets

  // Group KRs by parent obj for display header
  const krGroups = {}
  for (const kr of visibleKRs) {
    if (!krGroups[kr.objectiveId]) krGroups[kr.objectiveId] = []
    krGroups[kr.objectiveId].push(kr)
  }

  // Group targets by parent KR
  const tgtGroups = {}
  for (const t of visibleTargets) {
    if (!tgtGroups[t.keyResultId]) tgtGroups[t.keyResultId] = []
    tgtGroups[t.keyResultId].push(t)
  }

  const colHeader = 'flex items-center justify-between px-4 py-3 border-b border-[#1e2130] shrink-0'
  const colLabel = 'text-xs font-mono uppercase tracking-wider text-slate-500'

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {modal && (
        <ItemModal
          type={modal.type}
          item={modal.item}
          parentLabel={modal.parentLabel}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {/* ── Column 1: Objectives ─────────────────────────────────────────── */}
      <div className="flex flex-col w-1/3 min-h-0 border-r border-[#1e2130]">
        <div className={colHeader}>
          <span className={colLabel}>Objectives ({objectives.length})</span>
          <button onClick={() => openCreate('objective', null, null)}
            className="text-xs text-slate-500 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2 py-1 rounded transition-all">
            + Add
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {objectives.length === 0 && (
            <p className="text-xs text-slate-700 text-center mt-8">No objectives yet. Use Chat to generate, or add one manually.</p>
          )}
          {objectives.map(obj => (
            <ObjCard key={obj.id} obj={obj}
              selected={selObj === obj.id}
              onSelect={selectObj}
              onEdit={o => openEdit('objective', o)}
              onDelete={deleteObjective}
              onAddKR={o => openCreate('keyResult', o.id, o.title)}
            />
          ))}
        </div>
      </div>

      {/* ── Column 2: Key Results ────────────────────────────────────────── */}
      <div className="flex flex-col w-1/3 min-h-0 border-r border-[#1e2130]">
        <div className={colHeader}>
          <span className={colLabel}>Key Results ({visibleKRs.length})</span>
          {selObj && (
            <button onClick={() => {
              const obj = objectives.find(o => o.id === selObj)
              openCreate('keyResult', selObj, obj?.title)
            }}
              className="text-xs text-slate-500 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2 py-1 rounded transition-all">
              + Add
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {visibleKRs.length === 0 && (
            <p className="text-xs text-slate-700 text-center mt-8">
              {selObj ? 'No key results for this objective.' : 'No key results yet.'}
            </p>
          )}
          {Object.entries(krGroups).map(([objId, krs]) => {
            const obj = objectives.find(o => o.id === objId)
            return krs.map((kr, i) => (
              <KRCard key={kr.id} kr={kr}
                selected={selKR === kr.id}
                onSelect={selectKR}
                onEdit={k => openEdit('keyResult', k)}
                onDelete={deleteKeyResult}
                onAddTarget={k => openCreate('target', k.id, k.title)}
                objTitle={!selObj && i === 0 ? obj?.title : null}
              />
            ))
          })}
        </div>
      </div>

      {/* ── Column 3: Targets ────────────────────────────────────────────── */}
      <div className="flex flex-col w-1/3 min-h-0">
        <div className={colHeader}>
          <span className={colLabel}>Targets ({visibleTargets.length})</span>
          {selKR && (
            <button onClick={() => {
              const kr = keyResults.find(k => k.id === selKR)
              openCreate('target', selKR, kr?.title)
            }}
              className="text-xs text-slate-500 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2 py-1 rounded transition-all">
              + Add
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {visibleTargets.length === 0 && (
            <p className="text-xs text-slate-700 text-center mt-8">
              {selKR ? 'No targets for this key result.' : 'No targets yet.'}
            </p>
          )}
          {Object.entries(tgtGroups).map(([krId, tgts]) => {
            const kr = keyResults.find(k => k.id === krId)
            return tgts.map((t, i) => (
              <TargetCard key={t.id} target={t}
                onEdit={tgt => openEdit('target', tgt)}
                onDelete={deleteTarget}
                onToggle={toggleTarget}
                krTitle={!selKR && i === 0 ? kr?.title : null}
              />
            ))
          })}
        </div>
      </div>
    </div>
  )
}
