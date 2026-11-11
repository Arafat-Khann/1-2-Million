import { estimateWater } from '../rules'
import { cropLabels, stageLabels } from '../mockData'

export function WaterTab({ farm, hasFarm }) {
  if (!hasFarm) return null
  const result = estimateWater(farm)
  const litres = Math.round(result.estimate * farm.areaAcres * 4046.86)
  return <section className="stack"><div className="card"><div className="card-title-row"><div><p className="eyebrow">INDICATIVE ESTIMATE</p><h2>Crop water use</h2></div><span className="weather-icon">◌</span></div><div className="estimate"><strong>{result.estimate}</strong><span>{result.unit}</span></div><p>{result.assumption}</p><div className="assumptions"><span>ET₀ <b>{result.et0} mm/day assumed</b></span><span>Kc <b>{result.kc} for {stageLabels[farm.stage]}</b></span><span>Crop <b>{cropLabels[farm.crop]}</b></span><span>Area <b>{farm.areaAcres} acres</b></span><span>Approx. volume <b>{litres.toLocaleString()} litres</b></span></div><p className="muted water-unknowns">{result.unknowns}</p></div><div className="notice amber"><span className="notice-icon">!</span><p><strong>Soil moisture unknown.</strong><br />Check the soil before watering. This estimate is not a measurement.</p></div><div className="source-note">Volume assumes the estimate applies evenly across the saved area. Never water for a fixed number of minutes. Recheck before irrigating if rain is forecast.</div></section>
}
