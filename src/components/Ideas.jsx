import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { fetchFeed } from '../lib/rss'

function ReflectionModal({ article, onSave, onClose }) {
  const [why, setWhy] = useState('')
  const [suggests, setSuggests] = useState('')
  const [disagree, setDisagree] = useState('')

  function handleSave() {
    onSave(article, { why: why.trim(), suggests: suggests.trim(), disagree: disagree.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-lg mx-6 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e]">
          <span className="text-sm font-semibold text-white">Save to Ideas Board</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            "{article.title}"
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">Why did this grab you?</label>
            <textarea
              value={why}
              onChange={e => setWhy(e.target.value)}
              placeholder="Optional — what made you stop on this?"
              rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">What does it suggest is true?</label>
            <textarea
              value={suggests}
              onChange={e => setSuggests(e.target.value)}
              placeholder="Optional — what belief or pattern does this point to?"
              rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-amber-400">Where do you disagree?</label>
            <textarea
              value={disagree}
              onChange={e => setDisagree(e.target.value)}
              placeholder="Optional — what does this get wrong or miss?"
              rows={2}
              className="bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2d3e]">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            Skip
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all">
            Save to Ideas Board →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Ideas() {
  const [tab, setTab]           = useState('feed')
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [saved, setSaved]       = useState(storage.getSaved)
  const [board, setBoard]       = useState(storage.getBoard)
  const [reflectionTarget, setReflectionTarget] = useState(null)

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

  function toggleSaved(article) {
    const next = saved.some(s => s.id === article.id)
      ? saved.filter(s => s.id !== article.id)
      : [...saved, article]
    setSaved(next); storage.setSaved(next)
  }

  function requestAddToBoard(article) {
    if (board.some(s => s.id === article.id)) {
      // already on board — remove it
      const next = board.filter(s => s.id !== article.id)
      setBoard(next); storage.setBoard(next)
    } else {
      setReflectionTarget(article)
    }
  }

  function handleReflectionSave(article, reflections) {
    const itemWithReflections = { ...article, reflections }
    const next = [...board, itemWithReflections]
    setBoard(next); storage.setBoard(next)
    setReflectionTarget(null)
  }

  function handleReflectionClose() {
    setReflectionTarget(null)
  }

  function removeBoardItem(article) {
    const next = board.filter(s => s.id !== article.id)
    setBoard(next); storage.setBoard(next)
  }

  const isSaved   = a => saved.some(s => s.id === a.id)
  const isOnBoard = a => board.some(s => s.id === a.id)

  const TABS = [
    { id: 'feed',  label: 'Feed' },
    { id: 'saved', label: `Saved (${saved.length})` },
    { id: 'board', label: `Ideas Board (${board.length})` },
  ]
  const display = tab === 'feed' ? articles : tab === 'saved' ? saved : board

  return (
    <div className="flex-1 flex flex-col relative">
      {reflectionTarget && (
        <ReflectionModal
          article={reflectionTarget}
          onSave={handleReflectionSave}
          onClose={handleReflectionClose}
        />
      )}

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

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && <p className="text-[#4a6080] py-8 text-center">Loading feeds…</p>}
        {error   && <p className="text-red-400 text-sm py-4">{error}</p>}

        {!loading && display.length === 0 && (
          <p className="text-[#4a6080] py-8 text-center">
            {tab === 'feed' ? 'No articles loaded.' : tab === 'saved' ? 'Nothing saved yet.' : 'Ideas board is empty.'}
          </p>
        )}

        <ul className="space-y-3">
          {display.map(article => (
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
                  {tab === 'board' && article.reflections && (
                    <div className="mt-2 flex flex-col gap-0.5">
                      {article.reflections.why && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Why:</span> {article.reflections.why}</p>}
                      {article.reflections.suggests && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Suggests:</span> {article.reflections.suggests}</p>}
                      {article.reflections.disagree && <p className="text-xs text-slate-500"><span className="text-amber-400/70">Disagree:</span> {article.reflections.disagree}</p>}
                    </div>
                  )}
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
    </div>
  )
}
