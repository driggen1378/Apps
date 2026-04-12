import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { saveSession, loadSession, clearSession } from '../lib/storage';
import { countWords } from '../lib/anthropic';

const AppContext = createContext(null);

const SCREENS = {
  INPUT: 'input',
  QA: 'qa',
  DRAFT: 'draft',
  HEADLINES: 'headlines',
  FILTER: 'filter',
};

const initialState = {
  screen: SCREENS.INPUT,
  rawInput: '',
  assessment: null,       // 'rich' | 'thin'
  questions: [],          // [{ question, options }]
  answers: [],            // [{ question, answer }]
  currentQuestionIndex: 0,
  draftVersions: [],      // [{ draft, wordCount, timestamp }]
  currentVersionIndex: -1,
  subjectLine: '',
  headlines: [],
  filterResults: null,    // { brandFilter, promiseFilter }
  filterStatus: 'not_run', // 'not_run' | 'running' | 'passed' | 'failed'
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { ...initialState, ...action.payload };

    case 'RESET':
      return { ...initialState };

    case 'SET_SCREEN':
      return { ...state, screen: action.screen, error: null };

    case 'SET_RAW_INPUT':
      return { ...state, rawInput: action.value };

    case 'SET_ASSESSMENT':
      return {
        ...state,
        assessment: action.assessment,
        questions: action.questions,
        currentQuestionIndex: 0,
        answers: [],
      };

    case 'SET_ANSWER': {
      const answers = [...state.answers];
      answers[action.index] = { question: action.question, answer: action.answer };
      return { ...state, answers };
    }

    case 'SET_QUESTION_INDEX':
      return { ...state, currentQuestionIndex: action.index };

    case 'ADD_DRAFT_VERSION': {
      const newVersion = {
        draft: action.draft,
        wordCount: action.wordCount,
        timestamp: Date.now(),
      };
      const versions = [...state.draftVersions, newVersion];
      return {
        ...state,
        draftVersions: versions,
        currentVersionIndex: versions.length - 1,
      };
    }

    case 'UPDATE_CURRENT_DRAFT': {
      const versions = state.draftVersions.map((v, i) =>
        i === state.currentVersionIndex
          ? { ...v, draft: action.draft, wordCount: countWords(action.draft) }
          : v
      );
      return { ...state, draftVersions: versions };
    }

    case 'RESTORE_VERSION':
      return { ...state, currentVersionIndex: action.index };

    case 'SET_SUBJECT_LINE':
      return { ...state, subjectLine: action.value };

    case 'SET_HEADLINES':
      return { ...state, headlines: action.headlines };

    case 'SET_FILTER_RESULTS':
      return {
        ...state,
        filterResults: action.results,
        filterStatus: action.status,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.value };

    case 'SET_ERROR':
      return { ...state, error: action.message, isLoading: false };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    if (state.screen !== SCREENS.INPUT || state.rawInput) {
      saveSession({
        screen: state.screen,
        rawInput: state.rawInput,
        assessment: state.assessment,
        questions: state.questions,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        draftVersions: state.draftVersions,
        currentVersionIndex: state.currentVersionIndex,
        subjectLine: state.subjectLine,
        headlines: state.headlines,
        filterResults: state.filterResults,
        filterStatus: state.filterStatus,
      });
    }
  }, [
    state.screen,
    state.rawInput,
    state.assessment,
    state.questions,
    state.answers,
    state.currentQuestionIndex,
    state.draftVersions,
    state.currentVersionIndex,
    state.subjectLine,
    state.headlines,
    state.filterResults,
    state.filterStatus,
  ]);

  const currentDraft =
    state.currentVersionIndex >= 0
      ? state.draftVersions[state.currentVersionIndex]
      : null;

  const currentWordCount = currentDraft ? currentDraft.wordCount : 0;

  const startOver = useCallback(() => {
    clearSession();
    dispatch({ type: 'RESET' });
  }, []);

  const restoreSession = useCallback((saved) => {
    dispatch({ type: 'RESTORE', payload: saved });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        SCREENS,
        currentDraft,
        currentWordCount,
        startOver,
        restoreSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { SCREENS };
