import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { loadSession, hasSession, storage } from '../lib/storage'

export default function HomeScreen() {
  const { state, dispatch, SCREENS, restoreSession } = useApp()
  const [topic, setTopic] = useState('')

  const readyIdeas = storage.getBoard().filter(i => i.stage === 'ready' && i.pipeline?.q2)

  const hasSaved = hasSession() && (() => {
    const s = loadSession()
    return !!(s && s.draftVersions?.length > 0)
  })()
  const savedPreview = (() => {
    const s = loadSession()
    if (!s || !s.draftVersions?.length) return ''
    return `Draft v${s.draftVersions.length}`
  })()

  function handleContinue() {
    const saved = loadSession()
    if (saved) restoreSession(saved)
  }

  function startNewsletter(item) {
    dispatch({
      type: 'SET_NEWSLETTER_SEED',
      seed: item
        ? { topic: item.pipeline.q2, pipeline: item.pipeline }
        : { topic: topic.trim(), pipeline: null },
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-white">Write</h1>
          <p className="text-slate-600 text-sm mt-0.5">Pick an idea or start with a topic.</p>
        </div>

        {/* Continue banner */}
        {hasSaved && (
          <button onClick={handleContinue}
            className="flex items-center gap-3 bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl px-5 py-4 hover:border-slate-500 transition-all text-left">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">Continue draft in progress</p>
              <p className="text-xs text-slate-500 mt-0.5">{savedPreview}</p>
            </div>
            <span className="text-amber-400 text-sm shrink-0">Continue →</span>
          </button>
        )}

        {/* Ready ideas */}
        {readyIdeas.length > 0 && (
          <div className="border border-[#1e3a5f] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-[#0d1829] border-b border-[#1e3a5f] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">Ready to write</p>
              <span className="text-xs text-slate-600 ml-auto">{readyIdeas.length}</span>
            </div>
            <ul className="divide-y divide-[#1e3a5f]">
              {readyIdeas.map(item => (
                <li key={item.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#0d1829] transition-colors cursor-pointer"
                  onClick={() => startNewsletter(item)}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 leading-snug">{item.pipeline.q2}</p>
                    {item.pipeline.bucket && (
                      <p className="text-xs text-slate-600 mt-0.5">{item.pipeline.bucket.replace(/_/g, ' ')}</p>
                    )}
                  </div>
                  <span className="text-xs text-[#c5a028] shrink-0">Write →</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* New topic */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
            {readyIdeas.length > 0 ? 'Or start with a new topic' : 'What do you want to write about?'}
          </p>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && topic.trim()) startNewsletter(null) }}
            rows={3}
            placeholder="Type a topic or rough idea — you'll shape it on the next screen."
            className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
            autoFocus={readyIdeas.length === 0}
          />
          <div className="flex justify-end">
            <button
              onClick={() => startNewsletter(null)}
              disabled={!topic.trim()}
              className="px-6 py-2.5 bg-[#c5a028] text-[#071020] text-sm font-bold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Start writing →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
