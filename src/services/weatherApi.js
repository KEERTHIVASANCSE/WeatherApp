/**
 * Open-Meteo Weather Service
 * Free, non-commercial weather service requiring NO API keys or environment variables.
 * Endpoints used:
 * - Geocoding API: https://geocoding-api.open-meteo.com/v1/search
 * - Forecast API: https://api.open-meteo.com/v1/forecast
 */

// WMO Weather Interpretation Codes (WW)
export function getWmoWeather(code, isDay = 1) {
  const c = Number(code);
  switch (c) {
    case 0:
      return {
        id: 0,
        main: 'Clear',
        description: isDay ? 'Clear sky' : 'Clear night',
        icon: isDay ? '01d' : '01n'
      };
    case 1:
      return {
        id: 1,
        main: 'Clear',
        description: isDay ? 'Mainly clear' : 'Mainly clear night',
        icon: isDay ? '02d' : '02n'
      };
    case 2:
      return {
        id: 2,
        main: 'Clouds',
        description: 'Partly cloudy',
        icon: isDay ? '03d' : '03n'
      };
    case 3:
      return {
        id: 3,
        main: 'Clouds',
        description: 'Overcast',
        icon: '04d'
      };
    case 45:
      return {
        id: 45,
        main: 'Haze',
        description: 'Fog',
        icon: '50d'
      };
    case 48:
      return {
        id: 48,
        main: 'Haze',
        description: 'Depositing rime fog',
        icon: '50d'
      };
    case 51:
      return {
        id: 51,
        main: 'Rain',
        description: 'Light drizzle',
        icon: '09d'
      };
    case 53:
      return {
        id: 53,
        main: 'Rain',
        description: 'Moderate drizzle',
        icon: '09d'
      };
    case 55:
      return {
        id: 55,
        main: 'Rain',
        description: 'Dense drizzle',
        icon: '09d'
      };
    case 56:
      return {
        id: 56,
        main: 'Snow',
        description: 'Light freezing drizzle',
        icon: '13d'
      };
    case 57:
      return {
        id: 57,
        main: 'Snow',
        description: 'Dense freezing drizzle',
        icon: '13d'
      };
    case 61:
      return {
        id: 61,
        main: 'Rain',
        description: 'Slight rain',
        icon: '10d'
      };
    case 63:
      return {
        id: 63,
        main: 'Rain',
        description: 'Moderate rain',
        icon: '10d'
      };
    case 65:
      return {
        id: 65,
        main: 'Rain',
        description: 'Heavy torrential rain',
        icon: '10d'
      };
    case 66:
      return {
        id: 66,
        main: 'Snow',
        description: 'Light freezing rain',
        icon: '13d'
      };
    case 67:
      return {
        id: 67,
        main: 'Snow',
        description: 'Heavy freezing rain',
        icon: '13d'
      };
    case 71:
      return {
        id: 71,
        main: 'Snow',
        description: 'Slight snow fall',
        icon: '13d'
      };
    case 73:
      return {
        id: 73,
        main: 'Snow',
        description: 'Moderate snow fall',
        icon: '13d'
      };
    case 75:
      return {
        id: 75,
        main: 'Snow',
        description: 'Heavy snow fall',
        icon: '13d'
      };
    case 77:
      return {
        id: 77,
        main: 'Snow',
        description: 'Snow grains',
        icon: '13d'
      };
    case 80:
      return {
        id: 80,
        main: 'Rain',
        description: 'Slight rain showers',
        icon: '09d'
      };
    case 81:
      return {
        id: 81,
        main: 'Rain',
        description: 'Moderate rain showers',
        icon: '09d'
      };
    case 82:
      return {
        id: 82,
        main: 'Rain',
        description: 'Violent rain showers',
        icon: '09d'
      };
    case 85:
      return {
        id: 85,
        main: 'Snow',
        description: 'Slight snow showers',
        icon: '13d'
      };
    case 86:
      return {
        id: 86,
        main: 'Snow',
        description: 'Heavy snow showers',
        icon: '13d'
      };
    case 95:
      return {
        id: 95,
        main: 'Thunderstorm',
        description: 'Thunderstorm',
        icon: '11d'
      };
    case 96:
      return {
        id: 96,
        main: 'Thunderstorm',
        description: 'Thunderstorm with slight hail',
        icon: '11d'
      };
    case 99:
      return {
        id: 99,
        main: 'Thunderstorm',
        description: 'Thunderstorm with heavy hail',
        icon: '11d'
      };
    default:
      return {
        id: c || 0,
        main: 'Clear',
        description: 'Clear sky',
        icon: '01d'
      };
  }
}

