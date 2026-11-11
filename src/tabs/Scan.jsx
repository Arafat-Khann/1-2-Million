import { useState } from 'react'
import { scanLeaf } from '../scan'

export function ScanTab({ hasFarm }) {
  const [preview, setPreview] = useState('')
  const [result, setResult] = useState(null)
  function choose(event) { const file = event.target.files?.[0]; if (!file) return; setPreview(URL.createObjectURL(file)); setResult(null) }
  async function assess() { setResult(await scanLeaf(preview)) }
  if (!hasFarm) return null
  return <section className="card"><div className="card-intro"><span className="section-icon scan">▣</span><div><h2>Screen a leaf photo</h2><p>Take a clear photo in good light. The photo stays on this device.</p></div></div><label className="upload-box">{preview ? <img src={preview} alt="Selected leaf preview" /> : <span className="upload-placeholder">＋<b>Choose a leaf photo</b><small>JPG or PNG · one leaf at a time</small></span>}<input type="file" accept="image/*" onChange={choose} /></label>{preview && !result && <button className="primary-button" onClick={assess}>Screen this photo</button>}{result && <div className="notice info"><span className="notice-icon">i</span><p><strong>Could not assess this photo</strong><br />The leaf model is not connected yet.</p></div>}<p className="disclaimer">Screening result only, not a confirmed diagnosis. If you are concerned, contact your local agriculture extension office.</p></section>
}
