import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { assessInput } from '../lib/anthropic';
import { loadSession, hasSession } from '../lib/storage';

export default function InputScreen() {
  const { state, dispatch, SCREENS, restoreSession } = useApp();
  const [hasSaved, setHasSaved] = useState(false);
  const [savedPreview, setSavedPreview] = useState('');

  useEffect(() => {
    if (hasSession()) {
      const saved = loadSession();
      if (saved && saved.rawInput) {
        setHasSaved(true);
        setSavedPreview(saved.rawInput.slice(0, 80) + (saved.rawInput.length > 80 ? '…' : ''));
      }
    }
  }, []);

  async function handleSubmit() {
    const input = state.rawInput.trim();
    if (!input) return;

    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await assessInput(input);
      dispatch({
        type: 'SET_ASSESSMENT',
        assessment: result.assessment,
        questions: result.questions,
      });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        message: err.message || 'Something went wrong. Check your API key and try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handleContinue() {
    const saved = loadSession();
    if (saved) {
      restoreSession(saved);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Lessons Learned
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Draft Workspace — RUFIO</p>
        </div>
      </div>

      {/* Continue banner */}
      {hasSaved && (
        <div className="mx-8 mb-4 flex items-center justify-between bg-[#1a1d2e] border border-[#2a2d3e] rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-200">You have a draft in progress</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{savedPreview}</p>
            </div>
          </div>
          <button
            onClick={handleContinue}
            className="ml-4 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Main input area */}
      <div className="flex-1 flex flex-col px-8 pb-8 gap-4 min-h-0">
        <textarea
          value={state.rawInput}
          onChange={(e) => dispatch({ type: 'SET_RAW_INPUT', value: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Drop your raw input here — voice memo transcript, podcast clip, rough thought, anything."
          className="flex-1 w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-6 py-5 text-slate-200 placeholder-slate-600 text-base leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors font-mono"
          disabled={state.isLoading}
          autoFocus
        />

        {/* Error */}
        {state.error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Cmd+Enter to start
          </p>
          <button
            onClick={handleSubmit}
            disabled={!state.rawInput.trim() || state.isLoading}
            className="px-6 py-3 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {state.isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingDots />
                Reading…
              </span>
            ) : (
              'Start drafting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
