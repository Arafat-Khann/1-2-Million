import { useState } from 'react'
import { requireSupabase } from '../supabase'

export function AuthTab({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const client = requireSupabase()
      if (mode === 'reset') {
        await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` })
        setMessage('Check your email for a password reset link.')
        return
      }
      const result = mode === 'login'
        ? await client.auth.signInWithPassword({ email, password })
        : await client.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
      if (result.error) throw result.error
      if (mode === 'signup') setMessage('Check your email to confirm your account.')
      else if (result.data.session) onAuthenticated(result.data.session.user)
    } catch (authError) {
      setError(authError.message || 'Authentication failed. Please try again.')
    }
  }

  return <main className="auth-page"><div className="card auth-card"><img src="/Logo.png" alt="KisanSense logo" className="auth-logo" /><p className="eyebrow">KISANSENSE</p><h1>{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}</h1><p className="muted">Your farm information will be protected by your account.</p><form onSubmit={submit} className="farm-form">{mode === 'signup' && <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>}<label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>{mode !== 'reset' && <label>Password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>}{error && <div className="notice error-state"><span>!</span><p>{error}</p></div>}{message && <div className="notice info"><span className="notice-icon">i</span><p>{message}</p></div>}<button className="primary-button" type="submit">{mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'}</button></form><div className="auth-links">{mode === 'login' && <button onClick={() => setMode('reset')}>Forgot password?</button>}{mode !== 'login' && <button onClick={() => setMode('login')}>Back to log in</button>}{mode === 'login' && <button onClick={() => setMode('signup')}>Create a new account</button>}</div></div></main>
}
