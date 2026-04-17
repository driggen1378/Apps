import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { fetchFeed } from '../lib/rss'

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

function ReflectionModal({ article, onSave, onClose }) {
  const [why, setWhy] = useState('')
  const [suggests, setSuggests] = useState('')
  const [disagree, setDisagree] = useState('')
  const [bucket, setBucket] = useState('present')

  function handleSave() {
    onSave(article, { why: why.trim(), suggests: suggests.trim(), disagree: disagree.trim() }, bucket)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-lg mx-6 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e]">
          <span className="text-sm font-semibold text-white">Save to Ideas Board</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            "{article.title}"
          </p>

          {/* Bucket selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Which bucket?</label>
            <div className="flex gap-2">
              {BUCKETS.map(b => (
                <button key={b.id} onClick={() => setBucket(b.id)}
                  className={`flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all text-left ${
                    bucket === b.id ? b.activeBorder : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300 hover:border-slate-500'
                  }`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                    {b.label}
                  </div>
                  <div className="text-slate-600 font-normal text-xs leading-tight">{b.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">Why did this grab you?</label>
            <textarea value={why} onChange={e => setWhy(e.target.value)}
              placeholder="Optional — what made you stop on this?" rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">What does it suggest is true?</label>
            <textarea value={suggests} onChange={e => setSuggests(e.target.value)}
              placeholder="Optional — what belief or pattern does this point to?" rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">Where do you disagree?</label>
            <textarea value={disagree} onChange={e => setDisagree(e.target.value)}
              placeholder="Optional — what does this get wrong or miss?" rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors" />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2d3e]">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</button>
          <button onClick={handleSave}
            className="px-5 py-2 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all">
            Save to Ideas Board →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Ideas({ onDraftFromIdea }) {
  const [tab, setTab]           = useState('capture')
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [saved, setSaved]       = useState(storage.getSaved)
  const [board, setBoard]       = useState(storage.getBoard)
  const [reflectionTarget, setReflectionTarget] = useState(null)

  // Quick capture state
  const [captureText, setCaptureText] = useState('')
  const [captureSaved, setCaptureSaved] = useState(false)
  const [bucket, setBucket] = useState('present')

  useEffect(() => { if (tab === 'feed') loadFeeds() }, [tab])

  async function loadFeeds() {
    const feeds = storage.getBrand().rssFeeds || []
    if (!feeds.length) {
      setError('No RSS feeds configured — add them in Brand Settings.')
      return
    }
    setLoading(true); setError('')
    try {
      const results = await Promise.allSettled(feeds.map(fetchFeed))
      const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
      all.sort((a, b) => new Date(b.date) - new Date(a.date))
      setArticles(all)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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

  function toggleSaved(article) {
    const next = saved.some(s => s.id === article.id)
      ? saved.filter(s => s.id !== article.id)
      : [...saved, article]
    setSaved(next); storage.setSaved(next)
  }

  function requestAddToBoard(article) {
    if (board.some(s => s.id === article.id)) {
      const next = board.filter(s => s.id !== article.id)
      setBoard(next); storage.setBoard(next)
    } else {
      setReflectionTarget(article)
    }
  }

  function handleReflectionSave(article, reflections, bucketId) {
    const item = { ...article, reflections, bucket: bucketId }
    const next = [item, ...board.filter(s => s.id !== article.id)]
    setBoard(next); storage.setBoard(next)
    setReflectionTarget(null)
  }

  function removeBoardItem(id) {
    const next = board.filter(s => s.id !== id)
    setBoard(next); storage.setBoard(next)
  }

  function draftFromItem(item) {
    const text = item.type === 'capture'
      ? item.text
      : [item.title, item.reflections?.why, item.reflections?.suggests].filter(Boolean).join('\n\n')
    onDraftFromIdea(text)
  }

  const isSaved   = a => saved.some(s => s.id === a.id)
  const isOnBoard = a => board.some(s => s.id === a.id)

  const TABS = [
    { id: 'capture', label: 'Capture' },
    { id: 'board',   label: `Board (${board.length})` },
    { id: 'feed',    label: 'Feed' },
    { id: 'saved',   label: `Saved (${saved.length})` },
  ]

  return (
    <div className="flex-1 flex flex-col relative">
      {reflectionTarget && (
        <ReflectionModal
          article={reflectionTarget}
          onSave={handleReflectionSave}
          onClose={() => setReflectionTarget(null)}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-[#1e3a5f] px-6 flex gap-1 pt-2 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#c5a028] text-[#c5a028]' : 'border-transparent text-[#6a80a0] hover:text-white'
            }`}>{t.label}</button>
        ))}
        {tab === 'feed' && (
          <button onClick={loadFeeds} className="ml-auto text-[#4a6080] text-xs hover:text-[#c5a028] py-2.5">
            ↻ Refresh
          </button>
        )}
      </div>

      {/* ── Capture tab ──────────────────────────────────────────────────────── */}
      {tab === 'capture' && (
        <div className="flex-1 flex flex-col px-6 py-6 max-w-2xl mx-auto w-full gap-4">
          <div>
            <p className="text-sm text-white font-medium mb-0.5">What's rattling around?</p>
            <p className="text-xs text-slate-500">
              Dump it raw — a phrase, a question, an observation, a half-formed thing. No editing.
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
              onClick={() => setTab('board')}
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

            {/* Why Me — pinned thesis */}
            <div className="mb-6 bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-5 py-4">
              <p className="text-xs text-slate-600 font-mono uppercase tracking-wider mb-2">Why you</p>
              <p className="text-sm text-white font-medium leading-relaxed">
                What have I actually seen that my audience hasn't — and am I willing to say it plainly?
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                My pattern recognition and my lens: how humans make decisions under pressure and within daily systems.
              </p>
            </div>

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
                                  {item.type === 'capture' ? (
                                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                                  ) : (
                                    <>
                                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                                        className="text-white font-medium hover:text-[#c5a028] transition-colors line-clamp-2 block">
                                        {item.title}
                                      </a>
                                      {item.description && (
                                        <p className="text-[#6a80a0] text-sm mt-1 line-clamp-2">{item.description}</p>
                                      )}
                                      {item.reflections && (
                                        <div className="mt-2 flex flex-col gap-0.5">
                                          {item.reflections.why && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Why:</span> {item.reflections.why}</p>}
                                          {item.reflections.suggests && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Suggests:</span> {item.reflections.suggests}</p>}
                                          {item.reflections.disagree && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Disagree:</span> {item.reflections.disagree}</p>}
                                        </div>
                                      )}
                                    </>
                                  )}
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

      {/* ── Feed + Saved tabs ─────────────────────────────────────────────────── */}
      {(tab === 'feed' || tab === 'saved') && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && <p className="text-[#4a6080] py-8 text-center">Loading feeds…</p>}
          {error   && <p className="text-red-400 text-sm py-4">{error}</p>}

          {!loading && (tab === 'feed' ? articles : saved).length === 0 && (
            <p className="text-[#4a6080] py-8 text-center">
              {tab === 'feed' ? 'No articles loaded.' : 'Nothing saved yet.'}
            </p>
          )}

          <ul className="space-y-3">
            {(tab === 'feed' ? articles : saved).map(article => (
              <li key={article.id} className="bg-[#112040] border border-[#2a4070] rounded-lg p-4 hover:border-[#3a5080] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <a href={article.link} target="_blank" rel="noopener noreferrer"
                      className="text-white font-medium hover:text-[#c5a028] transition-colors line-clamp-2 block">
                      {article.title}
                    </a>
                    {article.description && (
                      <p className="text-[#6a80a0] text-sm mt-1 line-clamp-2">{article.description}</p>
                    )}
                    <p className="text-[#4a6080] text-xs mt-1.5">{article.source}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 pt-0.5">
                    <button onClick={() => toggleSaved(article)}
                      title={isSaved(article) ? 'Remove from saved' : 'Save for later'}
                      className={`text-base transition-colors ${isSaved(article) ? 'text-[#c5a028]' : 'text-[#3a5080] hover:text-[#c5a028]'}`}>
                      🔖
                    </button>
                    <button
                      onClick={() => requestAddToBoard(article)}
                      title={isOnBoard(article) ? 'Remove from ideas board' : 'Add to ideas board'}
                      className={`text-base transition-colors ${isOnBoard(article) ? 'text-green-400' : 'text-[#3a5080] hover:text-green-400'}`}>
                      💡
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
