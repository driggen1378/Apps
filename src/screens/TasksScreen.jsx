import { useState } from 'react'
import { loadTasks, saveTasks, getWorkflow } from '../lib/tasks'

const CATS = {
  dissertation: { label: 'Dissertation', color: '#EF9F27' },
  media:        { label: 'Media',        color: '#5DCAA5' },
  business:     { label: 'Business',     color: '#9B7FD4' },
  gym:          { label: 'Gym',          color: '#85B7EB' },
}

export default function TasksScreen({ onNavigate }) {
  const [tasks, setTasks] = useState(loadTasks)
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ text: '', cat: 'media', detail: '' })

  function persist(next) { setTasks(next); saveTasks(next) }

  function toggleDone(id) {
    persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }
  function toggleWeek(id) {
    persist(tasks.map(t => t.id === id ? { ...t, inWeek: !t.inWeek } : t))
  }
  function addTask() {
    if (!draft.text.trim()) return
    persist([
      { id: 'u-' + Date.now(), cat: draft.cat, text: draft.text.trim(), detail: draft.detail.trim(), workflow: null, nav: null, done: false, inWeek: false },
      ...tasks,
    ])
    setDraft({ text: '', cat: 'media', detail: '' })
    setAdding(false)
  }

  const pending = tasks.filter(t => !t.done)
  const done    = tasks.filter(t => t.done)
  const shown   = (filter === 'all' ? pending : pending.filter(t => t.cat === filter))

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Next Up</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">
              {pending.length} to do · tap to expand · <span className="text-[#5DCAA5]">+ week</span> sends it to your 4 days
            </p>
          </div>
          <button
            onClick={() => setAdding(a => !a)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#c5a028] text-[#c5a028] hover:bg-[#c5a028] hover:text-[#071020] transition-all"
          >
            + Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', ...Object.keys(CATS)].map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filter === c
                  ? 'bg-[#c5a028] border-[#c5a028] text-[#071020]'
                  : 'border-[#1e3a5f] text-[#4a6080] hover:text-white hover:border-[#4a6090]'
              }`}
            >
              {c === 'all' ? 'All' : CATS[c].label}
            </button>
          ))}
        </div>

        {/* Add form */}
        {adding && (
          <div className="border border-[#1e3a5f] rounded-xl px-4 py-4 bg-[#0d1829] flex flex-col gap-3 mb-4">
            <input
              autoFocus
              placeholder="What needs doing?"
              value={draft.text}
              onChange={e => setDraft(d => ({ ...d, text: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-[#4a6090]"
            />
            <textarea
              placeholder="Detail (shown when expanded) — optional"
              value={draft.detail}
              onChange={e => setDraft(d => ({ ...d, detail: e.target.value }))}
              rows={2}
              className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-xs resize-none focus:outline-none focus:border-[#4a6090]"
            />
            <div className="flex items-center gap-2">
              <select
                value={draft.cat}
                onChange={e => setDraft(d => ({ ...d, cat: e.target.value }))}
                className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none"
              >
                {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button onClick={addTask} className="px-4 py-2 bg-[#c5a028] text-[#071020] text-xs font-semibold rounded-lg">Add task</button>
              <button onClick={() => setAdding(false)} className="px-4 py-2 text-slate-500 text-xs border border-[#1e3a5f] rounded-lg hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Pending list */}
        <div className="flex flex-col gap-2">
          {shown.length === 0 && (
            <p className="text-sm text-[#3a5070] text-center py-8">Nothing pending here. 🎯</p>
          )}
          {shown.map(t => {
            const cat = CATS[t.cat] || CATS.business
            const isOpen = openId === t.id
            const wf = t.workflow ? getWorkflow(t.workflow) : null
            return (
              <div
                key={t.id}
                className="border border-[#1e3a5f] rounded-xl bg-[#0d1829] overflow-hidden transition-all hover:border-[#2a5080]"
              >
                {/* Row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => toggleDone(t.id)}
                    className="w-4 h-4 rounded border border-[#2a4070] hover:border-[#4a6090] flex items-center justify-center shrink-0 transition-all"
                  />
                  <button
                    onClick={() => setOpenId(isOpen ? null : t.id)}
                    className="flex-1 min-w-0 flex items-center gap-2 text-left"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="text-sm text-slate-200 truncate">{t.text}</span>
                  </button>
                  {t.inWeek && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5DCAA5] shrink-0">in week</span>
                  )}
                  <button
                    onClick={() => toggleWeek(t.id)}
                    className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 transition-all ${
                      t.inWeek
                        ? 'border-[#5DCAA5] text-[#5DCAA5] bg-[#5DCAA5]/10'
                        : 'border-[#2a4070] text-[#4a6080] hover:text-white hover:border-[#4a6090]'
                    }`}
                  >
                    {t.inWeek ? '− week' : '+ week'}
                  </button>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#112040] flex flex-col gap-3">
                    {t.detail && <p className="text-xs text-slate-400 leading-relaxed">{t.detail}</p>}
                    <div className="flex flex-wrap gap-2">
                      {wf && (
                        <button
                          onClick={() => onNavigate('workflows', t.workflow)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-[#5DCAA5]/50 text-[#5DCAA5] hover:bg-[#5DCAA5]/10 transition-colors"
                        >
                          {wf.icon} {wf.title} →
                        </button>
                      )}
                      {t.nav && (
                        <button
                          onClick={() => onNavigate(t.nav)}
                          className="text-[11px] px-2.5 py-1 rounded-lg border border-[#1e3a5f] text-[#7a9ab5] hover:text-white hover:border-[#4a6090] transition-colors"
                        >
                          Open {t.nav} →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Done */}
        {done.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest text-[#2a4070] font-semibold mb-2">Done ({done.length})</p>
            <div className="flex flex-col gap-1.5">
              {done.map(t => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#0a1220] border border-[#112040] opacity-50">
                  <button
                    onClick={() => toggleDone(t.id)}
                    className="w-4 h-4 rounded bg-[#1D9E75] border border-[#1D9E75] flex items-center justify-center shrink-0"
                  >
                    <span className="text-[#071020] text-[9px] leading-none font-black">✓</span>
                  </button>
                  <span className="text-xs text-[#4a6080] line-through truncate">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
