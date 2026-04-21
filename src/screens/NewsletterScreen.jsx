import { useState } from 'react'

const SECTIONS = [
  {
    id: 'loop',
    title: 'The Writing Loop',
    subtitle: '6 steps, repeat every week',
    color: '#c5a028',
    steps: [
      {
        num: 1,
        label: 'Choose Your Idea',
        body: 'Pick one idea from your board. The best ideas are things you\'ve been thinking about for a while — not just what happened this week.',
      },
      {
        num: 2,
        label: 'Ask 3 Questions',
        body: [
          'What is the main point I want to make?',
          'Why does this matter to my reader right now?',
          'What is the one thing I want them to do or feel after reading?',
        ],
      },
      {
        num: 3,
        label: 'Write Without Judgment',
        body: 'Get it out. Don\'t edit while you write. Write the whole draft before you touch a word. Silence the inner critic — it has no place in the first draft.',
      },
      {
        num: 4,
        label: 'Become the Reader',
        body: 'Read it cold. Ask: does this land? Does it move? Would I forward this to someone? Where does it drag?',
      },
      {
        num: 5,
        label: 'Question and Object',
        body: 'Be your own toughest reader. What would a skeptic say? What assumption are you making that isn\'t earned? Cut anything that doesn\'t serve the main point.',
      },
      {
        num: 6,
        label: 'Format for Engagement',
        body: 'Short paragraphs. White space. No bullet lists. One idea per paragraph. The last line of a section should pull the reader into the next.',
      },
    ],
  },
  {
    id: 'structure',
    title: 'Newsletter Structure',
    subtitle: 'The anatomy of every issue',
    color: '#3b82f6',
    steps: [
      {
        label: '1 Topic',
        body: 'One idea, explored fully. Not three ideas explored shallowly. The topic is the load-bearing wall — everything else hangs from it.',
      },
      {
        label: '3+ Key Points',
        body: 'Each key point supports the main topic. They should stack — each one building on the last, not repeating it.',
      },
      {
        label: 'Problem → Insight → Solution',
        body: 'Every newsletter follows this arc. Name the problem your reader already feels. Give them the insight that reframes it. Then give them the move.',
      },
      {
        label: 'Filler Ideas',
        body: 'Quotes, stats, short anecdotes, or examples that support the key points. Use them to break rhythm, not to pad.',
      },
    ],
  },
  {
    id: 'topics',
    title: 'Generating Topics',
    subtitle: 'The 3 filters before you pick',
    color: '#10b981',
    steps: [
      {
        label: 'Reach',
        body: 'Would this topic resonate with more than just me? If it\'s purely personal, it needs a universal bridge.',
      },
      {
        label: 'Relevance',
        body: 'Is this relevant to my reader\'s actual life — not just adjacent to it? Ask: would this come up in a real conversation?',
      },
      {
        label: 'Resonance',
        body: 'Does this idea have emotional pull? Would someone forward it? The best topics feel like they name something the reader already knew but couldn\'t articulate.',
      },
    ],
  },
  {
    id: 'outline',
    title: 'The Outline',
    subtitle: 'Most important part — built at the start of the week',
    color: '#a855f7',
    steps: [
      {
        label: 'Start of Week: Set the Frame',
        body: 'Write the topic and the one-sentence point. Pin the three key ideas you want to make. Don\'t write prose yet — just the skeleton.',
      },
      {
        label: 'Throughout the Week: Collect',
        body: 'Everything you read, notice, or experience goes through the filter: does this support my outline? Drop supporting ideas, quotes, stats, and stories into the relevant slots.',
      },
      {
        label: 'Writing Day: Fill the Frame',
        body: 'By writing day, the outline is full. You\'re not generating — you\'re assembling and polishing. This is why outlining first saves hours.',
      },
    ],
  },
  {
    id: 'ideatypes',
    title: 'Idea Types',
    subtitle: 'Two categories: starter/transition and explanatory',
    color: '#f59e0b',
    steps: [
      {
        label: 'Starter / Transition Ideas',
        body: [
          'Big Ideas — a core claim or reframe',
          'Quotes — from a book, person, or conversation',
          'Stats — a number that surprises or proves',
          'Problems — something your reader is experiencing',
          'Experiences — a personal moment with universal meaning',
        ],
      },
      {
        label: 'Explanatory Ideas',
        body: [
          'Anecdotes — short stories that illustrate a point',
          'Concepts — frameworks or models',
          'Insights — the non-obvious takeaway',
          'Metaphors — translate abstract to concrete',
          'Action Steps — the specific move',
          'Examples — proof that the idea works in the real world',
        ],
      },
    ],
  },
  {
    id: 'intro',
    title: 'Writing the Introduction',
    subtitle: 'First lines determine if anyone reads the rest',
    color: '#ef4444',
    steps: [
      {
        label: 'Illustrate What People Do Wrong',
        body: 'Open by naming the mistake most people make. This creates instant recognition. Your reader thinks: "That\'s me." Now you have them.',
      },
      {
        label: 'Personal Story or Direct Statement',
        body: 'Either open with a specific personal moment (not generic — specific) or a direct, confident claim. Don\'t ease in. Don\'t hedge.',
      },
      {
        label: 'The Big Idea + Support',
        body: 'After the hook, state the big idea clearly. Then support it with one example, one stat, or one quote. Now the reader knows what they\'re getting and why it matters.',
      },
    ],
  },
  {
    id: 'frameworks',
    title: 'Three Newsletter Frameworks',
    subtitle: 'Pick based on where your reader is',
    color: '#06b6d4',
    steps: [
      {
        label: 'Beginner: Pain & Process',
        body: 'Name the pain → give the process to solve it. Simple, direct, actionable. Best for readers who are just starting to think about this problem.',
        tag: 'Beginner',
      },
      {
        label: 'Intermediate: Pain + Concept + Process',
        body: 'Name the pain → introduce a reframing concept → give the process. Best for readers who\'ve tried solutions before and need a new mental model first.',
        tag: 'Intermediate',
      },
      {
        label: 'Advanced: Perspective + Advantage + Gamify',
        body: 'Share a unique perspective → show the unfair advantage it creates → turn it into a system they can run. Best for readers who already know the basics and want the edge.',
        tag: 'Advanced',
      },
    ],
  },
  {
    id: 'dissector',
    title: 'Newsletter Dissector Prompt',
    subtitle: 'AI content analysis — use on any newsletter you want to study',
    color: '#64748b',
    prompt: true,
    body: `You are a master content analyst and newsletter strategist. I'm going to share a newsletter with you. Your job is to dissect it completely.

Analyze the following:

1. HOOK — How does it open? What technique is used? Would you keep reading?

2. STRUCTURE — What is the overall arc? Problem → Insight → Solution? Another pattern? How do the sections connect?

3. VOICE — How would you describe the voice? What makes it distinct? What would be lost if it were more generic?

4. KEY POINTS — List the 2-4 main ideas. Are they stacked (each building on the last) or parallel (each independent)?

5. FILLER — What supporting material is used? Quotes, stats, anecdotes, metaphors? How do they land?

6. INTRODUCTION TECHNIQUE — Which intro type? Personal story, direct statement, or naming what people do wrong?

7. FRAMEWORK — Which of the three frameworks? Pain & Process, Pain + Concept + Process, or Perspective + Advantage + Gamify?

8. WHAT WORKS — The 3 specific things this newsletter does well.

9. WHAT TO STEAL — One technique from this newsletter you could apply to your own writing immediately.

[PASTE NEWSLETTER HERE]`,
  },
]

