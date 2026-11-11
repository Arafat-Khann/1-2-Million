import { useState } from 'react'
import { requireSupabase } from '../supabase'

export function ResetPasswordTab({ onComplete }) {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    const { error: updateError } = await requireSupabase().auth.updateUser({ password })
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. You can continue to your farm.')
  }
  return <main className="auth-page"><div className="card auth-card"><img src="/Logo.png" alt="KisanSense logo" className="auth-logo" /><p className="eyebrow">PASSWORD RESET</p><h1>Choose a new password</h1><form onSubmit={submit} className="farm-form"><label>New password<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <div className="notice error-state"><span>!</span><p>{error}</p></div>}{message && <div className="notice info"><span className="notice-icon">i</span><p>{message}</p></div>}<button className="primary-button" type="submit">Update password</button>{message && <button className="secondary-button" type="button" onClick={onComplete}>Continue</button>}</form></div></main>
}
