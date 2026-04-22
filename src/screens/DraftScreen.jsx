import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { reviseDraft, generateSpeakingOutline, fillInPlaceholder, reviewArgument, scoreDraftAgainstBrand, countWords } from '../lib/anthropic';
import { storage } from '../lib/storage';

function extractPlaceholders(text) {
  const regex = /\[FILL IN:[^\]]+\]/g;
  return [...new Set(text.match(regex) || [])];
}

export default function DraftScreen({ onNavigate }) {
  const { state, dispatch, SCREENS, OUTPUT_TYPES, currentDraft } = useApp();
  const [feedback, setFeedback] = useState('');
  const chatEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [versionOpen, setVersionOpen] = useState(false);
  const [outlineModalOpen, setOutlineModalOpen] = useState(false);
  const [outlineText, setOutlineText] = useState('');
  const [outlineLoading, setOutlineLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewStep, setReviewStep] = useState('review'); // 'review' | 'scoring' | 'scored'
  const [reviewHighlights, setReviewHighlights] = useState('');
  const [reviewRecommendedChanges, setReviewRecommendedChanges] = useState('');
  const [editableDraft, setEditableDraft] = useState('');
  const [brandScores, setBrandScores] = useState(null);
  const [scoreError, setScoreError] = useState(null);
  const [activePh, setActivePh] = useState(null);
  const [phInput, setPhInput] = useState('');
  const [phLoading, setPhLoading] = useState(false);
  const [savedToDrafts, setSavedToDrafts] = useState(false);

  // Guard: if no draft exists (bad session restore), render nothing
  if (!currentDraft) return null;

  const draft = currentDraft?.draft || '';
  const placeholders = extractPlaceholders(draft);
  const wordCount = currentDraft?.wordCount || 0;
  const isPodcast = state.outputType === OUTPUT_TYPES.PODCAST;
  const maxWords = isPodcast ? 1000 : 800;
  const warnAt   = isPodcast ? 950  : 760;

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

  async function handleReviewArgument() {
    if (reviewLoading || !draft) return;
    setReviewLoading(true);
    setReviewModalOpen(true);
    setReviewStep('review');
    setReviewHighlights('');
    setReviewRecommendedChanges('');
    setEditableDraft(draft);
    setBrandScores(null);
    setScoreError(null);
    try {
      const result = await reviewArgument({ draft, brand: state.brand });
      setReviewHighlights(result.highlights || '');
      setReviewRecommendedChanges(result.recommendedChanges || '');
    } catch (err) {
      setReviewHighlights(`Error: ${err.message || 'Failed to review argument.'}`);
    } finally {
      setReviewLoading(false);
    }
  }

  async function handleSubmitForScoring() {
    if (!editableDraft.trim()) return;
    setReviewStep('scoring');
    setScoreError(null);
    try {
      const result = await scoreDraftAgainstBrand({ draft: editableDraft, brand: state.brand });
      setBrandScores(result.scores || []);
      setReviewStep('scored');
    } catch (err) {
      setScoreError(err.message || 'Scoring failed. Try again.');
      setReviewStep('review');
    }
  }

  function handleSaveAndGoToDrafts() {
    if (!editableDraft.trim()) return;
    const wc = countWords(editableDraft);
    dispatch({ type: 'ADD_DRAFT_VERSION', draft: editableDraft, wordCount: wc });
    storage.saveDraft({
      id: Date.now(),
      title: state.rawInput?.slice(0, 80) || 'Draft',
      content: editableDraft,
      wordCount: wc,
      outputType: state.outputType,
      readyToPublish: true,
      brandScores: brandScores || [],
    });
    setReviewModalOpen(false);
    setReviewStep('review');
    onNavigate?.('drafts');
  }

  function closeReviewModal() {
    setReviewModalOpen(false);
    setReviewStep('review');
    setScoreError(null);
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
      {reviewModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#141620] border border-[#2a2d3e] rounded-2xl shadow-2xl w-full max-w-3xl mx-6 flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2d3e] shrink-0">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">
                  {reviewStep === 'scored' ? 'Brand Score' : 'Argument Review'}
                </span>
                <span className="text-xs text-slate-600">
                  {reviewStep === 'scored'
                    ? 'How well this draft hits your brand priorities'
                    : 'Intellectual-honesty pass — flags + rewrites'}
                </span>
              </div>
              <button onClick={closeReviewModal}
                className="text-slate-500 hover:text-white transition-colors text-lg leading-none">✕</button>
            </div>

            {/* Body */}
            {reviewStep === 'review' && (
              <div className="flex-1 overflow-y-auto min-h-0">
                {reviewLoading ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <LoadingDots />
                    <span className="text-sm text-slate-500 ml-2">Pressure-testing the argument…</span>
                  </div>
                ) : (
                  <>
                    {scoreError && (
                      <div className="mx-6 mt-4 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-2">
                        <p className="text-xs text-red-300">{scoreError}</p>
                      </div>
                    )}

                    {reviewHighlights && (
                      <div className="px-6 py-5 border-b border-[#1e2130]">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-3">Highlights</p>
                        <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'inherit' }}>{reviewHighlights}</pre>
                      </div>
                    )}

                    {reviewRecommendedChanges && (
                      <div className="px-6 py-5 border-b border-[#1e2130]">
                        <p className="text-xs text-amber-500 uppercase tracking-wider font-mono mb-3">Recommended Changes</p>
                        <pre className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'inherit' }}>{reviewRecommendedChanges}</pre>
                      </div>
                    )}

                    {reviewHighlights && (
                      <div className="px-6 py-5">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-3">Edit your draft</p>
                        <textarea
                          value={editableDraft}
                          onChange={(e) => setEditableDraft(e.target.value)}
                          className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-4 text-slate-200 text-sm leading-[1.8] resize-none focus:outline-none focus:border-slate-500 transition-colors"
                          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", minHeight: '260px' }}
                          spellCheck
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {reviewStep === 'scoring' && (
              <div className="flex-1 flex items-center justify-center gap-2">
                <LoadingDots />
                <span className="text-sm text-slate-500 ml-2">Scoring against your brand…</span>
              </div>
            )}

            {reviewStep === 'scored' && brandScores && (
              <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
                <div className="flex flex-col">
                  {brandScores.map((item, i) => (
                    <ScoreRow key={i} label={item.label} score={item.score} note={item.note} />
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#2a2d3e] flex items-center justify-between shrink-0">
              {reviewStep === 'scored' ? (
                <>
                  <button onClick={() => setReviewStep('review')}
                    className="text-xs text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
                    ← Back to edit
                  </button>
                  <button onClick={handleSaveAndGoToDrafts}
                    className="px-5 py-2 bg-white text-[#0f1117] text-xs font-bold rounded-xl hover:bg-slate-100 transition-all">
                    Save → Drafts
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { try { navigator.clipboard.writeText(`${reviewHighlights}\n\n---\n\n${reviewRecommendedChanges}`) } catch {} }}
                    disabled={reviewLoading || !reviewHighlights}
                    className="text-xs text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
                    Copy review
                  </button>
                  <button
                    onClick={handleSubmitForScoring}
                    disabled={reviewLoading || !reviewHighlights || !editableDraft.trim()}
                    className="px-5 py-2 bg-white text-[#0f1117] text-xs font-bold rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    Submit for scoring →
                  </button>
                </>
              )}
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
            <button
              onClick={() => {
                storage.saveDraft({
                  id:         Date.now(),
                  title:      state.rawInput?.slice(0, 80) || 'Draft',
                  content:    draft,
                  wordCount,
                  outputType: state.outputType,
                })
                setSavedToDrafts(true)
                setTimeout(() => setSavedToDrafts(false), 2000)
              }}
              className="text-xs text-slate-500 hover:text-slate-300 border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              {savedToDrafts ? '✓ Saved to Drafts' : 'Save to Drafts'}
            </button>
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
              <button onClick={handleReviewArgument} disabled={reviewLoading || !draft}
                className="text-xs text-amber-400 hover:text-amber-300 border border-amber-900/40 hover:border-amber-700/60 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40">
                {reviewLoading ? 'Reviewing…' : 'Review argument'}
              </button>
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

function ScoreRow({ label, score, note }) {
  const color = score >= 7 ? 'text-green-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  const barColor = score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="py-3 border-b border-[#1e2130] last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-200">{label}</span>
        <span className={`text-base font-bold font-mono ${color}`}>
          {score}<span className="text-xs text-slate-600">/10</span>
        </span>
      </div>
      <div className="w-full bg-[#1e2130] rounded-full h-1 mb-1.5">
        <div className={`h-1 rounded-full ${barColor} transition-all`} style={{ width: `${score * 10}%` }} />
      </div>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  );
}
