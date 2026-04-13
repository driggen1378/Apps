const API = 'https://api.anthropic.com/v1/messages'

export function getKey() {
  return localStorage.getItem('ll-api-key') || ''
}

export async function callClaude({ system, messages, tools, maxTokens = 1024, model }) {
  const key = getKey()
  if (!key) throw new Error('API key not set — add it in Brand Settings.')

  const betaHeaders = ['prompt-caching-2024-07-31']
  if (tools?.some(t => t.type?.includes('web_search'))) {
    betaHeaders.push('web-search-2025-03-05')
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': betaHeaders.join(','),
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages,
      ...(system && { system }),
      ...(tools  && { tools  }),
    }),
  })

  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

export function getText(r) {
  return r.content?.find(b => b.type === 'text')?.text || ''
}

export function parseJSON(text) {
  const match = text.match(/[\[{][\s\S]*[\]}]/)
  if (!match) throw new Error('Could not parse response as JSON')
  return JSON.parse(match[0])
}
