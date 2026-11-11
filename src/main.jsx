import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { FarmTab } from './tabs/Farm'
import { WarningsTab } from './tabs/Warnings'
import { WaterTab } from './tabs/Water'
import { ScanTab } from './tabs/Scan'
import { AboutTab } from './tabs/About'

const emptyPlot = () => ({
  id: crypto.randomUUID(), crop: 'tomato', variety: '', sowingDate: '',
  stage: 'seedling', areaAcres: '', updatedAt: '',
})

const emptyFarm = () => ({
  id: crypto.randomUUID(), name: '', cityLabel: '', village: '', district: '',
  latitude: '', longitude: '', locationConsent: false, locationMode: 'manual',
  updatedAt: '', plots: [emptyPlot()],
})

function readStore() {
  try {
    const saved = JSON.parse(localStorage.getItem('farms'))
    if (saved?.farms?.length) return saved
    const old = JSON.parse(localStorage.getItem('farm'))
    if (old?.name) {
      const { crop, variety, sowingDate, stage, areaAcres, ...farmFields } = old
      const farmId = crypto.randomUUID()
      const plotId = crypto.randomUUID()
      return { farms: [{ ...farmFields, id: farmId, locationMode: old.locationConsent ? 'precise' : 'manual', plots: [{ id: plotId, crop, variety, sowingDate, stage, areaAcres, updatedAt: old.updatedAt || '' }] }], activeFarmId: farmId, activePlotId: plotId }
    }
  } catch (error) {
    console.warn('Saved farm profiles could not be read.', error)
  }
  const farm = emptyFarm()
  return { farms: [farm], activeFarmId: farm.id, activePlotId: farm.plots[0].id }
}

const tabs = [
  { id: 'farm', label: 'Farm', icon: '⌂' }, { id: 'warnings', label: 'Warnings', icon: '!' },
  { id: 'water', label: 'Water', icon: '◌' }, { id: 'scan', label: 'Scan', icon: '▣' },
  { id: 'about', label: 'About', icon: 'i' },
]

function App() {
  const [store, setStore] = useState(readStore)
  const [activeTab, setActiveTab] = useState('farm')
  const [saved, setSaved] = useState(false)
  const activeFarm = store.farms.find((farm) => farm.id === store.activeFarmId) || store.farms[0]
  const activePlot = activeFarm?.plots.find((plot) => plot.id === store.activePlotId) || activeFarm?.plots[0]
  const profile = activeFarm && activePlot ? { ...activeFarm, ...activePlot } : null
  const hasPlot = Boolean(profile?.name && profile?.cityLabel && profile?.sowingDate && profile?.areaAcres)
  const hasWeather = Boolean(hasPlot && profile?.locationMode === 'precise' && profile?.locationConsent && profile?.latitude && profile?.longitude)

  useEffect(() => { localStorage.setItem('farms', JSON.stringify(store)) }, [store])

  function updateSelection(farmId, plotId) { setStore((current) => ({ ...current, activeFarmId: farmId, activePlotId: plotId })) }
  function saveProfile(nextFarm, nextPlot) {
    const now = new Date().toISOString()
    setStore((current) => ({ ...current, farms: current.farms.map((farm) => farm.id === nextFarm.id ? { ...nextFarm, updatedAt: now, plots: farm.plots.map((plot) => plot.id === nextPlot.id ? { ...nextPlot, updatedAt: now } : plot) } : farm) }))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }
  function addFarm() { const farm = emptyFarm(); setStore((current) => ({ ...current, farms: [...current.farms, farm], activeFarmId: farm.id, activePlotId: farm.plots[0].id })) }
  function addPlot() { const plot = emptyPlot(); setStore((current) => ({ ...current, farms: current.farms.map((farm) => farm.id === activeFarm.id ? { ...farm, plots: [...farm.plots, plot] } : farm), activePlotId: plot.id })) }

  const content = {
    farm: <FarmTab farm={activeFarm} plot={activePlot} farms={store.farms} onSelect={updateSelection} onSave={saveProfile} onAddFarm={addFarm} onAddPlot={addPlot} saved={saved} />,
    warnings: <WarningsTab farm={profile} hasFarm={hasWeather} />,
    water: <WaterTab farm={profile} hasFarm={hasPlot} />,
    scan: <ScanTab farm={profile} hasFarm={hasPlot} />,
    about: <AboutTab />,
  }[activeTab]
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><img src="/Logo.png" alt="KisanSense logo" /><div><strong>KisanSense</strong><span>Clearer decisions for your farm</span></div></div><span className="device-pill">On this device</span></header>
    <main className="main-content"><div className="page-heading"><div><p className="eyebrow">SMALL FARM SUPPORT</p><h1>{tabs.find((tab) => tab.id === activeTab).label}</h1></div>{profile && hasPlot && <span className="farm-chip">● {profile.crop} · {profile.cityLabel}</span>}</div>
      {!hasPlot && activeTab !== 'farm' && <div className="notice info"><span className="notice-icon">i</span><p>Save a complete crop plot first to personalise this section.</p><button onClick={() => setActiveTab('farm')}>Set up plot</button></div>}
      {activeTab === 'warnings' && hasPlot && !hasWeather && <div className="notice amber"><span className="notice-icon">!</span><p>Precise location permission is needed for weather. Add coordinates and approve their use, or keep using the manual location for your records.</p></div>}
      {content}
    </main>
    <nav className="bottom-nav" aria-label="Main navigation">{tabs.map((tab) => <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}><span className="nav-icon">{tab.icon}</span><span>{tab.label}</span></button>)}</nav>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
