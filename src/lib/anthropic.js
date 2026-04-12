import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `ROLE: You are a newsletter editor and thinking partner for Norman Driggers (RUFIO). Your job is to help him extract, shape, and publish one issue of Lessons Learned. You do not write for him. You organize and assemble what he gives you.

BRAND CONTEXT:
Newsletter: Lessons Learned | Frequency: Twice weekly
Author: Norman Driggers — former USAF Weapons School Instructor, Ed.D. candidate in Organizational Leadership. Goes by RUFIO.
Mission: Helping people find better ways to think about the lives they're building and the people they influence.
Audience: Thoughtful, growth-minded adults who take work and life seriously but do not want to become rigid, performative, or derivative. Overloaded with advice, skeptical of extremes, tired of borrowed beliefs.
Core promise: Every issue helps the reader act on what they already have.

VOICE AND TONE:
Curious, useful, slightly skeptical, conversational, mildly funny, not polished to death, not trying to sound important. Anti-guru. No performance of wisdom. Clear, current, intelligent, masculine without trying, socially aware, not academic, not self-help cheesy.

VOICE RULES:
1. Use 95%+ of Norman's exact words. Do not replace with AI alternatives or elevated language.
2. Colloquialisms are not errors. Keep them.
3. Remove only: redundancy, filler, tangents that do not serve the format.
4. Fix grammar and punctuation only where broken. Do not rewrite for style.
5. No sentences fewer than 3-5 words. No fragments used for emphasis.
6. Grade 5-6 reading level throughout.
7. If a section is thin — flag it. Do not pad it.

READER-CENTERING RULE:
Norman speaks in I and me language. Keep it — it makes it relatable. But the insight must land on the reader, not stay with Norman. Test: does the reader think "that happened to him" or "that happens to me"? It should be the second one.

TARGET FORMAT (400 words maximum):
Hi friend,

[Hook — one story detail or quote that earned what follows. Specific. Not a thesis.]

[Very short story + practical application — insight lands on the reader, not on Norman.]

[What this means — the decision frame, not the answer. Never prescriptive. Never "you should."]

[Podcast CTA — one sentence only, only if directly connected. Never forced.]

[Closing comment — one sentence, personal, direct. Not a summary. Not a moral.]

Fights On,
RUFIO`;

export function createClient() {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file.');
  }
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

export { SYSTEM_PROMPT };

/**
 * Assess raw input — returns { assessment, questions }
 */
export async function assessInput(rawInput) {
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
The options must be specific to what is actually in the input — not generic. The default question bank below is a fallback, not a script. Adapt the options to match the content Norman gave you.

DEFAULT QUESTION BANK (adapt options to input):
Q1 — What is this issue about?
Q2 — What is the specific moment or scene?
Q3 — What are readers actually afraid of or avoiding?
Q4 — What do you want the reader to do differently — not think, do?
Q5 — Is there a Your Finest Hour episode that connects to this?

Every question must also include option E: "None of these — here is mine" as a free-text field.

Return ONLY the JSON object. No explanation, no markdown fences, no commentary.

INPUT:
${rawInput}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: instruction }],
  });

  const text = message.content[0].text.trim();
  // Strip markdown fences if Claude wraps in them
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

/**
 * Assemble draft from raw input + Q&A answers
 * answers: array of { question, answer } objects
 */
export async function assembleDraft(rawInput, answers) {
  const client = createClient();

  const conversation = answers
    .map((a) => `Q: ${a.question}\nA: ${a.answer}`)
    .join('\n\n');

  const instruction = `Here is the raw input Norman provided:

${rawInput}

Here are the Q&A answers:

${conversation}

Assemble the first draft using the target format and voice rules. Return only the newsletter draft — no commentary above or below it. 400 words maximum. Then on a new line after the draft return the word count as: WORDCOUNT: [n]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: instruction }],
  });

  return parseDraftResponse(message.content[0].text);
}

/**
 * Revise draft based on feedback
 */
export async function reviseDraft(currentDraft, feedback) {
  const client = createClient();

  const instruction = `Here is the current draft:

${currentDraft}

Feedback from Norman:
${feedback}

Revise the draft based on this feedback. Apply the voice rules. Return only the revised draft — no commentary. Then return WORDCOUNT: [n]`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: instruction }],
  });

  return parseDraftResponse(message.content[0].text);
}

/**
 * Search for trending headlines related to the draft topic.
 * The web_search_20250305 tool is a server-side built-in tool — the API
 * handles execution automatically and returns a final text response.
 */
export async function findHeadlines(draft) {
  const client = createClient();

  const instruction = `Search for 3-5 trending article headlines, newsletter subject lines, or widely-shared pieces related to the core topic of this newsletter issue.

The draft:
${draft}

After searching, return results as a JSON object with this exact shape:
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
For each result: headline is the original title, source is the publication name, url is the link, plain_version is the headline rewritten at Grade 5-6 reading level in Norman's voice — plain, not clever, not smart-sounding. If you cannot verify a source, do not include it.

Return ONLY the JSON object. No markdown fences. No commentary before or after.`;

  const messages = [{ role: 'user', content: instruction }];

  // Agentic loop — web_search is a server-side tool; the API may use
  // tool_use blocks internally. We keep sending until stop_reason is end_turn.
  let response;
  for (let i = 0; i < 5; i++) {
    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages,
    });

    if (response.stop_reason === 'end_turn') break;

    // If Claude used tool(s) and needs to continue, append and loop
    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      const toolResults = response.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({
          type: 'tool_result',
          tool_use_id: b.id,
          content: '',
        }));
      messages.push({ role: 'user', content: toolResults });
    } else {
      break;
    }
  }

  // Extract the last text block from the final response
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text response from headlines call');

  const text = textBlock.text.trim();
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If Claude can't return clean JSON, return empty so UI can show a graceful message
    return { headlines: [] };
  }
}

/**
 * Run filter check on final draft
 */
export async function runFilterCheck(draft) {
  const client = createClient();

  const instruction = `Run the draft through both filters. Return JSON:
{
  "brandFilter": {
    "pass": true | false,
    "explanation": "string"
  },
  "promiseFilter": {
    "pass": true | false,
    "explanation": "string"
  }
}
BRAND FILTER: Does this help someone think more clearly about what it means to live as a modern person — without telling them what to think?
PROMISE FILTER: Does this help the reader act on what they already have — and does it answer somewhere: what do you actually need to make this call, and do you already have it?
If pass is true: explanation is one sentence confirming what works.
If pass is false: explanation is one sentence naming exactly what is missing, followed by one specific fix.

Return ONLY the JSON object. No explanation, no markdown fences, no commentary.

DRAFT:
${draft}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: instruction }],
  });

  const text = message.content[0].text.trim();
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDraftResponse(text) {
  const match = text.match(/WORDCOUNT:\s*(\d+)/);
  const wordCount = match ? parseInt(match[1], 10) : countWords(text);
  const draft = text.replace(/WORDCOUNT:\s*\d+/g, '').trim();
  return { draft, wordCount };
}

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
