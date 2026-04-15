import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { extractTensions, assessInput } from '../lib/anthropic';

// Phase 1: seed input
// Phase 2: tension cards → select one → Q&A

export default function IdeaExtractionScreen() {
  const { state, dispatch, SCREENS } = useApp();

  const [phase, setPhase] = useState('seed'); // 'seed' | 'tensions'
  const [theme, setTheme] = useState('');
  const [tensions, setTensions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  async function handleMine() {
    setLoading(true);
    setError(null);
    setTensions([]);
    setSelected(null);

    try {
      const result = await extractTensions(theme, state.brand);
      const found = result.tensions || [];
      if (!found.length) {
        setError('No tensions surfaced. Try a more specific theme, or leave it blank to search your brand pillars.');
      } else {
        setTensions(found);
        setPhase('tensions');
      }
    } catch (err) {
      setError(err.message || 'Search failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTension(tension) {
    setSelected(tension);

    const seed = `Tension: ${tension.name}\n${tension.plain_language}\n\nWhat people argue: ${tension.what_people_argue}\n\nSeed question: ${tension.seed_question}`;
    dispatch({ type: 'SET_RAW_INPUT', value: seed });
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await assessInput(
        `${tension.plain_language} ${tension.seed_question} ${tension.what_people_argue}`,
        state.brand
      );
      dispatch({ type: 'SET_ASSESSMENT', assessment: result.assessment, questions: result.questions });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Failed to start Q&A. Try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  function handleReset() {
    setPhase('seed');
    setTensions([]);
    setSelected(null);
    setError(null);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#1e2130]">
        <div>
          <h2 className="text-lg font-semibold text-white">Steal Like an Artist</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {phase === 'seed'
              ? 'Pull raw material from the internet · Surface what people are actually wrestling with'
              : 'Pick the tension that hits closest to home'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
            className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
          >
            ← Back
          </button>
          {phase === 'tensions' && (
            <button
              onClick={handleReset}
              className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
            >
              ↺ New search
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* ── Phase 1: Seed input ──────────────────────────────────────────── */}
        {phase === 'seed' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-300 leading-relaxed">
                Type a theme you're orbiting — a word, a question, a feeling — or leave it blank to
                search your brand pillars. Either way, we'll dig into Reddit threads, comment sections,
                headlines, and debates to find where people are actually stuck.
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                We're not looking for what to write. We're looking for the push-pull — the thing people
                want on both sides and can't resolve. That's where your angle lives.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !loading) handleMine(); }}
                placeholder="e.g. "discipline", "leaving the military", "being a good leader" — or leave blank"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-base focus:outline-none focus:border-[#4a4d6e] transition-colors"
                disabled={loading}
                autoFocus
              />

              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleMine}
                disabled={loading}
                className="w-full px-4 py-3 bg-white text-[#0f1117] text-sm font-semibold rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingDots dark />
                    <span>Mining for tensions…</span>
                  </>
                ) : (
                  'Start digging →'
                )}
              </button>
            </div>

            {loading && (
              <div className="flex flex-col gap-1.5 text-center">
                <p className="text-xs text-slate-500">
                  Searching Reddit, headlines, and debate threads…
                </p>
                <p className="text-xs text-slate-600">
                  Looking for what people argue about, not what they agree on.
                </p>
              </div>
            )}

            {/* What this does */}
            <div className="border border-[#1e2130] rounded-xl px-5 py-4 flex flex-col gap-3">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">How it works</p>
              <div className="flex flex-col gap-2">
                {[
                  ['Pulls raw material', 'Reddit threads, comment fights, search patterns, headlines — not think-pieces.'],
                  ['Finds recurring tensions', 'Not topics. The push-pull between what people want on both sides.'],
                  ['Translates to plain language', 'Each tension becomes a question a real person would actually ask.'],
                  ['Gives you a seed', 'One question that brings that tension into your life and your story.'],
                ].map(([label, desc]) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-amber-400 text-xs mt-0.5 shrink-0">→</span>
                    <div>
                      <span className="text-xs text-slate-300 font-medium">{label} </span>
                      <span className="text-xs text-slate-500">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Phase 2: Tension cards ──────────────────────────────────────── */}
        {phase === 'tensions' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {state.error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-2">
                <p className="text-sm text-red-300">{state.error}</p>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              These are the push-pulls showing up across the internet right now.
              Pick the one that hits closest — the tension you've lived, failed at, or figured something out about.
            </p>

            {tensions.map((t, i) => (
              <button
                key={i}
                onClick={() => handleSelectTension(t)}
                disabled={state.isLoading}
                className={`w-full flex flex-col items-start text-left bg-[#141620] border rounded-xl px-5 py-5 hover:border-slate-500 transition-all group disabled:opacity-50 ${
                  selected?.name === t.name ? 'border-white' : 'border-[#2a2d3e]'
                }`}
              >
                {/* Tension name */}
                <p className="text-base font-semibold text-white leading-snug mb-1 group-hover:text-white">
                  {t.name}
                </p>

                {/* Plain language question */}
                <p className="text-sm text-slate-300 leading-relaxed mb-3">
                  {t.plain_language}
                </p>

                {/* The two poles */}
                <div className="flex gap-2 mb-3 w-full">
                  <div className="flex-1 bg-[#0f1117] border border-[#1e2130] rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-500 mb-0.5 font-mono">one side</p>
                    <p className="text-xs text-slate-400 leading-snug">{t.pole_a}</p>
                  </div>
                  <div className="flex items-center px-1 text-slate-700 text-xs font-bold">vs</div>
                  <div className="flex-1 bg-[#0f1117] border border-[#1e2130] rounded-lg px-3 py-2">
                    <p className="text-xs text-slate-500 mb-0.5 font-mono">other side</p>
                    <p className="text-xs text-slate-400 leading-snug">{t.pole_b}</p>
                  </div>
                </div>

                {/* What people argue */}
                <p className="text-xs text-slate-500 leading-relaxed mb-3 italic">
                  {t.what_people_argue}
                </p>

                {/* Seed question */}
                <div className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2.5 mb-3">
                  <p className="text-xs text-amber-500 mb-1 font-mono">seed question for you</p>
                  <p className="text-xs text-amber-300 leading-snug">{t.seed_question}</p>
                </div>

                {/* Source */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-700 bg-[#1e2130] px-2.5 py-1 rounded-full">
                    {t.source_hint}
                  </span>
                  <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                    Use this tension →
                  </span>
                </div>
              </button>
            ))}

            {state.isLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <LoadingDots />
                <p className="text-sm text-slate-500">Loading your questions…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingDots({ dark = false }) {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full animate-bounce ${dark ? 'bg-[#0f1117]' : 'bg-slate-500'}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
