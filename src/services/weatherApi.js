
export const getWeather = async (city) => {
  if (!city?.trim()) {
    throw new Error("Please enter a city name.");
  }

  const geoUrl =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`;

  const geoResponse = await fetch(geoUrl);

  if (!geoResponse.ok) {
    throw new Error("Unable to find the city.");
  }

  const geoData = await geoResponse.json();
  const place = geoData.results?.[0];

  if (!place) {
    throw new Error("City not found. Try another city.");
  }

  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    throw new Error("Unable to fetch weather data.");
  }

  const weatherData = await weatherResponse.json();
  const current = weatherData.current;

  return {
    name: place.name,
    sys: { country: place.country_code },
    main: {
      temp: current.temperature_2m,
      feels_like: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
    },
    wind: {
      speed: current.wind_speed_10m / 3.6,
    },
    weather: [{
      main: getWeatherDescription(current.weather_code),
      description: getWeatherDescription(current.weather_code),
      icon: current.is_day ? "01d" : "01n",
    }],
    daily: weatherData.daily,
  };
};

function getWeatherDescription(code) {
  if (code === 0) return "Clear sky";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}
