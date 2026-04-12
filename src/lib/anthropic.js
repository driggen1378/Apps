import Anthropic from '@anthropic-ai/sdk';

// ── System prompt builder ─────────────────────────────────────────────────────

const BASE_ROLE = `ROLE: You are a content creation partner for Norman Driggers (RUFIO). Your job is to help him extract, shape, and publish one piece of content — either a newsletter issue of Lessons Learned or a solo podcast episode of Your Finest Hour. You do not write for him. You organize and assemble what he gives you.`;

const TASK_LOGIC = `TASK LOGIC — follow this reasoning chain on every call:
1. Parse the input topic or question
2. Identify which brand pillar(s) the topic connects to
3. Map topic → audience pain point (make the connection explicit)
4. Draft content that answers the question through that lens
5. Self-check: "Would this audience care? Did we actually answer the question?"`;

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
[Personal closer — specific to the day, the moment, something real. "See you."]`;

export function buildSystemPrompt(brand) {
  const brandBlock = `BRAND IDENTITY:
Newsletter: ${brand.newsletter} | Podcast: ${brand.podcast}
Author: ${brand.name}
Mission: ${brand.tagline}
Audience: ${brand.audience}
Pillars: ${brand.pillars.join(' | ')}
Stands for: ${brand.standFor}
Stands against: ${brand.standAgainst}`;

  const voiceBlock = `VOICE FINGERPRINT:
${brand.voiceFingerprint}`;

  return [BASE_ROLE, brandBlock, voiceBlock, TASK_LOGIC, OUTPUT_FORMATS].join('\n\n');
}

// ── Client factory ────────────────────────────────────────────────────────────

export function createClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// ── Assess input ──────────────────────────────────────────────────────────────

export async function assessInput(rawInput, brand) {
  const client = createClient();

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

DEFAULT QUESTION BANK (adapt options to input):
Q1 — What is this piece about?
Q2 — What is the specific moment or scene?
Q3 — What are listeners/readers actually afraid of or avoiding?
Q4 — What do you want them to do differently — not think, do?
Q5 — Is there a Your Finest Hour episode that connects to this?

Every question must be answerable with one of the four options or free text.
Return ONLY the JSON object. No markdown fences. No commentary.

INPUT:
${rawInput}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  });

  return parseJSON(message.content[0].text);
}

// ── Assemble newsletter draft ─────────────────────────────────────────────────

export async function assembleNewsletter(rawInput, answers, brand) {
  const client = createClient();

  const conversation = answers
    .filter((a) => a.answer !== '[skipped]')
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n');

  const instruction = `Raw input from Norman:
${rawInput}

Q&A answers:
${conversation}

Assemble a NEWSLETTER draft using the newsletter format and voice fingerprint. Return only the newsletter draft — no commentary. 400 words maximum. Then on a new line: WORDCOUNT: [n]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  });

  return parseDraftResponse(message.content[0].text);
}

// ── Assemble podcast script ───────────────────────────────────────────────────

export async function assemblePodcast(rawInput, answers, brand) {
  const client = createClient();

  const conversation = answers
    .filter((a) => a.answer !== '[skipped]')
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n');

  const instruction = `Raw input from Norman:
${rawInput}

Q&A answers:
${conversation}

Assemble a PODCAST SCRIPT using the podcast format and voice fingerprint. This is a solo episode of Your Finest Hour. Write it as spoken word — how Norman actually talks, not how he writes. Keep the "uh" rhythm of his natural speech but clean up the filler — aim for natural without sounding scripted. 800-1000 words. Return only the script — no commentary. Then on a new line: WORDCOUNT: [n]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  });

  return parseDraftResponse(message.content[0].text);
}

// ── Revise draft ──────────────────────────────────────────────────────────────

export async function reviseDraft(currentDraft, feedback, outputType, brand) {
  const client = createClient();

  const formatNote = outputType === 'podcast'
    ? 'This is a podcast script. Keep it in spoken-word style, 800-1000 words.'
    : 'This is a newsletter. Keep it under 400 words.';

  const instruction = `Current draft:
${currentDraft}

Feedback from Norman:
${feedback}

Revise the draft based on this feedback. Apply the voice fingerprint. ${formatNote} Return only the revised draft — no commentary. Then return WORDCOUNT: [n]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    temperature: 0.7,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  });

  return parseDraftResponse(message.content[0].text);
}

