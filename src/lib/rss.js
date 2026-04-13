const PROXY = 'https://api.allorigins.win/get?url='

export async function fetchFeed(url) {
  const res = await fetch(PROXY + encodeURIComponent(url))
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  const { contents } = await res.json()
  const doc = new DOMParser().parseFromString(contents, 'text/xml')
  return Array.from(doc.querySelectorAll('item, entry')).slice(0, 20).map((item, i) => ({
    id: (item.querySelector('guid, id')?.textContent || `${url}-${i}`).trim(),
    title: item.querySelector('title')?.textContent?.trim() || 'Untitled',
    link: (
      item.querySelector('link')?.textContent?.trim() ||
      item.querySelector('link')?.getAttribute('href') || '#'
    ),
    description: stripHtml(
      item.querySelector('description, summary, content')?.textContent || ''
    ),
    date: item.querySelector('pubDate, published, updated')?.textContent || '',
    source: (() => { try { return new URL(url).hostname } catch { return url } })(),
  }))
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200)
}
