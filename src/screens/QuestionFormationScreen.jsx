import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateCandidateQuestions } from '../lib/anthropic';
import { storage } from '../lib/storage';

export default function QuestionFormationScreen() {
  const { state, dispatch, SCREENS } = useApp();
  const boardItems = storage.getBoard();

  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [chosenIndex, setChosenIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');

  const MAX_SELECT = 5;

  function toggleItem(item) {
    setSelected(prev => {
      const already = prev.some(s => s.id === item.id);
      if (already) return prev.filter(s => s.id !== item.id);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, item];
    });
  }

  async function handleGenerate() {
    if (!selected.length || loading) return;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setChosenIndex(null);
    setEditedQuestion('');

    try {
      const brand = storage.getBrand();
      const result = await generateCandidateQuestions(selected, brand);
      setQuestions(result.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to generate questions. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  function handleChoose(index) {
    setChosenIndex(index);
    setEditedQuestion(questions[index].question);
  }

  function handleUseQuestion() {
    if (chosenIndex === null) return;
    const q = editedQuestion.trim() || questions[chosenIndex].question;
    dispatch({ type: 'SET_SELECTED_QUESTION', question: q });
    dispatch({ type: 'SET_RAW_INPUT', value: q });
    dispatch({ type: 'SET_SCREEN', screen: SCREENS.TENSION_MAP });
  }

  if (boardItems.length === 0) {
    return (
      <div className="flex flex-col h-full min-h-0 items-center justify-center px-8">
        <p className="text-slate-500 text-sm text-center max-w-sm leading-relaxed">
          No items on your Ideas Board yet. Save articles in the Ideas section first.
        </p>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
          className="mt-6 text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-4 py-2 rounded-lg transition-all"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2130]">
        <div>
          <h2 className="text-lg font-semibold text-white">Question Formation</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select 1–5 board items, then generate candidate questions</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
          className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
        >
          ← Back
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left — board items */}
        <div className="w-1/2 flex flex-col min-h-0 border-r border-[#1e2130]">
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e2130]">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Ideas Board ({boardItems.length})
            </span>
            <span className="text-xs text-slate-600">
              {selected.length}/{MAX_SELECT} selected
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-2">
            {boardItems.map(item => {
              const isSelected = selected.some(s => s.id === item.id);
              const isDisabled = !isSelected && selected.length >= MAX_SELECT;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  disabled={isDisabled}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-white bg-white/10'
                      : isDisabled
                      ? 'border-[#2a2d3e] bg-[#141620] opacity-40 cursor-not-allowed'
                      : 'border-[#2a2d3e] bg-[#141620] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-white bg-white' : 'border-slate-600'
                    }`}>
                      {isSelected && <span className="text-[#0f1117] text-xs font-bold leading-none">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 leading-snug line-clamp-2">{item.title}</p>
                      {item.source && <p className="text-xs text-slate-600 mt-0.5">{item.source}</p>}
                      {item.reflections?.why && (
                        <p className="text-xs text-amber-400/70 mt-1 line-clamp-1">"{item.reflections.why}"</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-[#1e2130]">
            <button
              onClick={handleGenerate}
              disabled={!selected.length || loading}
              className="w-full px-4 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><LoadingDots /><span>Generating…</span></>
              ) : (
                `Generate questions →`
              )}
            </button>
          </div>
        </div>

        {/* Right — candidate questions */}
        <div className="w-1/2 flex flex-col min-h-0">
          <div className="flex items-center px-6 py-3 border-b border-[#1e2130]">
            <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Candidate Questions</span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
            {!questions.length && !loading && !error && (
              <p className="text-xs text-slate-600 text-center mt-8 leading-relaxed">
                Select items on the left and click<br />"Generate questions" to see candidates.
              </p>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {questions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
                  chosenIndex === i
                    ? 'border-white bg-white/10'
                    : 'border-[#2a2d3e] bg-[#141620] hover:border-slate-500'
                }`}
              >
                <p className="text-sm text-slate-200 leading-snug font-medium">{q.question}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{q.tension}</p>
              </button>
            ))}

            {chosenIndex !== null && (
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-xs text-amber-400 font-medium">Edit question (optional)</p>
                <textarea
                  value={editedQuestion}
                  onChange={e => setEditedQuestion(e.target.value)}
                  rows={2}
                  className="w-full bg-[#141620] border border-[#4a4d6e] rounded-xl px-4 py-3 text-slate-200 text-sm leading-relaxed resize-none focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>
            )}
          </div>

          {chosenIndex !== null && (
            <div className="px-6 py-4 border-t border-[#1e2130]">
              <button
                onClick={handleUseQuestion}
                className="w-full px-4 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all"
              >
                Use this question →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#0f1117] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
