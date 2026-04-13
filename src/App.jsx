import { useState, useEffect } from 'react'

const STORAGE_KEY = 'lessons-learned-v1'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function App() {
  const [lessons, setLessons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })
  const [search, setSearch] = useState('')
  const [view, setView] = useState('list') // 'list' | 'detail' | 'add' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ title: '', description: '' })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons))
  }, [lessons])

  const filtered = lessons.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase())
  )

  function handleAdd() {
    if (!form.title.trim()) return
    const now = new Date().toISOString()
    const lesson = {
      id: generateId(),
      title: form.title.trim(),
      description: form.description.trim(),
      createdAt: now,
      updatedAt: now,
    }
    setLessons(prev => [lesson, ...prev])
    setForm({ title: '', description: '' })
    setView('list')
  }

  function handleUpdate() {
    if (!form.title.trim()) return
    const updatedAt = new Date().toISOString()
    const updated = {
      ...selected,
      title: form.title.trim(),
      description: form.description.trim(),
      updatedAt,
    }
    setLessons(prev => prev.map(l => l.id === selected.id ? updated : l))
    setSelected(updated)
    setView('detail')
  }

  function handleDelete(lesson) {
    if (!window.confirm(`Delete "${lesson.title}"? This cannot be undone.`)) return
    setLessons(prev => prev.filter(l => l.id !== lesson.id))
    setView('list')
    setSelected(null)
  }

  function openDetail(lesson) {
    setSelected(lesson)
    setView('detail')
  }

  function openEdit(lesson) {
    setSelected(lesson)
    setForm({ title: lesson.title, description: lesson.description })
    setView('edit')
  }

  function openAdd() {
    setForm({ title: '', description: '' })
    setView('add')
  }

  function goBack() {
    if (view === 'edit') {
      setView('detail')
    } else {
      setView('list')
      setSelected(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">

      {/* Header */}
      <header className="bg-[#071020] border-b-2 border-[#c5a028]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => { setView('list'); setSelected(null); setSearch('') }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-[#c5a028] rounded flex items-center justify-center shrink-0">
              <span className="text-[#071020] font-bold text-sm">LL</span>
            </div>
            <span className="text-[#c5a028] text-lg font-bold tracking-widest uppercase">
              Lessons Learned
            </span>
          </button>

          <div>
            {view === 'list' && (
              <button
                onClick={openAdd}
                className="bg-[#c5a028] text-[#071020] px-4 py-1.5 rounded text-sm font-bold hover:bg-[#d9b030] transition-colors"
              >
                + New Lesson
              </button>
            )}
            {view !== 'list' && (
              <button
                onClick={goBack}
                className="text-[#c5a028] text-sm font-medium hover:underline"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* LIST VIEW */}
        {view === 'list' && (
          <div>
            {/* Search bar */}
            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6080]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search lessons..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#112040] border border-[#2a4070] rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a6080] hover:text-white text-lg leading-none"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Count */}
            <p className="text-[#4a6080] text-sm mb-4">
              {filtered.length} {filtered.length === 1 ? 'lesson' : 'lessons'}
              {search && <> matching &ldquo;{search}&rdquo;</>}
            </p>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#4a6080] text-4xl mb-4">📋</p>
                <p className="text-[#4a6080] text-lg">
                  {search ? 'No lessons match your search.' : 'No lessons yet.'}
                </p>
                {!search && (
                  <button
                    onClick={openAdd}
                    className="mt-4 text-[#c5a028] text-sm hover:underline"
                  >
                    Add your first lesson →
                  </button>
                )}
              </div>
            )}

            {/* Lesson list */}
            {filtered.length > 0 && (
              <ul className="space-y-3">
                {filtered.map(lesson => (
                  <li key={lesson.id}>
                    <button
                      onClick={() => openDetail(lesson)}
                      className="w-full text-left bg-[#112040] border border-[#2a4070] rounded-lg px-5 py-4 hover:border-[#c5a028] hover:bg-[#162850] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-white font-semibold group-hover:text-[#c5a028] transition-colors">
                          {lesson.title}
                        </h2>
                        <span className="text-[#4a6080] text-xs mt-0.5 shrink-0">
                          {formatDate(lesson.createdAt)}
                        </span>
                      </div>
                      {lesson.description && (
                        <p className="text-[#6a80a0] text-sm mt-1 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === 'detail' && selected && (
          <div className="bg-[#112040] border border-[#2a4070] rounded-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-[#c5a028] text-2xl font-bold leading-tight">
                {selected.title}
              </h2>
              <div className="flex gap-2 shrink-0 mt-0.5">
                <button
                  onClick={() => openEdit(selected)}
                  className="px-3 py-1 rounded border border-[#c5a028] text-[#c5a028] text-sm font-medium hover:bg-[#c5a028] hover:text-[#071020] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="px-3 py-1 rounded border border-[#6a3030] text-[#c07070] text-sm font-medium hover:bg-red-700 hover:text-white hover:border-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-[#4a6080] text-xs mb-5">
              Added {formatDate(selected.createdAt)}
              {selected.updatedAt !== selected.createdAt && (
                <> · Updated {formatDate(selected.updatedAt)}</>
              )}
            </p>

            <div className="border-t border-[#2a4070] pt-5">
              {selected.description ? (
                <p className="text-[#c0d0e0] leading-relaxed whitespace-pre-wrap">
                  {selected.description}
                </p>
              ) : (
                <p className="text-[#4a6080] italic">No description provided.</p>
              )}
            </div>
          </div>
        )}

        {/* ADD / EDIT VIEW */}
        {(view === 'add' || view === 'edit') && (
          <div className="bg-[#112040] border border-[#2a4070] rounded-lg p-6">
            <h2 className="text-[#c5a028] text-xl font-bold mb-6">
              {view === 'add' ? 'New Lesson' : 'Edit Lesson'}
            </h2>

            <div className="mb-4">
              <label className="block text-[#8a9db5] text-sm font-medium mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (view === 'add' ? handleAdd() : handleUpdate())}
                placeholder="Summarize the lesson in a few words"
                autoFocus
                className="w-full bg-[#0a1628] border border-[#2a4070] rounded-lg px-4 py-2.5 text-white placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#8a9db5] text-sm font-medium mb-1.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What happened? What would you do differently? What should others know?"
                rows={7}
                className="w-full bg-[#0a1628] border border-[#2a4070] rounded-lg px-4 py-2.5 text-white placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={view === 'add' ? handleAdd : handleUpdate}
                disabled={!form.title.trim()}
                className="bg-[#c5a028] text-[#071020] px-6 py-2.5 rounded-lg font-bold hover:bg-[#d9b030] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {view === 'add' ? 'Save Lesson' : 'Save Changes'}
              </button>
              <button
                onClick={goBack}
                className="px-6 py-2.5 rounded-lg border border-[#2a4070] text-[#8a9db5] font-medium hover:border-[#4a6080] hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
