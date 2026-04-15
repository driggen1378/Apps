import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reviseDraft, generateSpeakingOutline, fillInPlaceholder } from '../lib/anthropic';

function extractPlaceholders(text) {
  const regex = /\[FILL IN:[^\]]+\]/g;
  return [...new Set(text.match(regex) || [])];
}

export default function DraftScreen() {
  const { state, dispatch, SCREENS, OUTPUT_TYPES, currentDraft } = useApp();
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [versionOpen, setVersionOpen] = useState(false);
  const [outlineModalOpen, setOutlineModalOpen] = useState(false);
  const [outlineText, setOutlineText] = useState('');
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [activePh, setActivePh] = useState(null);
  const [phInput, setPhInput] = useState('');
  const [phLoading, setPhLoading] = useState(false);

  const draft = currentDraft?.draft || '';
  const placeholders = extractPlaceholders(draft);
  const wordCount = currentDraft?.wordCount || 0;
  const isPodcast = state.outputType === OUTPUT_TYPES.PODCAST;
  const maxWords = isPodcast ? 1000 : 400;
  const warnAt = isPodcast ? 950 : 380;

  const wordCountColor =
    wordCount > maxWords ? 'text-red-400' : wordCount >= warnAt ? 'text-amber-400' : 'text-slate-500';

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

  function handleSaveVersion() {
    if (!draft) return;
    dispatch({ type: 'ADD_DRAFT_VERSION', draft, wordCount });
  }

  async function handleWeaveIn(placeholder) {
    const words = phInput.trim();
    if (!words || phLoading) return;
    setPhLoading(true);
    try {
      const { draft: newDraft, wordCount: wc } = await fillInPlaceholder(
        draft, placeholder, words, state.outputType, state.brand
      );
      dispatch({ type: 'ADD_DRAFT_VERSION', draft: newDraft, wordCount: wc });
      setActivePh(null);
      setPhInput('');
    } catch (err) {
      // leave panel open so user can retry
    } finally {
      setPhLoading(false);
    }
  }

  async function handleRevise() {
    const fb = feedback.trim();
    if (!fb || state.isLoading) return;

    setChatHistory((h) => [...h, { role: 'user', content: fb }]);
    setFeedback('');
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const { draft: newDraft, wordCount: wc } = await reviseDraft(draft, fb, state.outputType, state.brand);
      dispatch({ type: 'ADD_DRAFT_VERSION', draft: newDraft, wordCount: wc });
      setChatHistory((h) => [...h, {
        role: 'assistant',
        content: `Updated. v${state.draftVersions.length + 1} saved.`,
      }]);
    } catch (err) {
      setChatHistory((h) => [...h, {
        role: 'assistant',
        content: `Error: ${err.message || 'Revision failed.'}`,
      }]);
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handleFeedbackKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRevise();
  }

  async function handleSpeakingOutline() {
    if (outlineLoading || !draft) return;
    setOutlineLoading(true);
    setOutlineModalOpen(true);
    setOutlineText('');
    try {
      const result = await generateSpeakingOutline(draft, state.outputType, state.brand);
      setOutlineText(result);
    } catch (err) {
      setOutlineText(`Error: ${err.message || 'Failed to generate outline.'}`);
    } finally {
      setOutlineLoading(false);
    }
  }

  const versionLabel = (i) => {
    const v = state.draftVersions[i];
    const d = new Date(v.timestamp);
    return `v${i + 1} — ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {outlineModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-lg mx-6 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e]">
              <span className="text-sm font-semibold text-white">Speaking Outline</span>
              <button onClick={() => setOutlineModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {outlineLoading ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <LoadingDots />
                  <span className="text-sm text-slate-500 ml-2">Building outline…</span>
                </div>
              ) : (
                <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono select-all">{outlineText}</pre>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#2a2d3e] flex justify-end">
              <button onClick={() => { try { navigator.clipboard.writeText(outlineText) } catch {} }}
                disabled={outlineLoading || !outlineText}
                className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        {/* LEFT — draft */}
        <div className="flex-1 flex flex-col min-h-0 border-r border-[#1e2130]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e2130]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Draft</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isPodcast ? 'bg-purple-900/40 text-purple-400' : 'bg-blue-900/40 text-blue-400'
              }`}>
                {isPodcast ? 'Podcast' : 'Newsletter'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono font-medium ${wordCountColor}`}>
                {wordCount} / {maxWords}
              </span>
              <button onClick={handleSaveVersion} disabled={!draft}
                className="text-xs text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all disabled:opacity-30">
                Save version
              </button>
              <div className="relative">
                <button onClick={() => setVersionOpen((v) => !v)}
                  className="text-xs text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                  {versionLabel(state.currentVersionIndex)}
                  <span className="text-slate-600">▾</span>
                </button>
                {versionOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-[#141620] border border-[#2a2d3e] rounded-xl shadow-xl min-w-[160px] py-1">
                    {state.draftVersions.map((_, i) => (
                      <button key={i} onClick={() => handleRestoreVersion(i)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${
                          i === state.currentVersionIndex ? 'text-white font-medium' : 'text-slate-400'
                        }`}>
                        {versionLabel(i)}
                        {i === state.currentVersionIndex && <span className="ml-2 text-slate-600">← current</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <textarea value={draft} onChange={handleDraftChange}
            className="flex-1 w-full bg-[#0f1117] text-slate-200 px-8 py-6 resize-none focus:outline-none leading-[1.8] min-h-0 text-base"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            spellCheck />

          {/* FILL IN panel */}
          {placeholders.length > 0 && (
            <div className="border-t border-[#1e2130] px-6 py-3 bg-[#0c0e18]">
              <p className="text-xs text-amber-400 font-medium mb-2">
                Needs your words ({placeholders.length})
              </p>
              <div className="flex flex-col gap-2">
                {placeholders.map((ph) => (
                  <div key={ph} className="rounded-lg border border-[#2a2d3e] overflow-hidden">
                    <button
                      onClick={() => { setActivePh(activePh === ph ? null : ph); setPhInput(''); }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate text-amber-400/80">{ph}</span>
                      <span className="text-slate-600 shrink-0">{activePh === ph ? '▲' : '▼'}</span>
                    </button>
                    {activePh === ph && (
                      <div className="px-3 pb-3 bg-[#141620]">
                        <textarea
                          value={phInput}
                          onChange={(e) => setPhInput(e.target.value)}
                          placeholder="Your actual words here — be specific, be you…"
                          rows={3} autoFocus
                          className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-slate-500 transition-colors mb-2"
                        />
                        <button
                          onClick={() => handleWeaveIn(ph)}
                          disabled={!phInput.trim() || phLoading}
                          className="text-xs px-3 py-1.5 bg-white text-[#0f1117] font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          {phLoading ? 'Weaving in…' : 'Weave in my words →'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-6 py-3 border-t border-[#1e2130]">
            <div />
            <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.FILTER })}
              className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-1.5 rounded-lg transition-all">
              Run filter check →
            </button>
          </div>
        </div>

        {/* RIGHT — chat */}
        <div className="w-80 flex flex-col min-h-0 bg-[#0c0e18]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2130]">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Revisions</span>
            <div className="flex items-center gap-2">
              <button onClick={handleSpeakingOutline} disabled={outlineLoading || !draft}
                className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40">
                {outlineLoading ? 'Building…' : 'Speaking outline'}
              </button>
              <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HEADLINES })}
                className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-2.5 py-1 rounded-lg transition-all">
                Find headlines →
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
            {chatHistory.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed">
                Type feedback below.<br />Claude will revise and save a new version.
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-white/10 text-slate-200' : 'bg-[#1a1d2e] border border-[#2a2d3e] text-slate-400'
                }`}>
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

          <div className="px-4 py-3 border-t border-[#1e2130]">
            {state.error && <p className="text-xs text-red-400 mb-2">{state.error}</p>}
            <div className="flex gap-2">
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={handleFeedbackKeyDown}
                placeholder="Tell Claude what to change…"
                rows={2} disabled={state.isLoading}
                className="flex-1 bg-[#141620] border border-[#2a2d3e] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-slate-500 transition-colors" />
              <button onClick={handleRevise}
                disabled={!feedback.trim() || state.isLoading}
                className="px-3 py-2 bg-white text-[#0f1117] text-xs font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all self-end">
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
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
