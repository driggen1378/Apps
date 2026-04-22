import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { generateNewsletter } from '../lib/anthropic'
import { storage } from '../lib/storage'

const FRAMEWORKS = [
  {
    id: 'pain_process',
    label: 'Pain & Process',
    tag: 'Direct',
    desc: 'Name the pain the reader already feels → give the process to resolve it.',
  },
  {
    id: 'pain_concept_process',
    label: 'Pain + Concept + Process',
    tag: 'Reframe',
    desc: 'Name the pain → introduce a mental model that reframes it → give the process.',
  },
  {
    id: 'perspective_advantage_gamify',
    label: 'Perspective + Advantage + System',
    tag: 'Counter',
    desc: 'Challenge a common belief → show the unfair advantage this reveals → make it a system.',
  },
]

const READER_STATE_CONFIG = {
  pain_process: {
    label: "Reader's entry point",
    hint: 'What pain or frustration does your reader already feel about this?',
    placeholder: 'e.g. They feel stuck because they\'re doing everything right but still not moving forward',
  },
  pain_concept_process: {
    label: "Reader's entry point",
    hint: 'What pain or frustration does your reader already feel about this?',
    placeholder: 'e.g. They keep trying to get more done but end up burning out and resenting it',
  },
  perspective_advantage_gamify: {
    label: 'Belief to challenge',
    hint: 'What common belief or assumption are you going to push back on?',
    placeholder: 'e.g. Most people think working harder automatically means earning more',
  },
}

