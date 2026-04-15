import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { discoverTopics, assessInput } from '../lib/anthropic';

export default function DiscoveryScreen() {
  const { state, dispatch, SCREENS } = useApp();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetch() {
    setLoading(true);
    setError(null);
    setSelected(null);

    // Build a short context from the ideas board if available
    const ideasContext = state.ideasBoard.slice(0, 5)
      .map((i) => `- ${i.title} (${i.source})`)
      .join('\n') || null;

    try {
      const result = await discoverTopics(state.brand, ideasContext);
      setTopics(result.topics || []);
    } catch (err) {
      setError(err.message || 'Discovery search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectTopic(topic) {
    setSelected(topic);
    dispatch({ type: 'SET_RAW_INPUT', value: `Topic: ${topic.title}\nFrom: ${topic.source}\nSeed question: ${topic.seed_question}\nWhy relevant: ${topic.why_relevant}` });

    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const result = await assessInput(
        `${topic.title}. ${topic.seed_question} ${topic.why_relevant}`,
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

  const pillarColors = {
    'Leadership and autonomy': 'bg-blue-900/30 text-blue-400',
    'Military transition and identity': 'bg-green-900/30 text-green-400',
    'Meaningful work and intentional living': 'bg-purple-900/30 text-purple-400',
    'Thinking clearly under pressure': 'bg-amber-900/30 text-amber-400',
    'Self-development without the self-help cheese': 'bg-pink-900/30 text-pink-400',
  };

  function pillarColor(pillar) {
    for (const [key, cls] of Object.entries(pillarColors)) {
      if (pillar?.toLowerCase().includes(key.toLowerCase().slice(0, 12))) return cls;
    }
    return 'bg-slate-800 text-slate-400';
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-[#1e2130]">
        <div>
          <h2 className="text-lg font-semibold text-white">What are others saying?</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filtered through your brand pillars · Influenced by your ideas board
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
            className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all">
            ← Back
          </button>
          <button onClick={fetch} disabled={loading}
            className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-sm text-slate-500">Searching your influence network…</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={fetch} className="text-xs text-red-400 hover:text-red-300 mt-2 transition-colors">
              Try again →
            </button>
          </div>
        )}

        {state.error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        {!loading && topics.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-slate-500">No results yet.</p>
            <button onClick={fetch}
              className="text-sm text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all">
              Search now →
            </button>
          </div>
        )}

        {!loading && topics.length > 0 && (
          <div className="grid gap-3 max-w-3xl mx-auto">
            <p className="text-xs text-slate-500 mb-2">
              Click a topic to start writing from it. RUFIO's voice and brand pillars are already wired in.
            </p>
            {topics.map((topic, i) => (
              <button key={i} onClick={() => handleSelectTopic(topic)}
                disabled={state.isLoading}
                className={`flex flex-col items-start text-left w-full bg-[#141620] border rounded-xl px-5 py-4 hover:border-slate-500 transition-all group ${
                  selected?.title === topic.title ? 'border-white' : 'border-[#2a2d3e]'
                } disabled:opacity-50`}>
                <div className="flex items-start justify-between w-full gap-3 mb-2">
                  <p className="text-sm font-medium text-white group-hover:text-white leading-snug flex-1">
                    {topic.title}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${pillarColor(topic.pillar)}`}>
                    {topic.pillar?.split(' ').slice(0, 3).join(' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{topic.why_relevant}</p>
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-600 bg-[#1e2130] px-2.5 py-1 rounded-full">
                    {topic.source}
                  </span>
                  <div className="flex items-center gap-2">
                    {topic.url && topic.url !== 'N/A' && (
                      <a href={topic.url} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                        ↗ read
                      </a>
                    )}
                    <span className="text-xs text-slate-500 italic">{topic.seed_question}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
