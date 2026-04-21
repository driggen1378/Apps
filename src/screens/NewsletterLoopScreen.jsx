import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { generateNewsletter } from '../lib/anthropic'
import { storage } from '../lib/storage'

const FRAMEWORKS = [
  {
    id: 'pain_process',
    label: 'Pain & Process',
    tag: 'Beginner',
    desc: 'Name the pain → give the process to fix it. Direct and actionable.',
  },
  {
    id: 'pain_concept_process',
    label: 'Pain + Concept + Process',
    tag: 'Intermediate',
    desc: 'Name the pain → reframe with a concept → give the process.',
  },
  {
    id: 'perspective_advantage_gamify',
    label: 'Perspective + Advantage + Gamify',
    tag: 'Advanced',
    desc: 'Counter-intuitive perspective → unfair advantage → repeatable system.',
  },
]

export default function NewsletterLoopScreen({ seed }) {
  const { dispatch, SCREENS } = useApp()
  const brand = storage.getBrand()

  // seed can be { topic, pipeline } from clicking a ready idea
  const [topic,     setTopic]     = useState(seed?.topic     || '')
  const [mainPoint, setMainPoint] = useState(seed?.pipeline?.q5 || '')
  const [whyNow,    setWhyNow]    = useState('')
  const [takeaway,  setTakeaway]  = useState(seed?.pipeline?.q7 || '')
  const [framework, setFramework] = useState('pain_process')
  const [step,      setStep]      = useState('frame') // frame | generating | done
  const [error,     setError]     = useState('')

  const canGenerate = topic.trim() && mainPoint.trim() && whyNow.trim() && takeaway.trim()

  async function generate() {
    setStep('generating')
    setError('')
    try {
      const result = await generateNewsletter({
        topic: topic.trim(),
        pipeline: seed?.pipeline || null,
        frame: {
          mainPoint: mainPoint.trim(),
          whyNow:    whyNow.trim(),
          takeaway:  takeaway.trim(),
        },
        framework,
        brand,
      })
      dispatch({ type: 'SET_OUTPUT_TYPE',   value: 'newsletter' })
      dispatch({ type: 'ADD_DRAFT_VERSION', draft: result.draft, wordCount: result.wordCount })
      dispatch({ type: 'SET_SCREEN',        screen: SCREENS.DRAFT })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStep('frame')
    }
  }

  function back() {
    dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })
  }

  const pipelineFields = seed?.pipeline && [
    seed.pipeline.q4 && { label: 'Opening angle',  value: seed.pipeline.q4 },
    seed.pipeline.q6 && { label: 'Caveat',          value: seed.pipeline.q6 },
  ].filter(Boolean)

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200">

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#1e2a3a] flex items-center gap-4 shrink-0">
        <button onClick={back} className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
          ← Back
        </button>
        <div>
          <p className="text-white font-semibold text-sm">Write Newsletter</p>
          <p className="text-slate-600 text-xs mt-0.5">
            {step === 'generating' ? 'Generating your draft…' : 'Frame your idea, then generate'}
          </p>
        </div>
      </div>

      {step === 'generating' ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-[#c5a028] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-slate-500 text-sm">Writing your newsletter…</p>
            <p className="text-slate-700 text-xs">Using Haiku — fast and affordable</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-xl mx-auto flex flex-col gap-5">

            {/* Topic */}
            <Field label="Topic" hint="The one idea this newsletter is about">
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={2}
                placeholder="e.g. Your phone isn't distracting you — it's training your standards"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
              />
            </Field>

            {/* Pipeline context pill — read-only reminder */}
            {pipelineFields?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {pipelineFields.map(f => (
                  <div key={f.label} className="flex gap-2 text-xs">
                    <span className="text-slate-600 shrink-0">{f.label}:</span>
                    <span className="text-slate-500 line-clamp-2">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 3 framing questions */}
            <Field label="Main point" hint="The one sentence you want them to leave with">
              <textarea
                value={mainPoint}
                onChange={e => setMainPoint(e.target.value)}
                rows={2}
                placeholder="What is the core claim or insight?"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
              />
            </Field>

            <Field label="Why now" hint="Why does this matter to your reader this week?">
              <textarea
                value={whyNow}
                onChange={e => setWhyNow(e.target.value)}
                rows={2}
                placeholder="What's the current tension, moment, or pressure that makes this relevant?"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
              />
            </Field>

            <Field label="Reader takeaway" hint="What should they do or feel after reading?">
              <textarea
                value={takeaway}
                onChange={e => setTakeaway(e.target.value)}
                rows={2}
                placeholder="What's the one thing you want them to do, feel, or think differently about?"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
              />
            </Field>

            {/* Framework */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Framework</p>
              <div className="flex flex-col gap-2">
                {FRAMEWORKS.map(f => (
                  <button key={f.id} onClick={() => setFramework(f.id)}
                    className={`text-left px-4 py-3 rounded-lg border transition-all ${
                      framework === f.id
                        ? 'border-[#c5a028]/60 bg-[#c5a028]/8 text-white'
                        : 'border-[#1e2a3a] text-slate-500 hover:text-slate-300 hover:border-[#2a3a4a]'
                    }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{f.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        framework === f.id ? 'bg-[#c5a028]/20 text-[#c5a028]' : 'bg-[#1e2a3a] text-slate-600'
                      }`}>{f.tag}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              onClick={generate}
              disabled={!canGenerate}
              className="w-full py-3 bg-[#c5a028] text-[#071020] font-bold text-sm rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Generate newsletter →
            </button>

            <p className="text-center text-slate-700 text-xs">~$0.007 · Haiku · 700–1000 words</p>

          </div>
        </div>
      )}
    </div>
  )
}

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
