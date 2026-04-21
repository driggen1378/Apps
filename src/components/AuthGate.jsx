import { useState, useEffect } from 'react'
import { supabase, pullFromCloud, pushMissingToCloud } from '../lib/supabase'

export default function AuthGate({ children }) {
  const [user,  setUser]  = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session) {
          setUser(session.user)
          const cloudKeys = await pullFromCloud()
          pushMissingToCloud(cloudKeys) // fire and forget — don't block app open
        }
      })
      .catch(() => {})
      .finally(() => setReady(true)) // always open the app, even if sync fails

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        const cloudKeys = await pullFromCloud()
        pushMissingToCloud(cloudKeys) // fire and forget
        setReady(true)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!ready) return <Splash />
  if (!user)  return <LoginScreen />
  return children
}

function LoginScreen() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function sendLink() {
    if (!email.trim()) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter') sendLink()
  }

  return (
    <div className="fixed inset-0 bg-[#071020] flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#c5a028] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#071020] font-bold text-sm">LL</span>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wider uppercase">Lessons Learned</p>
            <p className="text-[#4a6080] text-xs">RUFIO</p>
          </div>
        </div>

        {!sent ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-white text-lg font-semibold">Sign in</p>
              <p className="text-[#4a6080] text-sm mt-1">Enter your email — we'll send a magic link.</p>
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              placeholder="you@example.com"
              autoFocus
              className="w-full bg-[#112040] border border-[#2a4070] rounded-lg px-4 py-3 text-white text-sm placeholder-[#4a6080] focus:outline-none focus:border-[#c5a028] transition-colors"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              onClick={sendLink}
              disabled={!email.trim() || loading}
              className="w-full py-3 bg-[#c5a028] text-[#071020] font-bold text-sm rounded-lg hover:bg-[#d9b030] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending…' : 'Send magic link →'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="border border-[#2a4070] bg-[#112040] rounded-xl px-5 py-5 flex flex-col gap-2">
              <p className="text-white font-semibold text-sm">Check your email</p>
              <p className="text-[#6a80a0] text-sm leading-relaxed">
                We sent a link to <span className="text-white">{email}</span>. Click it on any device and you'll be signed in.
              </p>
            </div>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-xs text-[#4a6080] hover:text-[#c5a028] transition-colors self-start"
            >
              ← Use a different email
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

function Splash() {
  return (
    <div className="fixed inset-0 bg-[#071020] flex items-center justify-center">
      <div className="w-9 h-9 bg-[#c5a028] rounded-lg flex items-center justify-center animate-pulse">
        <span className="text-[#071020] font-bold text-sm">LL</span>
      </div>
    </div>
  )
}
