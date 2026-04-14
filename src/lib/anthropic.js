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

const TASK_LOGIC = `TASK LOGIC — follow this reasoning chain on every call:
1. Parse the input topic or question
2. Identify which brand pillar(s) the topic connects to
3. Map topic → audience pain point (make the connection explicit)
4. Draft content that answers the question through that lens
5. Self-check: "Would this audience care? Did we actually answer the question?"`

const OUTPUT_FORMATS = `OUTPUT FORMATS:
NEWSLETTER (400 words maximum):
Hi friend,
[Hook — one story detail or quote. Specific. Not a thesis.]
[Very short story + practical application — insight lands on the reader, not on Norman.]
[What this means — the decision frame, not the answer. Never prescriptive. Never "you should."]
[Podcast CTA — one sentence only, only if directly connected. Never forced.]
[Closing comment — one sentence, personal, direct. Not a summary. Not a moral.]
Fights On,
RUFIO

PODCAST SCRIPT (800-1000 words):
[Intro: "Hey everyone, welcome back to Your Finest Hour. I'm your host, Rufio, and this week I want to talk about..." — state the topic and why it's on Norman's mind right now.]
[Context: why this topic matters, personal connection to it]
[Main story or scenario — specific, detailed, real]
[Three numbered takeaways — each tied to the story, reader-centered]
[CTA: like, subscribe, tell a friend — one sentence each, natural not forced]
[Personal closer — specific to the day, the moment, something real. "See you."]`

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

  return [BASE_ROLE, brandBlock, voiceBlock, influencesBlock, TASK_LOGIC, OUTPUT_FORMATS]
    .filter(Boolean)
    .join('\n\n')
}

// ── Assess input ──────────────────────────────────────────────────────────────

export async function assessInput(rawInput, brand) {
  const instruction = `Read the input carefully. Assess whether it is RICH (clear central idea, story present, enough to work with) or THIN (vague, early-stage, missing key sections). Return a JSON object with this exact shape:
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
Assemble a NEWSLETTER draft using the newsletter format and voice fingerprint. Return only the newsletter draft — no commentary. 400 words maximum. Then on a new line: WORDCOUNT: [n]`

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
Assemble a PODCAST SCRIPT using the podcast format and voice fingerprint. This is a solo episode of Your Finest Hour. Write it as spoken word — how Norman actually talks, not how he writes. Keep the "uh" rhythm of his natural speech but clean up the filler — aim for natural without sounding scripted. 800-1000 words. Return only the script — no commentary. Then on a new line: WORDCOUNT: [n]`

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

Revise the draft based on this feedback. Apply the voice fingerprint. ${formatNote} Return only the revised draft — no commentary. Then return WORDCOUNT: [n]`

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
