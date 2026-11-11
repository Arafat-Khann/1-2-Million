import { useState } from 'react'
import { syntheticMarketPrices } from '../marketData'

const cropNames = { tomato: 'Tomato', potato: 'Potato' }
const cropCalendar = {
  tomato: { window: 'September to February', reason: 'A common cool-season option in much of Pakistan; local temperatures still matter.' },
  potato: { window: 'October to February', reason: 'A common cool-season option; timing varies with district and elevation.' },
}

function localCropShortlist() {
  const month = new Date().getMonth() + 1
  return Object.entries(cropCalendar)
    .map(([crop, details]) => ({ crop, details, inWindow: month >= 9 || month <= 2 }))
}

function MarketCard({ crop }) {
  const [selectedCrop, setSelectedCrop] = useState(crop === 'potato' ? 'potato' : 'tomato')
  const price = syntheticMarketPrices[selectedCrop]
  return <div className="card market-card">
    <div className="market-heading"><div><p className="eyebrow">PROTOTYPE MARKET VIEW</p><h2>{cropNames[selectedCrop]} market example</h2></div><span className="market-badge">SYNTHETIC</span></div>
    <label>Crop<select value={selectedCrop} onChange={(event) => setSelectedCrop(event.target.value)}>{Object.entries(cropNames).map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label>
    <div className="market-price"><strong>PKR {price.price.toLocaleString()}</strong><span>{price.unit}</span></div>
    <div className="market-details"><span>Market <b>{price.market}</b></span><span>Date <b>{price.date}</b></span><span>Source <b>{price.source}</b></span></div>
    <div className="notice amber"><span className="notice-icon">!</span><p><strong>Not live market data.</strong><br />This illustrative value is for the prototype. Verify the current price with your local mandi before making decisions.</p></div>
  </div>
}

export function AboutTab({ crop }) {
  const shortlist = localCropShortlist()
  return <section className="stack">
    <div className="card"><p className="eyebrow">ABOUT KISANSENSE</p><h2>Practical support for small farms</h2><p>KisanSense helps you notice weather risks, understand indicative crop water use, and screen a leaf photo. It is decision support — not a doctor and not an official warning service.</p><div className="about-list"><div><span>01</span><p><strong>Weather warnings</strong><br />Crop-aware advisories from Open-Meteo forecast data.</p></div><div><span>02</span><p><strong>Water estimate</strong><br />ET₀ × Kc with assumptions shown.</p></div><div><span>03</span><p><strong>Leaf screening</strong><br />Photos are checked on your device and never uploaded.</p></div></div></div>
    <MarketCard crop={crop} />
    <div className="card"><p className="eyebrow">PLANNING SHORTLIST</p><h2>Why these crops appear</h2><p className="muted">An indicative Pakistan calendar, not a local agronomist recommendation. Confirm timing with your district agriculture office.</p><div className="about-list">{shortlist.map(({ crop: itemCrop, details, inWindow }) => <div key={itemCrop}><span>{inWindow ? '✓' : '—'}</span><p><strong>{cropNames[itemCrop]}</strong> · {details.window}<br />{details.reason}</p></div>)}</div><p className="source-note">The shortlist is limited to the crops currently supported by this app.</p></div>
    <div className="card"><p className="eyebrow">VERIFIED ADVICE</p><h2>Fertilizer and pesticide guidance</h2><p>KisanSense does not provide unsupported product names, doses, spray timing, or fertilizer quantities. For verified advice, contact your local agriculture extension office.</p><a className="primary-button link-button" href="https://www.weather.gov.pk" target="_blank" rel="noreferrer">Open official Pakistan weather service</a></div>
    <div className="notice info"><span className="notice-icon">i</span><p>Your farm and plot details are linked to your account. Weather cache and leaf photos stay on this device.</p></div>
  </section>
}
