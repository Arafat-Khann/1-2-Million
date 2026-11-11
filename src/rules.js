export function findWarnings(weather) {
  const crop = weather.crop || 'tomato'
  const warnings = []
  const rain = weather.forecast.find((day) => day.rain >= 50)
  const heat = weather.forecast.find((day) => day.high >= (crop === 'potato' ? 30 : 35))
  const wind = weather.forecast.find((day) => day.wind >= 35)
  if (rain) warnings.push({ type: 'rain', title: `${crop === 'potato' ? 'Potato' : 'Tomato'} rain risk: recheck irrigation`, text: `${rain.day} has a ${rain.rain}% chance of rain. Recheck before irrigating; wet foliage can increase disease pressure.`, tone: 'amber' })
  if (heat) warnings.push({ type: 'heat', title: `${crop === 'potato' ? 'Potato' : 'Tomato'} heat stress is possible`, text: `${heat.day} may reach ${heat.high}°. Check soil and plant condition; this is a forecast advisory, not a certainty.`, tone: 'amber' })
  if (wind) warnings.push({ type: 'wind', title: 'Strong wind is possible', text: `${wind.day} may reach ${wind.wind} km/h. Check supports and avoid making decisions during unsafe conditions.`, tone: 'amber' })
  return warnings
}
export function estimateWater(farm) {
  const kcByStage = { seedling: 0.45, vegetative: 0.8, flowering: 1.15, ripening: 0.85 }
  const kc = kcByStage[farm.stage] || 0.8
  const assumedEt0 = 5
  const estimate = Number((assumedEt0 * kc).toFixed(1))
  return {
    estimate,
    unit: 'mm today',
    kc,
    et0: assumedEt0,
    assumption: 'Indicative crop evapotranspiration estimate: ET₀ × Kc.',
    unknowns: 'ET₀ is a planning assumption here. Soil type, mulch, effective rain, irrigation efficiency, root depth, and field measurements are unknown.',
  }
}
