const PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Fetch and parse an RSS feed via the allorigins CORS proxy.
 * Returns an array of { id, title, url, source, description, pubDate, feedName }
 */
export async function fetchFeed(feedUrl, feedName) {
  const proxied = `${PROXY}${encodeURIComponent(feedUrl)}`;
  const res = await fetch(proxied, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Failed to fetch ${feedName}: ${res.status}`);

  const text = await res.text();
  return parseFeed(text, feedName, feedUrl);
}

/**
 * Fetch multiple feeds in parallel. Returns merged + sorted by date array.
 * Feeds that fail are skipped silently.
 */
export async function fetchAllFeeds(feeds) {
  const results = await Promise.allSettled(
    feeds.map((f) => fetchFeed(f.url, f.name))
  );

  const items = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Sort by date descending
  items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return items;
}

function parseFeed(xmlText, feedName, feedUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  // Detect RSS vs Atom
  const isAtom = !!doc.querySelector('feed');
  const items = isAtom
    ? parseAtom(doc, feedName)
    : parseRSS(doc, feedName);

  return items;
}

function parseRSS(doc, feedName) {
  const items = Array.from(doc.querySelectorAll('item'));
  return items.slice(0, 20).map((item, i) => {
    const title = getText(item, 'title');
    const link = getText(item, 'link') || item.querySelector('guid')?.textContent || '';
    const description = stripHtml(getText(item, 'description') || '');
    const pubDate = getText(item, 'pubDate') || '';
    return {
      id: `${feedName}-${i}-${title.slice(0, 20)}`,
      title,
      url: link,
      source: feedName,
      description: description.slice(0, 200),
      pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      feedName,
    };
  }).filter((i) => i.title && i.url);
}

function parseAtom(doc, feedName) {
  const entries = Array.from(doc.querySelectorAll('entry'));
  return entries.slice(0, 20).map((entry, i) => {
    const title = getText(entry, 'title');
    const linkEl = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link');
    const link = linkEl?.getAttribute('href') || '';
    const summary = stripHtml(getText(entry, 'summary') || getText(entry, 'content') || '');
    const published = getText(entry, 'published') || getText(entry, 'updated') || '';
    return {
      id: `${feedName}-${i}-${title.slice(0, 20)}`,
      title,
      url: link,
      source: feedName,
      description: summary.slice(0, 200),
      pubDate: published ? new Date(published).toISOString() : new Date().toISOString(),
      feedName,
    };
  }).filter((i) => i.title && i.url);
}

function getText(el, tag) {
  return el.querySelector(tag)?.textContent?.trim() || '';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
