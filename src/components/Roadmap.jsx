import { useState, useRef, forwardRef } from 'react'

// ─── Phase definitions ────────────────────────────────────────────────────────
// Hormozi build chain: Attention → Engaged Leads → Validation → Offer → Money Model → $1M
const PHASES = [
  {
    id: 0,
    label: 'Phase 0',
    name: 'Attention',
    active: true,
    what: [
      'B2 LinkedIn writing (lead-qualifying engine): 3–5 native posts/wk + 1–2 carousels/mo from brand-ddc captures; substrate-validator filter; buyer-adjacent qualifier stays out of content',
      'B2 podcast / YouTube (broad attention): 1 main episode weekly with through-question in intros (5-interview A21 experiment); 1 clip + 1 short; 1–2 reach videos; 1 monthly solo source-material segment (Jocko mechanic)',
      'B4a newsletter weekly — primary harvest surface for DDC captures (Williamson mechanic)',
      'B3 guest acquisition at low cadence (DM ladder, category-based)',
      'A1a + A1b job applications at 3–4/day, 50/50 split; A1·diff 5-D framework applied to all resume versions',
      'D1 skill-build NOW: Cathy Moore (action mapping), Rossett / Dirksen (needs analysis), Hormozi ($100M Offers), Devlin Peck (freelance-ID model); then Kleon + Dunford',
      'C1 chair conversation initiated early; Scope 4 homework (non-aviation test domains + instructor access) before meeting',
    ],
    gate: 'Inbound from substrate-validator audience converts from "good post" to identifiable named individuals — DMs or comments from people who recognize themselves in what\'s being said. ICP-adjacent engagement becomes a pattern, not noise. Specifically: at least a handful of named, qualified contacts who would say yes to a free diagnostic conversation.',
    gate_tests: ['A21', 'A22', 'A9'],
  },
  {
    id: 1,
    label: 'Phase 1',
    name: 'Engaged Leads',
    active: false,
    what: [
      'Lead magnet activated (DM-based): offer a small, valuable free thing to people who lean in — 30-min diagnostic conversation, a written framework summary, a podcast guest slot',
      'B3 cadence may increase if guest acquisition is the lead-magnet shape',
      'LinkedIn content continues at attention register — NOT yet sales copy; filter-per-spine still holds',
      'A1b·LinkedIn consultant machinery stays gated (no Services tab, no Booking CTA) — pre-validation',
      'D2 self-directed curriculum: Pulizzi (Content Inc.), Challenger Sale or SPIN Selling (in-role)',
    ],
    gate: '~10–15 named-prospect conversations conducted (free diagnostic shape, "give until they ask"). Conversations are happening; buyer language is being captured.',
    gate_tests: ['A20', 'A9'],
  },
  {
    id: 2,
    label: 'Phase 2',
    name: 'Validation',
    active: false,
    what: [
      'Free diagnostic conversations with everyone who raises a hand — goal is buyer\'s language in their own words, not to sell; capture verbatim what they call the problem, what they\'ve tried, what they\'d pay to fix',
      'Offer shape resolves from buyer language (Hormozi: list 20+ problems, name solutions, trim and stack)',
      'Working hypothesis to react to: NGI turns technical SMEs into instructors whose people reach competency measurably — done-with-you, observable-bar conditional guarantee',
      'B4b IP artifacts begin reflecting actually-extracted pain (not pre-conceived frameworks)',
    ],
    gate: 'Repeat pain pattern across N conversations + at least one buyer says "I would pay to fix this" + named buyer set has resolved (which vertical or institution type the inbound converges on).',
    gate_tests: ['A19'],
  },
  {
    id: 3,
    label: 'Phase 3',
    name: 'Offer',
    active: false,
    what: [
      'B1 LLC formation moves from deferred to active — NGI registered (placeholder; refine before public wordmark commits); SDVOSB registration if user qualifies',
      'v1 offer drafted from buyer\'s words; founder pricing to buy proof; conditional guarantee tied to observable competency bar',
      'Consulting engagements begin (performance consulting / needs analysis front door: diagnose → design → ease → train-the-trainers → recede)',
      'A1b·LinkedIn consultant machinery activates (sales-page About, Services tab, banner, Booking CTA)',
      'D3 reading: deep-read whichever sales book skimmed in Phase 1; Hermann Simon Pricing Man',
    ],
    gate: '1–2 paid pilots completed at founder pricing. Case studies in hand. Buyer-side critique on what to refine.',
    gate_tests: ['A11', 'A19'],
  },
  {
    id: 4,
    label: 'Phase 4',
    name: 'Money Model',
    active: false,
    what: [
      'Pricing and sequencing refined from paid-pilot data — price climbs as case studies stack',
      'Cert layer begins development (Coughlin/RBLP shape — capitalized + partner-delivered; multi-year bolt-ons: ACE credit, IACET/ANSI accreditation, COOL approved-list application when 2+ years operating history exists)',
      'Channel options stay open until validated — civilian buyers, COOL/military, partner ATPs are all candidates; commit only when buyer data forces the choice',
      'Dissertation defends (if not already) → Asset 2 IP foundation lands; book draft + paid speaking activates (Stumpf trajectory)',
      'D4 reading: Hamilton Helmer (7 Powers) — strategy/moats as cert architecture is chosen',
    ],
    gate: null,
    gate_tests: [],
  },
]

