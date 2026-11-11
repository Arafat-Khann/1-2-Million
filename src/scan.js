import * as tf from '@tensorflow/tfjs'

let modelPromise
let classNamesPromise

async function loadModel() {
  modelPromise ||= tf.loadLayersModel('/cropguard_model/web_model/model.json')
  classNamesPromise ||= fetch('/cropguard_model/class_names.json').then((response) => {
    if (!response.ok) throw new Error('Leaf class names could not be loaded.')
    return response.json()
  })
  const [model, classNames] = await Promise.all([modelPromise, classNamesPromise])
  return { model, classNames }
}

export async function scanLeaf(imageSource) {
  try {
    const { model, classNames } = await loadModel()
    const image = await loadImage(imageSource)
    const resizedCanvas = resizeImageToModelInput(image)
    const input = tf.tidy(() => tf.browser.fromPixels(resizedCanvas).toFloat().div(127.5).sub(1).expandDims(0))
    const prediction = model.predict(input)
    const probabilities = Array.isArray(prediction) ? prediction[0] : prediction
    const values = await probabilities.data()
    input.dispose()
    if (Array.isArray(prediction)) prediction.forEach((tensor) => tensor.dispose())
    else prediction.dispose()
    image.close?.()

    const ranked = Array.from(values).map((score, index) => ({ className: classNames[index] || `Class ${index + 1}`, score })).sort((a, b) => b.score - a.score).slice(0, 3)
    const top = ranked[0]
    if (!top || top.score < 0.65) return { clear: false, results: ranked, message: 'Could not assess any disease. Try a clearer photo with one leaf in good light.' }
    return { clear: true, results: ranked, message: confidenceLabel(top.score) }
  } catch (error) {
    console.error('Leaf screening failed.', error)
    return { clear: false, results: [], message: 'Could not assess this photo. Try again with a clearer image.' }
  }
}

function resizeImageToModelInput(image) {
  const canvas = document.createElement('canvas')
  canvas.width = 224
  canvas.height = 224
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser cannot prepare the image for screening.')
  context.drawImage(image, 0, 0, 224, 224)
  return canvas
}

function confidenceLabel(score) {
  if (score >= 0.78) return 'Highest-ranked result (78%+ model score)'
  if (score >= 0.72) return 'Very likely top-ranked result'
  return 'Likely top-ranked result'
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The selected image could not be read.'))
    image.src = source
  })
}
