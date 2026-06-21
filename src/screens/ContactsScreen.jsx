import { useState } from 'react'

// ── Storage ───────────────────────────────────────────────────────────────────

function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def } catch { return def } }
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

const TYPES = {
  committee: { label: 'Committee',  color: '#9B7FD4' },
  guest:     { label: 'Guest',      color: '#5DCAA5' },
  network:   { label: 'Network',    color: '#85B7EB' },
  advisor:   { label: 'Advisor',    color: '#EF9F27' },
  other:     { label: 'Other',      color: '#6a7a8a' },
}

const DEFAULT_CONTACTS = [
  {
    id: 1,
    name: 'Gene Coughlin',
    type: 'committee',
    role: 'External chair / RBLP',
    org: '',
    lastAction: 'Sent dissertation chapter outline — awaiting feedback',
    nextAction: 'Write-up due 2026-06-30; RSVP Oct cohort 2026-08-01',
    notes: 'External committee chair. Key connector for practitioner credibility. See §8.3 of strategy doc for context on relationship arc.',
    tags: ['dissertation', 'external-chair'],
    updatedAt: new Date().toISOString(),
  },
]

const DEFAULT_PATTERNS = [
  {
    id: 1,
    problem: 'Practitioners can\'t connect learning theory to their daily decisions — they\'re told to "reflect" but nobody shows them how.',
    source: 'Recurring across advisory conversations',
    date: new Date().toISOString(),
  },
]

// ── Contacts tab ──────────────────────────────────────────────────────────────

