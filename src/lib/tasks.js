// Shared task + workflow data for the Next Up → Weekly → Workflows chain.
// Seeded from Brand Plan v5 (§5.6, §5.7, §5.9, §5.10, §6.2) and Content OS v2.

export function loadTasks() {
  try { return JSON.parse(localStorage.getItem('ll-tasks')) ?? DEFAULT_TASKS } catch { return DEFAULT_TASKS }
}
export function saveTasks(v) { localStorage.setItem('ll-tasks', JSON.stringify(v)) }

// cat must match Command Center rings: dissertation | media | business | gym
export const DEFAULT_TASKS = [
  // ── Dissertation ──
  {
    id: 't-pe',
    cat: 'dissertation',
    text: 'Confirm PE pathway with faculty (G1)',
    detail: 'The one live gate. Program Evaluation, case-study flavor — confirm with faculty so G1/G2 can close. PE asks "does this program work, and how?" — no deficit needed. §4.6 / §6.1.',
    workflow: 'diss-protocol',
    nav: 'dissertation',
    done: false, inWeek: false,
  },
  {
    id: 't-ci',
    cat: 'dissertation',
    text: 'Draft critical-incident interview questions',
    detail: 'Write the 8 questions in critical-incident format: specific debrief episodes — what the instructor did and in what order, what the WUG changed after, when it clicked, what made it work. Not general impressions. §6.2.',
    workflow: 'diss-protocol',
    nav: 'dissertation',
    done: false, inWeek: false,
  },
  {
    id: 't-gene-writeup',
    cat: 'dissertation',
    text: 'Send Gene the chair-role write-up',
    detail: 'You owe him this — the external chair-role write-up. Gene Coughlin confirmed as third (external) chair. Keep it peer-to-peer, not tributary (§8.3).',
    workflow: null,
    nav: 'contacts',
    done: false, inWeek: false,
  },
  {
    id: 't-gene-rsvp',
    cat: 'dissertation',
    text: 'Decide Gene October event RSVP',
    detail: 'South Dakota event. Decide by ~Aug 2026. Weigh the relationship value against the firewall risk (sponsorship strings, §8.3).',
    workflow: null,
    nav: 'contacts',
    done: false, inWeek: false,
  },

  // ── Media ──
  {
    id: 't-standup',
    cat: 'media',
    text: 'Stand up show + newsletter + landing page',
    detail: 'Jun 2026 milestone: get the podcast, newsletter, and a landing page live. Apex-themed; market the question, not the answer. §5.7.',
    workflow: 'record',
    nav: 'weekly',
    done: false, inWeek: false,
  },
  {
    id: 't-optin',
    cat: 'media',
    text: 'Set up one clear email opt-in',
    detail: 'One opt-in live: "one story, one insight, one question, every issue." The list is the only compounding asset you own — drive everything to it. §5.9 #2.',
    workflow: 'write',
    nav: null,
    done: false, inWeek: false,
  },
  {
    id: 't-cadence',
    cat: 'media',
    text: 'Lock the fortnightly cadence',
    detail: 'Fixed publish days, treated like a sortie schedule — consistency is the rarest edge (Williamson). Fortnightly now; weekly once an editor is in place. §5.4.',
    workflow: 'record',
    nav: 'weekly',
    done: false, inWeek: false,
  },
  {
    id: 't-record1',
    cat: 'media',
    text: 'Record the first episode',
    detail: 'Run the Week A record workflow: one core question, prep the guest, let it breathe, capture immediately.',
    workflow: 'record',
    nav: 'weekly',
    done: false, inWeek: false,
  },

  // ── Business (foundation) ──
  {
    id: 't-patterns',
    cat: 'business',
    text: 'Start the patterns / problems log',
    detail: 'Begin logging one recurring problem your audience or guests keep raising. Raw material for the future framework/book (your Manson move). Note only — building/selling is gated by the study. §5.7 / §5.9 #6.',
    workflow: 'capture',
    nav: 'contacts',
    done: false, inWeek: false,
  },
  {
    id: 't-network',
    cat: 'business',
    text: 'Map your warm network',
    detail: 'List future guests and vet/L&D/defense contacts. Jul 2026 foundation task — relationships now, not selling. §5.7.',
    workflow: 'connect',
    nav: 'contacts',
    done: false, inWeek: false,
  },
]

// ── Workflows (SOPs) ──────────────────────────────────────────────────────────
// Each step: { text, nav?, url?, urlLabel? }

