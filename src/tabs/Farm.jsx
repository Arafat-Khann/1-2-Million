import { useState } from 'react'
import { cropLabels, stageLabels } from '../mockData'

const staleAfterDays = 30

function isStale(timestamp) {
  return !timestamp || (Date.now() - new Date(timestamp).getTime()) > staleAfterDays * 86400000
}

export function FarmTab({ farm, plot, farms, onSelect, onSave, onAddFarm, onAddPlot, saved }) {
  const [locationMode, setLocationMode] = useState(farm?.locationMode || 'manual')
  const [coordinates, setCoordinates] = useState({ latitude: farm?.latitude || '', longitude: farm?.longitude || '' })
  if (!farm || !plot) return null

  function useDeviceLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setCoordinates({ latitude: coords.latitude, longitude: coords.longitude }); setLocationMode('precise') },
      () => window.alert('Location was not shared. You can enter a village and district instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function submit(event) {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    const precise = locationMode === 'precise' && data.locationConsent === 'on'
    const nextFarm = {
      ...farm, name: data.name, cityLabel: data.cityLabel, village: data.village, district: data.district,
      locationMode: precise ? 'precise' : 'manual', locationConsent: precise,
      latitude: precise ? Number(coordinates.latitude) : '', longitude: precise ? Number(coordinates.longitude) : '',
    }
    const nextPlot = { ...plot, crop: data.crop, variety: data.variety, sowingDate: data.sowingDate, stage: data.stage, areaAcres: Number(data.areaAcres) || 0 }
    onSave(nextFarm, nextPlot)
  }

  return <section className="stack">
    <div className="card">
      <div className="card-title-row"><div><p className="eyebrow">SAVED PROFILES</p><h2>Choose a farm and plot</h2></div><span className="section-icon leaf">✦</span></div>
      <div className="form-grid"><label>Farm<select value={farm.id} onChange={(event) => { const selected = farms.find((item) => item.id === event.target.value); onSelect(selected.id, selected.plots[0].id); setLocationMode(selected.locationMode || 'manual'); setCoordinates({ latitude: selected.latitude || '', longitude: selected.longitude || '' }) }}>{farms.map((item) => <option value={item.id} key={item.id}>{item.name || 'Unnamed farm'}</option>)}</select></label><label>Crop plot<select value={plot.id} onChange={(event) => onSelect(farm.id, event.target.value)}>{farm.plots.map((item, index) => <option value={item.id} key={item.id}>{cropLabels[item.crop]} plot {index + 1}</option>)}</select></label></div>
      <div className="button-row"><button className="secondary-button" type="button" onClick={() => { setLocationMode('manual'); setCoordinates({ latitude: '', longitude: '' }); onAddFarm() }}>＋ Add another farm</button><button className="secondary-button" type="button" onClick={onAddPlot}>＋ Add crop plot</button></div>
    </div>
    <div className="card">
      <div className="card-intro"><span className="section-icon leaf">✦</span><div><h2>{farm.name || 'Farm details'}</h2><p>Farm details and crop information stay on this device.</p></div></div>
      <form key={`${farm.id}-${plot.id}`} onSubmit={submit} className="farm-form">
        <label>Farm name<input name="name" defaultValue={farm.name} placeholder="e.g. North Field" required /></label>
        <div className="form-grid"><label>Village<input name="village" defaultValue={farm.village} placeholder="Village name" required /></label><label>District<input name="district" defaultValue={farm.district} placeholder="District name" required /></label></div>
        <label>Location label<input name="cityLabel" defaultValue={farm.cityLabel} placeholder="Village / district" required /></label>
        <div className="location-choice"><strong>Location permission</strong><p className="muted">Precise coordinates are only saved after you approve their use for weather.</p><div className="choice-row"><label><input type="radio" name="locationMode" value="manual" checked={locationMode === 'manual'} onChange={() => setLocationMode('manual')} /> Manual village / district</label><label><input type="radio" name="locationMode" value="precise" checked={locationMode === 'precise'} onChange={() => setLocationMode('precise')} /> Precise coordinates</label></div>{locationMode === 'precise' && <><button className="secondary-button" type="button" onClick={useDeviceLocation}>Use my current location</button><div className="form-grid"><label>Latitude<input type="number" step="any" value={coordinates.latitude} onChange={(event) => setCoordinates({ ...coordinates, latitude: event.target.value })} required /></label><label>Longitude<input type="number" step="any" value={coordinates.longitude} onChange={(event) => setCoordinates({ ...coordinates, longitude: event.target.value })} required /></label></div><label className="consent-check"><input name="locationConsent" type="checkbox" required={locationMode === 'precise'} defaultChecked={farm.locationConsent} /><span>I approve saving these coordinates on this device and using them for weather.</span></label></>}</div>
        <div className="form-grid"><label>Crop<select name="crop" defaultValue={plot.crop}>{Object.entries(cropLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><label>Variety <span className="optional">(optional)</span><input name="variety" defaultValue={plot.variety} placeholder="e.g. Rio Grande" /></label></div>
        <div className="form-grid"><label>Sowing date<input name="sowingDate" type="date" defaultValue={plot.sowingDate} required /></label><label>Farm area (acres)<input name="areaAcres" type="number" min="0" step="0.01" defaultValue={plot.areaAcres} placeholder="e.g. 1.5" required /></label></div>
        <label>Growth stage<select name="stage" defaultValue={plot.stage}>{Object.entries(stageLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
        {isStale(plot.updatedAt) && <div className="notice amber"><span className="notice-icon">!</span><p><strong>Crop information may be stale.</strong><br />Review the crop, sowing date, and growth stage before relying on advice.</p></div>}
        <p className="muted">Last crop update: {plot.updatedAt ? new Date(plot.updatedAt).toLocaleString() : 'Not saved yet'}</p>
        <button className="primary-button" type="submit">{saved ? '✓ Profile saved' : 'Save farm and plot'}</button>
      </form>
    </div>
  </section>
}
