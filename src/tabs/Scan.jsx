import { useState } from 'react'
import { scanLeaf } from '../scan'

export function ScanTab({ hasFarm }) {
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  function choose(event) { const file = event.target.files?.[0]; if (!file) return; setPreview(URL.createObjectURL(file)); setResult(null) }
  const [assessing, setAssessing] = useState(false)
  async function assess() { setAssessing(true); setResult(await scanLeaf(preview)); setAssessing(false) }
  if (!hasFarm) return null
  return <section className="card"><div className="card-intro"><span className="section-icon scan">▣</span><div><h2>Screen a leaf photo</h2><p>Take a clear photo in good light. The photo stays on this device.</p></div></div><label className="upload-box">{preview ? <img src={preview} alt="Selected leaf preview" /> : <span className="upload-placeholder">＋<b>Choose a leaf photo</b><small>JPG or PNG · one leaf at a time</small></span>}<input type="file" accept="image/*" onChange={choose} /></label>{preview && !result && <button className="primary-button" onClick={assess} disabled={assessing}>{assessing ? 'Loading model and screening…' : 'Screen this photo'}</button>}{result && <div className={`scan-result ${result.clear ? 'scan-result-good' : 'scan-result-unclear'}`}><span className="notice-icon">{result.clear ? '✓' : 'i'}</span><div><strong>{result.clear ? result.message : 'Could not assess any disease'}</strong>{result.results.map((item, index) => <p key={item.className}>{index === 0 ? 'Most likely' : 'Also possible'}: {formatClassName(item.className)} · {Math.round(item.score * 100)}% model score</p>)}{!result.clear && <p>{result.message}</p>}</div></div>}<p className="disclaimer">Screening result only, not a confirmed diagnosis. Scores are rankings, not certainty. If you are concerned, contact your local agriculture extension office.</p></section>
}

function formatClassName(className) {
  return className.replaceAll('___', ' — ').replaceAll('_', ' ').replaceAll(' Two-spotted spider mite', '')
}
