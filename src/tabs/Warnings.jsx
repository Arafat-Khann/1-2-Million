import { useEffect, useState } from 'react'
import { getOpenMeteoWeather } from '../openMeteo'
import { findWarnings } from '../rules'

export function WarningsTab({ farm, hasFarm }) {
  const cacheKey = `weather:${farm?.id}`
  const [state, setState] = useState({ loading: true, weather: null, error: '', stale: false })
  useEffect(() => {
    if (!hasFarm) return undefined
    let live = true
    let cached = null
    try {
      cached = JSON.parse(localStorage.getItem(cacheKey) || 'null')
    } catch (cacheError) {
      localStorage.removeItem(cacheKey)
    }
    if (cached?.weather) setState({ loading: false, weather: cached.weather, error: '', stale: true })
    getOpenMeteoWeather(farm).then((weather) => {
      if (!live) return
      localStorage.setItem(cacheKey, JSON.stringify({ weather, savedAt: Date.now() }))
      setState({ loading: false, weather, error: '', stale: false })
    }).catch((weatherError) => {
      if (live && !cached?.weather) setState({ loading: false, weather: null, error: weatherError.message || 'Weather is unavailable right now.', stale: false })
    })
    return () => { live = false }
  }, [farm?.id, farm?.latitude, farm?.longitude, hasFarm, cacheKey])
  if (!hasFarm) return null
  if (state.loading) return <div className="card loading">Loading local weather forecast…</div>
  if (state.error) return <div className="card error-state"><span>!</span>{state.error}<p>Check your connection and try again.</p></div>
  const warnings = findWarnings({ ...state.weather, crop: farm.crop })
  return <section className="stack"><div className="card"><div className="card-title-row"><div><h2>Forecast for {farm.cityLabel}</h2><p className="muted">Fetched {new Date(state.weather.fetchedAt).toLocaleString()}</p></div><span className="weather-icon">☀</span></div>{state.stale && <div className="notice amber"><span className="notice-icon">!</span><p>Showing saved weather while we refresh. This data may be stale.</p></div>}{warnings.length ? warnings.map((warning) => <div className={`warning ${warning.tone}`} key={warning.title}><span>⚠</span><div><strong>{warning.title}</strong><p>{warning.text}</p></div></div>) : <div className="success-message">✓ No notable crop warnings in this forecast.</div>}<div className="forecast-grid">{state.weather.forecast.map((day) => <div className="forecast-day" key={day.day}><strong>{day.day}</strong><span>{day.label}</span><b>{day.high}°</b><small>Rain {day.rain}% · Wind {day.wind} km/h</small></div>)}</div></div><div className="source-note">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>. Forecast advisory, not an official warning. <a href="https://www.weather.gov.pk" target="_blank" rel="noreferrer">Official warnings →</a></div></section>
}
