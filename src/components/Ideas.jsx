import { useState } from 'react'
import { storage } from '../lib/storage'
import PipelineModal from './ideas/PipelineModal'

// ── Stage config ───────────────────────────────────────────────────────────────

const STAGES = {
  ready:       { label: 'Ready',       dot: 'bg-green-500',  color: 'text-green-400',  badge: 'bg-green-900/30 border-green-700/40 text-green-300' },
  in_progress: { label: 'In Progress', dot: 'bg-amber-500',  color: 'text-amber-400',  badge: 'bg-amber-900/20 border-amber-700/30 text-amber-400' },
  draft:       { label: 'Draft',       dot: 'bg-blue-500',   color: 'text-blue-400',   badge: 'bg-blue-900/20 border-blue-700/30 text-blue-400' },
  captured:    { label: 'Captured',    dot: 'bg-slate-500',  color: 'text-slate-400',  badge: 'bg-slate-800/50 border-slate-700/30 text-slate-400' },
  killed:      { label: 'Killed',      dot: 'bg-red-700',    color: 'text-red-500',    badge: 'bg-red-900/20 border-red-800/30 text-red-500' },
}

function itemStage(item) {
  if (item.stage) return item.stage
  if (item.pipeline?.q1) return 'in_progress'
  return 'captured'
}

