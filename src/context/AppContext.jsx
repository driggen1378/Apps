import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { saveSession, loadSession, clearSession } from '../lib/storage';
import { countWords } from '../lib/anthropic';

const AppContext = createContext(null);

export const SCREENS = {
  HOME: 'home',
  QA: 'qa',
  DRAFT: 'draft',
  HEADLINES: 'headlines',
  FILTER: 'filter',
  DISCOVERY: 'discovery',
  IDEAS: 'ideas',
  BRAND: 'brand',
};

export const OUTPUT_TYPES = {
  NEWSLETTER: 'newsletter',
  PODCAST: 'podcast',
};

export const NAV_SECTIONS = {
  CREATE: 'create',
  IDEAS: 'ideas',
  BRAND: 'brand',
};

const DEFAULT_VOICE_FINGERPRINT = `SENTENCE PATTERNS:
Opens with one specific personal detail before any concept — never a thesis. States the observation plainly before explaining it. Short declarative sentences after longer narrative ones. Questions embedded in the narrative, not as headers. Uses "I" as the lens but directs the insight at the reader.

VOCABULARY:
Military terms used naturally: terminal leave, PCS, TDY, WUGs, Weapons School — never explained, just present. Plain verbs: got, learned, watched, said, tried. Casual contractions throughout.
HARD AVOIDS: leverage, optimize, unlock, game-changer, harness, actionable, deep dive, unpack.

STRUCTURE — Newsletter (400 words max):
Personal hook → story → named insight → reader application → gratitude closer → Fights On, RUFIO

STRUCTURE — Podcast (800-1000 words):
Welcome back to Your Finest Hour → why this topic, why now → story or scenario → three clear takeaways → CTA (like/subscribe/tell a friend) → personal send-off

TONE:
Vulnerable without being weak — admits failure and struggle before the lesson, not after. Intellectual but not academic. Curious over authoritative. Anti-guru: "I share this in case it helps you." Military pride without jingoism.

WHAT RUFIO NEVER DOES:
Bullet lessons without a story attached. Abstract openers. Telling the reader/listener what to do. Padding. Polished-sounding language. Performance of wisdom.

SIGNATURE CLOSE — Newsletter: "Thank you for everything you do" → Fights On, RUFIO
SIGNATURE CLOSE — Podcast: personal send-off specific to the day/moment → See you.`;

const DEFAULT_BRAND = {
  name: 'Norman "RUFIO" Driggers Jr',
  newsletter: 'Lessons Learned',
  podcast: 'Your Finest Hour',
  tagline: 'Helping people find better ways to think about the lives they\'re building and the people they influence.',
  pillars: [
    'Leadership and autonomy',
    'Military transition and identity',
    'Meaningful work and intentional living',
    'Thinking clearly under pressure',
    'Self-development without the self-help cheese',
  ],
  audience: 'Thoughtful, growth-minded adults who take work and life seriously but do not want to become rigid, performative, or derivative. Overloaded with advice, skeptical of extremes, tired of borrowed beliefs. Many are veterans or high-performers navigating transitions.',
  standFor: 'Autonomy, honest reflection, earned lessons, clear thinking, doing the work.',
  standAgainst: 'Performative wisdom, borrowed beliefs, guru culture, vague inspiration without application.',
  voiceFingerprint: DEFAULT_VOICE_FINGERPRINT,
  influences: [
    { name: 'Naval Ravikant', handle: '@naval', topic: 'philosophy, wealth, decision-making' },
    { name: 'Dan Koe', handle: '@thedankoe', topic: 'one-person business, creative work' },
    { name: 'Austin Kleon', handle: '@austinkleon', topic: 'steal like an artist, creative process' },
    { name: 'James Clear', handle: '@jamesclear', topic: 'habits, systems, identity' },
    { name: 'Ryan Holiday', handle: '@ryanholiday', topic: 'stoicism, practical philosophy' },
  ],
  rssFeeds: [],
};