export const DEFAULT_WORKFLOWS = [
  {
    id: 'record',
    title: 'Record an Episode',
    week: 'Week A',
    cat: 'media',
    icon: '🎙️',
    purpose: 'Talk → notes. One core question, genuine curiosity, let it breathe.',
    steps: [
      { text: "Pick the cycle's one core question / premise — strong premise first (Manson).", nav: 'ideas' },
      { text: 'Prep the guest: read their material; write a 1-page brief + 8–10 custom questions.', nav: 'create' },
      { text: 'Record long-form in Riverside — genuinely curious, no rigid script (Rogan).', url: 'https://riverside.fm', urlLabel: 'Riverside' },
      { text: 'Capture immediately (10–15 min): notes on what struck you, filtered for the audience.', nav: 'bank' },
    ],
  },
  {
    id: 'write',
    title: 'Write the Newsletter',
    week: 'Week B',
    cat: 'media',
    icon: '✍️',
    purpose: 'Distill the episode into one owned email. The newsletter converts listeners into contacts.',
    steps: [
      { text: 'Write from the transcript + capture notes: one story, one insight (your POV), one question back. ~800–1,500 words.', nav: 'create' },
      { text: 'End on the opt-in CTA — drive every reader to the list.' },
      { text: 'Expand the show notes into a light blog post (searchable; link any research referenced).', nav: 'create' },
      { text: 'Schedule on the fixed publish day — no exceptions.' },
    ],
  },
  {
    id: 'slice',
    title: 'Clip · Short · Title Engine',
    week: 'Week B',
    cat: 'media',
    icon: '✂️',
    purpose: 'Turn the transcript into ranked clips, shorts, and titles — in your voice, firewall-filtered.',
    steps: [
      { text: 'Open the Clip · Short · Title Engine prompt in Claude (Eden MCP connected; voice + Mount Rushmore attached).', url: 'https://claude.ai', urlLabel: 'Claude' },
      { text: 'Paste the transcript; run it. Get 1–2 long clips (2–19 min) + 3–4+ shorts + title options.' },
      { text: 'Take the timestamped picks into Riverside and make the actual cuts.', url: 'https://riverside.fm', urlLabel: 'Riverside' },
      { text: 'Schedule the clips. Feed what lands back into the patterns log.', nav: 'contacts' },
    ],
  },
  {
    id: 'capture',
    title: 'Capture & Patterns Log',
    week: 'Every week',
    cat: 'business',
    icon: '📥',
    purpose: "Document, don't create. Capture what already happened; log the recurring problems.",
    steps: [
      { text: '10–15 min debrief capture after recording: what struck you as useful or new.', nav: 'bank' },
      { text: 'Publish filter: is it funny, or is it helpful? If neither, cut it.' },
      { text: 'Add one recurring audience/guest problem to the patterns log.', nav: 'contacts' },
    ],
  },
  {
    id: 'connect',
    title: 'Relationship Actions',
    week: 'Every week',
    cat: 'business',
    icon: '🤝',
    purpose: 'Build the network that becomes guests, buyers, and borrowed audiences.',
    steps: [
      { text: '3–5 relationship actions: one real comment in your niche, one potential-guest DM, one vet/L&D/defense contact.', nav: 'contacts' },
      { text: 'Pitch yourself as a guest on one smaller/adjacent show (your Stumpf move).' },
      { text: 'Log who you reached out to and the next action.', nav: 'contacts' },
    ],
  },
  {
    id: 'publish',
    title: 'Publish & Weekly Review',
    week: 'Every week',
    cat: 'media',
    icon: '🚀',
    purpose: 'Ship on the fixed day; run the 10-minute self-AAR.',
    steps: [
      { text: 'Publish/schedule the episode WITH the opt-in CTA.' },
      { text: '10-min review: DiP move done? Content shipped? List growing (reply rate, not views)?', nav: 'weekly' },
      { text: "Firewall check: did I claim anything the study hasn't earned? Walk it back." },
      { text: 'Note one thing to improve next cycle.' },
    ],
  },
  {
    id: 'diss-protocol',
    title: 'Critical-Incident Protocol',
    week: 'Dissertation',
    cat: 'dissertation',
    icon: '🎓',
    purpose: 'Build the interview guide that surfaces the mechanism living only in memory.',
    steps: [
      { text: 'Confirm PE pathway with faculty — the one open gate (G1).', nav: 'dissertation' },
      { text: 'Draft 8 questions in critical-incident format: specific debrief episodes, not impressions.', nav: 'dissertation' },
      { text: 'Add org-level + individual questions; build the sampling plan.' },
      { text: 'Pilot/refine in EDUC 914 (Fall 2026).', nav: 'dissertation' },
    ],
  },
]

export function getWorkflow(id) {
  return DEFAULT_WORKFLOWS.find(w => w.id === id) || null
}
