import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { supabase } from './supabase'
import { AuthTab } from './tabs/Auth'
import { ResetPasswordTab } from './tabs/ResetPassword'
import { FarmTab } from './tabs/Farm'
import { WarningsTab } from './tabs/Warnings'
import { WaterTab } from './tabs/Water'
import { ScanTab } from './tabs/Scan'
import { AboutTab } from './tabs/About'

const emptyPlot = () => ({ id: crypto.randomUUID(), crop: 'tomato', variety: '', sowingDate: '', stage: 'seedling', areaAcres: '', updatedAt: '' })
const emptyFarm = () => ({ id: crypto.randomUUID(), name: '', cityLabel: '', village: '', district: '', latitude: '', longitude: '', locationConsent: false, locationMode: 'manual', updatedAt: '', plots: [emptyPlot()] })

function localStore() {
  try {
    const saved = JSON.parse(localStorage.getItem('farms'))
    if (saved?.farms?.length) return saved
  } catch (error) { console.warn('Saved farm profiles could not be read.', error) }
  const farm = emptyFarm()
  return { farms: [farm], activeFarmId: farm.id, activePlotId: farm.plots[0].id }
}

async function loadProfiles(userId) {
  const client = supabase
  const { data, error } = await client.from('farms').select('*, crop_plots(*)').eq('user_id', userId).order('created_at')
  if (error) throw error
  if (!data.length) return localStore()
  const farms = data.map((farm) => ({ ...farm, cityLabel: farm.location_label, locationMode: farm.location_consent ? 'precise' : 'manual', plots: (farm.crop_plots || []).map((plot) => ({ ...plot, sowingDate: plot.sowing_date, areaAcres: plot.area_acres, stage: plot.growth_stage })) }))
  const firstPlot = farms[0].plots[0]
  return { farms, activeFarmId: farms[0].id, activePlotId: firstPlot?.id }
}

const tabs = [{ id: 'farm', label: 'Farm', icon: '⌂' }, { id: 'warnings', label: 'Warnings', icon: '!' }, { id: 'water', label: 'Water', icon: '◌' }, { id: 'scan', label: 'Scan', icon: '▣' }, { id: 'about', label: 'About', icon: 'i' }]

