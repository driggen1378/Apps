import { useState, useCallback } from 'react'

const KEY = 'roadmap-data'

let _seq = 0
function genId(prefix) {
  _seq = (_seq + 1) % 10000
  return `${prefix}-${Date.now().toString(36)}${_seq.toString(36).padStart(3, '0')}`.toUpperCase()
}

function empty() {
  return { objectives: [], keyResults: [], targets: [] }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : empty()
  } catch { return empty() }
}

function itemProgress(t) {
  if ((t.total || 0) > 0) return Math.min((t.current || 0) / t.total, 1) * 100
  return (t.completed || t.status === 'done') ? 100 : 0
}

function groupProgress(items) {
  if (!items.length) return 0
  return Math.round(items.reduce((s, i) => s + itemProgress(i), 0) / items.length)
}

function recompute(data) {
  const targets = data.targets.map(t => ({ ...t, progress: Math.round(itemProgress(t)) }))
  const krs = data.keyResults.map(kr => {
    const children = targets.filter(t => t.keyResultId === kr.id)
    return { ...kr, progress: groupProgress(children) }
  })
  const objs = data.objectives.map(obj => {
    const krIds = krs.filter(kr => kr.objectiveId === obj.id).map(kr => kr.id)
    const all = targets.filter(t => krIds.includes(t.keyResultId))
    return { ...obj, progress: all.length ? groupProgress(all) : 0 }
  })
  return { objectives: objs, keyResults: krs, targets }
}

const norm = s => (s || '').trim().toLowerCase()

export function useRoadmap() {
  // Single state object: { data, history }
  const [state, setState] = useState(() => ({ data: load(), history: [] }))

  const mutate = useCallback((fn) => {
    setState(prev => {
      const next = recompute(fn(prev.data))
      localStorage.setItem(KEY, JSON.stringify(next))
      return { data: next, history: [...prev.history.slice(-1), prev.data] }
    })
  }, [])

  const undo = useCallback(() => {
    setState(prev => {
      if (!prev.history.length) return prev
      const d = prev.history[prev.history.length - 1]
      localStorage.setItem(KEY, JSON.stringify(d))
      return { data: d, history: prev.history.slice(0, -1) }
    })
  }, [])

  const { data } = state

  // ── Objectives ──────────────────────────────────────────────────────────────
  function addObjective(fields) {
    mutate(d => ({
      ...d,
      objectives: [...d.objectives, {
        id: genId('OBJ'), progress: 0,
        createdAt: new Date().toISOString(), ...fields,
      }],
    }))
  }

  function updateObjective(id, changes) {
    mutate(d => ({ ...d, objectives: d.objectives.map(o => o.id === id ? { ...o, ...changes } : o) }))
  }

  function deleteObjective(id) {
    mutate(d => {
      const krIds = d.keyResults.filter(kr => kr.objectiveId === id).map(kr => kr.id)
      return {
        ...d,
        objectives: d.objectives.filter(o => o.id !== id),
        keyResults: d.keyResults.filter(kr => kr.objectiveId !== id),
        targets: d.targets.filter(t => !krIds.includes(t.keyResultId)),
      }
    })
  }

  // ── Key Results ─────────────────────────────────────────────────────────────
  function addKeyResult(fields) {
    mutate(d => ({
      ...d,
      keyResults: [...d.keyResults, {
        id: genId('KR'), progress: 0,
        createdAt: new Date().toISOString(), ...fields,
      }],
    }))
  }

  function updateKeyResult(id, changes) {
    mutate(d => ({ ...d, keyResults: d.keyResults.map(kr => kr.id === id ? { ...kr, ...changes } : kr) }))
  }

  function deleteKeyResult(id) {
    mutate(d => ({
      ...d,
      keyResults: d.keyResults.filter(kr => kr.id !== id),
      targets: d.targets.filter(t => t.keyResultId !== id),
    }))
  }

  // ── Targets ─────────────────────────────────────────────────────────────────
  function addTarget(fields) {
    mutate(d => ({
      ...d,
      targets: [...d.targets, {
        id: genId('TRG'), progress: 0, completed: false,
        total: 0, current: 0,
        status: 'pending', priority: 'medium', track: 'on',
        createdAt: new Date().toISOString(), ...fields,
      }],
    }))
  }

  function updateTarget(id, changes) {
    mutate(d => ({ ...d, targets: d.targets.map(t => t.id === id ? { ...t, ...changes } : t) }))
  }

  function deleteTarget(id) {
    mutate(d => ({ ...d, targets: d.targets.filter(t => t.id !== id) }))
  }

  function toggleTarget(id) {
    mutate(d => ({
      ...d,
      targets: d.targets.map(t => t.id === id
        ? { ...t, completed: !t.completed, status: t.completed ? 'pending' : 'done' }
        : t
      ),
    }))
  }

  function incrementTarget(id) {
    mutate(d => ({
      ...d,
      targets: d.targets.map(t => t.id === id && (t.total || 0) > 0
        ? { ...t, current: Math.min((t.current || 0) + 1, t.total) }
        : t
      ),
    }))
  }

  function decrementTarget(id) {
    mutate(d => ({
      ...d,
      targets: d.targets.map(t => t.id === id && (t.total || 0) > 0
        ? { ...t, current: Math.max((t.current || 0) - 1, 0) }
        : t
      ),
    }))
  }

  // ── Bulk import — deduplicates by title within scope ──────────────────────────
  function importOKRs(parsed) {
    mutate(d => {
      const objectives = [...d.objectives]
      const keyResults = [...d.keyResults]
      const targets = [...d.targets]

      for (const obj of parsed.objectives || []) {
        const existing = objectives.find(o => norm(o.title) === norm(obj.title))
        const objId = existing ? existing.id : genId('OBJ')
        if (!existing) {
          objectives.push({
            id: objId, progress: 0,
            title: obj.title || '',
            description: obj.description || '',
            tags: obj.tags || [],
            startDate: obj.startDate || '',
            dueDate: obj.dueDate || '',
            createdAt: new Date().toISOString(),
          })
        }

        for (const kr of obj.keyResults || []) {
          const existingKR = keyResults.find(k => k.objectiveId === objId && norm(k.title) === norm(kr.title))
          const krId = existingKR ? existingKR.id : genId('KR')
          if (!existingKR) {
            keyResults.push({
              id: krId, objectiveId: objId, progress: 0,
              title: kr.title || '',
              description: kr.description || '',
              tags: kr.tags || [],
              startDate: kr.startDate || '',
              dueDate: kr.dueDate || '',
              createdAt: new Date().toISOString(),
            })
          }

          for (const tgt of kr.targets || []) {
            const existingTgt = targets.find(t => t.keyResultId === krId && norm(t.title) === norm(tgt.title))
            if (!existingTgt) {
              targets.push({
                id: genId('TRG'), keyResultId: krId,
                progress: 0, completed: false,
                total: 0, current: 0,
                title: tgt.title || '',
                description: tgt.description || '',
                tags: tgt.tags || [],
                startDate: tgt.startDate || '',
                dueDate: tgt.dueDate || '',
                priority: tgt.priority || 'medium',
                status: 'pending', track: 'on',
                createdAt: new Date().toISOString(),
              })
            }
          }
        }
      }
      return { ...d, objectives, keyResults, targets }
    })
  }

  return {
    ...data,
    canUndo: state.history.length > 0,
    undo,
    addObjective, updateObjective, deleteObjective,
    addKeyResult, updateKeyResult, deleteKeyResult,
    addTarget, updateTarget, deleteTarget, toggleTarget, incrementTarget, decrementTarget,
    importOKRs,
  }
}
