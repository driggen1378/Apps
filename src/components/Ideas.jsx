import { useState } from 'react'
import { storage } from '../lib/storage'

const BUCKETS = [
  {
    id: 'past',
    label: 'Past',
    long: 'PAST',
    sub: "Problems I've genuinely figured out",
    dot: 'bg-green-500',
    color: 'text-green-400',
    activeBorder: 'border-green-600/60 bg-green-900/10 text-green-300',
    cardBorder: 'border-green-900/30',
    cardBg: 'bg-[#0d1a12]',
  },
  {
    id: 'present',
    label: 'Present',
    long: 'PRESENT',
    sub: "I'm actively wrestling with this",
    dot: 'bg-amber-500',
    color: 'text-amber-400',
    activeBorder: 'border-amber-600/60 bg-amber-900/10 text-amber-300',
    cardBorder: 'border-amber-900/30',
    cardBg: 'bg-[#1a1500]',
  },
  {
    id: 'lens',
    label: 'Lens',
    long: 'LENS',
    sub: "My unique angle to investigate",
    dot: 'bg-blue-500',
    color: 'text-blue-400',
    activeBorder: 'border-blue-600/60 bg-blue-900/10 text-blue-300',
    cardBorder: 'border-blue-900/30',
    cardBg: 'bg-[#0a1020]',
  },
]

export default function Ideas({ onDraftFromIdea }) {
  const [tab, setTab]     = useState('capture')
  const [board, setBoard] = useState(storage.getBoard)

  // Quick capture state
  const [captureText, setCaptureText] = useState('')
  const [captureSaved, setCaptureSaved] = useState(false)
  const [bucket, setBucket] = useState('present')

  function saveCapture() {
    const text = captureText.trim()
    if (!text) return
    const item = {
      id: Date.now(),
      type: 'capture',
      bucket,
      title: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
      text,
      source: 'Quick capture',
      date: new Date().toISOString(),
    }
    const next = [item, ...board]
    setBoard(next)
    storage.setBoard(next)
    setCaptureText('')
    setCaptureSaved(true)
    setTimeout(() => setCaptureSaved(false), 2000)
  }

  function handleCaptureKey(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveCapture()
  }

  function removeBoardItem(id) {
    const next = board.filter(s => s.id !== id)
    setBoard(next); storage.setBoard(next)
  }

  function draftFromItem(item) {
    onDraftFromIdea(item.text)
  }

  // Sync board from storage when switching to board tab (picks up WeeklyScreen captures)
  function openBoard() {
    setBoard(storage.getBoard())
    setTab('board')
  }

  const TABS = [
    { id: 'capture', label: 'Capture',             onClick: () => setTab('capture') },
    { id: 'board',   label: `Board (${board.length})`, onClick: openBoard },
  ]

  return (
    <div className="flex-1 flex flex-col relative">

      {/* Tabs */}
      <div className="border-b border-[#1e3a5f] px-6 flex gap-1 pt-2 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={t.onClick}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#c5a028] text-[#c5a028]' : 'border-transparent text-[#6a80a0] hover:text-white'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* ── Capture tab ──────────────────────────────────────────────────────── */}
      {tab === 'capture' && (
        <div className="flex-1 flex flex-col px-6 py-6 max-w-2xl mx-auto w-full gap-4">
          <div className="border-l-2 border-[#c5a028]/50 pl-4 py-0.5">
            <p className="text-xs text-slate-600 font-mono uppercase tracking-wider mb-1">The filter</p>
            <p className="text-sm text-slate-300 leading-snug">
              What have I actually seen that my audience hasn't yet — and that I'm willing to say plainly?
            </p>
          </div>

          <textarea
            value={captureText}
            onChange={e => setCaptureText(e.target.value)}
            onKeyDown={handleCaptureKey}
            placeholder="Type anything. You can sort it later."
            rows={5}
            autoFocus
            className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-base leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
          />

          {/* Bucket selector */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500">Which bucket does this belong to?</p>
            <div className="flex gap-2">
              {BUCKETS.map(b => (
                <button key={b.id} onClick={() => setBucket(b.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-left transition-all ${
                    bucket === b.id
                      ? b.activeBorder
                      : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300 hover:border-slate-500'
                  }`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${b.dot}`} />
                    <span className="text-xs font-semibold">{b.label}</span>
                  </div>
                  <p className="text-xs font-normal leading-snug opacity-70">{b.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Cmd+Enter to save</span>
            <button
              onClick={saveCapture}
              disabled={!captureText.trim()}
              className="px-5 py-2.5 bg-[#c5a028] text-[#071020] text-sm font-semibold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {captureSaved ? '✓ Saved' : 'Save →'}
            </button>
          </div>

          {board.length > 0 && (
            <button
              onClick={openBoard}
              className="text-xs text-[#6a80a0] hover:text-[#c5a028] transition-colors self-start"
            >
              View board ({board.length}) →
            </button>
          )}
        </div>
      )}

      {/* ── Board tab ────────────────────────────────────────────────────────── */}
      {tab === 'board' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-2xl mx-auto">

            {board.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <p className="text-[#4a6080] text-sm">Your board is empty.</p>
                <button onClick={() => setTab('capture')}
                  className="text-xs text-[#c5a028] hover:text-[#d9b030] transition-colors">
                  Capture your first idea →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {BUCKETS.map(section => {
                  const items = board.filter(i => (i.bucket || 'present') === section.id)
                  return (
                    <div key={section.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${section.dot}`} />
                        <span className={`text-xs font-mono font-bold tracking-widest uppercase ${section.color}`}>
                          {section.long}
                        </span>
                        <span className="text-xs text-slate-600">— {section.sub}</span>
                        <span className="text-xs text-slate-700 ml-auto">{items.length}</span>
                      </div>

                      {items.length === 0 ? (
                        <p className="text-xs text-slate-700 pl-4 italic">Nothing here yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {items.map(item => (
                            <li key={item.id}
                              className={`border rounded-lg p-4 hover:border-opacity-60 transition-colors ${section.cardBorder} ${section.cardBg}`}>
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                                  <p className="text-[#4a6080] text-xs mt-2">{item.source || 'Quick capture'}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 pt-0.5">
                                  <button
                                    onClick={() => draftFromItem(item)}
                                    className="text-xs font-medium text-[#c5a028] hover:text-[#d9b030] border border-[#c5a028]/40 hover:border-[#c5a028] px-2 py-1 rounded transition-all whitespace-nowrap"
                                  >
                                    Draft →
                                  </button>
                                  <button
                                    onClick={() => removeBoardItem(item.id)}
                                    className="text-xs text-[#3a5080] hover:text-red-400 transition-colors text-center"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
