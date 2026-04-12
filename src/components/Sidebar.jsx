import { useState } from 'react';
import { useApp } from '../context/AppContext';

const CREATE_STEPS = [
  { id: 'home', label: 'Start' },
  { id: 'qa', label: 'Q&A' },
  { id: 'draft', label: 'Draft' },
  { id: 'headlines', label: 'Headlines' },
  { id: 'filter', label: 'Filters' },
];

const FILTER_BADGE = {
  not_run: { label: 'Not run', cls: 'bg-slate-800 text-slate-500' },
  running: { label: 'Running…', cls: 'bg-slate-800 text-slate-400 animate-pulse' },
  passed: { label: '✅ Passed', cls: 'bg-green-900/40 text-green-400' },
  failed: { label: '⚠ Failed', cls: 'bg-amber-900/40 text-amber-400' },
};

export default function Sidebar() {
  const { state, dispatch, SCREENS, NAV_SECTIONS, currentWordCount, startOver } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  const badge = FILTER_BADGE[state.filterStatus] || FILTER_BADGE.not_run;
  const isPodcast = state.outputType === 'podcast';
  const maxWords = isPodcast ? 1000 : 400;
  const warnAt = isPodcast ? 950 : 380;

  const wordCountColor =
    currentWordCount > maxWords ? 'text-red-400' :
    currentWordCount >= warnAt ? 'text-amber-400' : 'text-slate-400';

  const createStepIndex = CREATE_STEPS.findIndex((s) => s.id === state.screen);

  function navTo(section, screen) {
    dispatch({ type: 'SET_NAV_SECTION', section });
    dispatch({ type: 'SET_SCREEN', screen });
  }

  function handleSaveDraft() {
    const draft = state.draftVersions[state.currentVersionIndex]?.draft || '';
    if (!draft) return;
    const date = new Date().toISOString().slice(0, 10);
    const type = isPodcast ? 'podcast' : 'newsletter';
    const subject = state.subjectLine ? `${isPodcast ? 'Episode' : 'Subject'}: ${state.subjectLine}\n\n` : '';
    const blob = new Blob([`${subject}${draft}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lessons-learned-${type}-${date}.txt`;
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

  const isCreate = state.navSection === NAV_SECTIONS.CREATE;
  const isIdeas = state.navSection === NAV_SECTIONS.IDEAS;
  const isBrand = state.navSection === NAV_SECTIONS.BRAND;

  return (
    <aside className="w-52 shrink-0 bg-[#0c0e18] border-r border-[#1e2130] flex flex-col py-4">
      {/* Logo */}
      <div className="px-4 mb-5">
        <h1 className="text-sm font-semibold text-white leading-tight">Lessons Learned</h1>
        <p className="text-xs text-slate-600 mt-0.5">Your Finest Hour</p>
      </div>

      {/* Global nav */}
      <div className="px-2 mb-5">
        <NavItem
          active={isCreate}
          onClick={() => navTo(NAV_SECTIONS.CREATE, state.draftVersions.length > 0 ? SCREENS.DRAFT : SCREENS.HOME)}
          icon="✏️" label="Create" />
        <NavItem
          active={isIdeas}
          onClick={() => navTo(NAV_SECTIONS.IDEAS, SCREENS.IDEAS)}
          icon="💡" label="Ideas"
          badge={state.ideasBoard.length > 0 ? state.ideasBoard.length : null} />
        <NavItem
          active={isBrand}
          onClick={() => navTo(NAV_SECTIONS.BRAND, SCREENS.BRAND)}
          icon="⚙️" label="Brand Settings" />
      </div>

      <div className="h-px bg-[#1e2130] mx-4 mb-4" />

      {/* Create flow progress */}
      {isCreate && (
        <div className="px-4 mb-5">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-2">Progress</p>
          <div className="flex flex-col gap-0.5">
            {CREATE_STEPS.map((step, i) => {
              const isActive = step.id === state.screen;
              const isDone = i < createStepIndex;
              return (
                <div key={step.id}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-white bg-white/5' : isDone ? 'text-slate-500' : 'text-slate-700'
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white' : isDone ? 'bg-slate-600' : 'bg-slate-800'
                  }`} />
                  {step.label}
                  {step.id === 'draft' && state.outputType && (
                    <span className={`ml-auto text-xs px-1.5 py-0 rounded-full font-medium ${
                      isPodcast ? 'text-purple-500' : 'text-blue-500'
                    }`}>
                      {isPodcast ? '🎙' : '✉️'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Word count — only in Create with a draft */}
      {isCreate && state.draftVersions.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-1">Words</p>
          <p className={`text-2xl font-bold font-mono ${wordCountColor}`}>
            {currentWordCount}
            <span className="text-xs text-slate-700 ml-1">/ {maxWords}</span>
          </p>
        </div>
      )}

      {/* Filter status */}
      {isCreate && (
        <div className="px-4 mb-4">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-mono mb-1.5">Filters</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto px-2 flex flex-col gap-1.5">
        {state.draftVersions.length > 0 && (
          <button onClick={handleSaveDraft}
            className="w-full text-xs text-left px-3 py-2 text-slate-400 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg transition-all">
            ↓ Save draft
          </button>
        )}
        <button onClick={handleStartOver}
          className={`w-full text-xs text-left px-3 py-2 rounded-lg border transition-all ${
            confirmReset
              ? 'border-red-700/60 text-red-400 bg-red-900/10'
              : 'border-[#2a2d3e] text-slate-600 hover:text-red-400 hover:border-red-700/40'
          }`}>
          {confirmReset ? 'Tap again to confirm' : '✕ Start over'}
        </button>
      </div>
    </aside>
  );
}

function NavItem({ active, onClick, icon, label, badge }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
        active ? 'bg-white/8 text-white font-medium' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}>
      <span className="text-sm">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-xs bg-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded-full font-mono">
          {badge}
        </span>
      )}
    </button>
  );
}
