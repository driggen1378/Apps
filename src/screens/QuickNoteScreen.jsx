import { useState, useRef, useEffect } from 'react'
import { storage } from '../lib/storage'

export default function QuickNoteScreen() {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const ref = useRef(null)

  useEffect(() => { ref.current?.focus() }, [])

  function save() {
    const trimmed = text.trim()
    if (!trimmed) return
    storage.saveNote(trimmed)
    setText('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    ref.current?.focus()
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200">

      <div className="px-6 py-5 border-b border-[#1e2130] shrink-0">
        <h1 className="text-lg font-semibold text-white">Quick Note</h1>
        <p className="text-xs text-slate-500 mt-0.5">Drop a thought. It goes straight to Bank.</p>
      </div>

      <div className="flex-1 flex flex-col px-6 py-6 gap-4 max-w-2xl w-full mx-auto">
        <textarea
          ref={ref}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="What's the thought…"
          className="flex-1 bg-transparent text-slate-200 text-base leading-[1.8] resize-none focus:outline-none placeholder-slate-700 min-h-0"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        />

        <div className="flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-700">Cmd+Enter to save</p>
          <button
            onClick={save}
            disabled={!text.trim()}
            className="px-5 py-2 bg-white text-[#0f1117] text-sm font-bold rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {saved ? 'Saved ✓' : 'Save →'}
          </button>
        </div>
      </div>

    </div>
  )
}
