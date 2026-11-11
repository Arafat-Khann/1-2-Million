// Temporary local mock. Replace this file with the weather teammate's module.
export async function getWeather() {
  return { fetchedAt: new Date().toISOString(), current: { temperature: 29, rain: 0 }, forecast: [
    { day: 'Today', label: 'Sunny intervals', high: 31, rain: 10, wind: 14 },
    { day: 'Tomorrow', label: 'Possible rain', high: 28, rain: 65, wind: 18 },
    { day: 'Day 3', label: 'Partly cloudy', high: 27, rain: 20, wind: 12 },
  ] }
}
