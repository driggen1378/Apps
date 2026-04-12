import { useState } from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  { id: 'input', label: 'Input' },
  { id: 'qa', label: 'Q&A' },
  { id: 'draft', label: 'Draft' },
  { id: 'headlines', label: 'Headlines' },
  { id: 'filter', label: 'Filters' },
];

const FILTER_BADGE = {
  not_run: { label: 'Filters not run', cls: 'bg-slate-800 text-slate-500' },
  running: { label: 'Running…', cls: 'bg-slate-800 text-slate-400 animate-pulse' },
  passed: { label: '✅ Both passed', cls: 'bg-green-900/40 text-green-400' },
  failed: { label: '⚠ Check failed', cls: 'bg-amber-900/40 text-amber-400' },
};

export default function Sidebar() {
  const { state, dispatch, SCREENS, currentWordCount, startOver } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  const stepIndex = STEPS.findIndex((s) => s.id === state.screen);
  const badge = FILTER_BADGE[state.filterStatus] || FILTER_BADGE.not_run;

  function handleSaveDraft() {
    const draft = state.draftVersions[state.currentVersionIndex]?.draft || '';
    if (!draft) return;

    const date = new Date().toISOString().slice(0, 10);
    const subject = state.subjectLine ? `Subject: ${state.subjectLine}\n\n` : '';
    const content = `${subject}${draft}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lessons-learned-draft-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleStartOver() {
    if (confirmReset) {
      startOver();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    }
  }

  const wordCountColor =
    currentWordCount > 400
      ? 'text-red-400'
      : currentWordCount >= 380
      ? 'text-amber-400'
      : 'text-slate-400';

  return (
    <aside className="w-52 shrink-0 bg-[#0c0e18] border-r border-[#1e2130] flex flex-col py-6 px-4">
      {/* App title */}
      <div className="mb-6">
        <h1 className="text-sm font-semibold text-white leading-tight">Lessons Learned</h1>
        <p className="text-xs text-slate-600 mt-0.5">Draft Workspace</p>
      </div>

      {/* Progress steps */}
      <div className="mb-6">
        <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-3">Progress</p>
        <div className="flex flex-col gap-1">
          {STEPS.map((step, i) => {
            const isActive = step.id === state.screen;
            const isDone = i < stepIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'text-white bg-white/5'
                    : isDone
                    ? 'text-slate-500'
                    : 'text-slate-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isActive
                    ? 'bg-white'
                    : isDone
                    ? 'bg-slate-600'
                    : 'bg-slate-800'
                }`} />
                {step.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Word count */}
      <div className="mb-6">
        <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-1">Words</p>
        <p className={`text-2xl font-bold font-mono ${wordCountColor}`}>
          {currentWordCount}
          <span className="text-xs text-slate-700 ml-1">/ 400</span>
        </p>
      </div>

      {/* Filter status */}
      <div className="mb-6">
        <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-2">Filters</p>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {/* Save draft */}
        <button
          onClick={handleSaveDraft}
          disabled={!state.draftVersions.length}
          className="w-full text-xs text-left px-3 py-2 text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↓ Save draft
        </button>

        {/* Start over */}
        <button
          onClick={handleStartOver}
          className={`w-full text-xs text-left px-3 py-2 rounded-lg border transition-all ${
            confirmReset
              ? 'border-red-700/60 text-red-400 bg-red-900/10'
              : 'border-[#2a2d3e] text-slate-600 hover:text-red-400 hover:border-red-700/40'
          }`}
        >
          {confirmReset ? 'Tap again to confirm' : '✕ Start over'}
        </button>
      </div>
    </aside>
  );
}