// ─── Plan data ────────────────────────────────────────────────────────────────
const planData = {
  meta: {
    title: 'Solo Practice Launch — Micro v4.4',
    window: 'May 2026 – Jul 2027 · 15 months',
    constraint: 'Vocational direction is the binding constraint (not cash survival)',
    runway: 'Peak ~$37.5K late-Jun · danger ~Dec 2026 · floor Jan–Feb 2027',
    metreaEnd: 'Metrea final day: 2026-06-12',
    months: [
      {n:1,label:'May',year:'26'},{n:2,label:'Jun',year:'26'},{n:3,label:'Jul',year:'26'},
      {n:4,label:'Aug',year:'26'},{n:5,label:'Sep',year:'26'},{n:6,label:'Oct',year:'26'},
      {n:7,label:'Nov',year:'26'},{n:8,label:'Dec',year:'26'},{n:9,label:'Jan',year:'27'},
      {n:10,label:'Feb',year:'27'},{n:11,label:'Mar',year:'27'},{n:12,label:'Apr',year:'27'},
      {n:13,label:'May',year:'27'},{n:14,label:'Jun',year:'27'},{n:15,label:'Jul',year:'27'},
    ],
  },
  workstreams: [
    {id:'job',   name:'A · Job Search',    barColor:'#85B7EB', barBg:'#112842'},
    {id:'brand', name:'B · Asset Stack',   barColor:'#5DCAA5', barBg:'#0F2E25'},
    {id:'diss',  name:'C · Dissertation',  barColor:'#EF9F27', barBg:'#2F2208'},
    {id:'curric',name:'D · Curriculum',    barColor:'#B87FD4', barBg:'#2A1542'},
  ],
  tasks: [
    // A — Job Search
    {id:'A1a', ws:'job',   start:1, duration:8, label:'defense lane (~50%)',
     name:'A1a · Defense lane (~50%)', status:'in progress',
     linked_assumptions:['A14-defense','A16a','A17','A18'],
     notes:'Target: cleared defense/intel/training/exercise/capture roles where USAFWS credential is premium signal, not a discount. Role buckets: Intelligence Exercise Planner / ISR-SIGINT SME, Training Facilitator / curriculum / readiness / exercise design, Capture / Solutions Architect tied to ISR/SIGINT. 3–4 high-customization apps/day combined, weighted ~50/50 with A1b (v4.4 — retired 70/30). Leidos Intel Exercise Planner submitted as strongest fit; Quick Services intel-planner also submitted; JT4 Training Facilitator III cover letter drafted. Senior cleared roles reward keyword fit + clearance currency + named referral — quality over volume; ~2 weeks before Nellis-tied contractor queue exhausts. Geographic: Las Vegas local or remote only.'},
    {id:'A1b', ws:'job',   start:1, duration:8, label:'L&D lane (~50%)',
     name:'A1b · L&D lane (~50%)', status:'in progress',
     linked_assumptions:['A14-tech','A16b','A18'],
     notes:'Target: L&D positions where rebuilt L&D/OD/Change resume reads as the lane it claims. Role buckets: Director/Manager of L&D, Learning Strategy Lead, Talent Development Director/Manager, Learning Architect, Leadership Development Lead, OD positions where JD genuinely fits. OD-bridge framing retired in v4.4 — two distinct lanes (Defense + L&D), not primary + bridge. Direct OD Manager at top consultancies = stretch only (named referral or unusual JD flexibility required). Deloitte auto-reject (2026-05-XX) is a data point on direct OD-Manager titles specifically, not on this L&D lane. BAH warm-network (Jennie Loughran) → immediate change-strategist consideration once resume reframed: first positive L&D-lane signal. Performance consulting / needs-analysis vocabulary is the highest-leverage buyer-side language (Moore/Rossett framing) — pays into both job hunt AND eventual practice.'},
    {id:'A1diff', ws:'job', start:1, duration:8, label:'5-D diff framework',
     name:'A1·diff · 5-D differentiation (anti-teacher-pivot lens)', status:'in progress',
     linked_assumptions:['A23'],
     notes:'Framework live (v4.3, per Macro A23). Every resume version must surface ≥3 of 5 differentiators in structural locations (Summary opening, Key Achievements, scope claims) — NOT buried where a 6-second scan misses them. The 5 differentiators: (1) Resource authority — $260K annual budget + $1M training allocation + $10M equipment portfolio. (2) Instructor-of-instructors at most selective USAF school — 130+ certified specialists across 9 cadre classes. (3) Multi-agency executive-level stakeholders — FBI/CIA/NSA, 8 partner agencies, 5 operational units. (4) High-stakes no-do-over context — combat readiness, 20% measured performance improvement. (5) Greenfield enterprise build — ~1,000-person L&D function at Metrea from zero. Defense variants lean on #2/#3/#4; L&D variants lean on #1/#2/#5. Summary must NOT lead with generic L&D taxonomy (LNA, ADDIE, LMS, Kirkpatrick) — that is the teacher-pivot opening line. Awards reinforce, do NOT substitute. LD docx + Eaton-targeted resume rebuilt against framework.'},
    {id:'A2',  ws:'job',   start:2, duration:7, label:'screen → interview',
     name:'A2 · Convert applications to interviews', status:'not started',
     linked_assumptions:['A16a','A16b'],
     notes:'Lane-aware prep cycle. Track conversion separately for A1a and A1b — different competency models, different STAR emphasis. DP2 Day-14/30/60 reviews gate lane rebalancing.'},
    {id:'A3',  ws:'job',   start:3, duration:6, label:'close offer (DP1)',
     name:'A3 · Close an offer', status:'not started',
     linked_assumptions:['A16a','A16b','A17'],
     notes:'Surface outside-practice/moonlighting policy before signing. Get it in writing. Firing DP1 restructures all workstreams.'},

    // B — Asset Stack
    {id:'B1',  ws:'brand', start:7, duration:1, label:'LLC · Phase 3 gate',
     name:'B1 · LLC formation (deferred until Phase 3 / offer gate)', status:'deferred',
     linked_assumptions:['A20'],
     notes:'~$425, 1–2 weeks evening effort. Deferred until Phase 3 (offer) gate fires — i.e., after Phase 2 validation conversations surface repeat pain + willing-to-pay buyer set. The earlier "no solo-sales while interviewing" rule was retired in Macro v3.5; gating is now signal-based, not employment-status-based. Skill-build (D1) + warm/positioned 1099 ID contract work are permitted NOW (income + proof + possible Scope-4 test domains). NGI is working internal entity name (placeholder — refine before public wordmark commits). SDVOSB registration when LLC opens if user qualifies; tips federal set-aside contracts toward the practice.'},
    {id:'B2',  ws:'brand', start:1, duration:15, label:'LinkedIn (lead engine) + podcast (attention)',
     name:'B2 · Asset 1 — LinkedIn writing + podcast / YouTube', status:'in progress',
     linked_assumptions:['A21','A22','A9'],
     notes:'Asset 1 runs two surfaces with different jobs (v4.4 reframe). LINKEDIN WRITING (lead-qualifying engine): 3–5 native posts/wk + 1–2 carousels/mo from brand-ddc captures; substrate-validator filter (broad institutional-substrate recognition); buyer-adjacent qualifier stays out of post content (filter-per-spine rule); ICP signal expected here first because audience is buyer-adjacent by construction. PODCAST / YOUTUBE (broad attention, not retired): 32 episodes, ~54 subs / 27K views / 157 watch hours; 1 main episode/wk with through-question in intros; 1 clip + 1 short; 1–2 reach videos; 1 monthly solo source-material segment (Jocko mechanic — institution-building/instructor-pedagogy source pool). Core promise (user\'s words): "Making sense of the modern world... curious about human performance, meaning and worldview, work, sociology, psychology, leadership." Lens underneath (not on-air): authorship over assignment — make the implicit explicit so it can be owned. 5 roam buckets: (1) mind & body / willpower-ceiling, (2) meaning & worldview, (3) work & craft / operator-to-civilian gap, (4) people & leadership, (5) big-swing curiosity. Two-spine split: B2B2C codified-excellence (product altitude, A19/A15) vs B2C meaning/voice (Eden persona altitude — Stumpf: persona public). DO NOT conflate. Content Engine (brand-ddc v0.8): trigger "spin this / make a post" → stop-slop-content skill handles craft; this doc handles positioning. Give-until-they-ask: no pitch, no CTA, no "work with me."'},
    {id:'B3',  ws:'brand', start:1, duration:15, label:'network + guest acq',
     name:'B3 · Networking + guest acquisition', status:'not started',
     linked_assumptions:['A9','A11','A21'],
     notes:'Koe 7-step DM ladder applied three ways: (1) warm B2B ties in defense human capital + OD/L&D, (2) category-based guest acquisition, (3) USAFWS alumni outreach. 2–3 touches/week. NOT 30 min/day.'},
    {id:'B4a', ws:'brand', start:1, duration:15, label:'newsletter (weekly)',
     name:'B4a · Newsletter — weekly codification practice', status:'in progress',
     linked_assumptions:['A21','A22'],
     notes:'Williamson mechanic: one extracted lesson + one personal lesson per issue, sourced from brand-ddc captures of the week. Already running on Substack via yfhpodcast.com. Highest per-reader signal surface — subscribers self-selected hard.'},
    {id:'B4b', ws:'brand', start:7, duration:9, label:'IP artifacts · Ph1+',
     name:'B4b · Dissertation-adjacent IP artifacts', status:'not started',
     linked_assumptions:['A11','A19','A20'],
     notes:'Debrief framework one-pagers, competency-model templates, worked examples of operating-model translation. Publish on LinkedIn or gated downloads. Draft/circulation form only — NOT paid-product until Phase 1 gate clears (A20).'},

    // C — Dissertation
    {id:'C1',  ws:'diss',  start:1, duration:2, label:'chair convo',
     name:'C1 · Chair conversation', status:'not started',
     linked_assumptions:['A15'],
     notes:'LEADING CANDIDATE (v4.0, pending sign-off): Design and validation of a protocol that translates the WS instructional loop (info→skill→test→apply→feedback) into non-aviation domains. WS is the IP source, not the research site — dissolves classified-access and no-current-employer constraints. Test population: instructors in 2–3 non-aviation domains (OPEN: Scope 4 is the sole unresolved gate — name the domains and secure access before C1). Pathway: Design Thinking. PHENOMENOLOGY RETIRED — wrong method, wrong pathway; do not use the word in any C-workstream conversation. Other options: (1) templateless-field pedagogy — DT, (2) high-performer pipeline burnout — RCA/PE, (3) elite-institution implicit excellence transmission — RCA. Option 4 is convergent path: dissertation IP + product IP (A19) + podcast mechanic (A21) share the same spine.'},
    {id:'C2',  ws:'diss',  start:2, duration:13, label:'scope resolution',
     name:'C2 · Scope resolution (6 scopes)', status:'not started',
     linked_assumptions:['A15','A7'],
     notes:'Six scopes: topic (Year 2 mid-term), site (before topic confirm), meaning (Year 2 Sem 2), practice (Year 2 mid-term), methodological (Year 3 Sem 1), instrument (Year 3 Sem 2 proposal). NOT resolved independently — site constrains topic, methodology forced by problem state. v4.0 status: Scope 1 (topic) and Scope 5 (methodology → DT) have firm leading answers pending chair. Scope 2 (site) effectively resolved by source-vs-site reframe (WS is source; prototyping context is test-domain instructors). SCOPE 4 IS THE SOLE OPEN GATE: which 2–3 non-aviation domains + who specifically teaches there + will permit prototyping. Live homework before C1.'},
    {id:'C3',  ws:'diss',  start:1, duration:15, label:'coursework (continuous)',
     name:'C3 · Coursework + milestones', status:'in progress',
     notes:'Continuous per program calendar. Comps mid-Year 2. Maintain enrollment. Final defense passes = done.'},
    {id:'C4',  ws:'diss',  start:12, duration:4, label:'IP harvest',
     name:'C4 · IP harvesting from dissertation work', status:'not started',
     linked_assumptions:['A11','A19','A20'],
     notes:'As scope resolves and data collection runs, harvest patterns into B4 IP artifacts. This is where C and B converge: dissertation produces codified IP (Asset 2), B4 is its early-prototype layer, B2 audience is its eventual market.'},

    // D — Curriculum
    {id:'D1',  ws:'curric', start:1, duration:3, label:'needs analysis + positioning',
     name:'D1 · Phase 0 reading (performance consulting priority)', status:'not started',
     notes:'NOW skill-build priority (v4.1 — do first): Cathy Moore action mapping / Map It — performance consulting + backward design; business-goal-first; routes to non-training fixes (job aids, process, tools, manager upskilling). Allison Rossett First Things Fast + Julie Dirksen Design for How People Learn — needs-analysis + learning-design canon. Hormozi $100M Offers — offer construction / productizing the diagnostic front-door. Devlin Peck — freelance-ID business model: pricing, portfolio, client acquisition. THEN: Kleon Show Your Work (2 evenings) — frame for podcast + LinkedIn during job hunt. Dunford Obviously Awesome (1 week) — apply to resume header positioning across both lanes.'},
    {id:'D2',  ws:'curric', start:7, duration:3, label:'Pulizzi + Sales',
     name:'D2 · Phase 1 reading (in-role)', status:'not started',
     notes:'Pulizzi Content Inc. (2 weeks, in role) — apply to podcast monetization roadmap + B4 artifacts. Skim Challenger Sale OR SPIN Selling — pick based on which lane landed.'},
    {id:'D3',  ws:'curric', start:13, duration:3, label:'Pricing + deep Sales',
     name:'D3 · Phase 2 reading', status:'not started',
     notes:'Deep-read whichever sales book skimmed in Phase 1. Hermann Simon Confessions of the Pricing Man — pricing is highest-leverage skill at this phase.'},
  ],
  assumptions: [
    // Job Search
    {id:'A14-defense', category:'Job Search', status:'holds', evidence_quality:'moderate',
     claim:'USAFWS credential is a premium signal in cleared defense/intel/training lanes',
     justification:'Defense contractors screen for clearance + USAFWS-tier credentials explicitly. Intel exercise planning roles (Leidos, BAH, JT4) treat the credential as table-stakes differentiation.',
     fail_signal:'Zero recruiter responses after 20 A1a submissions → lane anchoring weaker than estimated. Have cleared-defense recruiter critique the resume.',
     reassessment_trigger:'After 20 A1a submissions for response rate; after 10 recruiter conversations for credential feedback.',
     linked_tasks:['A1a','A2']},
    {id:'A14-tech', category:'Job Search', status:'holds', evidence_quality:'moderate',
     claim:'USAFWS credential creates a discount in mainstream-tech OD direct-title applications',
     justification:'Conventional OD-title history is the screening filter at tech/consulting. Military background reads as vertical mismatch without translation. Deloitte auto-reject (2026-05-XX) is first data point confirming this.',
     fail_signal:'Bridge titles auto-reject at same rate as direct OD Manager → discount is structural, not title-dependent. Stop both; seek referral-only entry.',
     reassessment_trigger:'After 15 A1b bridge-title submissions; compare response rate vs. direct OD Manager rate.',
     linked_tasks:['A1b','A2']},
    {id:'A16a', category:'Job Search', status:'hypothesis', evidence_quality:'weak',
     claim:'Resume positions credibly in defense lane (A1a) without additional recruiter critique',
     justification:'Lane-anchored header + Nellis/USAFWS/ISR keywords + clearance posture stated. Not yet tested at volume.',
     fail_signal:'Zero responses after 20 A1a submissions. Or: auto-rejects clustering on a single role class → JD-keyword gaps in that class.',
     reassessment_trigger:'After 20 A1a submissions.',
     linked_tasks:['A1a','A2','A3']},
    {id:'A16b', category:'Job Search', status:'hypothesis', evidence_quality:'weak',
     claim:'Resume positions credibly in L&D lane (Director/Manager L&D, Learning Strategy, Talent Development) without additional critique',
     justification:'"Designed capability pathways, role progression, certification criteria, operating rhythms, cross-unit readiness systems" is the reframe into L&D Director language. Performance-consulting / needs-analysis vocabulary (Moore/Rossett framing) is the buyer-side translation that makes "I taught at WS" legible to a Head of L&D. 5-D framework (A23) applied to L&D variants. L&D lane volume not yet tested.',
     fail_signal:'Zero responses on 15 L&D-lane submissions → L&D positioning isn\'t landing. Get a buyer-side L&D Director or Head of Talent to critique the language directly. If screens convert but panels don\'t → corporate L&D vocab gap showing in conversation; drill platforms (Workday, Cornerstone, Docebo), KPIs (engagement, time-to-productivity, learner NPS), and L&D operating models.',
     reassessment_trigger:'After 15 A1b L&D-lane submissions. Separate tracking from A1a.',
     linked_tasks:['A1b','A2','A3'],
     notes:'Status upgraded from "weakening" to "hypothesis" in v4.4 — Deloitte auto-reject was a data point on direct OD-Manager titles specifically, NOT on L&D lane as redefined. POSITIVE SIGNAL: BAH warm-network (Jennie Loughran) produced immediate Director-of-L&D / change-strategist consideration once resume reframed correctly — first real positive signal on this lane. Lane is now redefined as L&D positions (sometimes OD where JD fits), not "bridge titles."'},
    {id:'A17', category:'Job Search', status:'holds', evidence_quality:'strong',
     claim:'Runway holds long enough for conversion without forced compression',
     justification:'Metrea final day 2026-06-12. June 1 starting position ~$22.5K liquid. Separation: 4 wks severance ≈ $8.8K take-home + 136 hrs PTO ≈ $6–7K take-home = ~$15K arriving end of June. Peak liquid late June ~$37.5K. Burn ~$3K/mo Jun–Aug, ~$5K/mo Sep onward. VA disability ~$1K/mo possible but not budgeted. Worst-case zero-income floor late January / early February 2027. With $5K emergency reserve held back, practical danger point late December 2026 ("Christmas"). DP1.5 trigger realistically fires ~October 2026 if no income — 60–90 days runway to close an offer above the floor rather than accept anything that walks in.',
     fail_signal:'Verified liquid falls below $20K before DP1 fires. If DP1.5 fires early (before October 2026), runway math was wrong.',
     reassessment_trigger:'Monthly cash review. DP1.5 tripwire at ~$12K floor (~October 2026 if no income).',
     linked_tasks:['A1a','A1b','A2','A3']},
    {id:'A18', category:'Job Search', status:'hypothesis', evidence_quality:'weak',
     claim:'50/50 two-lane portfolio (Defense + L&D) outperforms single-lane approaches for conversion speed and option value',
     justification:'Defense lane (A1a) has higher per-application conversion probability where clearance + USAFWS credential premium applies. L&D lane (A1b) has higher long-arc value (brand-stack vocab, OD network, practice readiness). Portfolio hedges each lane\'s weakness while keeping both options open. 50/50 is two distinct lanes — "primary + bridge" framing retired in v4.4. Deloitte auto-reject is a data point on direct OD-Manager titles, not on the L&D-lane-as-redefined. BAH warm-network signal (Jennie Loughran) is first positive L&D-lane data. Not yet tested at volume.',
     fail_signal:'One lane producing traction, other producing zero after 15 submissions each → rebalance toward whichever is converting. A1a offer only → consider 70/30 defense. A1b converting only → consider 70/30 L&D.',
     reassessment_trigger:'DP2 Day-14, Day-30, Day-60 reviews (2026-06-03, 06-19, 07-19). Lane-specific conversion rates tracked separately.',
     linked_tasks:['A1a','A1b']},
    {id:'A23', category:'Job Search', status:'hypothesis', evidence_quality:'weak',
     claim:'5-D differentiation framework lifts screen rates above the teacher-PhD pivot baseline within 15 submissions',
     justification:'L&D / ID applicant pool is saturated with teachers and bootcamp pivots (Reddit r/Training, IDOL Courses, Brandon Hall). Without structural differentiation in first 6 seconds of a recruiter scan, the resume reads interchangeable with a PhD-credentialed teacher who reframes 18 months of IDOL bootcamp work — and the teacher has more "classroom" L&D-coded activity years. The 5 differentiators are structurally non-replicable: (1) $260K annual budget + $1M training allocation + $10M equipment portfolio, (2) instructor-of-instructors at most selective USAF school, (3) multi-agency executive stakeholders (FBI/CIA/NSA), (4) high-stakes no-do-over context, (5) greenfield ~1,000-person L&D function from zero.',
     fail_signal:'Zero screens after 15 submissions of 5-D-rebuilt resumes → either (a) differentiation IS landing but downstream filter is killing it (years-in-corporate-L&D, civilian-vocabulary fluency, keyword stack), OR (b) 5-D framing reads as military-coded to civilian screeners. Get buyer-side critique on which filter is failing before more volume. Do NOT re-add taxonomy-led Summary as a "safe" fallback — that returns to teacher-pivot equivalence.',
     reassessment_trigger:'After 15 submissions of 5-D-rebuilt resumes. Compare screen rates vs. pre-framework baseline.',
     linked_tasks:['A1a','A1b','A1diff']},
    // Asset Stack
    {id:'A9', category:'Asset Stack', status:'hypothesis', evidence_quality:'weak',
     claim:'Multi-surface content (YouTube + LinkedIn + newsletter) compounds to ICP inbound by M6–M12',
     justification:'Consistent cadence + harvest filter applied to captures compounds to ICP DMs. Conditional on applied-insight quality via DDC capture, not generic-credential content.',
     fail_signal:'Zero ICP-quality inbound after 6 months of sustained cadence → content is generic. Rebuild around real-work DDC captures.',
     reassessment_trigger:'Month 3 early signal; Month 6 for Phase 0→1 gate decision.',
     linked_tasks:['B2','B3','B4a']},
    {id:'A19', category:'Asset Stack', status:'hypothesis', evidence_quality:'weak',
     claim:'Operator-interview extraction methodology is the viable leading wedge (A19 candidate #3)',
     justification:'Option 4 in C1 converges dissertation IP, product IP, and podcast mechanic (A21) on the same spine. Tightest convergence available. Not yet tested as a teachable methodology.',
     fail_signal:'Draft IP artifact produces no recognition response from operators, OR chair signals Option 4 doesn\'t fit any UNC pathway, OR meta-layer proves non-portable under normal-resource conditions.',
     reassessment_trigger:'First B4b artifact draft; C1 chair conversation outcome.',
     linked_tasks:['B4b','C1','C4'],
     notes:'First N=1 demand signal (v4.0, suggestive not proof): yfh-35 guest (Patrick Boylan, music-edtech founder, zero military background) independently reinvented the WS loop, then asked unprompted "how do you port this to other disciplines — I don\'t have an answer." Real builder articulating the exact gap the A19 artifact addresses. Double-edged: his independent convergence also shows the base loop is general learning science, not WS IP. Demand for the translation protocol looks real; the loop is not the moat — the recursive meta-layer is.'},
    {id:'A20', category:'Asset Stack', status:'hypothesis', evidence_quality:'weak',
     claim:'Asset 1 compounds before Asset 2 launches publicly and Asset 3 is built (sequencing holds)',
     justification:'Publishing IP without audience = shouting into void. B4b and LLC deferred until compounding signal. Prevents premature productization of unvalidated methodology.',
     fail_signal:'No compounding signal by Month 9 while dissertation nears defense window → accept sequencing break; publish dissertation IP as credentialing artifact regardless.',
     reassessment_trigger:'Phase 0→1 gate review at Month 6.',
     linked_tasks:['B1','B4b','C4']},
    {id:'A21', category:'Asset Stack', status:'hypothesis', evidence_quality:'moderate',
     claim:'Lessons-learned through-question is the podcast nucleus (operative mechanic resolving real problems)',
     justification:'Retrospective evidence: top watch-time videos cluster on operator interviews structured around "what did you learn doing this." Forward-validation: next 5 interviews state frame explicitly in intros. Signal tracked vs. prior baseline.',
     fail_signal:'No signal change (retention, DM quality, guest ease) after 5-interview experiment → revisit whether another mechanic carries the podcast.',
     reassessment_trigger:'After 5-interview experiment. Month 6 cumulative review (~25 main episodes).',
     linked_tasks:['B2','B3','B4a'],
     notes:'v3.8 fix: wordmark lock (prohibited) ≠ audience filter (encouraged). v4.0 nucleus crystallized: spine = "make the implicit explicit so it can be owned — authorship over assignment." Three registers of the same gap: instructor (information delivered ≠ knowledge transferred — Socratic Loop), institution (mastery produced ≠ mastery codified — A15/Option A), transition (meaning assigned ≠ meaning chosen — Eden voice). Two-spine split: B2B2C codified-excellence = product altitude (A19/A15, sellable core); B2C meaning/voice = Eden persona altitude (attention layer, Stumpf: persona public). Spine is a WORKING LENS, not a wordmark — no-lock constraint still applies.'},
    {id:'A22', category:'Asset Stack', status:'hypothesis', evidence_quality:'weak',
     claim:'DDC capture practice surfaces transmissible content with ICP signal in 60 days',
     justification:'Gary Vee DDC: capture moments from real work, tag lightly by domain + surface, harvest with audience filter (substrate-validator) + 7-criteria harvest filter before shipping. First 6 captures in brand-ddc.md v0.2.',
     fail_signal:'No ICP-quality engagement on any domain × surface combo after 60 days → filter criteria need recalibration or surface is wrong for this ICP.',
     reassessment_trigger:'60-day mark from first harvest (~2026-07-25). Monthly harvest tracker review.',
     linked_tasks:['B2','B4a'],
     notes:'v3.8 unblocks "what do I post" — execution begins week of 2026-05-25. Harvest filter prevents "I felt like it" drift and surface genericization. brand-ddc.md v0.8 has 17 captures + Content Engine block; spine-as-lens (authorship over assignment) added as secondary harvest lens.'},
    {id:'A11', category:'Long Arc', status:'hypothesis', evidence_quality:'moderate',
     claim:'B2B2C credentialing body or productized IP is the $1M/year path (years 10–15)',
     justification:'Project-based consulting math doesn\'t pencil solo. Viable paths: owned credentialing body (Coughlin), productized IP + speaking/licensing, or retainer-anchored advisory at $20–30K/mo. Dissertation is the IP that makes any path defensible.',
     fail_signal:'Phase 2 delivered and no credentialing partner interest + no retainer advisory traction → productized IP + speaking as fallback.',
     reassessment_trigger:'Annual, at each plan-anniversary review.',
     linked_tasks:['B4b','C4']},
    // Dissertation
    {id:'A15', category:'Dissertation', status:'leading candidate', evidence_quality:'moderate',
     claim:'Dissertation scope resolves within UNC\'s three DiP pathways (RCA / DT / PE) without compromising IP value',
     justification:'Leading candidate (v4.0): DT protocol translating the WS instructional loop (info→skill→test→apply→feedback) into non-aviation domains. WS as IP source, not research site — dissolves site-access constraint. Pathway: Design Thinking (artifact is the designed translation protocol). Novelty lives in the recursive meta-instructional layer (WS teaches skill + teaches you to teach it + debriefs your ability to run your own debrief) — not the base loop, which is general learning science (yfh-35 guest independently reinvented it in music ed). Phenomenology retired — not on UNC\'s menu and the goal is design, not lived-experience description.',
     fail_signal:'Chair rejects DT-translation framing OR meta-layer proves non-portable AND non-defensible in any test domain → pivot to program-compliant topic with lower IP leverage, OR reconsider program fit.',
     reassessment_trigger:'C1 chair conversation (two gates: chair sign-off + Scope-4 test-domain access). Topic-lock by Year 2 mid-term.',
     linked_tasks:['C1','C2'],
     notes:'Scope-4 (which 2–3 non-aviation test domains + who specifically has access to instructors willing to permit prototyping) is the single open soft spot as of v4.0. This is live homework before C1. yfh-35 (Patrick Boylan / MuseFlow) is a found existence-proof that the base loop ports to music ed — usable as confirming case + live demand evidence.'},
    {id:'A7', category:'Dissertation', status:'holds', evidence_quality:'moderate',
     claim:'Dissertation research population and consulting clients are non-overlapping under IRB firewall',
     justification:'USAFWS instructor alumni (research population) and business clients/network contacts are structurally non-overlapping under Federal Common Rule 45 CFR 46. Dual-role conflict must be pre-registered with chair.',
     fail_signal:'Chair raises subject/client overlap, OR UNC IRB flags dual-role conflict.',
     reassessment_trigger:'C1 chair conversation first, then at IRB submission.',
     linked_tasks:['C1','C2']},
  ],
  milestones: [
    {id:'DP2-14', name:'DP2 · Day-14 review',              month:1,  type:'dp2',
     criteria:'2026-06-03 — Pattern: auto-rejects, screens, silence across both lanes. Adjust resumes + lane mix if a class is decisively failing. Source: application tracker.'},
    {id:'DP2-30', name:'DP2 · Day-30 review',              month:2,  type:'dp2',
     criteria:'2026-06-19 — Lane decision: is A1a (defense) producing traction? Is A1b (L&D) producing traction? Re-balance the 50/50 ratio on evidence — one lane may earn a heavier weight if it\'s the only one converting. Track conversion rates separately per lane.'},
    {id:'MS-5i',  name:'A21 · 5-interview experiment done', month:3,  type:'ms',
     criteria:'Track vs. prior baseline: retention curve shape, DM response volume + quality, guest acquisition ease, "this changed how I think" qualitative responses. Cheap fast test of A21.'},
    {id:'MS-C1',  name:'C1 · Chair conversation',          month:2,  type:'ms',
     criteria:'Chair met; scope-sequencing question on record; all four options presented; mutual next-step expectations set. Forcing function for C2–C6. PREP: resolve Scope 4 (test domains + instructor access) before the meeting.'},
    {id:'DP2-60', name:'DP2 · Day-60 review',              month:3,  type:'dp2',
     criteria:'2026-07-19 — Precision decision: offer in hand, or compression options activate. Not a forced deadline given runway math — structured review point only.'},
    {id:'MS-A22', name:'A22 · 60-day DDC harvest',         month:3,  type:'ms',
     criteria:'~2026-07-25 — First harvest tracker review. Signal: ICP-quality engagement on ≥1 domain × surface. Audience filter + harvest filter applied to each candidate capture.'},
    {id:'DP1',    name:'DP1 · Job offer received',         month:5,  type:'dp',
     criteria:'Signed offer letter. Surface outside-practice/moonlighting policy before signing. Get it in writing. A1a lane → income protected, B shifts to "build solo readiness." A1b lane → A1a winds down, B4 IP artifacts accelerate.'},
    {id:'DP1-5',  name:'DP1.5 · Cash tripwire (~Oct 2026)', month:6, type:'dp-warn',
     criteria:'Trigger if liquid falls below ~$12K (~4 months burn). Corrected math (v4.2): peak $37.5K late June, burn $3K/mo Jun–Aug then $5K/mo Sep onward → realistically fires ~October 2026 if no income, giving 60–90 days to close an offer above the floor. With $5K reserve, practical danger point late December 2026 ("Christmas"). If fired: A1a becomes operational priority, stretch targets paused, any offer above minimum-acceptable salary accepted within 5 business days, B drops to maintenance (B2 main episode only), C at minimum enrollment.'},
  ],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WS_MAP     = Object.fromEntries(planData.workstreams.map(w => [w.id, w]))
const ASSUME_MAP = Object.fromEntries(planData.assumptions.map(a => [a.id, a]))

const STATUS_META = {
  'holds':             {color:'#1D9E75', label:'holds'},
  'hypothesis':        {color:'#6a90b5', label:'hypothesis'},
  'in resolution':     {color:'#BA7517', label:'in resolution'},
  'leading candidate': {color:'#5DCAA5', label:'leading candidate'},
  'weakening':         {color:'#D85A30', label:'weakening'},
  'falsified':         {color:'#D83050', label:'falsified'},
  'in progress':       {color:'#1D9E75', label:'in progress'},
  'not started':       {color:'#344a60', label:'not started'},
  'deferred':          {color:'#4a4060', label:'deferred'},
  'done':              {color:'#1D9E75', label:'done'},
}
const EQ_COLORS = {strong:'#1D9E75', moderate:'#BA7517', weak:'#D85A30'}
function eqColor(q)  { return EQ_COLORS[q] || '#888' }
function stColor(s)  { return STATUS_META[s]?.color || '#888' }
function stLabel(s)  { return STATUS_META[s]?.label || s }

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text, x, y, visible }) {
  if (!visible) return null
  return (
    <div style={{
      position:'fixed', left:x+12, top:y-8, zIndex:1000,
      background:'#0a1628', border:'1px solid #1e3a5f', borderRadius:8,
      padding:'8px 12px', pointerEvents:'none', maxWidth:260,
      boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
    }}>
      <div style={{color:'#fff',fontSize:12,fontWeight:600}}>{text.name}</div>
      <div style={{color:'#6a80a0',fontSize:11,marginTop:2}}>{text.ws}</div>
      <div style={{color:'#c5a028',fontSize:11,marginTop:2}}>{text.range}</div>
      <div style={{color:stColor(text.status),fontSize:11,marginTop:2}}>{stLabel(text.status)}</div>
      {text.assumCount > 0 && (
        <div style={{color:'#7a9ab5',fontSize:11,marginTop:2}}>
          {text.assumCount} linked assumption{text.assumCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ─── Phase Navigator ──────────────────────────────────────────────────────────
function PhaseNavigator() {
  const [expanded, setExpanded] = useState(0)

  const PHASE_COLORS = {
    0: {active:'#85B7EB', bg:'#112842'},
    1: {active:'#5DCAA5', bg:'#0F2E25'},
    2: {active:'#EF9F27', bg:'#2F2208'},
    3: {active:'#B87FD4', bg:'#2A1542'},
    4: {active:'#e05c28', bg:'#2F1408'},
  }

  return (
    <div className="shrink-0 px-6 py-4 border-b border-[#1e3a5f]">
      {/* Phase pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {PHASES.map(p => {
          const isExp = expanded === p.id
          const c = PHASE_COLORS[p.id]
          return (
            <button
              key={p.id}
              onClick={() => setExpanded(prev => prev === p.id ? null : p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: isExp ? c.bg : '#071020',
                border: `1px solid ${isExp ? c.active : p.active ? c.active + '66' : '#1e3a5f'}`,
                color: isExp ? c.active : p.active ? c.active + 'cc' : '#4a6080',
              }}
            >
              {p.active && (
                <span style={{
                  width:6, height:6, borderRadius:'50%',
                  background: c.active,
                  boxShadow:`0 0 6px ${c.active}`,
                  display:'inline-block',
                }} />
              )}
              {p.label}
              <span style={{color: isExp ? c.active + 'aa' : '#4a6080', fontWeight:400}}>
                {p.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Expanded phase detail */}
      {expanded !== null && (() => {
        const p = PHASES[expanded]
        const c = PHASE_COLORS[expanded]
        return (
          <div className="rounded-xl border px-4 py-3" style={{background:c.bg, borderColor:c.active+'44'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:c.active}}>
                  {p.active ? '● Active now' : 'Activates when gate fires'}
                </p>
                <ul className="flex flex-col gap-1">
                  {p.what.map((item, i) => (
                    <li key={i} className="flex gap-2 text-xs" style={{color:'#a0b8cc'}}>
                      <span style={{color:c.active, marginTop:1, flexShrink:0}}>–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {p.gate && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 text-[#c5a028]">
                    Gate to Phase {p.id + 1}
                  </p>
                  <p className="text-xs text-[#a0b8cc] leading-relaxed mb-2">{p.gate}</p>
                  {p.gate_tests.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {p.gate_tests.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e3a5f] text-[#7a9ab5]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {!p.gate && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{color:c.active}}>
                    Terminal phase — no gate
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Roadmap() {
  const [selectedTask,    setSelectedTask]    = useState(null)
  const [selectedAssumId, setSelectedAssumId] = useState(null)
  const [assumCat,        setAssumCat]        = useState('all')
  const [tooltip,         setTooltip]         = useState({visible:false,x:0,y:0,text:{}})
  const [expandedMs,      setExpandedMs]      = useState(null)
  const assumRefs = useRef({})

  const months = planData.meta.months

  // Today line
  const planStart    = new Date(2026, 4, 1)
  const planEnd      = new Date(2027, 7, 1)
  const todayPct     = Math.min(100, Math.max(0, (Date.now() - planStart) / (planEnd - planStart) * 100))
  const todayInRange = Date.now() >= planStart && Date.now() <= planEnd

  const CATS = ['all', 'Job Search', 'Asset Stack', 'Dissertation', 'Long Arc']

  function isDimmed(task) {
    if (!selectedAssumId) return false
    return !(ASSUME_MAP[selectedAssumId]?.linked_tasks || []).includes(task.id)
  }

  function handleBarClick(task) {
    setSelectedTask(task)
    setSelectedAssumId(null)
  }

  function handleAssumClick(id) {
    setSelectedAssumId(prev => prev === id ? null : id)
    setSelectedTask(null)
  }

  function jumpToAssum(id) {
    setSelectedAssumId(id)
    setSelectedTask(null)
    setTimeout(() => {
      assumRefs.current[id]?.scrollIntoView({behavior:'smooth', block:'nearest'})
    }, 50)
  }

  function handleBarEnter(e, task) {
    const ws = WS_MAP[task.ws]
    const s  = months[task.start - 1]
    const en = months[task.start + task.duration - 2]
    setTooltip({
      visible: true, x: e.clientX, y: e.clientY,
      text: {
        name: task.name, ws: ws?.name || task.ws, status: task.status,
        range: `M${task.start}–M${task.start+task.duration-1} · ${s?.label} '${s?.year} – ${en?.label} '${en?.year}`,
        assumCount: (task.linked_assumptions||[]).length,
      },
    })
  }

  function handleBarMove(e) { setTooltip(p => ({...p, x:e.clientX, y:e.clientY})) }
  function handleBarLeave()  { setTooltip(p => ({...p, visible:false})) }

  const filteredAssumptions = planData.assumptions.filter(a =>
    assumCat === 'all' || a.category === assumCat
  )

  const tasksByWs = {}
  planData.workstreams.forEach(ws => {
    tasksByWs[ws.id] = planData.tasks.filter(t => t.ws === ws.id)
  })

  function TodayLine() {
    if (!todayInRange) return null
    return (
      <div style={{
        position:'absolute', top:0, bottom:0, width:2,
        background:'#e05c28', left:`${todayPct}%`,
        zIndex:4, opacity:0.85, pointerEvents:'none',
      }} />
    )
  }

  return (
    <div className="flex flex-col bg-[#0a1628] text-white overflow-y-auto h-full">
      <Tooltip {...tooltip} />

      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#1e3a5f]">
        <h2 className="text-sm font-bold text-white mb-3">{planData.meta.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {label:'Window',     value:planData.meta.window},
            {label:'Constraint', value:planData.meta.constraint},
            {label:'Runway',     value:planData.meta.runway},
            {label:'Metrea',     value:planData.meta.metreaEnd},
          ].map(item => (
            <div key={item.label} className="bg-[#071020] border border-[#1e3a5f] rounded-lg px-3 py-2">
              <div className="text-[#4a6080] text-xs mb-0.5">{item.label}</div>
              <div className="text-white text-xs font-medium leading-snug">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase navigator */}
      <PhaseNavigator />

      {/* Gantt */}
      <div className="shrink-0 px-6 pt-4 pb-2">
        <div className="overflow-x-auto">
          <div style={{minWidth: 900 + 232}}>

            {/* Month header */}
            <div className="flex" style={{marginLeft:232}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(15,1fr)', width:'100%'}}>
                {months.map(m => (
                  <div key={m.n} className="text-center border-l border-[#1e3a5f] first:border-l-0"
                    style={{borderBottom:'1px solid #1e3a5f'}}>
                    <div className="text-[#c5a028] text-xs font-bold py-1">{m.label}</div>
                    <div className="text-[#4a6080] text-xs pb-1">'{m.year}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workstream rows */}
            {planData.workstreams.map(ws => {
              const wsTasks = tasksByWs[ws.id] || []
              return (
                <div key={ws.id}>
                  {/* WS header */}
                  <div className="flex items-center" style={{borderTop:'1px solid #1e3a5f', background:'#071020'}}>
                    <div style={{width:232, minWidth:232}} className="px-3 py-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{color:ws.barColor}}>
                        {ws.name}
                      </span>
                    </div>
                    <div style={{flex:1}} />
                  </div>

                  {/* Task rows */}
                  {wsTasks.map(task => {
                    const isSelected = selectedTask?.id === task.id
                    const dimmed     = isDimmed(task)
                    const leftPct    = (task.start - 1) / 15 * 100
                    const widthPct   = task.duration / 15 * 100
                    const assumCount = (task.linked_assumptions || []).length

                    return (
                      <div key={task.id} className="flex items-center"
                        style={{borderTop:'1px solid #112040', minHeight:40}}>
                        <div style={{width:232, minWidth:232}} className="px-3 py-2 flex items-center gap-1.5">
                          <span
                            className="text-xs leading-snug cursor-pointer"
                            style={{color: isSelected ? '#fff' : '#7a9ab5'}}
                            onClick={() => handleBarClick(task)}
                          >
                            {task.name}
                          </span>
                          {assumCount > 0 && (
                            <span className="text-[10px] text-[#c5a028] shrink-0">({assumCount})</span>
                          )}
                        </div>

                        <div style={{flex:1, position:'relative', height:40}}>
                          {/* Grid lines */}
                          <div style={{
                            position:'absolute', inset:0,
                            display:'grid', gridTemplateColumns:'repeat(15,1fr)',
                          }}>
                            {months.map(m => (
                              <div key={m.n} style={{borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none'}} />
                            ))}
                          </div>

                          <TodayLine />

                          {/* Bar */}
                          <div
                            style={{
                              position:'absolute', top:'50%', transform:'translateY(-50%)',
                              left:`${leftPct}%`, width:`${widthPct}%`, height:26,
                              background: ws.barBg, borderRadius:6,
                              border: isSelected ? `2px solid ${ws.barColor}` : `1px solid ${ws.barColor}33`,
                              opacity: dimmed ? 0.2 : task.status === 'deferred' ? 0.5 : 1,
                              cursor:'pointer', display:'flex', alignItems:'center',
                              paddingLeft:8, paddingRight:4, overflow:'hidden',
                              transition:'opacity 0.2s, border 0.15s',
                              boxShadow: isSelected ? `0 0 8px ${ws.barColor}55` : 'none',
                            }}
                            onClick={() => handleBarClick(task)}
                            onMouseEnter={e => handleBarEnter(e, task)}
                            onMouseMove={handleBarMove}
                            onMouseLeave={handleBarLeave}
                          >
                            <span style={{
                              color: ws.barColor, fontSize:10, fontWeight:600,
                              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                            }}>{task.label}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Milestones row */}
            <div className="flex items-center" style={{borderTop:'1px solid #1e3a5f', minHeight:48}}>
              <div style={{width:232, minWidth:232}} className="px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c5a028]">Milestones</span>
              </div>
              <div style={{flex:1, position:'relative', height:48}}>
                <div style={{
                  position:'absolute', inset:0,
                  display:'grid', gridTemplateColumns:'repeat(15,1fr)',
                }}>
                  {months.map(m => (
                    <div key={m.n} style={{borderLeft: m.n > 1 ? '1px solid #0f1f35' : 'none'}} />
                  ))}
                </div>
                <TodayLine />
                {planData.milestones.map(ms => {
                  const leftPct   = ((ms.month - 1) / 15 * 100) + (1/15*50)
                  const msColor   = ms.type === 'dp' ? '#e05c28'
                                  : ms.type === 'dp2' ? '#BA7517'
                                  : ms.type === 'dp-warn' ? '#4a6080'
                                  : '#c5a028'
                  return (
                    <div
                      key={ms.id}
                      style={{
                        position:'absolute', left:`${leftPct}%`, top:'50%',
                        width:11, height:11, background:msColor,
                        transform:'translate(-50%,-50%) rotate(45deg)',
                        cursor:'pointer', zIndex:2,
                      }}
                      onClick={() => setExpandedMs(prev => prev === ms.id ? null : ms.id)}
                    />
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Two-column panel */}
      <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Task Detail */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080]">Task Detail</h3>
          {selectedTask ? (
            <TaskDetail task={selectedTask} onJumpToAssumption={jumpToAssum} />
          ) : (
            <div className="bg-[#071020] border border-[#1e3a5f] rounded-xl flex items-center justify-center py-12">
              <p className="text-[#344a60] text-sm text-center">Click a Gantt bar to see details</p>
            </div>
          )}
        </div>

        {/* Assumptions Register */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080]">Assumptions Register</h3>
            <div className="flex gap-1 flex-wrap">
              {CATS.map(c => (
                <button key={c}
                  onClick={() => setAssumCat(c)}
                  className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                  style={{
                    background: assumCat === c ? '#1e3a5f' : 'transparent',
                    color: assumCat === c ? '#fff' : '#4a6080',
                    border: `1px solid ${assumCat === c ? '#2a5080' : '#1e3a5f'}`,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {filteredAssumptions.map(a => (
              <AssumptionCard
                key={a.id}
                assumption={a}
                isSelected={selectedAssumId === a.id}
                onClick={() => handleAssumClick(a.id)}
                ref={el => assumRefs.current[a.id] = el}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Milestones + Decision Points */}
      <div className="shrink-0 px-6 pb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a6080] mb-3">
          Milestones &amp; Decision Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {planData.milestones.map(ms => {
            const isDP  = ms.type?.startsWith('dp')
            const msColor = ms.type === 'dp' ? '#e05c28'
                          : ms.type === 'dp2' ? '#BA7517'
                          : ms.type === 'dp-warn' ? '#4a6080'
                          : '#c5a028'
            const isExp = expandedMs === ms.id
            return (
              <div key={ms.id}
                className="bg-[#071020] border rounded-lg px-4 py-3 cursor-pointer transition-colors"
                style={{borderColor: isExp ? msColor : isDP ? msColor+'55' : '#1e3a5f'}}
                onClick={() => setExpandedMs(prev => prev === ms.id ? null : ms.id)}
              >
                <div className="flex items-start gap-2">
                  <span style={{
                    display:'inline-block', width:10, height:10,
                    background:msColor, transform:'rotate(45deg)',
                    marginTop:4, flexShrink:0,
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold shrink-0" style={{color:msColor}}>{ms.id}</span>
                      <span className="text-white text-xs font-medium truncate">{ms.name}</span>
                      <span className="text-[#4a6080] text-xs shrink-0 ml-auto">M{ms.month}</span>
                    </div>
                    {isExp && (
                      <p className="text-[#6a80a0] text-xs mt-2 leading-relaxed">{ms.criteria}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Task Detail ──────────────────────────────────────────────────────────────
function TaskDetail({ task, onJumpToAssumption }) {
  const ws     = WS_MAP[task.ws]
  const months = planData.meta.months
  const s      = months[task.start - 1]
  const e      = months[task.start + task.duration - 2]
  const linked = (task.linked_assumptions || []).map(id => ASSUME_MAP[id]).filter(Boolean)

  return (
    <div className="bg-[#071020] border border-[#1e3a5f] rounded-xl px-4 py-4 flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider" style={{color:ws?.barColor}}>
            {ws?.name}
          </span>
          <span className="text-[#4a6080] text-xs">·</span>
          <span className="text-[#c5a028] text-xs font-medium">M{task.start}–M{task.start+task.duration-1}</span>
          <span
            className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
            style={{color:stColor(task.status), background:stColor(task.status)+'22'}}
          >
            {stLabel(task.status)}
          </span>
        </div>
        <p className="text-white text-sm font-semibold">{task.name}</p>
        <p className="text-[#6a80a0] text-xs mt-1">
          {s?.label} '{s?.year} – {e?.label} '{e?.year} · {task.duration} month{task.duration !== 1 ? 's' : ''}
        </p>
      </div>

      {task.notes && (
        <p className="text-[#5a7090] text-xs leading-relaxed border-t border-[#1e3a5f] pt-3">
          {task.notes}
        </p>
      )}

      {linked.length > 0 && (
        <div>
          <p className="text-[#4a6080] text-xs mb-2 font-medium uppercase tracking-wider">Linked Assumptions</p>
          <div className="flex flex-col gap-1.5">
            {linked.map(a => (
              <button key={a.id}
                onClick={() => onJumpToAssumption(a.id)}
                className="flex items-start gap-2 text-left hover:bg-[#0f2040] rounded-lg px-2 py-1.5 transition-colors"
              >
                <span className="inline-block w-2 h-2 rounded-full shrink-0 mt-0.5"
                  style={{background:stColor(a.status)}} />
                <div>
                  <span className="text-[#7a9ab5] text-xs font-bold">{a.id}</span>
                  <span className="text-[#6a80a0] text-xs ml-1">{a.claim}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Assumption Card ──────────────────────────────────────────────────────────
const AssumptionCard = forwardRef(function AssumptionCard({ assumption, isSelected, onClick }, ref) {
  const a = assumption
  return (
    <div ref={ref} onClick={onClick}
      className="bg-[#071020] border rounded-xl px-4 py-3 cursor-pointer transition-all flex flex-col gap-2"
      style={{
        borderColor: isSelected ? '#c5a028' : '#1e3a5f',
        boxShadow: isSelected ? '0 0 0 1px #c5a02855' : 'none',
      }}
    >
      <div className="flex items-start gap-2">
        <span className="inline-block w-2 h-2 rounded-full shrink-0 mt-1"
          style={{background:stColor(a.status)}} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[#c5a028] text-xs font-bold">{a.id}</span>
            <span className="text-[#4a6080] text-xs">{a.category}</span>
            <span className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
              style={{color:stColor(a.status), background:stColor(a.status)+'22'}}>
              {stLabel(a.status)}
            </span>
          </div>
          <p className="text-white text-xs font-medium leading-snug">{a.claim}</p>
        </div>
      </div>

      {isSelected && (
        <div className="flex flex-col gap-2 pt-1 border-t border-[#1e3a5f]">
          <div>
            <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Fail Signal</p>
            <p className="text-[#D85A30] text-xs leading-relaxed">{a.fail_signal}</p>
          </div>
          <div>
            <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Reassessment Trigger</p>
            <p className="text-[#6a80a0] text-xs leading-relaxed">{a.reassessment_trigger}</p>
          </div>
          {a.justification && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Justification</p>
              <p className="text-[#5a7090] text-xs leading-relaxed">{a.justification}</p>
            </div>
          )}
          {a.notes && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Notes</p>
              <p className="text-[#5a7090] text-xs leading-relaxed">{a.notes}</p>
            </div>
          )}
          {a.linked_tasks && a.linked_tasks.length > 0 && (
            <div>
              <p className="text-[#4a6080] text-xs font-bold uppercase tracking-wider mb-1">Linked Tasks</p>
              <div className="flex flex-wrap gap-1">
                {a.linked_tasks.map(tid => (
                  <span key={tid} className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e3a5f] text-[#7a9ab5]">{tid}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
