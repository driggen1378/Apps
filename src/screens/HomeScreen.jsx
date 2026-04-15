import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { assessInput, repurposeContent } from '../lib/anthropic';
import { loadSession, hasSession } from '../lib/storage';

export default function HomeScreen() {
  const { state, dispatch, SCREENS, restoreSession } = useApp();
  const [outputType, setOutputType] = useState(null);
  const [showRepurpose, setShowRepurpose] = useState(false);
  const [sourceContent, setSourceContent] = useState('');

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
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-white">Lessons Learned</h1>
        <p className="text-xs text-slate-500 mt-0.5">Draft Workspace — RUFIO</p>
      </div>

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
              <span>⚡</span>
              Steal Like an Artist
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
