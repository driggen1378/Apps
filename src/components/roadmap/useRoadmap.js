import { useState, useCallback } from 'react'

const KEY = 'roadmap-data'

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}`
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

function calcProgress(items) {
  if (!items.length) return 0
  const done = items.filter(i => i.completed || i.status === 'done').length
  return Math.round((done / items.length) * 100)
}

function recompute(data) {
  const krs = data.keyResults.map(kr => {
    const children = data.targets.filter(t => t.keyResultId === kr.id)
    return { ...kr, progress: calcProgress(children) }
  })
  const objs = data.objectives.map(obj => {
    const children = krs.filter(kr => kr.objectiveId === obj.id)
    const progress = children.length
      ? Math.round(children.reduce((s, kr) => s + kr.progress, 0) / children.length)
      : 0
    return { ...obj, progress }
  })
  return { ...data, objectives: objs, keyResults: krs }
}

export function useRoadmap() {
  const [data, setData] = useState(load)

  const mutate = useCallback((fn) => {
    setData(prev => {
      const next = recompute(fn(prev))
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

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

  // ── Bulk import from AI ──────────────────────────────────────────────────────
  function importOKRs(parsed) {
    mutate(d => {
      const objectives = [...d.objectives]
      const keyResults = [...d.keyResults]
      const targets = [...d.targets]

      for (const obj of parsed.objectives || []) {
        const objId = genId('OBJ')
        objectives.push({
          id: objId, progress: 0,
          title: obj.title || '',
          description: obj.description || '',
          tags: obj.tags || [],
          startDate: obj.startDate || '',
          dueDate: obj.dueDate || '',
          createdAt: new Date().toISOString(),
        })
        for (const kr of obj.keyResults || []) {
          const krId = genId('KR')
          keyResults.push({
            id: krId, objectiveId: objId, progress: 0,
            title: kr.title || '',
            description: kr.description || '',
            tags: kr.tags || [],
            startDate: kr.startDate || '',
            dueDate: kr.dueDate || '',
            createdAt: new Date().toISOString(),
          })
          for (const tgt of kr.targets || []) {
            targets.push({
              id: genId('TRG'), keyResultId: krId,
              progress: 0, completed: false,
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
      return { objectives, keyResults, targets }
    })
  }

  return {
    ...data,
    addObjective, updateObjective, deleteObjective,
    addKeyResult, updateKeyResult, deleteKeyResult,
    addTarget, updateTarget, deleteTarget, toggleTarget,
    importOKRs,
  }
}
