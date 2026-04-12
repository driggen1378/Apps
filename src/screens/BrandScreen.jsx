import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function BrandScreen() {
  const { state, dispatch } = useApp();
  const brand = state.brand;
  const [saved, setSaved] = useState(false);
  const [newInfluence, setNewInfluence] = useState({ name: '', handle: '', topic: '' });
  const [newFeed, setNewFeed] = useState({ name: '', url: '' });

  function update(field, value) {
    dispatch({ type: 'UPDATE_BRAND', updates: { [field]: value } });
  }

  function updatePillar(index, value) {
    const pillars = [...brand.pillars];
    pillars[index] = value;
    update('pillars', pillars);
  }

  function addPillar() {
    update('pillars', [...brand.pillars, '']);
  }

  function removePillar(index) {
    update('pillars', brand.pillars.filter((_, i) => i !== index));
  }

  function addInfluence() {
    if (!newInfluence.name.trim()) return;
    update('influences', [...brand.influences, { ...newInfluence }]);
    setNewInfluence({ name: '', handle: '', topic: '' });
  }

  function removeInfluence(index) {
    update('influences', brand.influences.filter((_, i) => i !== index));
  }

  function addFeed() {
    if (!newFeed.name.trim() || !newFeed.url.trim()) return;
    const url = newFeed.url.startsWith('http') ? newFeed.url : `https://${newFeed.url}`;
    update('rssFeeds', [...brand.rssFeeds, { name: newFeed.name.trim(), url }]);
    setNewFeed({ name: '', url: '' });
  }

  function removeFeed(index) {
    update('rssFeeds', brand.rssFeeds.filter((_, i) => i !== index));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Brand Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Injected into every Claude call. Changes take effect immediately.</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-white text-[#0f1117] text-sm font-semibold rounded-lg hover:bg-slate-100 transition-all"
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {/* Identity */}
        <Section title="Identity">
          <Field label="Your name">
            <input value={brand.name} onChange={(e) => update('name', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Newsletter name">
            <input value={brand.newsletter} onChange={(e) => update('newsletter', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Podcast name">
            <input value={brand.podcast} onChange={(e) => update('podcast', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Mission / tagline">
            <textarea value={brand.tagline} onChange={(e) => update('tagline', e.target.value)}
              rows={2} className={textareaCls} />
          </Field>
        </Section>

        {/* Audience */}
        <Section title="Audience">
          <Field label="Who are they">
            <textarea value={brand.audience} onChange={(e) => update('audience', e.target.value)}
              rows={3} className={textareaCls} />
          </Field>
          <Field label="Stands for">
            <input value={brand.standFor} onChange={(e) => update('standFor', e.target.value)}
              className={inputCls} />
          </Field>
          <Field label="Stands against">
            <input value={brand.standAgainst} onChange={(e) => update('standAgainst', e.target.value)}
              className={inputCls} />
          </Field>
        </Section>

        {/* Pillars */}
        <Section title="Content Pillars">
          <div className="flex flex-col gap-2">
            {brand.pillars.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input value={p} onChange={(e) => updatePillar(i, e.target.value)}
                  placeholder={`Pillar ${i + 1}`} className={`${inputCls} flex-1`} />
                <button onClick={() => removePillar(i)}
                  className="text-slate-600 hover:text-red-400 px-2 transition-colors text-sm">✕</button>
              </div>
            ))}
            <button onClick={addPillar}
              className="text-xs text-slate-500 hover:text-white border border-dashed border-[#2a2d3e] hover:border-slate-500 rounded-lg px-3 py-2 transition-all text-left">
              + Add pillar
            </button>
          </div>
        </Section>

        {/* Voice fingerprint */}
        <Section title="Voice Fingerprint">
          <p className="text-xs text-slate-500 mb-2">Pre-filled from your newsletters and podcast episodes. Edit to refine.</p>
          <textarea value={brand.voiceFingerprint}
            onChange={(e) => update('voiceFingerprint', e.target.value)}
            rows={14} className={textareaCls} />
        </Section>

        {/* Influences */}
        <Section title="Influences">
          <p className="text-xs text-slate-500 mb-3">Used to filter discovery results and web searches.</p>
          <div className="flex flex-col gap-2 mb-3">
            {brand.influences.map((inf, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#141620] border border-[#2a2d3e] rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{inf.name}</p>
                  <p className="text-xs text-slate-500 truncate">{inf.handle} · {inf.topic}</p>
                </div>
                <button onClick={() => removeInfluence(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-sm shrink-0">✕</button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border border-dashed border-[#2a2d3e] rounded-lg p-3">
            <p className="text-xs text-slate-500">Add influence</p>
            <input value={newInfluence.name} onChange={(e) => setNewInfluence((n) => ({ ...n, name: e.target.value }))}
              placeholder="Name (e.g. Dan Koe)" className={inputCls} />
            <input value={newInfluence.handle} onChange={(e) => setNewInfluence((n) => ({ ...n, handle: e.target.value }))}
              placeholder="Handle (e.g. @thedankoe)" className={inputCls} />
            <input value={newInfluence.topic} onChange={(e) => setNewInfluence((n) => ({ ...n, topic: e.target.value }))}
              placeholder="Topics (e.g. one-person business, creative work)" className={inputCls} />
            <button onClick={addInfluence}
              className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg px-3 py-2 transition-all">
              Add →
            </button>
          </div>
        </Section>

        {/* RSS feeds */}
        <Section title="RSS Feeds">
          <p className="text-xs text-slate-500 mb-3">Feeds shown in the Ideas section. Fetched fresh each time you open Ideas.</p>
          <div className="flex flex-col gap-2 mb-3">
            {brand.rssFeeds.length === 0 && (
              <p className="text-xs text-slate-600 italic">No feeds yet. Add your influences' blogs, newsletters, or podcasts below.</p>
            )}
            {brand.rssFeeds.map((feed, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#141620] border border-[#2a2d3e] rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{feed.name}</p>
                  <p className="text-xs text-slate-500 truncate">{feed.url}</p>
                </div>
                <button onClick={() => removeFeed(i)}
                  className="text-slate-600 hover:text-red-400 transition-colors text-sm shrink-0">✕</button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 border border-dashed border-[#2a2d3e] rounded-lg p-3">
            <p className="text-xs text-slate-500">Add RSS feed</p>
            <input value={newFeed.name} onChange={(e) => setNewFeed((f) => ({ ...f, name: e.target.value }))}
              placeholder="Feed name (e.g. Dan Koe)" className={inputCls} />
            <input value={newFeed.url} onChange={(e) => setNewFeed((f) => ({ ...f, url: e.target.value }))}
              placeholder="RSS URL (e.g. https://thedankoe.com/feed)" className={inputCls} />
            <button onClick={addFeed}
              className="text-xs text-slate-300 hover:text-white border border-[#2a2d3e] hover:border-slate-500 rounded-lg px-3 py-2 transition-all">
              Add feed →
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-[#141620] border border-[#2a2d3e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500 transition-colors';
const textareaCls = `${inputCls} resize-none leading-relaxed`;
