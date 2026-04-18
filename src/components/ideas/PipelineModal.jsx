import { useState } from 'react'

const BUCKET_OPTIONS = [
  { id: 'core_sensemaking',  label: 'Core Sensemaking',   sub: 'How people think, decide, or understand' },
  { id: 'lens_applied',      label: 'Lens Applied',        sub: 'Your framework applied to a real domain' },
  { id: 'behind_the_scenes', label: 'Behind the Scenes',   sub: 'The podcast or creative process itself' },
]

const STEPS = ['Explore', 'Question', 'Filter', 'Surface', 'Insight', 'Caveat', 'Payoff']

export default function PipelineModal({ item, onSave, onClose }) {
  const p = item.pipeline || {}

  const startStep = (() => {
    if (!p.q1)     return 0
    if (!p.q2)     return 1
    if (p.bucket == null) return 2
    if (!p.q4)     return 3
    if (!p.q5)     return 4
    if (!p.q6)     return 5
    return 6
  })()

  const [step,         setStep]        = useState(startStep)
  const [q1,           setQ1]          = useState(p.q1           || item.text || '')
  const [q2,           setQ2]          = useState(p.q2           || '')
  const [filterConvo,  setFilterConvo] = useState(p.filterConvo  ?? null)
  const [filterUseful, setFilterUseful]= useState(p.filterUseful ?? null)
  const [bucket,       setBucket]      = useState(p.bucket       || null)
  const [q4,           setQ4]          = useState(p.q4           || '')
  const [q5,           setQ5]          = useState(p.q5           || '')
  const [q5Connect,    setQ5Connect]   = useState(p.q5Connection || '')
  const [q6,           setQ6]          = useState(p.q6           || '')
  const [q7,           setQ7]          = useState(p.q7           || '')
  const [filterFailed, setFilterFailed]= useState(false)

  function currentPipeline() {
    return { q1, q2, filterConvo, filterUseful, bucket, q4, q5, q5Connection: q5Connect, q6, q7 }
  }

  function buildSave(stage) {
    return { ...item, pipeline: currentPipeline(), stage, bucket: bucket || item.bucket }
  }

  function persist(stage = 'in_progress') {
    onSave(buildSave(stage))
  }

  function advance() {
    if (step === 0) {
      if (!q1.trim()) return
      persist(); setStep(1)
    } else if (step === 1) {
      if (!q2.trim()) return
      persist(); setStep(2)
    } else if (step === 2) {
      if (filterConvo === false || filterUseful === false) { setFilterFailed(true); return }
      if (filterConvo !== true || filterUseful !== true || !bucket) return
      persist(); setStep(3)
    } else if (step === 3) {
      if (!q4.trim()) return
      persist(); setStep(4)
    } else if (step === 4) {
      if (!q5.trim()) return
      if (bucket !== 'core_sensemaking' && !q5Connect.trim()) {
        persist('draft')
        onClose()
        return
      }
      persist(); setStep(5)
    } else if (step === 5) {
      if (!q6.trim()) return
      persist(); setStep(6)
    } else if (step === 6) {
      if (!q7.trim()) return
      onSave(buildSave('ready'))
      onClose()
    }
  }

  function killIdea() {
    onSave(buildSave('killed'))
    onClose()
  }

  const canAdvance = (() => {
    if (step === 0) return q1.trim().length > 0
    if (step === 1) return q2.trim().length > 0
    if (step === 2) return filterConvo === true && filterUseful === true && !!bucket
    if (step === 3) return q4.trim().length > 0
    if (step === 4) return q5.trim().length > 0
    if (step === 5) return q6.trim().length > 0
    if (step === 6) return q7.trim().length > 0
    return false
  })()

  const isDraftStep  = step === 4 && bucket !== 'core_sensemaking'
  const willDraft    = isDraftStep && q5.trim() && !q5Connect.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e] shrink-0">
          <div>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Idea Pipeline</p>
            <p className="text-sm text-slate-300 mt-0.5 line-clamp-1">{item.title || item.text?.slice(0, 60)}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="flex items-center">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full text-[10px] font-bold border flex items-center justify-center shrink-0 transition-all ${
                  i < step    ? 'bg-[#c5a028] border-[#c5a028] text-[#071020]'
                  : i === step ? 'border-[#c5a028] text-[#c5a028]'
                               : 'border-[#2a2d3e] text-slate-600'
                }`}>{i < step ? '✓' : i + 1}</div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-[#c5a028]/40' : 'bg-[#2a2d3e]'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#c5a028] mt-1.5 font-mono tracking-wide">{STEPS[step]}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filterFailed ? (
            <div className="flex flex-col gap-4">
              <div className="border border-red-900/40 bg-red-900/10 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-red-300">This idea doesn't pass the filter.</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  It either wouldn't come up in real conversation or it's not useful in real life. Kill it — you can retrieve it later.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setFilterFailed(false)}
                  className="flex-1 px-4 py-2.5 border border-[#2a2d3e] text-slate-400 hover:text-white text-sm rounded-lg transition-colors">
                  Go back and reconsider
                </button>
                <button onClick={killIdea}
                  className="flex-1 px-4 py-2.5 bg-red-900/40 border border-red-700/40 text-red-300 hover:bg-red-900/70 text-sm rounded-lg transition-colors font-medium">
                  Kill it
                </button>
              </div>
            </div>

          ) : step === 0 ? (
            <Field
              q="What's bothering or interesting you about this?"
              hint="Start from what you actually noticed — not what you think you should say."
              value={q1} onChange={setQ1} rows={6}
            />
          ) : step === 1 ? (
            <Field
              q="If you had to ask this as one plain question, what would it be?"
              hint="This becomes your article title. Make it specific enough to answer."
              value={q2} onChange={setQ2} rows={2}
            />
          ) : step === 2 ? (
            <div className="flex flex-col gap-5">
              <Toggle label="Would this come up in a real conversation?" value={filterConvo} onChange={setFilterConvo} />
              <Toggle label="Is it useful in real life?" value={filterUseful} onChange={setFilterUseful} />
              {filterConvo === true && filterUseful === true && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-slate-400 font-medium">Assign a bucket</p>
                  {BUCKET_OPTIONS.map(b => (
                    <button key={b.id} onClick={() => setBucket(b.id)}
                      className={`text-left px-4 py-3 rounded-xl border transition-all ${
                        bucket === b.id
                          ? 'border-[#c5a028] bg-[#1a1800] text-white'
                          : 'border-[#2a2d3e] text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      }`}>
                      <p className="text-sm font-medium">{b.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{b.sub}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : step === 3 ? (
            <Field
              q="What's the surface-level answer most people would give, and why is it insufficient?"
              hint="State the common belief plainly first, then explain what it misses."
              value={q4} onChange={setQ4} rows={6}
            />
          ) : step === 4 ? (
            <div className="flex flex-col gap-5">
              <Field
                q="What does your lens let you see that most people miss?"
                hint="A hidden dynamic, incentive, or unstated assumption."
                value={q5} onChange={setQ5} rows={5}
              />
              {bucket !== 'core_sensemaking' && (
                <div className="border-t border-[#2a2d3e] pt-4">
                  <Field
                    q="In one sentence, how does this connect back to sensemaking?"
                    hint="Leave blank to save as draft and come back to it."
                    value={q5Connect} onChange={setQ5Connect} rows={2}
                  />
                </div>
              )}
            </div>
          ) : step === 5 ? (
            <Field
              q="What's the cost, limit, or warning label?"
              hint="When does this break down? What could go wrong? What's the honest catch?"
              value={q6} onChange={setQ6} rows={6}
            />
          ) : (
            <Field
              q="What should a reader be able to do differently after reading?"
              hint="Concrete and specific — not 'think differently' but what they'd actually do."
              value={q7} onChange={setQ7} rows={6}
            />
          )}
        </div>

        {/* Footer */}
        {!filterFailed && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2d3e] shrink-0">
            <button
              onClick={step > 0 ? () => setStep(s => s - 1) : onClose}
              className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              {step > 0 ? '← Back' : 'Cancel'}
            </button>
            <div className="flex items-center gap-3">
              {willDraft && (
                <span className="text-xs text-slate-600">Saves as draft to revisit</span>
              )}
              <button onClick={advance} disabled={!canAdvance}
                className="px-5 py-2 bg-[#c5a028] text-[#071020] text-sm font-semibold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {step === 6 ? 'Complete →' : willDraft ? 'Save as draft →' : 'Next →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ q, hint, value, onChange, rows = 4 }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-sm font-semibold text-white leading-snug">{q}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        rows={rows} autoFocus
        className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
      />
    </div>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <div className="flex gap-2">
        <button onClick={() => onChange(true)}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            value === true
              ? 'border-green-600 bg-green-900/30 text-green-300'
              : 'border-[#2a2d3e] text-slate-500 hover:border-slate-500 hover:text-slate-300'
          }`}>Yes</button>
        <button onClick={() => onChange(false)}
          className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
            value === false
              ? 'border-red-700 bg-red-900/20 text-red-300'
              : 'border-[#2a2d3e] text-slate-500 hover:border-slate-500 hover:text-slate-300'
          }`}>No</button>
      </div>
    </div>
  )
}
