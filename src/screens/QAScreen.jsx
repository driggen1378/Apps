import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { assembleDraft } from '../lib/anthropic';

export default function QAScreen() {
  const { state, dispatch, SCREENS } = useApp();
  const { questions, currentQuestionIndex, answers } = state;

  const [selected, setSelected] = useState(null);
  const [freeText, setFreeText] = useState('');
  const [showFreeText, setShowFreeText] = useState(false);

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

    dispatch({
      type: 'SET_ANSWER',
      index: currentQuestionIndex,
      question: question.question,
      answer,
    });

    if (isLast) {
      submitForDraft(answer);
    } else {
      dispatch({ type: 'SET_QUESTION_INDEX', index: currentQuestionIndex + 1 });
      resetLocal();
    }
  }

  function handleSkip() {
    dispatch({
      type: 'SET_ANSWER',
      index: currentQuestionIndex,
      question: question.question,
      answer: '[skipped]',
    });

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
    if (selected) {
      const opt = question.options.find((o) => o.label === selected);
      return opt ? opt.text : '';
    }
    return '';
  }

  function resetLocal() {
    setSelected(null);
    setFreeText('');
    setShowFreeText(false);
  }

  async function submitForDraft(lastAnswer) {
    const allAnswers = [...state.answers];
    allAnswers[currentQuestionIndex] = {
      question: question.question,
      answer: lastAnswer,
    };

    dispatch({ type: 'SET_LOADING', value: true });
    dispatch({ type: 'SET_ERROR', message: null });

    try {
      const { draft, wordCount } = await assembleDraft(state.rawInput, allAnswers);
      dispatch({ type: 'ADD_DRAFT_VERSION', draft, wordCount });
      dispatch({ type: 'SET_SCREEN', screen: SCREENS.DRAFT });
    } catch (err) {
      dispatch({
        type: 'SET_ERROR',
        message: err.message || 'Failed to assemble draft. Try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', value: false });
    }
  }

  const canContinue = (selected && !showFreeText) || (showFreeText && freeText.trim().length > 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Progress bar */}
      <div className="h-1 bg-[#1e2130]">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col px-8 py-8 max-w-2xl mx-auto w-full min-h-0">
        {/* Progress label */}
        <p className="text-xs text-slate-500 mb-6 font-mono">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>

        {/* Question */}
        <h2 className="text-2xl font-semibold text-white leading-snug mb-8">
          {question.question}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelectOption(opt)}
              disabled={state.isLoading}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                selected === opt.label && !showFreeText
                  ? 'border-white bg-white/10 text-white'
                  : 'border-[#2a2d3e] bg-[#141620] text-slate-300 hover:border-slate-500 hover:text-white'
              }`}
            >
              <span className={`text-xs font-mono mt-0.5 shrink-0 w-4 ${
                selected === opt.label && !showFreeText ? 'text-white' : 'text-slate-500'
              }`}>
                {opt.label}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </button>
          ))}

          {/* None of these — free text */}
          <button
            onClick={() => { setShowFreeText(true); setSelected(null); }}
            disabled={state.isLoading}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
              showFreeText
                ? 'border-white bg-white/10 text-white'
                : 'border-[#2a2d3e] bg-[#141620] text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            <span className="text-xs font-mono mt-0.5 shrink-0 w-4 text-slate-500">E</span>
            <span className="text-sm leading-relaxed">None of these — here's mine</span>
          </button>
        </div>

        {/* Free text field */}
        {showFreeText && (
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Type your answer here…"
            autoFocus
            rows={3}
            className="w-full bg-[#141620] border border-[#4a4d6e] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-slate-400 transition-colors mb-6"
          />
        )}

        {/* Error */}
        {state.error && (
          <div className="mb-4 bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{state.error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex gap-2">
            {currentQuestionIndex > 0 && (
              <button
                onClick={handleBack}
                disabled={state.isLoading}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleSkip}
              disabled={state.isLoading}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!canContinue || state.isLoading}
            className="px-6 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {state.isLoading ? (
              <>
                <LoadingDots />
                {isLast ? 'Assembling draft…' : 'Next'}
              </>
            ) : (
              isLast ? 'Build draft →' : 'Next →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