const initialState = {
  // Navigation
  screen: SCREENS.HOME,
  navSection: NAV_SECTIONS.CREATE,

  // Create flow
  rawInput: '',
  outputType: null,           // 'newsletter' | 'podcast'
  entryMode: null,            // 'input' | 'discovery'
  assessment: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,

  // Draft versions (shared for both newsletter and podcast)
  draftVersions: [],
  currentVersionIndex: -1,

  // Headlines + filter
  subjectLine: '',
  headlines: [],
  filterResults: null,
  filterStatus: 'not_run',

  // Brand settings
  brand: DEFAULT_BRAND,

  // Ideas board
  savedForLater: [],          // [{ id, title, url, source, savedAt, content }]
  ideasBoard: [],             // [{ id, title, url, source, savedAt, content, note }]

  // RSS
  rssItems: [],               // fetched RSS items, not persisted (refetch on load)

  // UI state
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { ...initialState, ...action.payload, isLoading: false, error: null, rssItems: [] };

    case 'RESET_CREATE':
      return {
        ...state,
        screen: SCREENS.HOME,
        rawInput: '',
        outputType: null,
        entryMode: null,
        assessment: null,
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        draftVersions: [],
        currentVersionIndex: -1,
        subjectLine: '',
        headlines: [],
        filterResults: null,
        filterStatus: 'not_run',
        isLoading: false,
        error: null,
      };

    case 'FULL_RESET':
      return { ...initialState, brand: state.brand, savedForLater: state.savedForLater, ideasBoard: state.ideasBoard };

    case 'SET_SCREEN':
      return { ...state, screen: action.screen, error: null };

    case 'SET_NAV_SECTION':
      return { ...state, navSection: action.section };

    case 'SET_RAW_INPUT':
      return { ...state, rawInput: action.value };

    case 'SET_OUTPUT_TYPE':
      return { ...state, outputType: action.value };

    case 'SET_ENTRY_MODE':
      return { ...state, entryMode: action.value };

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
        outputType: state.outputType,
        timestamp: Date.now(),
      };
      const versions = [...state.draftVersions, newVersion];
      return { ...state, draftVersions: versions, currentVersionIndex: versions.length - 1 };
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
      return { ...state, filterResults: action.results, filterStatus: action.status };

    case 'UPDATE_BRAND':
      return { ...state, brand: { ...state.brand, ...action.updates } };

    case 'SET_RSS_ITEMS':
      return { ...state, rssItems: action.items };

    case 'SAVE_FOR_LATER': {
      const exists = state.savedForLater.find((i) => i.url === action.item.url);
      if (exists) return state;
      return { ...state, savedForLater: [action.item, ...state.savedForLater] };
    }

    case 'REMOVE_SAVED_FOR_LATER':
      return { ...state, savedForLater: state.savedForLater.filter((i) => i.id !== action.id) };

    case 'SAVE_TO_IDEAS_BOARD': {
      const exists = state.ideasBoard.find((i) => i.url === action.item.url);
      if (exists) return state;
      return { ...state, ideasBoard: [action.item, ...state.ideasBoard] };
    }

    case 'REMOVE_FROM_IDEAS_BOARD':
      return { ...state, ideasBoard: state.ideasBoard.filter((i) => i.id !== action.id) };

    case 'MOVE_TO_IDEAS_BOARD': {
      const item = state.savedForLater.find((i) => i.id === action.id);
      if (!item) return state;
      const alreadyThere = state.ideasBoard.find((i) => i.url === item.url);
      return {
        ...state,
        savedForLater: state.savedForLater.filter((i) => i.id !== action.id),
        ideasBoard: alreadyThere ? state.ideasBoard : [item, ...state.ideasBoard],
      };
    }

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

  // Persist on every meaningful state change
  useEffect(() => {
    saveSession({
      screen: state.screen,
      navSection: state.navSection,
      rawInput: state.rawInput,
      outputType: state.outputType,
      entryMode: state.entryMode,
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
      brand: state.brand,
      savedForLater: state.savedForLater,
      ideasBoard: state.ideasBoard,
    });
  }, [
    state.screen, state.navSection, state.rawInput, state.outputType,
    state.entryMode, state.assessment, state.questions, state.answers,
    state.currentQuestionIndex, state.draftVersions, state.currentVersionIndex,
    state.subjectLine, state.headlines, state.filterResults, state.filterStatus,
    state.brand, state.savedForLater, state.ideasBoard,
  ]);

  const currentDraft =
    state.currentVersionIndex >= 0 ? state.draftVersions[state.currentVersionIndex] : null;
  const currentWordCount = currentDraft?.wordCount || 0;

  const startOver = useCallback(() => {
    dispatch({ type: 'FULL_RESET' });
  }, []);

  const restoreSession = useCallback((saved) => {
    dispatch({ type: 'RESTORE', payload: saved });
  }, []);

  return (
    <AppContext.Provider
      value={{ state, dispatch, SCREENS, OUTPUT_TYPES, NAV_SECTIONS, currentDraft, currentWordCount, startOver, restoreSession }}
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
