import { useEffect, useState } from 'react'
import { getWeather } from '../weather'
import { findWarnings } from '../rules'

export function WarningsTab({ farm, hasFarm }) {
  const [state, setState] = useState({ loading: true, weather: null, error: '' })
  useEffect(() => { if (!hasFarm) return; let live = true; getWeather(farm).then((weather) => live && setState({ loading: false, weather, error: '' })).catch(() => live && setState({ loading: false, weather: null, error: 'Weather is unavailable right now.' })); return () => { live = false } }, [farm, hasFarm])
  if (!hasFarm) return null
  if (state.loading) return <div className="card loading">Loading local weather forecast…</div>
  if (state.error) return <div className="card error-state"><span>!</span>{state.error}<p>Check your connection and try again.</p></div>
  const warnings = findWarnings(state.weather)
  return <section className="stack"><div className="card"><div className="card-title-row"><div><h2>Forecast for {farm.cityLabel}</h2><p className="muted">Fetched {new Date(state.weather.fetchedAt).toLocaleString()}</p></div><span className="weather-icon">☀</span></div>{warnings.length ? warnings.map((warning) => <div className={`warning ${warning.tone}`} key={warning.title}><span>⚠</span><div><strong>{warning.title}</strong><p>{warning.text}</p></div></div>) : <div className="success-message">✓ No notable crop warnings in this forecast.</div>}<div className="forecast-grid">{state.weather.forecast.map((day) => <div className="forecast-day" key={day.day}><strong>{day.day}</strong><span>{day.label}</span><b>{day.high}°</b><small>Rain {day.rain}% · Wind {day.wind} km/h</small></div>)}</div></div><div className="source-note">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo.com</a>. Forecast advisory, not an official warning. <a href="https://www.weather.gov.pk" target="_blank" rel="noreferrer">Official warnings →</a></div></section>
}