// ── Discovery: find what others are saying ────────────────────────────────────

export async function discoverTopics(brand, ideasContext) {
  const client = createClient();

  const influenceNames = brand.influences.map((i) => i.name).join(', ');
  const pillars = brand.pillars.join(', ');

  const ideasNote = ideasContext
    ? `Norman also has these saved ideas to draw from:\n${ideasContext}\n\n`
    : '';

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
title: the original headline or thread opening
source: publication, person, or platform
url: direct link
why_relevant: one sentence — which pillar this connects to and why Norman's audience would care
pillar: the single most relevant brand pillar
seed_question: one question Norman could explore based on this content — in his voice

Return ONLY the JSON. No markdown fences. No commentary.`;

  const messages = [{ role: 'user', content: instruction }];
  let response;

  for (let i = 0; i < 5; i++) {
    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.7,
      system: buildSystemPrompt(brand),
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      const toolResults = response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ type: 'tool_result', tool_use_id: b.id, content: '' }));
      messages.push({ role: 'user', content: toolResults });
    } else {
      break;
    }
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text response from discovery call');

  try {
    return parseJSON(textBlock.text);
  } catch {
    return { topics: [] };
  }
}

// ── Find headlines ────────────────────────────────────────────────────────────

export async function findHeadlines(draft, brand) {
  const client = createClient();

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
plain_version: rewritten at Grade 5-6 reading level in Norman's voice — plain, not clever. If you cannot verify a source, do not include it.
Return ONLY the JSON. No markdown fences. No commentary.`;

  const messages = [{ role: 'user', content: instruction }];
  let response;

  for (let i = 0; i < 5; i++) {
    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.7,
      system: buildSystemPrompt(brand),
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    });

    if (response.stop_reason === 'end_turn') break;

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      const toolResults = response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ type: 'tool_result', tool_use_id: b.id, content: '' }));
      messages.push({ role: 'user', content: toolResults });
    } else {
      break;
    }
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text response from headlines call');

  try {
    return parseJSON(textBlock.text);
  } catch {
    return { headlines: [] };
  }
}

// ── Filter check ──────────────────────────────────────────────────────────────

export async function runFilterCheck(draft, outputType, brand) {
  const client = createClient();

  const formatNote = outputType === 'podcast'
    ? 'This is a podcast script. Evaluate it as spoken word content, not a written newsletter.'
    : 'This is a newsletter issue.';

  const instruction = `${formatNote}

Run the draft through both filters. Return JSON:
{
  "brandFilter": { "pass": true | false, "explanation": "string" },
  "promiseFilter": { "pass": true | false, "explanation": "string" }
}
BRAND FILTER: Does this help someone think more clearly about what it means to live as a modern person — without telling them what to think? Does it sound like Norman, not a content template?
PROMISE FILTER: Does this help the reader/listener act on what they already have — and does it answer somewhere: what do you actually need to make this call, and do you already have it?
If pass is true: one sentence confirming what works.
If pass is false: one sentence naming what is missing, followed by one specific fix.
Return ONLY the JSON. No markdown fences.

DRAFT:
${draft}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: instruction }],
  });

  return parseJSON(message.content[0].text);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDraftResponse(text) {
  const match = text.match(/WORDCOUNT:\s*(\d+)/);
  const wordCount = match ? parseInt(match[1], 10) : countWords(text);
  const draft = text.replace(/WORDCOUNT:\s*\d+/g, '').trim();
  return { draft, wordCount };
}

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
