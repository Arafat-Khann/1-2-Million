const cropCalendar = {
  tomato: { window: 'September to February', reason: 'A common cool-season option in much of Pakistan; local temperatures still matter.' },
  potato: { window: 'October to February', reason: 'A common cool-season option; timing varies with district and elevation.' },
}

function localCropShortlist() {
  const month = new Date().getMonth() + 1
  return Object.entries(cropCalendar)
    .filter(([crop]) => crop === 'tomato' || crop === 'potato')
    .map(([crop, details]) => ({ crop, details, inWindow: month >= 9 || month <= 2 }))
}

export function AboutTab() {
  const shortlist = localCropShortlist()
  return <section className="stack">
    <div className="card"><p className="eyebrow">ABOUT KISANSENSE</p><h2>Practical support for small farms</h2><p>KisanSense helps you notice weather risks, understand indicative crop water use, and screen a leaf photo. It is decision support — not a doctor and not an official warning service.</p><div className="about-list"><div><span>01</span><p><strong>Weather warnings</strong><br />Crop-aware advisories from Open-Meteo forecast data.</p></div><div><span>02</span><p><strong>Water estimate</strong><br />ET₀ × Kc with assumptions shown.</p></div><div><span>03</span><p><strong>Leaf screening</strong><br />Photos are checked on your device and never uploaded.</p></div></div></div>
    <div className="card"><p className="eyebrow">PLANNING SHORTLIST</p><h2>Why these crops appear</h2><p className="muted">An indicative Pakistan calendar, not a local agronomist recommendation. Confirm timing with your district agriculture office.</p><div className="about-list">{shortlist.map(({ crop, details, inWindow }) => <div key={crop}><span>{inWindow ? '✓' : '—'}</span><p><strong>{crop[0].toUpperCase() + crop.slice(1)}</strong> · {details.window}<br />{details.reason}</p></div>)}</div><p className="source-note">The shortlist is limited to the crops currently supported by this app.</p></div>
    <div className="card"><p className="eyebrow">MARKET PRICES</p><h2>Market information unavailable</h2><p>Live market price data is not connected yet. We will not invent a price, market, unit, date, or source.</p><div className="unavailable-card"><strong>Unavailable</strong><span>Market · unit · date · source not available</span></div></div>
    <div className="card"><p className="eyebrow">VERIFIED ADVICE</p><h2>Fertilizer and pesticide guidance</h2><p>KisanSense does not provide unsupported product names, doses, spray timing, or fertilizer quantities. For verified advice, contact your local agriculture extension office.</p><a className="primary-button link-button" href="https://www.weather.gov.pk" target="_blank" rel="noreferrer">Open official Pakistan weather service</a></div>
    <div className="notice info"><span className="notice-icon">i</span><p>Your farm and plot details are linked to your account. Weather cache and leaf photos stay on this device.</p></div>
  </section>
}
