import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reviseDraft } from '../lib/anthropic';

export default function DraftScreen() {
  const { state, dispatch, SCREENS, currentDraft } = useApp();
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [versionOpen, setVersionOpen] = useState(false);

  const draft = currentDraft?.draft || '';
  const wordCount = currentDraft?.wordCount || 0;

  const wordCountColor =
    wordCount > 400
      ? 'text-red-400'
      : wordCount >= 380
      ? 'text-amber-400'
      : 'text-slate-500';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  function handleDraftChange(e) {
    dispatch({ type: 'UPDATE_CURRENT_DRAFT', draft: e.target.value });
  }

  function handleRestoreVersion(index) {
    dispatch({ type: 'RESTORE_VERSION', index });
    setVersionOpen(false);
  }

  async function handleRevise() {
    const fb = feedback.trim();
    if (!fb || state.isLoading) return;

    const userMsg = { role: 'user', content: fb };
    setChatHistory((h) => [...h, userMsg]);
    setFeedback('');

    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const { draft: newDraft, wordCount: wc } = await reviseDraft(draft, fb);
      dispatch({ type: 'ADD_DRAFT_VERSION', draft: newDraft, wordCount: wc });
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', content: `Draft updated. v${state.draftVersions.length + 1} saved.` },
      ]);
    } catch (err) {
      setChatHistory((h) => [
        ...h,
        { role: 'assistant', content: `Error: ${err.message || 'Revision failed.'}` },
      ]);
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handleFeedbackKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleRevise();
    }
  }

  const versionLabel = (i) => {
    const v = state.draftVersions[i];
    const d = new Date(v.timestamp);
    return `v${i + 1} — ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex flex-1 min-h-0">
        {/* LEFT PANEL — draft */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1e2130]">
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e2130] bg-[#0f1117]">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Draft</span>
            <div className="flex items-center gap-4">
              {/* Word count */}
              <span className={`text-xs font-mono font-medium ${wordCountColor}`}>
                {wordCount} words
              </span>
              {/* Version history dropdown */}
              <div className="relative">
                <button
                  onClick={() => setVersionOpen((v) => !v)}
                  className="text-xs text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                >
                  {versionLabel(state.currentVersionIndex)}
                  <span className="text-slate-600">▾</span>
                </button>
                {versionOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-[#141620] border border-[#2a2d3e] rounded-xl shadow-xl min-w-[160px] py-1">
                    {state.draftVersions.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleRestoreVersion(i)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                          i === state.currentVersionIndex
                            ? 'text-white font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        {versionLabel(i)}
                        {i === state.currentVersionIndex && (
                          <span className="ml-2 text-slate-600">← current</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Draft textarea */}
          <textarea
            value={draft}
            onChange={handleDraftChange}
            className="flex-1 w-full bg-[#0f1117] text-slate-200 px-8 py-6 resize-none focus:outline-none font-serif text-base leading-[1.8] min-h-0"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            spellCheck
          />

          {/* Bottom actions */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-[#1e2130] bg-[#0f1117]">
            <div />
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.FILTER })}
              className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-1.5 rounded-lg transition-all"
            >
              Run filter check →
            </button>
          </div>
        </div>

        {/* RIGHT PANEL — chat */}
        <div className="w-80 flex flex-col min-h-0 bg-[#0c0e18]">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2130]">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Revisions</span>
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HEADLINES })}
              className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all"
            >
              Find headlines →
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {chatHistory.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed">
                Type feedback below.<br />Claude will revise and save a new version.
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white/10 text-slate-200'
                      : 'bg-[#1a1d2e] border border-[#2a2d3e] text-slate-400'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {state.isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#1a1d2e] border border-[#2a2d3e] px-3 py-2 rounded-xl">
                  <LoadingDots />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="px-4 py-3 border-t border-[#1e2130]">
            {state.error && (
              <p className="text-xs text-red-400 mb-2">{state.error}</p>
            )}
            <div className="flex gap-2">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={handleFeedbackKeyDown}
                placeholder="Tell Claude what to change…"
                rows={2}
                disabled={state.isLoading}
                className="flex-1 bg-[#141620] border border-[#2a2d3e] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-slate-500 transition-colors"
              />
              <button
                onClick={handleRevise}
                disabled={!feedback.trim() || state.isLoading}
                className="px-3 py-2 bg-white text-[#0f1117] text-xs font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all self-end"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">Cmd+Enter to send</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
