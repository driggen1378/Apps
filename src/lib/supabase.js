import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://skkahgrgnqfexerktfpm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2FoZ3JnbnFmZXhlcmt0ZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjg5NjQsImV4cCI6MjA5MjMwNDk2NH0.EkzXE7JVHs4mNYt4h7hH_9Ed8N7lRuvNoTgSP_qYdlQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Keys that sync across devices
const SYNC_KEYS = [
  'll-brand',
  'll-board',
  'll-weekly-schedule',
  'll-weekly-progress',
  'll-archive',
  'll-api-key',
]

// Push a single key's current localStorage value to Supabase
export async function pushToCloud(key) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const value = localStorage.getItem(key)
    if (value === null) return
    await supabase.from('user_data').upsert(
      { user_id: user.id, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  } catch (_) {}
}

// Pull all keys from Supabase into localStorage. Returns true if data existed.
export async function pullFromCloud() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', user.id)
    if (!data?.length) return false
    for (const row of data) {
      if (row.value !== null) localStorage.setItem(row.key, row.value)
    }
    return true
  } catch (_) {
    return false
  }
}

// Push all sync keys at once (used on first login to migrate existing local data)
export async function pushAllToCloud() {
  for (const key of SYNC_KEYS) {
    await pushToCloud(key)
  }
}
