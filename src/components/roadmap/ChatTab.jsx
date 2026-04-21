import { useState } from 'react'
import { generateOKRs } from '../../lib/anthropic'
import { TAG_COLORS } from './constants'

function PreviewCard({ obj, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="border border-[#2a2d3e] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#141620] hover:bg-[#1a1d2e] transition-colors text-left gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-slate-600 font-mono shrink-0">OBJ</span>
          <span className="text-sm font-semibold text-white truncate">{obj.title}</span>
          {obj.tags?.map(t => (
            <span key={t} className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {obj.dueDate && <span className="text-xs text-slate-600">{obj.dueDate}</span>}
          <span className="text-slate-600 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#1e2130]">
          {obj.description && (
            <p className="px-4 py-2 text-xs text-slate-500 leading-relaxed border-b border-[#1e2130]">{obj.description}</p>
          )}
          {(obj.keyResults || []).map((kr, ki) => (
            <div key={ki} className="border-b border-[#1e2130] last:border-0">
              <div className="flex items-start gap-3 px-4 py-3 bg-[#0f1117]">
                <span className="text-xs text-slate-700 font-mono shrink-0 mt-0.5">KR</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-medium text-slate-200">{kr.title}</p>
                    {kr.tags?.map(t => (
                      <span key={t} className={`text-xs px-1.5 py-0.5 rounded-full border capitalize ${TAG_COLORS[t] || 'bg-slate-700/30 text-slate-300 border-slate-600/40'}`}>{t}</span>
                    ))}
                  </div>
                  {kr.description && <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{kr.description}</p>}
                  {(kr.targets || []).map((tgt, ti) => (
                    <div key={ti} className="mt-2 pl-3 border-l border-[#2a2d3e] flex items-start gap-2">
                      <span className="text-xs text-slate-700 font-mono shrink-0">T</span>
                      <div>
                        <p className="text-xs text-slate-400">{tgt.title}</p>
                        {tgt.description && <p className="text-xs text-slate-600 mt-0.5">{tgt.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {kr.dueDate && <span className="text-xs text-slate-700 shrink-0">{kr.dueDate}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChatTab({ onImport }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [imported, setImported] = useState(false)

  async function handleGenerate() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setError(null)
    setPreview(null)
    setImported(false)
    try {
      const result = await generateOKRs(prompt)
      if (!result.objectives?.length) throw new Error('No OKRs returned. Try a more detailed description.')
      setPreview(result)
    } catch (err) {
      setError(err.message || 'Generation failed. Check your API key.')
    } finally {
      setLoading(false)
    }
  }

  function handleImport() {
    if (!preview) return
    onImport(preview)
    setImported(true)
    setPreview(null)
    setPrompt('')
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">

        {!preview && !imported && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Describe your plan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Write your goals, strategy, or roadmap in plain language. As much or as little detail as you have.
                The AI will structure it into Objectives → Key Results → Targets.
              </p>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
              placeholder={`e.g. "We want to launch a new product line by Q3, grow our newsletter to 5,000 subscribers, and hire two senior team members. We also need to restructure our operations to support a remote team..."`}
              rows={7}
              autoFocus
              className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
              disabled={loading}
            />

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button onClick={handleGenerate} disabled={!prompt.trim() || loading}
              className="w-full px-4 py-3 bg-white text-[#0f1117] text-sm font-semibold rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
              {loading ? (
                <><LoadingDots dark /><span>Generating OKRs…</span></>
              ) : 'Generate OKRs →'}
            </button>

            {loading && (
              <p className="text-xs text-slate-600 text-center">
                Parsing your plan into Objectives, Key Results, and Targets…
              </p>
            )}
          </>
        )}

        {imported && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <p className="text-white font-semibold">OKRs added to your board.</p>
            <p className="text-xs text-slate-500">Switch to Board or Timeline to view and edit them.</p>
            <button onClick={() => { setImported(false); setPrompt('') }}
              className="mt-2 text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
              Add another plan →
            </button>
          </div>
        )}

        {preview && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Review your OKRs</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {preview.objectives.length} objectives · {preview.objectives.reduce((s, o) => s + (o.keyResults?.length || 0), 0)} key results · {preview.objectives.reduce((s, o) => s + (o.keyResults?.reduce((ss, kr) => ss + (kr.targets?.length || 0), 0) || 0), 0)} targets
                </p>
              </div>
              <button onClick={() => setPreview(null)}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ← Edit prompt
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {preview.objectives.map((obj, i) => (
                <PreviewCard key={i} obj={obj} index={i} />
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setPreview(null)}
                className="flex-1 px-4 py-2.5 border border-[#2a2d3e] text-slate-400 hover:text-white hover:border-slate-500 text-sm rounded-xl transition-all">
                Regenerate
              </button>
              <button onClick={handleImport}
                className="flex-1 px-4 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-xl hover:bg-slate-100 transition-all">
                Add to board →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingDots({ dark }) {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-[#0f1117]' : 'bg-slate-500'}`}
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}
