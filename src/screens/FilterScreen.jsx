import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { runFilterCheck } from '../lib/anthropic';
import { storage } from '../lib/storage';

export default function FilterScreen() {
  const { state, dispatch, SCREENS, currentDraft } = useApp();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [copied, setCopied] = useState(false);

  const results = state.filterResults;

  useEffect(() => {
    if (!results && currentDraft?.draft) runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck() {
    setLocalLoading(true);
    setLocalError(null);
    dispatch({ type: 'SET_FILTER_RESULTS', results: null, status: 'running' });

    try {
      const result = await runFilterCheck(currentDraft.draft, state.outputType, state.brand);
      const bothPass = result.brandFilter.pass && result.promiseFilter.pass;
      dispatch({ type: 'SET_FILTER_RESULTS', results: result, status: bothPass ? 'passed' : 'failed' });
    } catch (err) {
      setLocalError(err.message || 'Filter check failed. Try again.');
      dispatch({ type: 'SET_FILTER_RESULTS', results: null, status: 'not_run' });
    } finally {
      setLocalLoading(false);
    }
  }

  async function handlePublish() {
    const draft = currentDraft?.draft || '';
    const wordCount = currentDraft?.wordCount || 0;
    const subject = state.subjectLine || '(no subject line set)';
    const isPodcast = state.outputType === 'podcast';

    const output = isPodcast
      ? `Episode: ${subject}\n\n${draft}\n\n---\nWord count: ${wordCount}\nFights On, RUFIO`
      : `Subject: ${subject}\n\n${draft}\n\n---\nWord count: ${wordCount}\nFights On, RUFIO`;

    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = output;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    storage.saveToArchive({
      question: state.rawInput,
      outputType: state.outputType,
      subjectLine: state.subjectLine,
      wordCount,
      publishedAt: Date.now(),
    });

    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  const bothPass = results?.brandFilter?.pass && results?.promiseFilter?.pass;

  return (
    <div className="flex flex-col h-full min-h-0 px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-semibold text-white">Filter Check</h2>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.DRAFT })}
          className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
          ← Back to draft
        </button>
      </div>

      {localLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-3 h-3 rounded-full border-2 border-slate-600 border-t-white animate-spin"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <p className="text-sm text-slate-500">Running quality filters…</p>
        </div>
      )}

      {localError && !localLoading && (
        <div className="mb-4">
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-3">
            <p className="text-sm text-red-300">{localError}</p>
          </div>
          <button onClick={runCheck}
            className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
            Try again
          </button>
        </div>
      )}

      {results && !localLoading && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <FilterCard title="Brand Filter" passed={results.brandFilter.pass} explanation={results.brandFilter.explanation} />
            <FilterCard title="Core Promise" passed={results.promiseFilter.pass} explanation={results.promiseFilter.explanation} />
          </div>

          {bothPass ? (
            <div className="flex flex-col items-center gap-4 mt-4">
              <p className="text-sm text-green-400 font-medium">Both filters passed — ready to publish.</p>
              <button onClick={handlePublish}
                className="px-8 py-3 bg-white text-[#0f1117] text-sm font-bold rounded-xl hover:bg-slate-100 transition-all">
                {copied ? '✓ Copied to clipboard' : 'Copy to clipboard →'}
              </button>
              {state.subjectLine && (
                <p className="text-xs text-slate-600">
                  {state.outputType === 'podcast' ? 'Episode: ' : 'Subject: '}{state.subjectLine}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 mt-4">
              <p className="text-sm text-amber-400">Fix the issues above, then re-check.</p>
              <button onClick={runCheck}
                className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
                ↻ Re-run check
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterCard({ title, passed, explanation }) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${passed ? 'border-green-700/60 bg-green-900/10' : 'border-red-700/60 bg-red-900/10'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${passed ? 'text-green-400' : 'text-red-400'}`}>{passed ? '✅' : '❌'}</span>
        <span className={`text-sm font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? '✓ ' : '✗ '}{title}
        </span>
      </div>
      <p className={`text-xs leading-relaxed ${passed ? 'text-slate-400' : 'text-red-300'}`}>{explanation}</p>
    </div>
  );
}
