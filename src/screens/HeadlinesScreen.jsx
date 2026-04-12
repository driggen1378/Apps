import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { findHeadlines } from '../lib/anthropic';

export default function HeadlinesScreen() {
  const { state, dispatch, SCREENS, currentDraft } = useApp();
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (state.headlines.length === 0 && currentDraft?.draft) fetchHeadlines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHeadlines() {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const result = await findHeadlines(currentDraft.draft, state.brand);
      dispatch({ type: 'SET_HEADLINES', headlines: result.headlines });
    } catch (err) {
      setLocalError(err.message || 'Headline search failed. Try again.');
    } finally {
      setLocalLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 px-8 py-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Trending Headlines</h2>
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.DRAFT })}
            className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
            ← Back to draft
          </button>
          <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.FILTER })}
            className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
            Run filter check →
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs text-slate-500 font-mono uppercase tracking-wider block mb-2">
          {state.outputType === 'podcast' ? 'Episode title' : 'Subject line'}
        </label>
        <input type="text" value={state.subjectLine}
          onChange={(e) => dispatch({ type: 'SET_SUBJECT_LINE', value: e.target.value })}
          placeholder="Click 'Use' below, or type your own"
          className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors" />
      </div>

      {localLoading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
          <p className="text-sm text-slate-500">Searching for trending headlines…</p>
        </div>
      )}

      {localError && !localLoading && (
        <div className="mb-4">
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-3">
            <p className="text-sm text-red-300">{localError}</p>
          </div>
          <button onClick={fetchHeadlines}
            className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
            Try again
          </button>
        </div>
      )}

      {!localLoading && !localError && state.headlines.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-slate-500">No results returned.</p>
          <button onClick={fetchHeadlines}
            className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
            ↻ Try again
          </button>
        </div>
      )}

      {!localLoading && state.headlines.length > 0 && (
        <div className="flex flex-col gap-3 overflow-y-auto">
          {state.headlines.map((h, i) => (
            <div key={i} className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 hover:border-slate-500 transition-colors">
              <p className="text-base font-medium text-white mb-1">{h.plain_version}</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{h.headline}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 bg-[#1e2130] px-2.5 py-1 rounded-full">{h.source}</span>
                  {h.url && h.url !== 'N/A' && (
                    <a href={h.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors">↗ link</a>
                  )}
                </div>
                <button onClick={() => dispatch({ type: 'SET_SUBJECT_LINE', value: h.plain_version })}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    state.subjectLine === h.plain_version
                      ? 'border-white text-white bg-white/10'
                      : 'border-[#2a2d3e] text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}>
                  {state.subjectLine === h.plain_version ? '✓ Selected' : 'Use'}
                </button>
              </div>
            </div>
          ))}
          <button onClick={fetchHeadlines}
            className="text-xs text-slate-500 hover:text-slate-300 text-center py-2 transition-colors">
            ↻ Refresh
          </button>
        </div>
      )}
    </div>
  );
}
