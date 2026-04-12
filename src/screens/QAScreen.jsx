import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { assembleNewsletter, assemblePodcast } from '../lib/anthropic';

export default function QAScreen() {
  const { state, dispatch, SCREENS, OUTPUT_TYPES } = useApp();
  const { questions, currentQuestionIndex, answers } = state;

  const [selected, setSelected] = useState(null);
  const [freeText, setFreeText] = useState('');
  const [showFreeText, setShowFreeText] = useState(false);

  // If output type not yet chosen, show the selector first
  if (!state.outputType) {
    return <OutputTypeSelector />;
  }

  const question = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLast = currentQuestionIndex === totalQuestions - 1;

  function handleSelectOption(option) {
    setSelected(option.label);
    setShowFreeText(false);
    setFreeText('');
  }

  function handleNext() {
    const answer = buildAnswer();
    if (!answer) return;
    dispatch({ type: 'SET_ANSWER', index: currentQuestionIndex, question: question.question, answer });
    if (isLast) {
      submitForDraft(answer);
    } else {
      dispatch({ type: 'SET_QUESTION_INDEX', index: currentQuestionIndex + 1 });
      resetLocal();
    }
  }

  function handleSkip() {
    dispatch({ type: 'SET_ANSWER', index: currentQuestionIndex, question: question.question, answer: '[skipped]' });
    if (isLast) {
      submitForDraft('[skipped]');
    } else {
      dispatch({ type: 'SET_QUESTION_INDEX', index: currentQuestionIndex + 1 });
      resetLocal();
    }
  }

  function handleBack() {
    if (currentQuestionIndex === 0) return;
    dispatch({ type: 'SET_QUESTION_INDEX', index: currentQuestionIndex - 1 });
    resetLocal();
  }

  function buildAnswer() {
    if (showFreeText && freeText.trim()) return freeText.trim();
    if (selected) return question.options.find((o) => o.label === selected)?.text || '';
    return '';
  }

  function resetLocal() {
    setSelected(null);
    setFreeText('');
    setShowFreeText(false);
  }

  async function submitForDraft(lastAnswer) {
    const allAnswers = [...state.answers];
    allAnswers[currentQuestionIndex] = { question: question.question, answer: lastAnswer };

    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const assembler = state.outputType === OUTPUT_TYPES.PODCAST ? assemblePodcast : assembleNewsletter;
      const { draft, wordCount } = await assembler(state.rawInput, allAnswers, state.brand);
      dispatch({ type: 'ADD_DRAFT_VERSION', draft, wordCount });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.DRAFT });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Failed to assemble draft. Try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  const canContinue = (selected && !showFreeText) || (showFreeText && freeText.trim().length > 0);
  const isPodcast = state.outputType === OUTPUT_TYPES.PODCAST;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="h-1 bg-[#1e2130]">
        <div className="h-full bg-white transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col px-8 py-8 max-w-2xl mx-auto w-full min-h-0">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-slate-500 font-mono">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            isPodcast ? 'bg-purple-900/40 text-purple-400' : 'bg-blue-900/40 text-blue-400'
          }`}>
            {isPodcast ? 'Podcast script' : 'Newsletter'}
          </span>
        </div>

        <h2 className="text-2xl font-semibold text-white leading-snug mb-8">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((opt) => (
            <button key={opt.label}
              onClick={() => handleSelectOption(opt)}
              disabled={state.isLoading}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                selected === opt.label && !showFreeText
                  ? 'border-white bg-white/10 text-white'
                  : 'border-[#2a2d3e] bg-[#141620] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}>
              <span className={`text-xs font-mono mt-0.5 shrink-0 w-4 ${selected === opt.label && !showFreeText ? 'text-white' : 'text-slate-500'}`}>
                {opt.label}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </button>
          ))}

          <button onClick={() => { setShowFreeText(true); setSelected(null); }}
            disabled={state.isLoading}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
              showFreeText ? 'border-white bg-white/10 text-white' : 'border-[#2a2d3e] bg-[#141620] text-slate-300 hover:border-slate-500 hover:text-white'
            }`}>
            <span className="text-xs font-mono mt-0.5 shrink-0 w-4 text-slate-500">E</span>
            <span className="text-sm leading-relaxed">None of these — here's mine</span>
          </button>
        </div>

        {showFreeText && (
          <textarea value={freeText} onChange={(e) => setFreeText(e.target.value)}
            placeholder="Type your answer here…" autoFocus rows={3}
            className="w-full bg-[#141620] border border-[#4a4d6e] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-slate-400 transition-colors mb-6" />
        )}

        {state.error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <button onClick={handleBack} disabled={state.isLoading}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg transition-all">
                ← Back
              </button>
            )}
            <button onClick={handleSkip} disabled={state.isLoading}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Skip
            </button>
          </div>

          <button onClick={handleNext}
            disabled={!canContinue || state.isLoading}
            className="px-6 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
            {state.isLoading ? (
              <><LoadingDots />{isLast ? 'Building…' : 'Next'}</>
            ) : (
              isLast ? 'Build draft →' : 'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function OutputTypeSelector() {
  const { state, dispatch, SCREENS, OUTPUT_TYPES } = useApp();

  function select(type) {
    dispatch({ type: 'SET_OUTPUT_TYPE', value: type });
    // If they came from discovery with questions already set, go straight to Q&A
    // Otherwise go back — shouldn't happen but guard anyway
  }

  return (
    <div className="flex flex-col h-full min-h-0 items-center justify-center px-8">
      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">What are we making?</p>
      <h2 className="text-2xl font-semibold text-white mb-8 text-center">Choose your output</h2>

      <div className="flex gap-4 w-full max-w-md">
        <button onClick={() => select(OUTPUT_TYPES.NEWSLETTER)}
          className="flex-1 flex flex-col items-center gap-3 px-6 py-8 bg-[#141620] border border-[#2a2d3e] hover:border-blue-500 rounded-xl transition-all group">
          <span className="text-3xl">✉️</span>
          <div className="text-center">
            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">Newsletter</p>
            <p className="text-xs text-slate-500 mt-1">Lessons Learned<br />400 words</p>
          </div>
        </button>

        <button onClick={() => select(OUTPUT_TYPES.PODCAST)}
          className="flex-1 flex flex-col items-center gap-3 px-6 py-8 bg-[#141620] border border-[#2a2d3e] hover:border-purple-500 rounded-xl transition-all group">
          <span className="text-3xl">🎙️</span>
          <div className="text-center">
            <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">Podcast Script</p>
            <p className="text-xs text-slate-500 mt-1">Your Finest Hour<br />800–1000 words</p>
          </div>
        </button>
      </div>

      <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.HOME })}
        className="mt-8 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        ← Back
      </button>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
