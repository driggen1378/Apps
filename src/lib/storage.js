const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v))

const SESSION_KEY = 'll-session'
export const saveSession  = (data) => set(SESSION_KEY, data)
export const loadSession  = ()     => get(SESSION_KEY, null)
export const hasSession   = ()     => !!localStorage.getItem(SESSION_KEY)
export const clearSession = ()     => localStorage.removeItem(SESSION_KEY)

export const DEFAULT_BRAND = {
  authorName: 'Norman Driggers',
  name: 'RUFIO',
  newsletterName: 'Lessons Learned',
  podcastName: 'Your Finest Hour',
  tagline: 'Think clearly. Act on what you have.',
  audience: 'High performers who want clarity, not content.',
  standsFor: 'Clear thinking, earned perspective, honest reflection',
  standsAgainst: 'Guru culture, prescriptive advice, empty motivation',
  pillars: ['Leadership', 'Learning', 'Performance', 'Identity'],
  voiceFingerprint: `Conversational but precise. Vulnerable without being weak. Military references used naturally, never for effect. Short sentences land punches. Longer sentences build context. Never starts with "I". Never ends with a question asking the reader what they think. No bullet points in the newsletter. No listicles. The closing line is always earned, never tacked on. Sounds like a person, not a brand.`,
  influences: [
    { name: 'Ryan Holiday', handle: '@RyanHoliday', topic: 'Stoicism/writing' },
    { name: 'James Clear',  handle: '@JamesClear',  topic: 'Habits/clarity'   },
  ],
}

export const DEFAULT_SCHEDULE = {
  title: 'Mikel Media System',
  days: [
    {
      name: 'Question Day',
      timeEst: '~1 hr',
      tasks: [
        { text: 'Pick one honest question', nav: 'ideas' },
        { text: 'Pressure-test: would this come up in real conversation? Useful in real life?' },
        { text: 'Sketch core claim, tensions, examples, takeaway', nav: 'ideas' },
      ],
    },
    {
      name: 'Writing Day',
      timeEst: '~2–3 hrs',
      tasks: [
        { text: 'Draft newsletter from the question', nav: 'create' },
        { text: 'Cut to length, lock voice' },
        { text: 'Schedule for publish day' },
      ],
    },
    {
      name: 'Recording Day',
      timeEst: '~2–3 hrs',
      tasks: [
        { text: 'Confirm guest / prep solo' },
        { text: 'Build speaking outline from the newsletter (not a full script)', nav: 'create' },
        { text: 'Record episode' },
      ],
    },
    {
      name: 'Edit Day',
      timeEst: '~3–4 hrs',
      tasks: [
        { text: 'Edit long-form first' },
        { text: 'Pull 3–7 clips: tension, reframe, surprise, usefulness' },
        { text: 'Title with searchable specifics (guest name + concrete topic)' },
      ],
    },
    {
      name: 'Publish Day',
      timeEst: '~1–2 hrs',
      tasks: [
        { text: 'Send newsletter', nav: 'create' },
        { text: 'Publish episode' },
        { text: 'Distribute clips' },
        { text: 'Reply to feedback' },
      ],
    },
  ],
  captureTask: { text: "Capture seed for next week's question", nav: 'ideas' },
}

export const storage = {
  getBrand: () => get('ll-brand', DEFAULT_BRAND),
  setBrand: v  => set('ll-brand', v),
  getBoard: () => get('ll-board', []),
  setBoard: v  => set('ll-board', v),
  getKey:   () => localStorage.getItem('ll-api-key') || '',
  setKey:   v  => localStorage.setItem('ll-api-key', v),
  getArchive: () => get('ll-archive', []),
  saveToArchive: (entry) => {
    const existing = get('ll-archive', [])
    set('ll-archive', [{ id: Date.now(), ...entry }, ...existing])
  },
  getDraftSeed: () => {
    const seed = localStorage.getItem('ll-draft-seed')
    if (seed) localStorage.removeItem('ll-draft-seed')
    return seed
  },
  setDraftSeed: (text) => localStorage.setItem('ll-draft-seed', text),
  getSchedule:     () => get('ll-weekly-schedule', DEFAULT_SCHEDULE),
  setSchedule:     v  => set('ll-weekly-schedule', v),
  getWeekProgress: () => get('ll-weekly-progress', {}),
  setWeekProgress: v  => set('ll-weekly-progress', v),
}

export const archiveStorage = {
  get: () => get('ll-archive', []),
  save: (entry) => {
    const existing = get('ll-archive', [])
    set('ll-archive', [{ id: Date.now(), ...entry }, ...existing])
  },
}