function pipelineButtonLabel(stage) {
  if (stage === 'ready')       return 'View answers'
  if (stage === 'in_progress') return 'Continue →'
  if (stage === 'draft')       return 'Revisit →'
  if (stage === 'killed')      return 'Reconsider'
  return 'Start pipeline →'
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Ideas({ onDraftFromIdea }) {
  const [tab, setTab]       = useState('capture')
  const [board, setBoard]   = useState(storage.getBoard)
  const [captureText, setCaptureText] = useState('')
  const [captureSaved, setCaptureSaved] = useState(false)
  const [pipelineItem, setPipelineItem] = useState(null)
  const [showKilled, setShowKilled] = useState(false)

  function saveCapture() {
    const text = captureText.trim()
    if (!text) return
    const item = {
      id: Date.now(),
      type: 'capture',
      title: text.slice(0, 80) + (text.length > 80 ? '…' : ''),
      text,
      source: 'Quick capture',
      date: new Date().toISOString(),
      stage: 'captured',
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

  function handlePipelineSave(updatedItem) {
    const next = board.map(i => i.id === updatedItem.id ? updatedItem : i)
    setBoard(next)
    storage.setBoard(next)
  }

  function removeItem(id) {
    const next = board.filter(i => i.id !== id)
    setBoard(next); storage.setBoard(next)
  }

  function openBoard() {
    setBoard(storage.getBoard())
    setTab('board')
  }

  const readyCount = board.filter(i => itemStage(i) === 'ready').length
  const TABS = [
    { id: 'capture', label: 'Capture',               onClick: () => setTab('capture') },
    { id: 'board',   label: `Board (${board.length})`, onClick: openBoard },
  ]

  return (
    <div className="flex-1 flex flex-col relative">
      {pipelineItem && (
        <PipelineModal
          item={pipelineItem}
          onSave={updated => { handlePipelineSave(updated); setPipelineItem(updated) }}
          onClose={() => setPipelineItem(null)}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-[#1e3a5f] px-6 flex gap-1 pt-2 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={t.onClick}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-[#c5a028] text-[#c5a028]' : 'border-transparent text-[#6a80a0] hover:text-white'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* ── Capture ─────────────────────────────────────────────────────────── */}
      {tab === 'capture' && (
        <div className="flex-1 flex flex-col px-6 py-6 max-w-2xl mx-auto w-full gap-4">
          <div className="border-l-2 border-[#c5a028]/50 pl-4 py-0.5">
            <p className="text-xs text-slate-600 font-mono uppercase tracking-wider mb-1">The filter</p>
            <p className="text-sm text-slate-300 leading-snug">
              What have I actually seen that my audience hasn't yet — and that I'm willing to say plainly?
            </p>
          </div>

          <textarea
            value={captureText}
            onChange={e => setCaptureText(e.target.value)}
            onKeyDown={handleCaptureKey}
            placeholder="Type anything. The pipeline walks you through shaping it."
            rows={5} autoFocus
            className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-base leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Cmd+Enter to save</span>
            <button onClick={saveCapture} disabled={!captureText.trim()}
              className="px-5 py-2.5 bg-[#c5a028] text-[#071020] text-sm font-semibold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {captureSaved ? '✓ Saved' : 'Save →'}
            </button>
          </div>

          {board.length > 0 && (
            <button onClick={openBoard} className="text-xs text-[#6a80a0] hover:text-[#c5a028] transition-colors self-start">
              View board ({board.length}){readyCount > 0 ? ` · ${readyCount} ready` : ''} →
            </button>
          )}
        </div>
      )}

      {/* ── Board ───────────────────────────────────────────────────────────── */}
      {tab === 'board' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {board.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <p className="text-[#4a6080] text-sm">Your board is empty.</p>
                <button onClick={() => setTab('capture')} className="text-xs text-[#c5a028] hover:text-[#d9b030] transition-colors">
                  Capture your first idea →
                </button>
              </div>
            ) : (
              <>
                {['ready', 'in_progress', 'draft', 'captured'].map(stageKey => {
                  const items = board.filter(i => itemStage(i) === stageKey)
                  if (!items.length) return null
                  const cfg = STAGES[stageKey]
                  return (
                    <StageSection key={stageKey} cfg={cfg} items={items}
                      onPipeline={setPipelineItem} onRemove={removeItem}
                      onDraft={onDraftFromIdea} />
                  )
                })}

                {/* Killed — hidden by default */}
                {board.some(i => itemStage(i) === 'killed') && (
                  <div>
                    <button onClick={() => setShowKilled(s => !s)}
                      className="text-xs text-slate-700 hover:text-slate-500 transition-colors">
                      {showKilled ? '▲ Hide killed ideas' : `▼ Show killed ideas (${board.filter(i => itemStage(i) === 'killed').length})`}
                    </button>
                    {showKilled && (
                      <div className="mt-3">
                        <StageSection cfg={STAGES.killed}
                          items={board.filter(i => itemStage(i) === 'killed')}
                          onPipeline={setPipelineItem} onRemove={removeItem}
                          onDraft={onDraftFromIdea} />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stage section ──────────────────────────────────────────────────────────────

function StageSection({ cfg, items, onPipeline, onRemove, onDraft }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`text-xs font-mono font-bold tracking-widest uppercase ${cfg.color}`}>{cfg.label}</span>
        <span className="text-xs text-slate-700 ml-auto">{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <IdeaCard key={item.id} item={item} cfg={cfg}
            onPipeline={onPipeline} onRemove={onRemove} onDraft={onDraft} />
        ))}
      </ul>
    </div>
  )
}

// ── Idea card ──────────────────────────────────────────────────────────────────

function IdeaCard({ item, cfg, onPipeline, onRemove, onDraft }) {
  const stage = itemStage(item)
  const title = item.pipeline?.q2 || item.title || item.text?.slice(0, 80)
  const sub   = item.text?.slice(0, 120)

  return (
    <li className="border border-[#1e3a5f] rounded-lg p-4 bg-[#0a1220] hover:border-[#2a4070] transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm leading-snug">{title}</p>
          {item.pipeline?.q2 && sub && sub !== title && (
            <p className="text-[#4a6080] text-xs mt-1 line-clamp-2">{sub}</p>
          )}
          {item.pipeline?.bucket && (
            <p className="text-[#4a6080] text-xs mt-1 font-mono">
              {item.pipeline.bucket.replace(/_/g, ' ')}
            </p>
          )}
          <p className="text-[#3a5070] text-xs mt-1">{item.source || 'Quick capture'}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 items-end">
          <button onClick={() => onPipeline(item)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${cfg.badge}`}>
            {pipelineButtonLabel(stage)}
          </button>
          {stage === 'ready' && (
            <button onClick={() => onDraft(item.pipeline?.q2 || item.text)}
              className="text-xs font-medium text-[#c5a028] hover:text-[#d9b030] border border-[#c5a028]/40 hover:border-[#c5a028] px-2 py-1 rounded transition-all whitespace-nowrap">
              Draft →
            </button>
          )}
          <button onClick={() => onRemove(item.id)} className="text-xs text-[#3a5080] hover:text-red-400 transition-colors">✕</button>
        </div>
      </div>
    </li>
  )
}
