import { useState, useRef, forwardRef } from 'react'

// ─── Phase definitions ────────────────────────────────────────────────────────
const PHASES = [
  {
    id: 0,
    label: 'Phase 0',
    name: 'Asset 1 Experimentation',
    active: true,
    what: [
      'B2 main episode weekly — through-question stated in intros (5-interview A21 experiment); lens: make the implicit explicit / authorship over assignment',
      'B2 solo source-material segment monthly (Jocko mechanic: institution-building/instructor-pedagogy source pool)',
      'B2 reach videos + shorts continuing',
      'LinkedIn 3–5 native posts/wk + 1–2 carousels/mo from brand-ddc captures',
      'B4a newsletter weekly — primary harvest surface for DDC captures',
      'B3 guest acquisition at low cadence (DM ladder, category-based)',
      'A1a + A1b job applications at 3–4/day, 70/30 split',
      'C1 chair conversation initiated early',
      'D1 Phase 0 reading: Kleon (Show Your Work), Dunford (Obviously Awesome)',
    ],
    gate: 'Asset 1 compounding signal — sustained sub growth, warm DM inbound from ICP, OR convergent topic signal from 5-interview A21 experiment, OR ICP-quality engagement on at least one domain × surface in brand-ddc harvest tracker (A22).',
    gate_tests: ['A21', 'A22', 'A9'],
  },
  {
    id: 1,
    label: 'Phase 1',
    name: 'Asset 1 Compounding',
    active: false,
    what: [
      'B3 cadence increases — warm-tie velocity now justified by audience proof',
      'B4b dissertation-adjacent IP artifacts begin circulating (no paywall yet)',
      'B1 LLC formation moves from deferred to active (~$425, 1–2 wk)',
      'D2 self-directed curriculum: Pulizzi (Content Inc.), Challenger Sale or SPIN Selling',
    ],
    gate: 'Dissertation defended OR paid pilot opportunity surfaces (whichever first).',
    gate_tests: ['A20', 'A11'],
  },
  {
    id: 2,
    label: 'Phase 2',
    name: 'Asset 2 Ships',
    active: false,
    what: [
      'Book draft from dissertation — methodology codified',
      'Paid speaking begins (Stumpf trajectory: persona public, method private)',
      'B4b IP artifacts gate to paid-product form',
      'Methodology stays private — productized version held back',
    ],
    gate: 'Delivery vehicle proven viable via 1–2 paid pilots.',
    gate_tests: ['A11', 'A19'],
  },
  {
    id: 3,
    label: 'Phase 3',
    name: 'Asset 3 Build',
    active: false,
    what: [
      'Intensive-format paid event (Forge-shape) OR retainer advisory (Kotter/BTS-shape)',
      'Methodology operates as spine of whichever delivery vehicle buyer base supports',
      'B4b artifacts become paid-product collateral',
      'D3 reading: Simon (Pricing Man), deep-read whichever sales book skimmed in Phase 1',
    ],
    gate: 'Delivery vehicle generating sustained engagement pipeline.',
    gate_tests: ['A11'],
  },
  {
    id: 4,
    label: 'Phase 4',
    name: 'Asset 4 Product',
    active: false,
    what: [
      'Cohort or productized methodology',
      'Book published (if not done in Phase 2)',
      'Possible certification body (Coughlin/RBLP shape)',
      'D4 reading: Hamilton Helmer (7 Powers)',
    ],
    gate: null,
    gate_tests: [],
  },
]