function App() {
  const [user, setUser] = useState(null)
  const [store, setStore] = useState(localStore)
  const [activeTab, setActiveTab] = useState('farm')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null))
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setRecovery(event === 'PASSWORD_RECOVERY')
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    loadProfiles(user.id).then(setStore).catch((loadError) => setError(loadError.message || 'Could not load your farm profiles.')).finally(() => setLoading(false))
  }, [user])

  useEffect(() => { localStorage.setItem('farms', JSON.stringify(store)) }, [store])

  async function saveProfile(nextFarm, nextPlot) {
    const now = new Date().toISOString()
    const farmRow = { id: nextFarm.id, user_id: user.id, name: nextFarm.name, village: nextFarm.village, district: nextFarm.district, location_label: nextFarm.cityLabel, latitude: nextFarm.latitude || null, longitude: nextFarm.longitude || null, location_consent: nextFarm.locationConsent, location_consent_at: nextFarm.locationConsent ? now : null }
    const plotRow = { id: nextPlot.id, farm_id: nextFarm.id, crop: nextPlot.crop, variety: nextPlot.variety || null, sowing_date: nextPlot.sowingDate, growth_stage: nextPlot.stage, area_acres: nextPlot.areaAcres }
    const { error: saveError } = await supabase.from('farms').upsert(farmRow).select().single()
    if (!saveError) {
      const { error: plotError } = await supabase.from('crop_plots').upsert(plotRow)
      if (plotError) { setError(plotError.message); return }
    } else { setError(saveError.message); return }
    setStore((current) => {
      const savedFarm = { ...nextFarm, updatedAt: now, plots: [{ ...nextPlot, updatedAt: now }] }
      const farmExists = current.farms.some((farm) => farm.id === nextFarm.id)
      return { ...current, farms: farmExists ? current.farms.map((farm) => farm.id === nextFarm.id ? { ...farm, ...savedFarm, plots: farm.plots.some((plot) => plot.id === nextPlot.id) ? farm.plots.map((plot) => plot.id === nextPlot.id ? { ...nextPlot, updatedAt: now } : plot) : [...farm.plots, { ...nextPlot, updatedAt: now }] } : farm) : [...current.farms, savedFarm] }
    })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }
  async function deleteFarm(farmId) {
    const farmToDelete = store.farms.find((farm) => farm.id === farmId)
    if (!farmToDelete || !window.confirm(`Delete "${farmToDelete.name || 'this farm'}" and all its crop plots? This cannot be undone.`)) return
    const { error: deleteError } = await supabase.from('farms').delete().eq('id', farmId).eq('user_id', user.id)
    if (deleteError) { setError(deleteError.message); return }
    setStore((current) => {
      const farms = current.farms.filter((farm) => farm.id !== farmId)
      if (farms.length) return { ...current, farms, activeFarmId: farms[0].id, activePlotId: farms[0].plots[0]?.id }
      const farm = emptyFarm()
      return { farms: [farm], activeFarmId: farm.id, activePlotId: farm.plots[0].id }
    })
  }

  if (!supabase) return <div className="notice error-state config-error"><span>!</span><p>Supabase is not configured. Add the Vercel environment variables <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.</p></div>
  if (loading) return <div className="card loading">Checking your account…</div>
  if (!user) return <AuthTab />
  if (recovery) return <ResetPasswordTab onComplete={() => setRecovery(false)} />
  if (error) return <div className="notice error-state config-error"><span>!</span><p>{error}</p><button onClick={() => setError('')}>Continue</button></div>

  const activeFarm = store.farms.find((farm) => farm.id === store.activeFarmId) || store.farms[0]
  const activePlot = activeFarm?.plots.find((plot) => plot.id === store.activePlotId) || activeFarm?.plots[0]
  const profile = activeFarm && activePlot ? { ...activeFarm, ...activePlot } : null
  const hasPlot = Boolean(profile?.name && profile?.cityLabel && profile?.sowingDate && profile?.areaAcres)
  const hasWeather = Boolean(hasPlot && profile?.locationMode === 'precise' && profile?.locationConsent && profile?.latitude && profile?.longitude)
  function updateSelection(farmId, plotId) { setStore((current) => ({ ...current, activeFarmId: farmId, activePlotId: plotId })) }
  function addFarm() { const farm = emptyFarm(); setStore((current) => ({ ...current, farms: [...current.farms, farm], activeFarmId: farm.id, activePlotId: farm.plots[0].id })) }
  function addPlot() { const plot = emptyPlot(); setStore((current) => ({ ...current, farms: current.farms.map((farm) => farm.id === activeFarm.id ? { ...farm, plots: [...farm.plots, plot] } : farm), activePlotId: plot.id })) }
  const content = { farm: <FarmTab farm={activeFarm} plot={activePlot} farms={store.farms} onSelect={updateSelection} onSave={saveProfile} onDeleteFarm={deleteFarm} onAddFarm={addFarm} onAddPlot={addPlot} saved={saved} />, warnings: <WarningsTab farm={profile} hasFarm={hasWeather} />, water: <WaterTab farm={profile} hasFarm={hasPlot} />, scan: <ScanTab farm={profile} hasFarm={hasPlot} />, about: <AboutTab key={`${profile?.id}-${profile?.crop}`} crop={profile?.crop} cityLabel={profile?.cityLabel} district={profile?.district} /> }[activeTab]
  return <div className="app-shell"><header className="topbar"><div className="brand"><img src="/Logo.png" alt="KisanSense logo" /><div><strong>KisanSense</strong><span>Clearer decisions for your farm</span></div></div><button className="device-pill" onClick={() => supabase.auth.signOut()}>Log out</button></header><main className="main-content"><div className="page-heading"><div><p className="eyebrow">SMALL FARM SUPPORT</p><h1>{tabs.find((tab) => tab.id === activeTab).label}</h1></div>{profile && hasPlot && <span className="farm-chip">● {profile.crop} · {profile.cityLabel}</span>}</div>{!hasPlot && activeTab !== 'farm' && <div className="notice info"><span className="notice-icon">i</span><p>Save a complete crop plot first to personalise this section.</p><button onClick={() => setActiveTab('farm')}>Set up plot</button></div>}{activeTab === 'warnings' && hasPlot && !hasWeather && <div className="notice amber"><span className="notice-icon">!</span><p>Precise location permission is needed for weather.</p></div>}{content}</main><nav className="bottom-nav" aria-label="Main navigation">{tabs.map((tab) => <button className={activeTab === tab.id ? 'active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}><span className="nav-icon">{tab.icon}</span><span>{tab.label}</span></button>)}</nav></div>
}

createRoot(document.getElementById('root')).render(<App />)
