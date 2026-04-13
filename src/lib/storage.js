const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v))

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
  rssFeeds: [],
}

export const storage = {
  getBrand: () => get('ll-brand', DEFAULT_BRAND),
  setBrand: v  => set('ll-brand', v),
  getSaved: () => get('ll-saved', []),
  setSaved: v  => set('ll-saved', v),
  getBoard: () => get('ll-board', []),
  setBoard: v  => set('ll-board', v),
  getKey:   () => localStorage.getItem('ll-api-key') || '',
  setKey:   v  => localStorage.setItem('ll-api-key', v),
}