// ─── Plan data ────────────────────────────────────────────────────────────────
const planData = {
  meta: {
    title: 'Solo Practice Launch — Micro v4.0',
    window: 'May 2026 – Jul 2027 · 15 months',
    constraint: 'Vocational direction is the binding constraint (not cash survival)',
    runway: 'Peak ~$42K mid-Jul · floor ~$12K not until mid-2027',
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
    {id:'A1a', ws:'job',   start:1, duration:8, label:'defense/intel (~70%)',
     name:'A1a · Income-protective lane (~70%)', status:'in progress',
     linked_assumptions:['A14-defense','A16a','A17','A18'],
     notes:'Target: cleared defense/intel/training/exercise/capture roles where USAFWS credential is premium. 3–4 high-customization apps/day combined. Leidos Intel Exercise Planner identified as strongest single fit.'},
    {id:'A1b', ws:'job',   start:1, duration:8, label:'OD-bridge (~30%)',
     name:'A1b · OD-pivot lane (~30%)', status:'in progress',
     linked_assumptions:['A14-tech','A16b','A18'],
     notes:'Target bridge titles: Workforce Transformation, Change Mgmt, Human Capital — Defense, Learning Strategy, OD Effectiveness. Direct OD Manager at top consultancies = stretch only. Deloitte auto-reject 2026-05-XX is first data point. BAH warm-network submission (Jennie Loughran) → change-strategist consideration: first positive bridge signal.'},
    {id:'A2',  ws:'job',   start:2, duration:7, label:'screen → interview',
     name:'A2 · Convert applications to interviews', status:'not started',
     linked_assumptions:['A16a','A16b'],
     notes:'Lane-aware prep cycle. Track conversion separately for A1a and A1b — different competency models, different STAR emphasis. DP2 Day-14/30/60 reviews gate lane rebalancing.'},
    {id:'A3',  ws:'job',   start:3, duration:6, label:'close offer (DP1)',
     name:'A3 · Close an offer', status:'not started',
     linked_assumptions:['A16a','A16b','A17'],
     notes:'Surface outside-practice/moonlighting policy before signing. Get it in writing. Firing DP1 restructures all workstreams.'},

    // B — Asset Stack
    {id:'B1',  ws:'brand', start:7, duration:1, label:'LLC · Phase 1 gate',
     name:'B1 · LLC formation (deferred until Phase 1)', status:'deferred',
     linked_assumptions:['A20'],
     notes:'~$425, 1–2 weeks evening effort. Deferred until Asset 1 compounding signal OR paid pilot surfaces. Formation premature without compounding evidence.'},
    {id:'B2',  ws:'brand', start:1, duration:15, label:'Asset 1 broadcast',
     name:'B2 · Podcast / YouTube + LinkedIn', status:'in progress',
     linked_assumptions:['A21','A22','A9'],
     notes:'32 episodes in, ~54 subs, 27K views/157 watch hours. Core promise (user\'s own words): "Making sense of the modern world. Curious about human performance, meaning and worldview, work, sociology, psychology, leadership, and everything in between." Working lens underneath (not on-air, not a slogan): authorship over assignment — what did we absorb without choosing, how do you make it yours. 5 roam buckets: (1) mind & body / willpower-ceiling, (2) meaning & worldview, (3) work & craft / operator-to-civilian gap, (4) people & leadership, (5) big-swing curiosity. Two-spine split: B2B2C codified-excellence (product altitude, A19/A15 spine) vs B2C meaning/voice (Eden persona altitude — Stumpf mechanic: persona public). DO NOT conflate the two altitudes. Through-question: "what did you learn doing this." 5-interview experiment scheduled. 3–5 LinkedIn posts/wk from brand-ddc captures. Eden for title engineering.'},
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
    {id:'D1',  ws:'curric', start:1, duration:3, label:'Kleon + Dunford',
     name:'D1 · Phase 0 reading', status:'not started',
     notes:'Kleon Show Your Work (2 evenings) — frame for podcast + LinkedIn during job hunt. Dunford Obviously Awesome (1 week) — apply to resume header positioning across both lanes.'},
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
    {id:'A16b', category:'Job Search', status:'weakening', evidence_quality:'weak',
     claim:'Resume bridges credibly into OD bridge titles (Workforce Transformation, Change Mgmt, etc.)',
     justification:'"Designed capability pathways, role progression, certification criteria, operating rhythms" is the reframe. Deloitte auto-reject suggests conventional OD-title history is still the filter. Bridge-title reframe not yet volume-tested.',
     fail_signal:'Zero responses on 15 bridge-title submissions → vocabulary gap not bridged. Get buyer-side OD/human-capital critique.',
     reassessment_trigger:'After 15 A1b bridge-title submissions.',
     linked_tasks:['A1b','A2','A3'],
     notes:'Deloitte auto-reject (2026-05-XX) = first data point on direct OD Manager title. POSITIVE SIGNAL (v3.9): BAH submission via warm network (Jennie Loughran) resulted in immediate Director-of-L&D / change-strategist consideration once resume reframed correctly — first real positive signal on bridge lane. Data point on A18 (70/30 portfolio): the 30% bridge lane IS responsive when positioning is clean.'},
    {id:'A17', category:'Job Search', status:'holds', evidence_quality:'strong',
     claim:'Runway holds long enough for conversion without forced compression',
     justification:'Metrea final day 2026-06-12. Sep pkg ~$14K. Peak liquid mid-July ~$42K. Burn ~$3K/mo (+$400 Jul/Aug, +$2K Nov). VA ~$1K/mo possible not budgeted. Floor ~$12K not hit until mid-2027 even with zero income.',
     fail_signal:'Verified liquid falls below $20K before DP1 fires.',
     reassessment_trigger:'Monthly cash review. DP1.5 tripwire at ~$12K floor.',
     linked_tasks:['A1a','A1b','A2','A3']},
    {id:'A18', category:'Job Search', status:'hypothesis', evidence_quality:'weak',
     claim:'70/30 portfolio outperforms direct OD-first approach for conversion speed and option value',
     justification:'A1a has higher per-application conversion probability. A1b has higher long-arc value. Portfolio hedges A14-tech while not abandoning OD direction. Not yet tested.',
     fail_signal:'A1a produces offer but zero A1b traction after 15 submissions → collapse to 100% defense. Or: A1b converts to screen before A1a → rebalance toward 50/50.',
     reassessment_trigger:'DP2 Day-14, Day-30, Day-60 reviews (2026-06-03, 06-19, 07-19).',
     linked_tasks:['A1a','A1b']},
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
     notes:'v3.8 unblocks "what do I post" — execution begins week of 2026-05-25. Harvest filter prevents "I felt like it" drift and surface genericization. brand-ddc.md v0.4 has 13 captures; spine-as-lens (authorship over assignment) added as secondary harvest lens in v0.4.'},
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
     criteria:'2026-06-19 — Lane decision: is A1a producing traction? Is A1b viable near-term? Re-balance the 70/30 ratio on evidence.'},
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
    {id:'DP1-5',  name:'DP1.5 · Cash tripwire (monitor)',  month:14, type:'dp-warn',
     criteria:'Trigger if liquid falls below ~$12K (~4 months burn). Current math: does not fire until mid-2027. If fired: A1a becomes operational priority, B drops to maintenance, C at minimum enrollment. Unlikely to fire.'},
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
