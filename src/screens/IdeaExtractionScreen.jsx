import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { gatherMosaic, assessInput } from '../lib/anthropic';

// Mosaic — pull raw material from the internet based on vague words + influences.
// Shows what creators and articles are already saying. User picks a tile and
// reacts from their own experience. That reaction becomes the seed for Q&A.

const TYPE_LABELS = {
  creator_take: 'Creator take',
  article_angle: 'Article angle',
  conversation: 'Conversation',
};

const TYPE_COLORS = {
  creator_take: 'text-blue-400 bg-blue-900/20 border-blue-900/40',
  article_angle: 'text-purple-400 bg-purple-900/20 border-purple-900/40',
  conversation: 'text-green-400 bg-green-900/20 border-green-900/40',
};

export default function MosaicScreen() {
  const { state, dispatch, SCREENS } = useApp();

  const [phase, setPhase] = useState('seed'); // 'seed' | 'tiles'
  const [words, setWords] = useState('');
  const [influences, setInfluences] = useState('');
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  async function handleBuild() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setTiles([]);
    setSelected(null);

    try {
      const result = await gatherMosaic(words, influences, state.brand);
      const found = result.tiles || [];
      if (!found.length) {
        setError('Nothing came back. Try adding a few influence names or more specific words.');
      } else {
        setTiles(found);
        setPhase('tiles');
      }
    } catch (err) {
      setError(err.message || 'Search failed. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTile(tile) {
    setSelected(tile);

    // Seed the Q&A with the tile's content + hook as context
    const seed = `Source: ${tile.source}\nAngle: ${tile.headline}\n\nWhat they say: ${tile.what_they_say}\n\nReaction prompt: ${tile.hook}`;
    dispatch({ type: 'SET_RAW_INPUT', value: seed });
    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await assessInput(
        `${tile.headline} ${tile.what_they_say} ${tile.hook}`,
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
    setTiles([]);
    setSelected(null);
    setError(null);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#1e2130]">
        <div>
          <h2 className="text-lg font-semibold text-white">Mosaic</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {phase === 'seed'
              ? 'Find what creators and articles are already saying — then apply your own take'
              : 'Pick a tile that lands. React from your own experience.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
            className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
          >
            ← Back
          </button>
          {phase === 'tiles' && (
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

        {/* ── Phase 1: Seed inputs ─────────────────────────────────────────── */}
        {phase === 'seed' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-5">
            <p className="text-sm text-slate-400 leading-relaxed">
              Type the words you keep circling and the people already working in that space.
              Mosaic will pull what they're saying — articles, takes, arguments — so you can
              react from your own experience instead of starting from nothing.
            </p>

            {/* Words input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Words you're orbiting
              </label>
              <textarea
                value={words}
                onChange={e => setWords(e.target.value)}
                placeholder="e.g. discipline, identity, leaving the military, what it means to lead, doing hard things"
                rows={3}
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors"
                disabled={loading}
                autoFocus
              />
              <p className="text-xs text-slate-600">Vague is fine. These are the words you keep coming back to.</p>
            </div>

            {/* Influences input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                Who's already talking about this?
              </label>
              <input
                type="text"
                value={influences}
                onChange={e => setInfluences(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !loading) handleBuild(); }}
                placeholder="e.g. Austin Kleon, Naval Ravikant, James Clear, Ryan Holiday, Tim Ferriss"
                className="w-full bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-[#4a4d6e] transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-slate-600">Creators, writers, podcasters — anyone whose work lives in this territory.</p>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleBuild}
              disabled={loading || (!words.trim() && !influences.trim())}
              className="w-full px-4 py-3 bg-white text-[#0f1117] text-sm font-semibold rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingDots dark />
                  <span>Building your Mosaic…</span>
                </>
              ) : (
                'Build my Mosaic →'
              )}
            </button>

            {loading && (
              <div className="flex flex-col gap-1 text-center">
                <p className="text-xs text-slate-500">Searching articles, creator takes, and discussions…</p>
                <p className="text-xs text-slate-600">Pulling what's already being said in this territory.</p>
              </div>
            )}

            {/* How it works */}
            <div className="border border-[#1e2130] rounded-xl px-5 py-4 flex flex-col gap-3 mt-1">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">How Mosaic works</p>
              <div className="flex flex-col gap-2.5">
                {[
                  ['Finds the landscape', 'Articles, creator takes, newsletter arguments, forum debates — whatever\'s already circulating in this territory.'],
                  ['Shows you the angles', 'Not topics. Specific claims: what the creator is actually arguing, what the article is pushing for.'],
                  ['Gives you a reaction prompt', 'A plain question that brings each take into your own experience. That reaction is your angle.'],
                  ['Seeds your Q&A', 'Pick the tile that lands. The Q&A will pull your version of that story out of you.'],
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

        {/* ── Phase 2: Tiles ───────────────────────────────────────────────── */}
        {phase === 'tiles' && (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {state.error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-2">
                <p className="text-sm text-red-300">{state.error}</p>
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              This is what's already being said in your territory. Pick the tile where your experience
              has something to say — agree, disagree, extend, complicate. That's your angle.
            </p>

            {tiles.map((tile, i) => (
              <button
                key={i}
                onClick={() => handleSelectTile(tile)}
                disabled={state.isLoading}
                className={`w-full flex flex-col items-start text-left bg-[#141620] border rounded-xl px-5 py-5 hover:border-slate-500 transition-all group disabled:opacity-50 ${
                  selected?.headline === tile.headline ? 'border-white' : 'border-[#2a2d3e]'
                }`}
              >
                {/* Source + type badge */}
                <div className="flex items-center gap-2 mb-3 w-full">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[tile.type] || 'text-slate-400 bg-slate-800/40 border-slate-700'}`}>
                    {TYPE_LABELS[tile.type] || tile.type}
                  </span>
                  <span className="text-xs text-slate-500 truncate">{tile.source}</span>
                  {tile.url && tile.url !== 'null' && tile.url !== null && (
                    <a
                      href={tile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="ml-auto text-xs text-slate-600 hover:text-slate-400 transition-colors shrink-0"
                    >
                      ↗ read
                    </a>
                  )}
                </div>

                {/* Headline — the actual claim */}
                <p className="text-sm font-semibold text-white leading-snug mb-2 group-hover:text-white">
                  {tile.headline}
                </p>

                {/* What they say */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {tile.what_they_say}
                </p>

                {/* Hook — the reaction invitation */}
                <div className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2.5 mb-3">
                  <p className="text-xs text-amber-500 mb-1 font-mono">your angle</p>
                  <p className="text-xs text-amber-300 leading-snug">{tile.hook}</p>
                </div>

                <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors self-end">
                  React from your experience →
                </span>
              </button>
            ))}

            {state.isLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <LoadingDots />
                <p className="text-sm text-slate-500">Setting up your questions…</p>
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
