import { useState } from 'react'
import { storage } from '../lib/storage'

export default function DraftsScreen() {
  const [drafts, setDrafts]     = useState(() => storage.getDrafts())
  const [expanded, setExpanded] = useState(null)
  const [copied, setCopied]     = useState(null)

  function remove(id) {
    storage.deleteDraft(id)
    setDrafts(storage.getDrafts())
    if (expanded === id) setExpanded(null)
  }

  function copy(draft) {
    navigator.clipboard.writeText(draft.content).then(() => {
      setCopied(draft.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const readyDrafts   = drafts.filter(d => d.readyToPublish)
  const regularDrafts = drafts.filter(d => !d.readyToPublish)

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0f1117] text-slate-200">

      <div className="px-6 py-5 border-b border-[#1e2130] shrink-0">
        <h1 className="text-lg font-semibold text-white">Drafts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {drafts.length === 0 ? 'No drafts yet' : `${drafts.length} saved draft${drafts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
              Drafts you generate or save from the Create tab will appear here.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-8">

            {readyDrafts.length > 0 && (
              <div>
                <p className="text-xs text-emerald-500 uppercase tracking-wider font-mono mb-3">Ready to Publish</p>
                <div className="flex flex-col gap-3">
                  {readyDrafts.map(draft => (
                    <ReadyToPublishCard
                      key={draft.id}
                      draft={draft}
                      isExpanded={expanded === draft.id}
                      isCopied={copied === draft.id}
                      onToggle={() => setExpanded(expanded === draft.id ? null : draft.id)}
                      onCopy={() => copy(draft)}
                      onDelete={() => remove(draft.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularDrafts.length > 0 && (
              <div>
                {readyDrafts.length > 0 && (
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-3">Other Drafts</p>
                )}
                <div className="flex flex-col gap-3">
                  {regularDrafts.map(draft => (
                    <DraftCard
                      key={draft.id}
                      draft={draft}
                      isExpanded={expanded === draft.id}
                      isCopied={copied === draft.id}
                      onToggle={() => setExpanded(expanded === draft.id ? null : draft.id)}
                      onCopy={() => copy(draft)}
                      onDelete={() => remove(draft.id)}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}

function ReadyToPublishCard({ draft, isExpanded, isCopied, onToggle, onCopy, onDelete }) {
  const date = new Date(draft.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const typeLabel = draft.outputType === 'podcast' ? 'Podcast' : 'Newsletter'
  const typeColor = draft.outputType === 'podcast'
    ? 'text-purple-400 bg-purple-900/20 border-purple-800/30'
    : 'text-blue-400 bg-blue-900/20 border-blue-800/30'

  return (
    <div className="bg-[#0a1f12] border border-emerald-800/50 rounded-xl overflow-hidden">

      <div className="flex items-start gap-3 px-4 py-4">
        <button onClick={onToggle} className="flex-1 text-left min-w-0">
          <p className="text-sm text-white font-medium leading-snug line-clamp-2">{draft.title || '(untitled)'}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeColor}`}>
              {typeLabel}
            </span>
            {draft.wordCount && (
              <span className="text-xs text-slate-500">{draft.wordCount} words</span>
            )}
            <span className="text-xs text-slate-500">{date}</span>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCopy}
            className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${
              isCopied
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isCopied ? 'Copied ✓' : 'Copy'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-slate-700 hover:text-red-400 transition-colors px-2 py-1.5"
          >
            ✕
          </button>
        </div>
      </div>

      {draft.brandScores?.length > 0 && (
        <div className="border-t border-emerald-900/40 px-4 py-3 flex flex-wrap gap-x-4 gap-y-1">
          {draft.brandScores.map((s, i) => (
            <span key={i} className="text-xs text-slate-500">
              {s.label}: <span className={s.score >= 7 ? 'text-emerald-400' : s.score >= 5 ? 'text-amber-400' : 'text-red-400'}>
                {s.score}/10
              </span>
            </span>
          ))}
        </div>
      )}

      {isExpanded && (
        <div className="border-t border-emerald-900/40 px-4 py-4">
          <pre className="text-sm text-slate-300 leading-[1.8] whitespace-pre-wrap"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {draft.content}
          </pre>
        </div>
      )}

      <button
        onClick={onToggle}
        className="w-full py-2 text-xs text-slate-700 hover:text-slate-500 border-t border-emerald-900/40 transition-colors"
      >
        {isExpanded ? '▲ Collapse' : '▼ Read draft'}
      </button>
    </div>
  )
}

function DraftCard({ draft, isExpanded, isCopied, onToggle, onCopy, onDelete }) {
  const date = new Date(draft.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const typeLabel = draft.outputType === 'podcast' ? 'Podcast' : 'Newsletter'
  const typeColor = draft.outputType === 'podcast'
    ? 'text-purple-400 bg-purple-900/20 border-purple-800/30'
    : 'text-blue-400 bg-blue-900/20 border-blue-800/30'

  return (
    <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl overflow-hidden">

      <div className="flex items-start gap-3 px-4 py-4">
        <button onClick={onToggle} className="flex-1 text-left min-w-0">
          <p className="text-sm text-white font-medium leading-snug line-clamp-2">{draft.title || '(untitled)'}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeColor}`}>
              {typeLabel}
            </span>
            {draft.wordCount && (
              <span className="text-xs text-slate-600">{draft.wordCount} words</span>
            )}
            <span className="text-xs text-slate-600">{date}</span>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCopy}
            className="text-xs px-3 py-1.5 border border-[#2a4070] text-slate-400 hover:text-white hover:border-slate-500 rounded-lg transition-all"
          >
            {isCopied ? 'Copied ✓' : 'Copy'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-slate-700 hover:text-red-400 transition-colors px-2 py-1.5"
          >
            ✕
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[#1e3a5f] px-4 py-4">
          <pre className="text-sm text-slate-300 leading-[1.8] whitespace-pre-wrap"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {draft.content}
          </pre>
        </div>
      )}

      <button
        onClick={onToggle}
        className="w-full py-2 text-xs text-slate-700 hover:text-slate-500 border-t border-[#1e3a5f] transition-colors"
      >
        {isExpanded ? '▲ Collapse' : '▼ Read draft'}
      </button>
    </div>
  )
}
