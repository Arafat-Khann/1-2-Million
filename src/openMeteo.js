const endpoint = 'https://api.open-meteo.com/v1/forecast'
const geocodingEndpoint = 'https://geocoding-api.open-meteo.com/v1/search'

export async function findLocation(village, district) {
  const query = [village, district].filter(Boolean).join(', ')
  const response = await fetch(`${geocodingEndpoint}?${new URLSearchParams({ name: query, count: '5', language: 'en', format: 'json' })}`)
  if (!response.ok) throw new Error(`Location search returned ${response.status}.`)
  const data = await response.json()
  if (!data.results?.length) throw new Error('No matching location found. Check the village and district spelling.')
  return data.results[0]
}

export async function getOpenMeteoWeather(farm) {
  const params = new URLSearchParams({
    latitude: farm.latitude,
    longitude: farm.longitude,
    timezone: 'auto',
    forecast_days: '4',
    current: 'temperature_2m,precipitation,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max',
  })
  const response = await fetch(`${endpoint}?${params}`)
  if (!response.ok) throw new Error(`Weather service returned ${response.status}.`)
  const data = await response.json()
  const labels = ['Today', 'Tomorrow', 'Day 3', 'Day 4']
  return {
    fetchedAt: new Date().toISOString(),
    current: {
      temperature: Math.round(data.current.temperature_2m),
      rain: data.current.precipitation,
      wind: Math.round(data.current.wind_speed_10m),
    },
    forecast: data.daily.time.map((date, index) => ({
      day: labels[index] || new Date(date).toLocaleDateString(),
      label: weatherLabel(data.daily.weather_code[index]),
      high: Math.round(data.daily.temperature_2m_max[index]),
      rain: data.daily.precipitation_probability_max[index] ?? 0,
      wind: Math.round(data.daily.wind_speed_10m_max[index]),
    })),
  }
}

function weatherLabel(code) {
  if (code === 0) return 'Clear sky'
  if ([1, 2].includes(code)) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Fog possible'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle possible'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain possible'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow possible'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm possible'
  return 'Conditions unavailable'
}
