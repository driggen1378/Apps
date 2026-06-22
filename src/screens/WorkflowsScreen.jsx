import { useState } from 'react'
import { DEFAULT_WORKFLOWS } from '../lib/tasks'

const CAT_COLOR = {
  media: '#5DCAA5',
  business: '#9B7FD4',
  dissertation: '#EF9F27',
}

export default function WorkflowsScreen({ openId, onNavigate }) {
  const [expanded, setExpanded] = useState(openId || DEFAULT_WORKFLOWS[0]?.id)

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0 max-w-3xl">

        <div className="mb-5">
          <h1 className="text-lg font-bold text-white tracking-tight">Workflows</h1>
          <p className="text-xs text-[#4a6080] mt-0.5">
            Step-by-step SOPs with the links and tools you need. Exactly what to do, every time.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {DEFAULT_WORKFLOWS.map(wf => {
            const color = CAT_COLOR[wf.cat] || '#7a9ab5'
            const isOpen = expanded === wf.id
            return (
              <div
                key={wf.id}
                className="border rounded-xl overflow-hidden bg-[#0d1829] transition-all"
                style={{ borderColor: isOpen ? color + '55' : '#1e3a5f' }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : wf.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#112040] transition-colors"
                >
                  <span className="text-lg shrink-0">{wf.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{wf.title}</p>
                    <p className="text-[11px] text-[#4a6080] truncate">{wf.purpose}</p>
                  </div>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{ color, background: color + '18' }}
                  >
                    {wf.week}
                  </span>
                  <span className="text-[#4a6080] text-xs ml-1 shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>

                {/* Steps */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#112040] flex flex-col gap-2.5">
                    {wf.steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                          style={{ background: color + '22', color }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-relaxed">{s.text}</p>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {s.url && (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] px-2 py-0.5 rounded-md border transition-colors"
                                style={{ borderColor: color + '55', color }}
                              >
                                {s.urlLabel || 'Open link'} ↗
                              </a>
                            )}
                            {s.nav && onNavigate && (
                              <button
                                onClick={() => onNavigate(s.nav)}
                                className="text-[11px] px-2 py-0.5 rounded-md border border-[#1e3a5f] text-[#7a9ab5] hover:text-white hover:border-[#4a6090] transition-colors"
                              >
                                {s.nav} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
