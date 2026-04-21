import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { assessInput, repurposeContent } from '../lib/anthropic'
import { loadSession, hasSession, storage } from '../lib/storage'

export default function HomeScreen() {
  const { state, dispatch, SCREENS, restoreSession } = useApp()
  const [mode, setMode]               = useState('newsletter') // 'newsletter' | 'podcast'
  const [topic, setTopic]             = useState('')
  const [podcastInput, setPodcastInput] = useState(state.rawInput || '')
  const [sourceContent, setSourceContent] = useState('')
  const [showRepurpose, setShowRepurpose] = useState(false)

  const readyIdeas = storage.getBoard().filter(i => i.stage === 'ready' && i.pipeline?.q2)

  const hasSaved = hasSession() && (() => {
    const s = loadSession()
    return !!(s && (s.rawInput || s.draftVersions?.length > 0))
  })()
  const savedPreview = (() => {
    const s = loadSession()
    if (!s) return ''
    if (s.draftVersions?.length > 0) return `Draft v${s.draftVersions.length} — ${s.outputType || 'newsletter'}`
    return (s.rawInput || '').slice(0, 60) + ((s.rawInput || '').length > 60 ? '…' : '')
  })()

  function handleContinue() {
    const saved = loadSession()
    if (saved) restoreSession(saved)
  }

  // ── Newsletter path ────────────────────────────────────────────────────────

  function startNewsletter(item) {
    dispatch({
      type: 'SET_NEWSLETTER_SEED',
      seed: item
        ? { topic: item.pipeline.q2, pipeline: item.pipeline }
        : { topic: topic.trim(), pipeline: null },
    })
  }

  // ── Podcast path ───────────────────────────────────────────────────────────

  async function startPodcast() {
    const input = (showRepurpose ? sourceContent : podcastInput).trim()
    if (!input) return

    dispatch({ type: 'SET_OUTPUT_TYPE', value: 'podcast' })
    dispatch({ type: 'SET_LOADING', value: true })
    dispatch({ type: 'SET_ERROR', message: null })

    try {
      const fn = showRepurpose ? repurposeContent : assessInput
      const result = showRepurpose
        ? await repurposeContent(input, 'podcast', state.brand)
        : await assessInput(input, state.brand, 'podcast')

      if (showRepurpose) {
        dispatch({ type: 'SET_RAW_INPUT', value: result.coreQuestion || input.slice(0, 120) })
      } else {
        dispatch({ type: 'SET_RAW_INPUT', value: input })
      }
      dispatch({ type: 'SET_ASSESSMENT', assessment: result.assessment, questions: result.questions })
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA })
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Something went wrong. Check your API key.' })
    } finally {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200 overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-white">Create</h1>
          <p className="text-slate-600 text-sm mt-0.5">Write your newsletter or podcast script.</p>
        </div>

        {/* Continue banner */}
        {hasSaved && (
          <button onClick={handleContinue}
            className="flex items-center gap-3 bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl px-5 py-4 hover:border-slate-500 transition-all text-left">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200">Continue draft in progress</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{savedPreview}</p>
            </div>
            <span className="text-amber-400 text-sm shrink-0">Continue →</span>
          </button>
        )}

        {/* Mode toggle */}
        <div className="flex gap-1 bg-[#141620] border border-[#2a2d3e] rounded-xl p-1">
          {[
            { id: 'newsletter', label: '✉️  Newsletter', sub: 'Lessons Learned' },
            { id: 'podcast',    label: '🎙️  Podcast Script', sub: 'Your Finest Hour' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={`flex-1 flex flex-col items-center py-3 rounded-lg text-sm font-medium transition-all ${
                mode === m.id
                  ? 'bg-white text-[#0f1117]'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>
              <span>{m.label}</span>
              <span className={`text-xs mt-0.5 ${mode === m.id ? 'text-slate-500' : 'text-slate-700'}`}>{m.sub}</span>
            </button>
          ))}
        </div>

        {/* ── Newsletter mode ──────────────────────────────────────────────── */}
        {mode === 'newsletter' && (
          <div className="flex flex-col gap-4">

            {/* Ready ideas */}
            {readyIdeas.length > 0 && (
              <div className="border border-[#1e3a5f] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#0d1829] border-b border-[#1e3a5f] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">Ready to write</p>
                  <span className="text-xs text-slate-600 ml-auto">{readyIdeas.length} idea{readyIdeas.length !== 1 ? 's' : ''}</span>
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

            {/* Or: write from scratch */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                {readyIdeas.length > 0 ? 'Or start with a new topic' : 'What do you want to write about?'}
              </p>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && topic.trim()) startNewsletter(null) }}
                rows={3}
                placeholder="Type your topic or a rough idea — you'll frame it on the next screen."
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
        )}

        {/* ── Podcast mode ─────────────────────────────────────────────────── */}
        {mode === 'podcast' && (
          <div className="flex flex-col gap-4">

            <div className="flex items-center gap-4">
              <button onClick={() => setShowRepurpose(false)}
                className={`text-sm transition-colors ${!showRepurpose ? 'text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}>
                New idea
              </button>
              <span className="text-slate-700">|</span>
              <button onClick={() => setShowRepurpose(true)}
                className={`text-sm transition-colors ${showRepurpose ? 'text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}>
                Build from existing piece
              </button>
            </div>

            {!showRepurpose ? (
              <textarea
                value={podcastInput}
                onChange={e => { setPodcastInput(e.target.value); dispatch({ type: 'SET_RAW_INPUT', value: e.target.value }) }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) startPodcast() }}
                rows={6}
                placeholder="What's on your mind? Dump your raw thoughts — don't shape it yet."
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors font-mono"
                autoFocus
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-slate-500">
                  Paste an existing piece. We'll extract the core idea and turn it into a podcast script.
                </p>
                <textarea
                  value={sourceContent}
                  onChange={e => setSourceContent(e.target.value)}
                  rows={6}
                  placeholder="Paste your existing newsletter, notes, or script here…"
                  className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
                  autoFocus
                />
              </div>
            )}

            {state.error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3">
                {state.error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">Cmd+Enter to submit</p>
              <button
                onClick={startPodcast}
                disabled={!(showRepurpose ? sourceContent.trim() : podcastInput.trim()) || state.isLoading}
                className="px-6 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {state.isLoading
                  ? <LoadingDots text={showRepurpose ? 'Extracting…' : 'Reading…'} />
                  : showRepurpose ? 'Build from this →' : 'Start drafting →'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

function LoadingDots({ text }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full bg-current animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      {text}
    </span>
  )
}
