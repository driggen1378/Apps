import { useState } from 'react'
import { AVAILABLE_TAGS, TAG_COLORS } from './constants'

const BLANK = {
  title: '', description: '', tags: [],
  startDate: '', dueDate: '',
  priority: 'medium', status: 'pending', track: 'on',
}

export default function ItemModal({ type, item, parentLabel, onSave, onClose }) {
  const [form, setForm] = useState(() => item ? { ...BLANK, ...item } : BLANK)

  const isTarget = type === 'target'
  const title = item
    ? `Edit ${type}`
    : `Add ${type}${parentLabel ? ` to ${parentLabel}` : ''}`

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function toggleTag(tag) {
    set('tags', form.tags.includes(tag)
      ? form.tags.filter(t => t !== tag)
      : [...form.tags, tag]
    )
  }

  function handleSave() {
    if (!form.title.trim()) return
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e] shrink-0">
          <span className="text-sm font-semibold text-white capitalize">{title}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder={`${type} title`} autoFocus
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#4a4d6e] transition-colors" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional — what does this achieve?" rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors" />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Start date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#4a4d6e] transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">Due date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#4a4d6e] transition-colors" />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all capitalize ${
                    form.tags.includes(tag)
                      ? TAG_COLORS[tag] || 'bg-slate-700 text-white border-slate-600'
                      : 'border-[#2a2d3e] text-slate-600 hover:text-slate-300 hover:border-slate-500'
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Target-only fields */}
          {isTarget && (
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Priority</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}
                  className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#4a4d6e] transition-colors">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#4a4d6e] transition-colors">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-medium">Track</label>
                <select value={form.track} onChange={e => set('track', e.target.value)}
                  className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[#4a4d6e] transition-colors">
                  <option value="on">On Track</option>
                  <option value="at_risk">At Risk</option>
                  <option value="off">Off Track</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2d3e] shrink-0">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={!form.title.trim()}
            className="px-5 py-2 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {item ? 'Save changes' : `Add ${type}`} →
          </button>
        </div>
      </div>
    </div>
  )
}
