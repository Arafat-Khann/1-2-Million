// Temporary local mock. Replace this file with the rules teammate's module.
export function findWarnings(weather) {
  const rain = weather.forecast.find((day) => day.rain >= 50)
  return rain ? [{ type: 'rain', title: 'Rain is possible', text: `${rain.day} has a chance of rain. Recheck before irrigating.`, tone: 'amber' }] : []
}
export function estimateWater(farm) {
  const cropFactor = farm.crop === 'potato' ? 4 : 5
  return { estimate: cropFactor, unit: 'mm today', assumption: 'Indicative estimate for a typical day, based on crop and growth stage.' }
}
