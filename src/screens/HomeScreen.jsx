import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { assessInput, repurposeContent, generateSkeleton } from '../lib/anthropic';
import { loadSession, hasSession, storage } from '../lib/storage';

export default function HomeScreen() {
  const { state, dispatch, SCREENS, restoreSession } = useApp();
  const [outputType, setOutputType] = useState(null);
  const [showRepurpose, setShowRepurpose] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [skeletonResult, setSkeletonResult]   = useState(null);
  const [skeletonError,  setSkeletonError]    = useState('');

  const readyIdeas = storage.getBoard().filter(i => i.stage === 'ready' && i.pipeline?.q2)

  async function handleGenerateSkeleton(item) {
    setSkeletonLoading(true)
    setSkeletonError('')
    try {
      const brand = storage.getBrand()
      const text  = await generateSkeleton(item.pipeline, brand)
      setSkeletonResult({ text, title: item.pipeline.q2 })
    } catch (err) {
      setSkeletonError(err.message || 'Something went wrong.')
    } finally {
      setSkeletonLoading(false)
    }
  }

  const [hasSaved] = useState(() => {
    if (!hasSession()) return false;
    const s = loadSession();
    return !!(s && (s.rawInput || (s.draftVersions && s.draftVersions.length > 0)));
  });
  const [savedPreview] = useState(() => {
    const s = loadSession();
    if (!s) return '';
    if (s.draftVersions?.length > 0) return `Draft v${s.draftVersions.length} — ${s.outputType || 'newsletter'}`;
    return (s.rawInput || '').slice(0, 60) + ((s.rawInput || '').length > 60 ? '…' : '');
  });

  function handleContinue() {
    const saved = loadSession();
    if (saved) restoreSession(saved);
  }

  async function handleSubmit() {
    const input = state.rawInput.trim();
    if (!input || !outputType) return;

    dispatch({ type: 'SET_OUTPUT_TYPE', value: outputType });
    dispatch({ type: 'SET_ENTRY_MODE', value: 'input' });
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await assessInput(input, state.brand, outputType);
      dispatch({ type: 'SET_ASSESSMENT', assessment: result.assessment, questions: result.questions });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Something went wrong. Check your API key.' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  async function handleRepurpose() {
    const src = sourceContent.trim();
    if (!src || !outputType) return;

    dispatch({ type: 'SET_OUTPUT_TYPE', value: outputType });
    dispatch({ type: 'SET_ENTRY_MODE', value: 'input' });
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await repurposeContent(src, outputType, state.brand);
      dispatch({ type: 'SET_RAW_INPUT', value: result.coreQuestion || src.slice(0, 120) });
      dispatch({ type: 'SET_ASSESSMENT', assessment: result.assessment || outputType, questions: result.questions });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Something went wrong. Check your API key.' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  }

  const canSubmit = outputType && (showRepurpose ? sourceContent.trim() : state.rawInput.trim()) && !state.isLoading;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0f1117] text-slate-200">
      {skeletonResult && (
        <SkeletonModal skeleton={skeletonResult.text} title={skeletonResult.title}
          onClose={() => setSkeletonResult(null)} />
      )}

      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">Lessons Learned</h1>
        <p className="text-xs text-slate-500 mt-0.5">Draft Workspace — RUFIO</p>
      </div>

      {/* Ready to draft */}
      {readyIdeas.length > 0 && (
        <div className="mx-8 mb-4 border border-[#1e3a5f] rounded-xl overflow-hidden shrink-0">
          <div className="px-4 py-2.5 bg-[#0d1829] border-b border-[#1e3a5f] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
            <p className="text-xs font-mono font-bold text-green-400 uppercase tracking-wider">Ready to draft</p>
            <span className="text-xs text-slate-600 ml-auto">{readyIdeas.length}</span>
          </div>
          <ul className="divide-y divide-[#1e3a5f]">
            {readyIdeas.map(item => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#0d1829] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug truncate">{item.pipeline.q2}</p>
                  {item.pipeline.bucket && (
                    <p className="text-xs text-slate-600 mt-0.5">{item.pipeline.bucket.replace(/_/g, ' ')}</p>
                  )}
                </div>
                <button
                  onClick={() => handleGenerateSkeleton(item)}
                  disabled={skeletonLoading}
                  className="text-xs font-medium text-[#c5a028] hover:text-[#d9b030] border border-[#c5a028]/40 hover:border-[#c5a028] px-3 py-1.5 rounded-lg transition-all shrink-0 disabled:opacity-40"
                >
                  {skeletonLoading ? '…' : 'Generate skeleton →'}
                </button>
              </li>
            ))}
          </ul>
          {skeletonError && (
            <p className="px-4 py-2 text-xs text-red-400 bg-red-900/20 border-t border-red-800/30">{skeletonError}</p>
          )}
        </div>
      )}

      {/* Continue banner */}
      {hasSaved && (
        <div className="mx-8 mb-4 flex items-center justify-between bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-200">You have a draft in progress</p>
              <p className="text-xs text-slate-500 mt-0.5">{savedPreview}</p>
            </div>
          </div>
          <button onClick={handleContinue}
            className="ml-4 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap">
            Continue →
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col px-8 pb-8 gap-4 min-h-0 overflow-y-auto">

        {/* Output type selector */}
        <div className="flex gap-3 shrink-0">
          {[
            { id: 'newsletter', label: 'Newsletter', icon: '✉️', sub: 'Lessons Learned · 400 words' },
            { id: 'podcast',    label: 'Podcast Script', icon: '🎙️', sub: 'Your Finest Hour · 800–1000 words' },
          ].map(t => (
            <button key={t.id} onClick={() => setOutputType(t.id)}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                outputType === t.id
                  ? 'border-white bg-white/8 text-white'
                  : 'border-[#2a2d3e] text-slate-500 hover:text-slate-300 hover:border-slate-500'
              }`}>
              <span className="text-xl">{t.icon}</span>
              <div>
                <p className={`text-sm font-medium ${outputType === t.id ? 'text-white' : ''}`}>{t.label}</p>
                <p className="text-xs text-slate-600 mt-0.5">{t.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Toggle: new idea vs repurpose */}
        <div className="flex items-center gap-4 shrink-0">
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

        {/* Input area */}
        {!showRepurpose ? (
          <textarea
            value={state.rawInput}
            onChange={(e) => dispatch({ type: 'SET_RAW_INPUT', value: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind? Dump your raw thoughts — don't shape it yet."
            className="flex-1 w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-6 py-5 text-slate-200 placeholder-slate-600 text-base leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors font-mono min-h-[120px]"
            disabled={state.isLoading}
            autoFocus
          />
        ) : (
          <div className="flex flex-col gap-2 flex-1 min-h-0">
            <p className="text-xs text-slate-500 shrink-0">
              Paste an existing newsletter or podcast script. We'll extract the core idea and help you expand it into something new.
            </p>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              placeholder="Paste your existing piece here…"
              className="flex-1 w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-6 py-5 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors min-h-[160px]"
              disabled={state.isLoading}
              autoFocus
            />
          </div>
        )}

        {!outputType && (
          <p className="text-xs text-amber-400/80 shrink-0">← Select Newsletter or Podcast Script above first</p>
        )}

        {state.error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 shrink-0">
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-3 justify-between shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.IDEA_EXTRACTION })}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#141620] border border-[#2a2d3e] text-slate-400 hover:text-white hover:border-slate-500 text-sm rounded-lg transition-all disabled:opacity-40"
            >
              <span>◈</span>
              Mosaic
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.DISCOVERY })}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#141620] border border-[#2a2d3e] text-slate-400 hover:text-white hover:border-slate-500 text-sm rounded-lg transition-all disabled:opacity-40"
            >
              <span>🔍</span>
              What are others saying?
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.QUESTION_FORMATION })}
              disabled={state.isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#141620] border border-[#2a2d3e] text-slate-400 hover:text-white hover:border-slate-500 text-sm rounded-lg transition-all disabled:opacity-40"
            >
              <span>💡</span>
              Ideas Board →
            </button>
          </div>

          <div className="flex items-center gap-3">
            {!showRepurpose && <p className="text-xs text-slate-600">Cmd+Enter</p>}
            <button
              onClick={showRepurpose ? handleRepurpose : handleSubmit}
              disabled={!canSubmit}
              className="px-6 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {state.isLoading
                ? <LoadingInline text={showRepurpose ? 'Extracting…' : 'Reading…'} />
                : showRepurpose ? 'Build from this →' : 'Start drafting →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonModal({ skeleton, title, onClose }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(skeleton)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e] shrink-0">
          <div>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Article Skeleton</p>
            <p className="text-sm text-white mt-0.5 line-clamp-1">{title}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg leading-none">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">{skeleton}</pre>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a2d3e] shrink-0">
          <p className="text-xs text-slate-600">Your answers are in verbatim. Brackets show where to expand.</p>
          <button onClick={copy}
            className="px-4 py-2 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all">
            {copied ? '✓ Copied' : 'Copy →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoadingInline({ text }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-current animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
      {text}
    </span>
  );
}