function StepList({ steps }) {
  return (
    <div className="flex flex-col gap-3 mt-3">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3">
          {step.num != null && (
            <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-[#7a9ab5] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {step.num}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-white text-sm font-semibold">{step.label}</p>
              {step.tag && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1e3a5f] text-[#7a9ab5]">
                  {step.tag}
                </span>
              )}
            </div>
            {Array.isArray(step.body) ? (
              <ul className="mt-1 flex flex-col gap-0.5">
                {step.body.map((line, j) => (
                  <li key={j} className="text-[#7a9ab5] text-sm flex gap-2">
                    <span className="text-[#3b5070] shrink-0">–</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[#7a9ab5] text-sm mt-1 leading-relaxed">{step.body}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function PromptBlock({ body }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="mt-3 relative">
      <pre className="bg-[#071020] border border-[#1e3a5f] rounded-lg p-4 text-[#7a9ab5] text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
        {body}
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-[#1e3a5f] text-[#7a9ab5] hover:text-white hover:bg-[#2a4070] transition-colors"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

function Section({ section }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-[#1e3a5f] bg-[#0d1f38] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#112040] transition-colors"
      >
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: section.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{section.title}</p>
          <p className="text-[#4a6080] text-xs mt-0.5">{section.subtitle}</p>
        </div>
        <span className="text-[#4a6080] text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {section.prompt ? (
            <PromptBlock body={section.body} />
          ) : (
            <StepList steps={section.steps} />
          )}
        </div>
      )}
    </div>
  )
}

export default function NewsletterScreen() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 md:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">

        <div className="mb-2">
          <h1 className="text-white font-bold text-xl">Newsletter</h1>
          <p className="text-[#4a6080] text-sm mt-1">
            The writing process, top to bottom. Follow the loop, use the frameworks.
          </p>
        </div>

        {SECTIONS.map(section => (
          <Section key={section.id} section={section} />
        ))}

      </div>
    </div>
  )
}
