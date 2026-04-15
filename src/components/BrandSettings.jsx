import { useState } from 'react'
import { storage } from '../lib/storage'

const INPUT = 'w-full bg-[#0a1628] border border-[#2a4070] rounded px-3 py-2 text-white text-sm placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors'
const BTN_GOLD  = 'bg-[#c5a028] text-[#071020] px-4 py-2 rounded text-sm font-bold hover:bg-[#d9b030] transition-colors shrink-0'
const BTN_GHOST = 'border border-[#2a4070] text-[#8a9db5] px-4 py-2 rounded text-sm hover:border-[#c5a028] hover:text-[#c5a028] transition-colors shrink-0'

export default function BrandSettings() {
  const [brand, setBrand]   = useState(storage.getBrand)
  const [apiKey, setApiKey] = useState(storage.getKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [newPillar, setNewPillar] = useState('')
  const [newFeed,   setNewFeed]   = useState('')
  const [newInf, setNewInf] = useState({ name: '', handle: '', topic: '' })

  function save() {
    storage.setBrand(brand)
    storage.setKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const upd = (field, val) => setBrand(b => ({ ...b, [field]: val }))

  function addPillar() {
    if (!newPillar.trim()) return
    upd('pillars', [...(brand.pillars || []), newPillar.trim()])
    setNewPillar('')
  }
  function addFeed() {
    if (!newFeed.trim()) return
    upd('rssFeeds', [...(brand.rssFeeds || []), newFeed.trim()])
    setNewFeed('')
  }
  function addInfluence() {
    if (!newInf.name.trim()) return
    upd('influences', [...(brand.influences || []), { ...newInf }])
    setNewInf({ name: '', handle: '', topic: '' })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-[#c5a028] text-2xl font-bold mb-8">Brand Settings</h1>

        <Section title="API Key">
          <p className="text-[#6a80a0] text-xs mb-2">
            Get your key at console.anthropic.com. Stored only in your browser, never sent anywhere else.
          </p>
          <div className="flex gap-2">
            <input type={showKey ? 'text' : 'password'} value={apiKey}
              onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..."
              className={INPUT} />
            <button onClick={() => setShowKey(s => !s)} className={BTN_GHOST}>
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </Section>

        <Section title="Identity">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Author name"      value={brand.authorName}     onChange={v => upd('authorName', v)} />
            <Field label="Brand name"       value={brand.name}           onChange={v => upd('name', v)} />
            <Field label="Newsletter name"  value={brand.newsletterName} onChange={v => upd('newsletterName', v)} />
            <Field label="Podcast name"     value={brand.podcastName}    onChange={v => upd('podcastName', v)} />
          </div>
          <Field label="Tagline" value={brand.tagline} onChange={v => upd('tagline', v)} className="mt-3" />
        </Section>

        <Section title="Audience & Values">
          <Field label="Audience"      value={brand.audience}      onChange={v => upd('audience', v)} />
          <Field label="Stands for"    value={brand.standsFor}     onChange={v => upd('standsFor', v)}    className="mt-3" />
          <Field label="Stands against" value={brand.standsAgainst} onChange={v => upd('standsAgainst', v)} className="mt-3" />
        </Section>

        <Section title="Content Pillars">
          <div className="flex flex-wrap gap-2 mb-3">
            {(brand.pillars || []).map((p, i) => (
              <span key={i} className="flex items-center gap-1 bg-[#1a3060] border border-[#2a4070] rounded px-3 py-1 text-sm text-white">
                {p}
                <button onClick={() => upd('pillars', brand.pillars.filter((_, j) => j !== i))}
                  className="text-[#6a80a0] hover:text-red-400 ml-1 text-xs">✕</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newPillar} onChange={e => setNewPillar(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPillar()}
              placeholder="Add pillar..." className={INPUT} />
            <button onClick={addPillar} className={BTN_GOLD}>Add</button>
          </div>
        </Section>

        <Section title="Voice Fingerprint">
          <textarea value={brand.voiceFingerprint || ''}
            onChange={e => upd('voiceFingerprint', e.target.value)}
            rows={6} className={`${INPUT} resize-none`} />
        </Section>

        <Section title="Influences">
          <ul className="space-y-2 mb-3">
            {(brand.influences || []).map((inf, i) => (
              <li key={i} className="flex items-center gap-3 bg-[#1a3060] border border-[#2a4070] rounded px-4 py-2 text-sm">
                <span className="text-white font-medium">{inf.name}</span>
                <span className="text-[#6a80a0]">{inf.handle}</span>
                <span className="text-[#4a6080] flex-1 truncate">{inf.topic}</span>
                <button onClick={() => upd('influences', brand.influences.filter((_, j) => j !== i))}
                  className="text-[#6a80a0] hover:text-red-400 text-xs shrink-0">✕</button>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['name','handle','topic'].map(f => (
              <input key={f} value={newInf[f]}
                onChange={e => setNewInf(s => ({ ...s, [f]: e.target.value }))}
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                className={INPUT} />
            ))}
          </div>
          <button onClick={addInfluence} className={BTN_GHOST}>+ Add influence</button>
        </Section>

        <Section title="RSS Feeds">
          <ul className="space-y-2 mb-3">
            {(brand.rssFeeds || []).map((url, i) => (
              <li key={i} className="flex items-center gap-3 bg-[#1a3060] border border-[#2a4070] rounded px-4 py-2 text-sm">
                <span className="text-[#8a9db5] flex-1 truncate">{url}</span>
                <button onClick={() => upd('rssFeeds', brand.rssFeeds.filter((_, j) => j !== i))}
                  className="text-[#6a80a0] hover:text-red-400 text-xs shrink-0">✕</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input value={newFeed} onChange={e => setNewFeed(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addFeed()}
              placeholder="https://..." className={INPUT} />
            <button onClick={addFeed} className={BTN_GOLD}>Add</button>
          </div>
        </Section>

        <div className="mt-8 pb-8">
          <button onClick={save}
            className="bg-[#c5a028] text-[#071020] px-8 py-3 rounded-lg font-bold hover:bg-[#d9b030] transition-colors">
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-[#c5a028] text-xs font-bold uppercase tracking-wider mb-3">{title}</h2>
      <div className="bg-[#112040] border border-[#2a4070] rounded-lg p-5">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[#8a9db5] text-xs font-medium mb-1">{label}</label>
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0a1628] border border-[#2a4070] rounded px-3 py-2 text-white text-sm placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors" />
    </div>
  )
}
