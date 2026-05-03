import { useState } from 'react'
import { storage } from '../lib/storage'

export default function BankScreen() {
  const [notes, setNotes] = useState(() => storage.getNotes())
  const [copied, setCopied] = useState(null)

  function remove(id) {
    storage.deleteNote(id)
    setNotes(storage.getNotes())
  }

  function copy(note) {
    navigator.clipboard.writeText(note.text).then(() => {
      setCopied(note.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200">

      <div className="px-6 py-5 border-b border-[#1e2130] shrink-0">
        <h1 className="text-lg font-semibold text-white">Bank</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {notes.length === 0 ? 'No notes yet' : `${notes.length} note${notes.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-slate-600 text-sm">Notes saved from Quick Note will appear here.</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                isCopied={copied === note.id}
                onCopy={() => copy(note)}
                onDelete={() => remove(note.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

function NoteCard({ note, isCopied, onCopy, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = note.text.length > 160
  const display = !isLong || expanded ? note.text : note.text.slice(0, 160).trimEnd() + '…'

  const date = new Date(note.savedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric',
  })
  const time = new Date(note.savedAt).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 flex gap-3">
      <div className="flex-1 min-w-0">
        <p
          className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap cursor-pointer"
          onClick={() => isLong && setExpanded(e => !e)}
        >
          {display}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-xs text-slate-600 hover:text-slate-400 mt-1 transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <p className="text-xs text-slate-700 mt-2">{date} · {time}</p>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={onCopy}
          className="text-xs text-slate-500 hover:text-white transition-colors px-2 py-1"
        >
          {isCopied ? '✓' : 'Copy'}
        </button>
        <button
          onClick={onDelete}
          className="text-xs text-slate-700 hover:text-red-400 transition-colors px-2 py-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