function ContactCard({ contact, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const type = TYPES[contact.type] || TYPES.other

  function startEdit(field) {
    setEditing(field)
    setDraft({ ...contact })
  }

  function commitEdit() {
    if (!editing) return
    onUpdate({ ...draft })
    setEditing(null)
  }

  return (
    <div className="border border-[#1e3a5f] rounded-xl overflow-hidden bg-[#0d1829]">
      {/* Summary row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#112040] transition-colors"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0 mt-0.5"
          style={{ background: type.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
          <p className="text-[11px] text-[#4a6080] truncate">{contact.role}</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
          style={{ color: type.color, borderColor: type.color + '55', background: type.color + '18' }}
        >
          {type.label}
        </span>
        <span className="text-[#4a6080] text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {/* Detail */}
      {open && (
        <div className="px-4 pb-4 border-t border-[#1e3a5f] pt-3 flex flex-col gap-3">
          {['lastAction', 'nextAction', 'notes'].map(field => (
            <div key={field}>
              <p className="text-[10px] uppercase tracking-widest text-[#4a6080] mb-1">
                {field === 'lastAction' ? 'Last Action' : field === 'nextAction' ? 'Next Action' : 'Notes'}
              </p>
              {editing === field ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    autoFocus
                    value={draft[field] || ''}
                    onChange={e => setDraft(d => ({ ...d, [field]: e.target.value }))}
                    rows={3}
                    className="w-full bg-[#0a1628] border border-[#4a6090] rounded-lg px-3 py-2 text-slate-200 text-xs leading-relaxed resize-none focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={commitEdit} className="px-3 py-1.5 bg-[#c5a028] text-[#071020] text-xs font-semibold rounded-lg">Save</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-slate-500 text-xs border border-[#1e3a5f] rounded-lg hover:text-white transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(field)}
                  className="w-full text-left text-xs text-slate-300 leading-relaxed hover:text-white transition-colors"
                >
                  {contact[field] || <span className="text-[#3a5070] italic">Click to add…</span>}
                </button>
              )}
            </div>
          ))}
          {contact.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map(t => (
                <span key={t} className="text-[10px] text-[#4a6080] bg-[#0a1628] border border-[#1e3a5f] px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContactsTab() {
  const [contacts, setContacts] = useState(() => load('contacts_list', DEFAULT_CONTACTS))
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'network', role: '', lastAction: '', nextAction: '', notes: '' })

  function updateContact(updated) {
    const next = contacts.map(c => c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c)
    setContacts(next)
    save('contacts_list', next)
  }

  function addContact() {
    if (!form.name.trim()) return
    const next = [{ ...form, id: Date.now(), tags: [], updatedAt: new Date().toISOString() }, ...contacts]
    setContacts(next)
    save('contacts_list', next)
    setForm({ name: '', type: 'network', role: '', lastAction: '', nextAction: '', notes: '' })
    setAdding(false)
  }

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.type === filter)

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', ...Object.keys(TYPES)].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filter === t
                ? 'bg-[#c5a028] border-[#c5a028] text-[#071020]'
                : 'border-[#1e3a5f] text-[#4a6080] hover:text-white hover:border-[#4a6090]'
            }`}
          >
            {t === 'all' ? 'All' : TYPES[t].label}
          </button>
        ))}
        <button
          onClick={() => setAdding(a => !a)}
          className="ml-auto px-3 py-1 rounded-full text-xs font-medium border border-[#c5a028] text-[#c5a028] hover:bg-[#c5a028] hover:text-[#071020] transition-all"
        >
          + Add
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="border border-[#1e3a5f] rounded-xl px-4 py-4 bg-[#0d1829] flex flex-col gap-3">
          <p className="text-xs font-semibold text-white">New contact</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-[#4a6090]"
            />
            <input
              placeholder="Role / title"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-[#4a6090]"
            />
          </div>
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="bg-[#0a1628] border border-[#2a4070] rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none"
          >
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={addContact} className="px-4 py-2 bg-[#c5a028] text-[#071020] text-xs font-semibold rounded-lg">Add contact</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-slate-500 text-xs border border-[#1e3a5f] rounded-lg hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Contact list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-sm text-[#3a5070] text-center py-8">No contacts yet.</p>
        )}
        {filtered.map(c => (
          <ContactCard key={c.id} contact={c} onUpdate={updateContact} />
        ))}
      </div>
    </div>
  )
}

// ── Patterns tab ──────────────────────────────────────────────────────────────

function PatternsTab() {
  const [patterns, setPatterns] = useState(() => load('patterns_list', DEFAULT_PATTERNS))
  const [draft, setDraft] = useState('')

  function addPattern() {
    const t = draft.trim()
    if (!t) return
    const next = [{ id: Date.now(), problem: t, source: 'Weekly log', date: new Date().toISOString() }, ...patterns]
    setPatterns(next)
    save('patterns_list', next)
    setDraft('')
  }

  function deletePattern(id) {
    const next = patterns.filter(p => p.id !== id)
    setPatterns(next)
    save('patterns_list', next)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[#1e3a5f] rounded-xl px-4 py-4 bg-[#0d1829]">
        <p className="text-xs font-semibold text-white mb-1">Log a pattern</p>
        <p className="text-[11px] text-[#4a6080] mb-3">Recurring problems you hear from guests or the audience. Raw material for the eventual framework.</p>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addPattern() }}
          placeholder="The recurring problem you noticed this week..."
          rows={3}
          className="w-full bg-[#0a1628] border border-[#2a4070] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#4a6090] transition-colors"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] text-[#3a5070]">Cmd+Enter to log</span>
          <button
            onClick={addPattern}
            disabled={!draft.trim()}
            className="px-4 py-2 bg-[#c5a028] text-[#071020] text-xs font-semibold rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Log pattern →
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {patterns.length === 0 && (
          <p className="text-sm text-[#3a5070] text-center py-8">No patterns logged yet.</p>
        )}
        {patterns.map((p, i) => (
          <div key={p.id} className="border border-[#1e3a5f] rounded-xl px-4 py-3 bg-[#0d1829] flex gap-3 group">
            <span className="text-xs text-[#3a5070] font-mono mt-0.5 shrink-0">#{patterns.length - i}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 leading-relaxed">{p.problem}</p>
              <p className="text-[10px] text-[#3a5070] mt-1">{p.source} · {new Date(p.date).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => deletePattern(p.id)}
              className="text-[#2a4070] hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ContactsScreen() {
  const [tab, setTab] = useState('contacts')

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a1628]">
      <div className="px-6 py-5 min-w-0 max-w-3xl">

        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Contacts</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">Relationships + audience patterns log</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-[#1e3a5f]">
            {['contacts', 'patterns'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  tab === t
                    ? 'bg-[#c5a028] text-[#071020]'
                    : 'bg-[#0d1829] text-[#4a6080] hover:text-white'
                }`}
              >
                {t === 'contacts' ? 'Contacts' : 'Patterns Log'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'contacts' && <ContactsTab />}
        {tab === 'patterns' && <PatternsTab />}

      </div>
    </div>
  )
}