/**
 * Fetch weather data for a city name using Open-Meteo Geocoding + Forecast APIs
 */
export async function fetchWeatherByCity(cityName, signal) {
  if (!cityName || !cityName.trim()) {
    throw new Error('Please enter a city name to search.');
  }

  const cleanQuery = cityName.trim();

  // 1. Geocoding API: resolve city name to coordinates
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;

  let geoRes;
  try {
    geoRes = await fetch(geoUrl, { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Unable to connect to weather network. Please check your internet connection.');
  }

  if (!geoRes.ok) {
    throw new Error(`Location search service returned status ${geoRes.status}`);
  }

  const geoData = await geoRes.json();
  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(`City "${cleanQuery}" not found. Please check the spelling and try again.`);
  }

  // Pick top location result
  const location = geoData.results[0];
  const { latitude, longitude, name, country, admin1, timezone } = location;

  // 2. Weather Forecast API: fetch current and daily forecast
  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', latitude);
  weatherUrl.searchParams.set('longitude', longitude);
  weatherUrl.searchParams.set(
    'current',
    ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation', 'weather_code', 'wind_speed_10m'].join(',')
  );
  weatherUrl.searchParams.set(
    'daily',
    ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'apparent_temperature_max', 'apparent_temperature_min', 'wind_speed_10m_max'].join(',')
  );
  weatherUrl.searchParams.set('timezone', timezone || 'auto');

  let weatherRes;
  try {
    weatherRes = await fetch(weatherUrl.toString(), { signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('Unable to connect to weather network. Please check your internet connection.');
  }

  if (!weatherRes.ok) {
    throw new Error(`Weather service returned status ${weatherRes.status}`);
  }

  const rawData = await weatherRes.json();
  const current = rawData.current;
  const daily = rawData.daily;

  if (!current) {
    throw new Error('No weather data available for this location.');
  }

  const isDay = current.is_day ?? 1;
  const currentWeatherInfo = getWmoWeather(current.weather_code, isDay);

  const countryDisplay = [admin1, country].filter(Boolean).join(', ') || country || '';

  // Adapt to the data contract expected by the existing UI components
  const adaptedData = {
    city: {
      name: name,
      country: countryDisplay,
      lat: latitude,
      lon: longitude
    },
    list: [
      {
        dt: Math.floor(Date.now() / 1000),
        dt_txt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        main: {
          temp: current.temperature_2m,
          feels_like: current.apparent_temperature,
          temp_max: daily?.temperature_2m_max ? daily.temperature_2m_max[0] : current.temperature_2m,
          temp_min: daily?.temperature_2m_min ? daily.temperature_2m_min[0] : current.temperature_2m,
          humidity: current.relative_humidity_2m,
          pressure: 1013
        },
        wind: {
          speed: current.wind_speed_10m
        },
        weather: [
          {
            id: current.weather_code,
            main: currentWeatherInfo.main,
            description: currentWeatherInfo.description,
            icon: currentWeatherInfo.icon
          }
        ]
      }
    ]
  };

  // Add 5-day daily forecast items (starting from tomorrow if available)
  if (daily && daily.time && daily.time.length > 0) {
    const startIdx = daily.time.length > 5 ? 1 : 0;
    const count = Math.min(5, daily.time.length - startIdx);

    for (let i = startIdx; i < startIdx + count; i++) {
      const code = daily.weather_code[i];
      const dayWeather = getWmoWeather(code, 1);
      adaptedData.list.push({
        dt: Math.floor(new Date(`${daily.time[i]}T12:00:00`).getTime() / 1000),
        dt_txt: `${daily.time[i]} 12:00:00`,
        main: {
          temp: daily.temperature_2m_max[i],
          temp_max: daily.temperature_2m_max[i],
          temp_min: daily.temperature_2m_min[i],
          feels_like: daily.apparent_temperature_max ? daily.apparent_temperature_max[i] : daily.temperature_2m_max[i],
          humidity: current.relative_humidity_2m
        },
        wind: {
          speed: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] : current.wind_speed_10m
        },
        weather: [
          {
            id: code,
            main: dayWeather.main,
            description: dayWeather.description,
            icon: dayWeather.icon
          }
        ]
      });
    }
  }

  return adaptedData;
}

// Backwards-compatible export
export const getWeather = fetchWeatherByCity;
