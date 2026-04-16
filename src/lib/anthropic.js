const API_URL = 'https://api.anthropic.com/v1/messages'

// ── API client ────────────────────────────────────────────────────────────────

function getKey() {
  const key = localStorage.getItem('ll-api-key')
  if (!key) throw new Error('API key not set — add it in Brand Settings.')
  return key
}

async function callAPI({ model, max_tokens, temperature, system, messages, tools }) {
  const key = getKey()
  const headers = {
    'content-type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
  if (tools?.some(t => t.type?.startsWith('web_search'))) {
    headers['anthropic-beta'] = 'web-search-2025-03-05'
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens,
      ...(temperature !== undefined && { temperature }),
      system,
      messages,
      ...(tools && { tools }),
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

// ── System prompt builder ─────────────────────────────────────────────────────
// Uses storage brand field names: authorName, name, newsletterName, podcastName,
// standsFor, standsAgainst (all other fields are the same in both formats)

const BASE_ROLE = `ROLE: You are a content creation partner for Norman Driggers (RUFIO). Your job is to help him extract, shape, and publish one piece of content — either a newsletter issue of Lessons Learned or a solo podcast episode of Your Finest Hour. You do not write for him. You organize and assemble what he gives you.`

const CORE_RULES = `CORE RULES — follow these on every single call:
1. USE NORMAN'S EXACT WORDS. Your job is to organize and arrange, not to write. Use 90%+ of his specific phrasing, sentences, and examples verbatim. Do not substitute his words with "elevated" or more "professional" alternatives.
2. NEVER INVENT. Do not fabricate stories, examples, anecdotes, or scenarios. If a section needs a specific personal detail that Norman did not provide, write [FILL IN: what's needed here] as a placeholder. Never fill the gap yourself.
3. DO NOT ADD. No transition phrases ("Moreover," "In conclusion," "It's worth noting"). No academic flourishes. No summaries he didn't write. No interpretive framing. No "This shows us that..."
4. KEEP HIS VOICE. If he said "man up," "kinda," "honestly," "look" — keep it. His casual, slightly skeptical, conversational tone is the product. Polishing it away is the mistake.
5. ORGANIZATION ONLY. Your allowed moves: remove redundancy, fix grammar/punctuation, arrange for logical flow, apply the format structure.`

const NEWSLETTER_FORMAT = `NEWSLETTER FORMAT (400 words maximum):

Hi friend,

[2–4 sentences. Something real from Norman's week — a specific moment, not a concept. Pulled directly from his Q&A answers. If he didn't give you a personal opening, write [FILL IN: one real thing from your week that connects to this]. Never invent the moment.]

Thoughts I had: [1–3 sentences. The common belief or assumption about this topic — stated plainly as something people actually think. Start in the middle, no setup. Use Norman's words from his Q&A answers.]

Lessons Learned: [2–4 sentences. Why that belief is incomplete. The reframe. Two sentences of Norman's lived experience as proof — use his exact words from his Q&A. If he didn't give you lived proof, write [FILL IN: specific moment where you saw this play out].]

[Named Mental Model]: [3–5 short bullets or sentences. Name it what Norman would say out loud to a friend — "The Socratic Loop," "Interaction Residue," "The Business of Attention." If it sounds like a PowerPoint title, rename it. Each bullet is one plain, useful sentence from his Q&A answers.]

Fights On,
RUFIO`

const PODCAST_FORMAT = `PODCAST SCRIPT FORMAT (800–1000 words, essay structure):

Write the script as a series of titled sections — one section per Q&A answer provided. Each section is ~150–200 words.

INTRO (no section title): "Hey everyone, welcome back to Your Finest Hour. I'm your host, Rufio. This week: [state the core question and why it's on Norman's mind RIGHT NOW — use his exact words from the input]."

For each Q&A answer, write one section:
## [SECTION TITLE]
[Section content — 150-200 words. Use Norman's exact words from his Q&A answer, organized for spoken delivery. Keep "uh" rhythm but remove filler. If a specific detail or story is missing, write [FILL IN: what's needed here] — do not invent it.]

SECTION TITLE CRITERIA — "Truthful packaging, not literal accuracy":
- Is this the clearest, most compelling promise the section substantially fulfills?
- Formula: core tension the section addresses + what someone would search for + the honest payoff they'll get
- Good: "Why Getting Better at Something Can Make You Worse at Knowing When to Use It"
- Bad: "Improvement and Its Limits" (no tension, no search intent)

CLOSE (no section title): 2-3 numbered takeaways pulled from Norman's words. Personal send-off specific to the day. "See you."`

export function buildSystemPrompt(brand) {
  const pillars = (brand.pillars || []).join(' | ')
  const influences = (brand.influences || []).map(i => `${i.name} ${i.handle} — ${i.topic}`).join(', ')

  const brandBlock = `BRAND IDENTITY:
Newsletter: ${brand.newsletterName || brand.newsletter || 'Lessons Learned'} | Podcast: ${brand.podcastName || brand.podcast || 'Your Finest Hour'}
Author: ${brand.authorName || brand.name || 'Norman Driggers'}
Mission: ${brand.tagline}
Audience: ${brand.audience}
Pillars: ${pillars}
Stands for: ${brand.standsFor || brand.standFor}
Stands against: ${brand.standsAgainst || brand.standAgainst}`

  const voiceBlock = `VOICE FINGERPRINT:\n${brand.voiceFingerprint}`

  const influencesBlock = influences ? `INFLUENCES:\n${influences}` : ''

  return [BASE_ROLE, brandBlock, voiceBlock, influencesBlock, CORE_RULES, NEWSLETTER_FORMAT, PODCAST_FORMAT]
    .filter(Boolean)
    .join('\n\n')
}

// ── Assess input ──────────────────────────────────────────────────────────────

export async function assessInput(rawInput, brand, outputType) {
  let instruction

  if (outputType === 'newsletter') {
    instruction = `You are generating extraction questions to draw out Norman's specific words for a newsletter draft.

Generate exactly 4 questions — one per newsletter section. Each question has A/B/C/D options derived specifically from what Norman actually wrote in the input below. Options should surface his specific angles, stories, and phrasing — not generic choices.

Return a JSON object with this exact shape:
{
  "assessment": "newsletter",
  "questions": [
    {
      "question": "string",
      "options": [
        { "label": "A", "text": "string" },
        { "label": "B", "text": "string" },
        { "label": "C", "text": "string" },
        { "label": "D", "text": "string" }
      ]
    }
  ]
}

The 4 questions must be exactly these (in this order), with options tailored to the input:

Q1 (Opening): "Walk me through one specific thing that happened this week — a moment, a conversation, a realization — that connects to what you're writing about. Details only, no framing."

Q2 (Thoughts I had): "What's the common belief or assumption about this that you've found isn't quite right? Say it the way someone actually thinks it."

Q3 (Lessons Learned): "Tell me about a specific moment when you saw the real version of this play out — in your life, your career, someone you know. Give me the scene."

Q4 (Mental Model): "If you had to name this pattern — what would you call it? Something you'd actually say to a friend, not a label that sounds important."

Options A/B/C/D for each question must be specific framings or angles drawn from what Norman actually wrote. Do not use generic placeholder options.
Return ONLY the JSON object. No markdown fences. No commentary.

INPUT:
${rawInput}`
  } else if (outputType === 'podcast') {
    instruction = `You are generating extraction questions to draw out Norman's specific words for a podcast script.

Generate 3–5 questions — each extracts one specific beat or section of the essay. Questions should draw out stories, specific details, and personal experience. Each question has A/B/C/D options derived specifically from what Norman actually wrote in the input below.

Return a JSON object with this exact shape:
{
  "assessment": "podcast",
  "questions": [
    {
      "question": "string",
      "options": [
        { "label": "A", "text": "string" },
        { "label": "B", "text": "string" },
        { "label": "C", "text": "string" },
        { "label": "D", "text": "string" }
      ]
    }
  ]
}

Each question should target a distinct beat of the topic — the setup, the tension, the story, the insight, the application. Options must be specific to what Norman actually wrote. Do not use generic placeholder options.
Return ONLY the JSON object. No markdown fences. No commentary.

INPUT:
${rawInput}`
  } else {
    instruction = `Read the input carefully. Assess whether it is RICH (clear central idea, story present, enough to work with) or THIN (vague, early-stage, missing key sections). Return a JSON object with this exact shape:
{
  "assessment": "rich" | "thin",
  "questions": [
    {
      "question": "string",
      "options": [
        { "label": "A", "text": "string" },
        { "label": "B", "text": "string" },
        { "label": "C", "text": "string" },
        { "label": "D", "text": "string" }
      ]
    }
  ]
}
If RICH: return exactly 1 question — a scoping question to narrow focus.
If THIN: return 3-5 questions to draw out what is missing.
Options must be specific to what is actually in the input — not generic.
Return ONLY the JSON object. No markdown fences. No commentary.

INPUT:
${rawInput}`
  }

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseJSON(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Assemble newsletter draft ─────────────────────────────────────────────────

function buildTensionMapBlock(tensionMap) {
  if (!tensionMap) return ''
  const lines = []
  if (tensionMap.competingExplanations?.trim()) lines.push(`Competing explanations: ${tensionMap.competingExplanations}`)
  if (tensionMap.whatMakesItHard?.trim()) lines.push(`What makes it hard: ${tensionMap.whatMakesItHard}`)
  if (tensionMap.commonBadAdvice?.trim()) lines.push(`Common bad advice: ${tensionMap.commonBadAdvice}`)
  if (tensionMap.realLifeStakes?.trim()) lines.push(`Real-life stakes: ${tensionMap.realLifeStakes}`)
  if (!lines.length) return ''
  return `\nTension map (use this to inform the distinctive angle):\n${lines.join('\n')}`
}

export async function assembleNewsletter(rawInput, answers, brand, tensionMap) {
  const conversation = answers
    .filter(a => a.answer !== '[skipped]')
    .map(a => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n')

  const tensionBlock = buildTensionMapBlock(tensionMap)

  const instruction = `Raw input from Norman:
${rawInput}

Q&A answers:
${conversation}
${tensionBlock}
Assemble a NEWSLETTER draft using the NEWSLETTER FORMAT from the system prompt.

ASSEMBLY RULES:
- Use 90%+ of Norman's exact words from the Q&A answers above.
- Map answers to sections: Answer 1 → Hi friend opening, Answer 2 → Thoughts I had, Answer 3 → Lessons Learned, Answer 4 → [Named Mental Model].
- Where a section needs personal detail Norman did not provide, write [FILL IN: what's needed here]. Never invent.
- Do not add transition phrases, summaries, or framing he did not write.

Return only the newsletter draft — no commentary. 400 words maximum. Then on a new line: WORDCOUNT: [n]`

  const response = await callAPI({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseDraftResponse(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Assemble podcast script ───────────────────────────────────────────────────

export async function assemblePodcast(rawInput, answers, brand, tensionMap) {
  const conversation = answers
    .filter(a => a.answer !== '[skipped]')
    .map(a => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n')

  const tensionBlock = buildTensionMapBlock(tensionMap)

  const instruction = `Raw input from Norman:
${rawInput}

Q&A answers:
${conversation}
${tensionBlock}
Assemble a PODCAST SCRIPT using the PODCAST SCRIPT FORMAT from the system prompt.

ASSEMBLY RULES:
- Each Q&A answer below becomes one section of the podcast essay.
- Use 90%+ of Norman's exact words from each answer.
- Title each section using the truthful packaging criteria: core tension + search intent + honest payoff. Not vague, not generic.
- Where a section needs specific detail Norman did not provide, write [FILL IN: what's needed here]. Never invent.
- Write for spoken delivery — keep the natural rhythm, remove filler words only.

800-1000 words. Return only the script — no commentary. Then on a new line: WORDCOUNT: [n]`

  const response = await callAPI({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseDraftResponse(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Revise draft ──────────────────────────────────────────────────────────────

export async function reviseDraft(currentDraft, feedback, outputType, brand) {
  const formatNote = outputType === 'podcast'
    ? 'This is a podcast script. Keep it in spoken-word style, 800-1000 words.'
    : 'This is a newsletter. Keep it under 400 words.'

  const instruction = `Current draft:
${currentDraft}

Feedback from Norman:
${feedback}

Revise the draft based on this feedback. Apply the voice fingerprint. ${formatNote} Keep 90%+ of the existing words. Your job is to rearrange, tighten, and fix grammar only — do not substitute Norman's phrasing with alternatives. If he uses casual language ("kinda," "honestly," "look"), keep it. Return only the revised draft — no commentary. Then return WORDCOUNT: [n]`

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseDraftResponse(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Discovery: find what others are saying ────────────────────────────────────

export async function discoverTopics(brand, ideasContext) {
  const influenceNames = (brand.influences || []).map(i => i.name).join(', ')
  const pillars = (brand.pillars || []).join(', ')
  const ideasNote = ideasContext ? `Norman also has these saved ideas to draw from:\n${ideasContext}\n\n` : ''

  const instruction = `${ideasNote}Search for 4-6 pieces of content — articles, threads, podcast clips, or widely-shared ideas — that are currently circulating around these topics: ${pillars}.

Prioritize content from or referencing these people: ${influenceNames}.

Filter results by relevance to Norman's brand pillars. Exclude anything that feels like generic self-help, hustle culture, or surface-level productivity content.

Return JSON:
{
  "topics": [
    {
      "title": "string",
      "source": "string",
      "url": "string",
      "why_relevant": "string",
      "pillar": "string",
      "seed_question": "string"
    }
  ]
}
Return ONLY the JSON. No markdown fences. No commentary.`

  const messages = [{ role: 'user', content: instruction }]
  let response

  for (let i = 0; i < 5; i++) {
    response = await callAPI({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.7,
      system: buildSystemPrompt(brand),
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    })

    if (response.stop_reason === 'end_turn') break

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const toolResults = response.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' }))
      messages.push({ role: 'user', content: toolResults })
    } else {
      break
    }
  }

  const text = response.content.find(b => b.type === 'text')?.text || ''
  try { return parseJSON(text) } catch { return { topics: [] } }
}

// ── Find headlines ────────────────────────────────────────────────────────────

export async function findHeadlines(draft, brand) {
  const instruction = `Search for 3-5 trending article headlines, newsletter subject lines, or widely-shared pieces related to the core topic of this content.

The draft:
${draft}

After searching, return results as JSON:
{
  "headlines": [
    {
      "headline": "string",
      "source": "string",
      "url": "string",
      "plain_version": "string"
    }
  ]
}
plain_version: rewritten at Grade 5-6 reading level in Norman's voice — plain, not clever.

TITLE GRADING CRITERIA — "Truthful packaging, not literal accuracy":
For each headline's plain_version, ask: Is this the clearest, most compelling promise this content substantially fulfills?
Formula: core tension + search intent + honest payoff.
Reject titles that are: vague ("The Power of X"), generic ("How to Improve"), or promise more than the content delivers.

Return ONLY the JSON. No markdown fences. No commentary.`

  const messages = [{ role: 'user', content: instruction }]
  let response

  for (let i = 0; i < 5; i++) {
    response = await callAPI({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.7,
      system: buildSystemPrompt(brand),
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    })

    if (response.stop_reason === 'end_turn') break

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const toolResults = response.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' }))
      messages.push({ role: 'user', content: toolResults })
    } else {
      break
    }
  }

  const text = response.content.find(b => b.type === 'text')?.text || ''
  try { return parseJSON(text) } catch { return { headlines: [] } }
}

// ── Mosaic: gather raw source material ──────────────────────────────────────
// Searches the web for what creators and articles in a territory are already
// saying, so the user can react from their own experience rather than starting
// from nothing. No pillars required — works from vague words and influences.

// Minimal system prompt — the full newsletter/voice/format system prompt is
// irrelevant here and burns ~1,600 tokens per call in the agentic loop.
const MOSAIC_SYSTEM = `You are a research assistant. Search the web, find specific arguments and claims from real creators and publications, and return structured JSON. Report actual positions — not vague topic summaries. Be direct and specific about what each source is actually arguing.`

export async function gatherMosaic(words, influences, brand) {
  const wordsNote = words?.trim()
    ? `The user is orbiting these words and themes: "${words.trim()}".`
    : `Search broadly across personal development, identity, transitions, and meaningful work.`

  const influencesNote = influences?.trim()
    ? `Focus on what these creators and sources are saying: ${influences.trim()}. Also pull others in the same space.`
    : `Search across popular creators, newsletters, and discussions in this space.`

  const instruction = `${wordsNote} ${influencesNote}

Search for what's already being written, said, and argued in this territory — articles, newsletters, podcast episodes, Reddit threads, forum discussions. For each piece, pull the specific angle or claim: what is the creator actually arguing? Not the topic — the take.

Return 6–8 tiles. Mix types:
- "creator_take": a specific claim a creator makes
- "article_angle": the specific angle a piece pushes
- "conversation": what a thread or debate reveals

For each tile:
- type: "creator_take" | "article_angle" | "conversation"
- source: specific (e.g., "Austin Kleon", "Cal Newport, Deep Work", "r/productivity thread")
- headline: their specific angle in one plain sentence — the claim, not the topic
- what_they_say: 2–3 sentences on their actual position, direct and specific
- hook: a plain question inviting the user's reaction from their own life
- url: URL if findable, null otherwise

Return JSON only — no markdown fences, no commentary:
{"tiles":[{"type":"string","source":"string","headline":"string","what_they_say":"string","hook":"string","url":null}]}`

  const messages = [{ role: 'user', content: instruction }]
  let response

  for (let i = 0; i < 3; i++) {
    response = await callAPI({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      temperature: 0.8,
      system: MOSAIC_SYSTEM,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    })

    if (response.stop_reason === 'end_turn') break

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content })
      const toolResults = response.content
        .filter(b => b.type === 'tool_use')
        .map(b => ({ type: 'tool_result', tool_use_id: b.id, content: '' }))
      messages.push({ role: 'user', content: toolResults })
    } else {
      break
    }
  }

  const text = response.content.find(b => b.type === 'text')?.text || ''
  try { return parseJSON(text) } catch { return { tiles: [] } }
}

// ── Filter check ──────────────────────────────────────────────────────────────

export async function runFilterCheck(draft, outputType, brand) {
  const formatNote = outputType === 'podcast'
    ? 'This is a podcast script. Evaluate it as spoken word content, not a written newsletter.'
    : 'This is a newsletter issue.'

  const instruction = `${formatNote}

Run the draft through both filters. Return JSON:
{
  "brandFilter": { "pass": true | false, "explanation": "string" },
  "promiseFilter": { "pass": true | false, "explanation": "string" }
}
BRAND FILTER: Does this help someone think more clearly — without telling them what to think? Does it sound like Norman, not a content template?
PROMISE FILTER: Does this help the reader/listener act on what they already have?
If pass is true: one sentence confirming what works.
If pass is false: one sentence naming what is missing, followed by one specific fix.
Return ONLY the JSON. No markdown fences.

DRAFT:
${draft}`

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    temperature: 0,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseJSON(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Generate candidate questions from Ideas Board ────────────────────────────

export async function generateCandidateQuestions(items, brand) {
  const itemDescriptions = items.map((item, i) => {
    const parts = [`${i + 1}. Title: ${item.title}`, `   Source: ${item.source || 'Unknown'}`]
    if (item.reflections?.why) parts.push(`   Why it grabbed me: ${item.reflections.why}`)
    if (item.reflections?.suggests) parts.push(`   What it suggests is true: ${item.reflections.suggests}`)
    if (item.reflections?.disagree) parts.push(`   Where I disagree: ${item.reflections.disagree}`)
    return parts.join('\n')
  }).join('\n\n')

  const instruction = `Based on these items from the Ideas Board, generate 5 sharp candidate questions for ${brand.newsletterName || 'Lessons Learned'} or ${brand.podcastName || 'Your Finest Hour'}.

Items:
${itemDescriptions}

WHAT MAKES A GOOD QUESTION:
- Has genuine tension — there is no clean answer
- Names something the audience feels but hasn't said out loud
- Invites earned perspective, not advice
- Examples of the RIGHT kind: "Why do competent people become performative when they want to improve?" / "What does it cost to keep leading people who've stopped trusting you?" / "Why is the version of you that started performing better also the version that lost the most?"

WHAT MAKES A BAD QUESTION:
- Topic labels: "How do leaders deal with change?" — too broad, no tension
- Advice prompts: "What should you do when X?" — invites prescriptions
- Vague: "What does success really mean?" — no stakes

For each question, provide one sentence of tension — what makes it hard or unresolved.

Return JSON only, no markdown fences:
{
  "questions": [
    { "question": "string", "tension": "string" }
  ]
}`

  const response = await callAPI({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    temperature: 0.9,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseJSON(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Generate speaking outline ─────────────────────────────────────────────────

export async function generateSpeakingOutline(draft, outputType, brand) {
  const formatNote = outputType === 'podcast'
    ? 'This is a podcast script.'
    : 'This is a newsletter.'

  const instruction = `${formatNote}

Create a speaking outline for this draft — NOT a script. A structure to speak from.

Format:
- Opening hook: one sentence describing the opening moment or image
- Beat 1: one plain sentence describing what happens here
- Beat 2: one plain sentence describing what happens here
- Beat 3: one plain sentence describing what happens here
- Beat 4: one plain sentence describing what happens here
- (Beat 5 and 6 if the piece warrants them)
- Closing line: one sentence describing how it lands

Each beat is a description of what happens, not the content itself. Plain language. No bullet-within-bullets. No headers.

DRAFT:
${draft}`

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    temperature: 0.3,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return response.content.find(b => b.type === 'text')?.text || ''
}

// ── Fill in a placeholder with Norman's actual words ─────────────────────────

export async function fillInPlaceholder(draft, placeholder, userWords, outputType, brand) {
  const formatNote = outputType === 'podcast' ? 'podcast script' : 'newsletter'

  const instruction = `This ${formatNote} draft has a placeholder: ${placeholder}

Norman's actual words to use there:
"${userWords}"

Replace the placeholder with his words. Use 90%+ of his exact phrasing. Clean grammar/punctuation only — do not rewrite what he said, do not add transitions, do not make it sound more polished. His casual voice is correct.

Return the full updated draft. Then on a new line: WORDCOUNT: [n]

DRAFT:
${draft}`

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    temperature: 0.2,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseDraftResponse(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Repurpose existing content ────────────────────────────────────────────────

export async function repurposeContent(sourceContent, targetType, brand) {
  const instruction = `Norman has an existing piece he wants to build a ${targetType} from.

Existing content:
${sourceContent}

1. Extract the core question this piece is exploring.
2. Extract the main personal story or example.
3. Extract the central insight or lesson.
4. Generate 3–4 extraction questions that would help Norman expand this into a ${targetType}. Each question should draw out details, angles, or stories he didn't fully develop in the original.

Each question needs A/B/C/D options — specific to what's actually in the existing piece.

Return JSON only, no markdown fences:
{
  "coreQuestion": "string",
  "coreConcept": "string",
  "keyInsight": "string",
  "assessment": "${targetType}",
  "questions": [
    {
      "question": "string",
      "options": [
        { "label": "A", "text": "string" },
        { "label": "B", "text": "string" },
        { "label": "C", "text": "string" },
        { "label": "D", "text": "string" }
      ]
    }
  ]
}`

  const response = await callAPI({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1200,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  })

  return parseJSON(response.content.find(b => b.type === 'text')?.text || '')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDraftResponse(text) {
  const match = text.match(/WORDCOUNT:\s*(\d+)/)
  const wordCount = match ? parseInt(match[1], 10) : countWords(text)
  const draft = text.replace(/WORDCOUNT:\s*\d+/g, '').trim()
  return { draft, wordCount }
}

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}
