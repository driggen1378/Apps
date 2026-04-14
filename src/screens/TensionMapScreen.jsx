import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function TensionMapScreen() {
  const { state, dispatch, SCREENS } = useApp();

  const [competingExplanations, setCompetingExplanations] = useState(
    state.tensionMap?.competingExplanations || ''
  );
  const [whatMakesItHard, setWhatMakesItHard] = useState(
    state.tensionMap?.whatMakesItHard || ''
  );
  const [commonBadAdvice, setCommonBadAdvice] = useState(
    state.tensionMap?.commonBadAdvice || ''
  );
  const [realLifeStakes, setRealLifeStakes] = useState(
    state.tensionMap?.realLifeStakes || ''
  );

  const question = state.selectedQuestion || state.rawInput || '';

  function handleBuildDraft() {
    dispatch({
      type: 'SET_TENSION_MAP',
      map: { competingExplanations, whatMakesItHard, commonBadAdvice, realLifeStakes },
    });
    dispatch({ type: 'SET_SCREEN', screen: SCREENS.QA });
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2130]">
        <div>
          <h2 className="text-lg font-semibold text-white">Tension Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">Optional context to sharpen the angle — all fields can be left blank</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: SCREENS.QUESTION_FORMATION })}
          className="text-sm text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Question display */}
        {question && (
          <div className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-5 py-4">
            <p className="text-xs text-amber-400 font-medium mb-1.5 uppercase tracking-wider">Your question</p>
            <p className="text-base text-white font-semibold leading-snug">{question}</p>
          </div>
        )}

        {/* Competing explanations */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-amber-400">Competing explanations</label>
          <p className="text-xs text-slate-500">What else might be true about this?</p>
          <textarea
            value={competingExplanations}
            onChange={e => setCompetingExplanations(e.target.value)}
            placeholder="Optional — what other angles or explanations exist?"
            rows={3}
            className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors leading-relaxed"
          />
        </div>

        {/* What makes it hard */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-amber-400">What makes it hard</label>
          <p className="text-xs text-slate-500">What's the real obstacle most people face here?</p>
          <textarea
            value={whatMakesItHard}
            onChange={e => setWhatMakesItHard(e.target.value)}
            placeholder="Optional — what's the friction point that doesn't get named?"
            rows={3}
            className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors leading-relaxed"
          />
        </div>

        {/* Common bad advice */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-amber-400">Common bad advice</label>
          <p className="text-xs text-slate-500">What do people usually say that doesn't actually work?</p>
          <textarea
            value={commonBadAdvice}
            onChange={e => setCommonBadAdvice(e.target.value)}
            placeholder="Optional — what's the received wisdom that misses the point?"
            rows={3}
            className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors leading-relaxed"
          />
        </div>

        {/* Real-life stakes */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-amber-400">Real-life stakes</label>
          <p className="text-xs text-slate-500">What does this question actually cost someone if they get it wrong?</p>
          <textarea
            value={realLifeStakes}
            onChange={e => setRealLifeStakes(e.target.value)}
            placeholder="Optional — what happens when someone handles this badly?"
            rows={3}
            className="bg-[#141620] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-[#4a4d6e] transition-colors leading-relaxed"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-[#1e2130] flex justify-end">
        <button
          onClick={handleBuildDraft}
          className="px-6 py-2.5 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all"
        >
          Build the draft →
        </button>
      </div>
    </div>
  );
}
