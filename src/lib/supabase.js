import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://skkahgrgnqfexerktfpm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNra2FoZ3JnbnFmZXhlcmt0ZnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Mjg5NjQsImV4cCI6MjA5MjMwNDk2NH0.EkzXE7JVHs4mNYt4h7hH_9Ed8N7lRuvNoTgSP_qYdlQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const SYNC_KEYS = [
  'll-brand',
  'll-board',
  'll-weekly-schedule',
  'll-weekly-progress',
  'll-archive',
  'll-api-key',
  'roadmap-data',
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

// Pull all keys from Supabase into localStorage.
// Returns the array of keys that existed in the cloud.
export async function pullFromCloud() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const { data } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', user.id)
    if (!data?.length) return []
    for (const row of data) {
      if (row.value !== null) localStorage.setItem(row.key, row.value)
    }
    return data.map(r => r.key)
  } catch (_) {
    return []
  }
}

// Push any SYNC_KEYS that exist locally but are missing from the cloud.
// This handles migration when new keys are added to SYNC_KEYS after first login.
export async function pushMissingToCloud(cloudKeys) {
  for (const key of SYNC_KEYS) {
    if (!cloudKeys.includes(key) && localStorage.getItem(key) !== null) {
      await pushToCloud(key)
    }
  }
}