export default function NewsletterLoopScreen({ seed }) {
  const { dispatch, SCREENS } = useApp()
  const brand = storage.getBrand()

  const [topic,       setTopic]       = useState(seed?.topic || '')
  const [framework,   setFramework]   = useState('pain_process')
  const [readerState, setReaderState] = useState('')
  const [sections,    setSections]    = useState(['', '', ''])
  const [anchor,      setAnchor]      = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  const filledSections = sections.filter(s => s.trim())
  const canGenerate = topic.trim() && readerState.trim() && filledSections.length >= 2

  function addSection() {
    if (sections.length < 5) setSections([...sections, ''])
  }

  function removeSection(i) {
    if (sections.length > 2) setSections(sections.filter((_, idx) => idx !== i))
  }

  function updateSection(i, val) {
    setSections(sections.map((s, idx) => idx === i ? val : s))
  }

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const result = await generateNewsletter({
        topic:    topic.trim(),
        pipeline: seed?.pipeline || null,
        frame: {
          readerState: readerState.trim(),
          sections:    sections.filter(s => s.trim()),
          anchor:      anchor.trim(),
        },
        framework,
        brand,
      })
      storage.saveDraft({
        id:         Date.now(),
        title:      topic.trim(),
        content:    result.draft,
        wordCount:  result.wordCount,
        outputType: 'newsletter',
      })
      dispatch({ type: 'SET_OUTPUT_TYPE',   value: 'newsletter' })
      dispatch({ type: 'ADD_DRAFT_VERSION', draft: result.draft, wordCount: result.wordCount })
      dispatch({ type: 'SET_SCREEN',        screen: SCREENS.DRAFT })
    } catch (err) {
      setError(err.message || 'Something went wrong. Check your API key.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0f1117] gap-4">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#c5a028] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
        <p className="text-slate-400 text-sm">Writing your newsletter…</p>
        <p className="text-slate-600 text-xs">Haiku · ~$0.007 · 700–800 words</p>
      </div>
    )
  }

  const rsConfig = READER_STATE_CONFIG[framework]

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#1e2a3a] flex items-center gap-4 shrink-0">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
          ← Back
        </button>
        <div>
          <p className="text-white font-semibold text-sm">Write Newsletter</p>
          <p className="text-slate-600 text-xs mt-0.5">Fill in the pieces — generation takes ~10 seconds</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-xl mx-auto flex flex-col gap-6">

          {/* Topic */}
          <Field label="Topic" hint="The one question or tension this issue answers">
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              rows={2}
              placeholder="e.g. Why getting better at something can make you worse at knowing when to stop"
              className={input}
            />
          </Field>

          {/* Framework — placed early so Q3 adapts */}
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Structure</p>
              <p className="text-xs text-slate-600">How do you want to move the reader?</p>
            </div>
            <div className="flex flex-col gap-2">
              {FRAMEWORKS.map(f => (
                <button key={f.id} onClick={() => setFramework(f.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all ${
                    framework === f.id
                      ? 'border-[#c5a028]/50 bg-[#c5a028]/5 text-white'
                      : 'border-[#1e2a3a] text-slate-500 hover:text-slate-300 hover:border-[#2a3a4a]'
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      framework === f.id ? 'bg-[#c5a028]/15 text-[#c5a028]' : 'bg-[#1e2a3a] text-slate-600'
                    }`}>{f.tag}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline context */}
          {seed?.pipeline && (
            <PipelineContext pipeline={seed.pipeline} />
          )}

          {/* Q3 — adaptive based on framework */}
          <Field label={rsConfig.label} hint={rsConfig.hint}>
            <textarea
              value={readerState}
              onChange={e => setReaderState(e.target.value)}
              rows={2}
              placeholder={rsConfig.placeholder}
              className={input}
              autoFocus={!!seed?.topic}
            />
          </Field>

          {/* Q4 — section ideas */}
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key sections</p>
              <p className="text-xs text-slate-600">What are the 2–5 main points or moves in this piece?</p>
            </div>
            <div className="flex flex-col gap-2">
              {sections.map((s, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-xs text-slate-700 font-mono mt-3.5 w-4 shrink-0">{i + 1}</span>
                  <textarea
                    value={s}
                    onChange={e => updateSection(i, e.target.value)}
                    rows={2}
                    placeholder={
                      i === 0 ? 'e.g. Why the standard advice fails — and what it misses' :
                      i === 1 ? 'e.g. The one shift that actually changes the outcome' :
                      i === 2 ? 'e.g. How to apply this without losing momentum' :
                      'Add another key point…'
                    }
                    className={`${input} flex-1`}
                  />
                  {sections.length > 2 && (
                    <button
                      onClick={() => removeSection(i)}
                      className="text-slate-700 hover:text-red-400 transition-colors text-xs mt-3 px-1">
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {sections.length < 5 && (
              <button
                onClick={addSection}
                className="mt-2 text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1">
                <span className="text-base leading-none">+</span> Add section
              </button>
            )}
          </div>

          {/* Q5 — optional anchor material */}
          <Field
            label="Anchor material"
            hint="Optional — a quote, stat, concept, or anecdote to weave in">
            <textarea
              value={anchor}
              onChange={e => setAnchor(e.target.value)}
              rows={2}
              placeholder="e.g. "Most people don't have a skill problem, they have a positioning problem." — Dan Koe"
              className={input}
            />
          </Field>

          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            onClick={generate}
            disabled={!canGenerate}
            className="w-full py-3.5 bg-[#c5a028] text-[#071020] font-bold text-sm rounded-xl hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Generate newsletter →
          </button>

          {!canGenerate && (
            <p className="text-xs text-slate-700 text-center -mt-2">
              {!topic.trim() && 'Add a topic · '}
              {!readerState.trim() && 'Fill in the reader entry point · '}
              {filledSections.length < 2 && `Add ${2 - filledSections.length} more section${2 - filledSections.length !== 1 ? 's' : ''}`}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}

const input = 'w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors'

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        {hint && <p className="text-xs text-slate-600">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function PipelineContext({ pipeline }) {
  const fields = [
    pipeline.q4 && { label: 'Opening angle', value: pipeline.q4 },
    pipeline.q5 && { label: 'Core insight',  value: pipeline.q5 },
    pipeline.q6 && { label: 'Caveat',        value: pipeline.q6 },
    pipeline.q7 && { label: 'Payoff',        value: pipeline.q7 },
  ].filter(Boolean)

  if (!fields.length) return null

  return (
    <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl px-4 py-3 flex flex-col gap-1.5">
      <p className="text-xs font-mono text-[#4a7080] uppercase tracking-wider mb-0.5">From your pipeline</p>
      {fields.map(f => (
        <div key={f.label} className="flex gap-2 text-xs">
          <span className="text-slate-600 shrink-0 w-24">{f.label}:</span>
          <span className="text-slate-400 leading-relaxed">{f.value}</span>
        </div>
      ))}
    </div>
  )
}
