import { useEffect, useState } from 'react'
import { getOpenMeteoWeather } from '../openMeteo'
import { estimateWater, findWarnings } from '../rules'
import { cropLabels, stageLabels } from '../mockData'

function PieChart({ first, second, firstLabel, secondLabel }) {
  const firstShare = Math.round((first / (first + second)) * 100)
  return <div className="pie-wrap"><div className="pie-chart" style={{ background: `conic-gradient(var(--terracotta) 0 ${firstShare}%, var(--beige) ${firstShare}% 100%)` }}><strong>{firstShare}%</strong></div><div className="pie-legend"><span><i className="legend-terracotta" />{firstLabel}</span><span><i className="legend-beige" />{secondLabel}</span></div></div>
}

export function Dashboard({ farm, hasFarm }) {
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const [loading, setLoading] = useState(false)
  const water = farm ? estimateWater(farm) : null
  const warnings = weather ? findWarnings({ ...weather, crop: farm.crop }) : []

  useEffect(() => {
    if (!hasFarm || !farm?.latitude || !farm?.longitude) return undefined
    let active = true
    setLoading(true)
    getOpenMeteoWeather(farm).then((result) => active && setWeather(result)).catch((error) => active && setWeatherError(error.message || 'Weather is unavailable.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [farm?.id, farm?.latitude, farm?.longitude, hasFarm])

  if (!hasFarm) return <div className="card dashboard-empty"><span className="section-icon leaf">✦</span><h2>Your farm dashboard is waiting</h2><p>Save a complete farm and crop plot to see your weather, water estimate, and next actions in one place.</p></div>
  const nextAction = warnings[0]?.text || 'Review the soil before watering and keep monitoring the forecast.'
  return <section className="dashboard-grid">
    <div className="dashboard-welcome card"><div><p className="eyebrow">FARM OVERVIEW</p><h2>Good day, {farm.name || 'farmer'}</h2><p className="muted">{cropLabels[farm.crop]} plot · {farm.cityLabel}</p></div><span className="dashboard-sun">☀</span></div>
    <div className="dashboard-stats"><div className="card stat-card"><span className="stat-icon">⌖</span><small>LOCATION</small><strong>{farm.cityLabel}</strong><span>{farm.district || 'District not provided'}</span></div><div className="card stat-card"><span className="stat-icon">✦</span><small>CROP STAGE</small><strong>{cropLabels[farm.crop]}</strong><span>{stageLabels[farm.stage]}</span></div><div className="card stat-card"><span className="stat-icon">▣</span><small>AREA</small><strong>{farm.areaAcres} acres</strong><span>Updated {farm.updatedAt ? new Date(farm.updatedAt).toLocaleDateString() : 'not yet'}</span></div></div>
    <div className="card dashboard-weather"><div className="card-title-row"><div><p className="eyebrow">WEATHER SNAPSHOT</p><h2>Today in {farm.cityLabel}</h2></div><span className="weather-icon">☀</span></div>{loading && <p className="muted">Loading forecast…</p>}{weatherError && <p className="error-copy">{weatherError}</p>}{weather && <><div className="weather-main"><strong>{weather.current.temperature}°</strong><span>Current temperature<br />Rain {weather.current.rain} mm · Wind {weather.current.wind} km/h</span></div><div className="mini-forecast">{weather.forecast.slice(0, 3).map((day) => <div key={day.day}><b>{day.day}</b><span>{day.high}°</span><small>Rain {day.rain}%</small></div>)}</div></>}</div>
    <div className="card dashboard-water"><div className="card-title-row"><div><p className="eyebrow">IRRIGATION VIEW</p><h2>Water estimate</h2></div><span className="weather-icon">◌</span></div>{water && <><div className="dashboard-water-row"><div><strong>{water.estimate}</strong><span>mm today</span></div><PieChart first={water.kc} second={2 - water.kc} firstLabel="Crop factor (Kc)" secondLabel="Remaining variability" /></div><p className="muted">ET₀ {water.et0} mm/day assumed · Kc {water.kc} for {stageLabels[farm.stage]}</p></>}</div>
    <div className="card dashboard-action"><p className="eyebrow">NEXT BEST CHECK</p><h2>What to do next</h2><div className={`action-callout ${warnings.length ? 'has-warning' : ''}`}><span>{warnings.length ? '⚠' : '✓'}</span><p>{nextAction}</p></div><p className="muted">Forecast advisory, not an official warning. Check the soil and your plants before acting.</p></div>
    <div className="card dashboard-location"><p className="eyebrow">PROFILE DETAILS</p><h2>Farm location</h2><div className="location-grid"><span>Village <b>{farm.village || 'Not provided'}</b></span><span>District <b>{farm.district || 'Not provided'}</b></span><span>Coordinates <b>{farm.latitude && farm.longitude ? `${Number(farm.latitude).toFixed(3)}, ${Number(farm.longitude).toFixed(3)}` : 'Manual location'}</b></span><span>Planting date <b>{farm.sowingDate || 'Not provided'}</b></span></div></div>
  </section>
}
