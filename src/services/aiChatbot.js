/**
 * ZenAI - Conversational AI Weather Intelligence Engine for WeatherSkyZen
 * Fast, privacy-preserving, zero paid API keys, with real Open-Meteo live weather data.
 */

import { fetchWeatherByCity, compareCities, formatTemp } from './weatherApi.js'

// Multilingual greeting and UI strings
export const I18N = {
  en: {
    greeting: "Hello! I'm ZenAI, your Skyzen Weather Intelligence Copilot. Ask me anything about the weather in your searched location or worldwide!",
    umbrellaYes: "Yes, you should definitely carry an umbrella!",
    umbrellaNo: "No umbrella needed today!",
    compareTitle: "City Comparison Analysis",
    travelTitle: "AI Travel Recommendation",
    outdoorTitle: "Outdoor Activities & Exercise",
    airQualityTitle: "Air Quality & UV Advisory",
    suggestions: [
      "☂️ Umbrella Check",
      "👕 What to Wear",
      "⚡ Severe Alerts",
      "🏃 Running & Outdoor",
      "📊 Compare Cities",
      "🍃 Air Quality",
      "✈️ Travel Tip"
    ]
  },
  es: {
    greeting: "¡Hola! Soy ZenAI, tu copiloto inteligente de clima en Skyzen. ¿En qué puedo ayudarte hoy? ¡Pregúntame sobre cualquier ciudad o tu ubicación actual!",
    umbrellaYes: "¡Sí, definitivamente deberías llevar un paraguas!",
    umbrellaNo: "¡No necesitas paraguas hoy!",
    compareTitle: "Comparación de Ciudades",
    travelTitle: "Recomendación de Viaje con IA",
    outdoorTitle: "Actividades al Aire Libre",
    airQualityTitle: "Calidad del Aire y UV",
    suggestions: [
      "☂️ ¿Llevar Paraguas?",
      "👕 ¿Qué Vestir?",
      "⚡ Alertas Clima",
      "🏃 Deporte al Aire Libre",
      "📊 Comparar Ciudades",
      "🍃 Calidad del Aire",
      "✈️ Consejos de Viaje"
    ]
  },
  fr: {
    greeting: "Bonjour ! Je suis ZenAI, votre assistant météo intelligent sur Skyzen. Posez-moi des questions sur votre ville recherchée ou n'importe où dans le monde !",
    umbrellaYes: "Oui, vous devriez absolument prendre un parapluie !",
    umbrellaNo: "Pas besoin de parapluie aujourd'hui !",
    compareTitle: "Comparaison de Villes",
    travelTitle: "Conseil Voyage IA",
    outdoorTitle: "Activités de Plein Air",
    airQualityTitle: "Qualité de l'Air et UV",
    suggestions: [
      "☂️ Prendre un parapluie ?",
      "👕 Que porter ?",
      "⚡ Alertes météo",
      "🏃 Sport extérieur",
      "📊 Comparer des villes",
      "🍃 Qualité de l'air",
      "✈️ Conseils voyage"
    ]
  },
  de: {
    greeting: "Hallo! Ich bin ZenAI, Ihr Skyzen Wetter-Copilot. Fragen Sie mich nach dem Wetter am aktuellen Suchort oder weltweit!",
    umbrellaYes: "Ja, Sie sollten auf jeden Fall einen Regenschirm mitnehmen!",
    umbrellaNo: "Heute wird kein Regenschirm benötigt!",
    compareTitle: "Städtevergleich",
    travelTitle: "KI-Reiseempfehlung",
    outdoorTitle: "Outdoor-Aktivitäten",
    airQualityTitle: "Luftqualität & UV",
    suggestions: [
      "☂️ Regenschirm nötig?",
      "👕 Was anziehen?",
      "⚡ Unwetterwarnungen",
      "🏃 Outdoor-Sport",
      "📊 Städte vergleichen",
      "🍃 Luftqualität",
      "✈️ Reisetipps"
    ]
  },
  hi: {
    greeting: "नमस्ते! मैं ZenAI हूँ, आपका Skyzen वेदर इंटेलिजेंस साथी। अपने खोजे गए शहर या किसी भी स्थान के मौसम के बारे में पूछें!",
    umbrellaYes: "हाँ, आज छाता ज़रूर साथ रखें!",
    umbrellaNo: "आज छाते की ज़रूरत नहीं है!",
    compareTitle: "शहरों की तुलना",
    travelTitle: "AI यात्रा सलाह",
    outdoorTitle: "आउटडोर गतिविधियाँ और कसरत",
    airQualityTitle: "वायु गुणवत्ता और UV स्तर",
    suggestions: [
      "☂️ क्या छाता चाहिए?",
      "👕 क्या पहनें?",
      "⚡ मौसम चेतावनी",
      "🏃 सुबह की सैर",
      "📊 शहरों की तुलना",
      "🍃 वायु गुणवत्ता",
      "✈️ यात्रा सुझाव"
    ]
  },
  ja: {
    greeting: "こんにちは！SkyzenのAIウェザーアシスタント「ZenAI」です。検索された都市や世界中の天候についてお答えします！",
    umbrellaYes: "はい、今日はぜひ傘をお持ちください！",
    umbrellaNo: "今日は傘の心配はいりません！",
    compareTitle: "都市の気象比較",
    travelTitle: "AI旅行アドバイス",
    outdoorTitle: "屋外アクティビティ",
    airQualityTitle: "大気質とUV指数",
    suggestions: [
      "☂️ 傘は必要？",
      "👕 おすすめの服装",
      "⚡ 気象警報",
      "🏃 屋外運動",
      "📊 都市を比較",
      "🍃 大気質情報",
      "✈️ 旅行計画"
    ]
  }
}

/**
 * Extract city name(s) from user prompt with support for active searched location
 */
function extractCities(text, activeCityName) {
  // Check for comparison: "compare X with Y" or "compare X and Y"
  const compMatch = text.match(/compare\s+([a-zA-Z\s]+?)\s+(?:and|with|to|vs\.?)\s+([a-zA-Z\s]+)/i)
  if (compMatch) {
    return {
      type: 'compare',
      cities: [compMatch[1].trim(), compMatch[2].trim()]
    }
  }

  // "compare with [City]" or "compare to [City]" relative to active searched location
  const relativeComp = text.match(/compare\s+(?:with|to|against)\s+([a-zA-Z\s]+)/i)
  if (relativeComp && activeCityName) {
    return {
      type: 'compare',
      cities: [activeCityName, relativeComp[1].trim()]
    }
  }

  // Common prepositions: in, for, at, around
  const match = text.match(/(?:in|at|for|around|weather\s+of|weather\s+in)\s+([a-zA-Z\s]+)/i)
  if (match) {
    const cleaned = match[1]
      .replace(/\b(today|tomorrow|now|please|right now|this week|the city|current location)\b/gi, '')
      .trim()
    if (cleaned.length >= 2) return { type: 'single', city: cleaned }
  }

  return null
}

/**
 * Main AI Query Processor
 */
export async function processAIChat({
  message,
  currentWeather,
  unit = 'C',
  language = 'en'
}) {
  const query = message.trim().toLowerCase()
  const langStrings = I18N[language] || I18N.en
  const activeCityName = currentWeather?.city?.name

  // 1. Detect if query is asking to compare cities
  const cityInfo = extractCities(message, activeCityName)
  if (cityInfo && cityInfo.type === 'compare') {
    try {
      const comp = await compareCities(cityInfo.cities[0], cityInfo.cities[1])
      const cA = comp.cityA.list[0]
      const cB = comp.cityB.list[0]

      const reply = `📊 **${comp.cityA.city.name} vs ${comp.cityB.city.name}**:\n\n• **${comp.cityA.city.name}**: ${formatTemp(cA.main.temp, unit)}, ${cA.weather[0].description} (Wind: ${cA.wind.speed} m/s, Humidity: ${cA.main.humidity}%)\n• **${comp.cityB.city.name}**: ${formatTemp(cB.main.temp, unit)}, ${cB.weather[0].description} (Wind: ${cB.wind.speed} m/s, Humidity: ${cB.main.humidity}%)\n\n🏆 **Verdict**: ${comp.summary}`

      return {
        text: reply,
        cards: [comp.cityA, comp.cityB],
        followUps: [
          `☂️ Umbrella in ${comp.cityA.city.name}`,
          `👕 What to wear in ${comp.cityB.city.name}`,
          `7-day forecast for ${comp.cityA.city.name}`
        ]
      }
    } catch (err) {
      return {
        text: `I couldn't compare those locations. Please make sure both city names are spelled correctly.`,
        followUps: ['Compare Tokyo and London', 'Weather in Chennai']
      }
    }
  }

  // 2. Resolve target weather: either extracted city, or active searched city
  let targetWeather = currentWeather
  if (cityInfo && cityInfo.type === 'single') {
    try {
      targetWeather = await fetchWeatherByCity(cityInfo.city)
    } catch (e) {
      // If specific search fails, fall back to active city
    }
  }

  // If no weather data exists yet, fall back to default
  if (!targetWeather || !targetWeather.list || targetWeather.list.length === 0) {
    try {
      targetWeather = await fetchWeatherByCity('Chennai')
    } catch (e) {
      return {
        text: "Please search for a city on the dashboard so I can analyze its real-time telemetries for you!",
        followUps: ['Weather in Chennai', 'Weather in London', 'Weather in Tokyo']
      }
    }
  }

  const cur = targetWeather.list[0]
  const cityName = targetWeather.city.name
  const tempStr = formatTemp(cur.main.temp, unit)
  const feelsStr = formatTemp(cur.main.feels_like, unit)
  const desc = cur.weather[0].description
  const rec = targetWeather.recommendations || {}
  const air = targetWeather.airQuality || {}

  // 3. Umbrella questions
  if (query.includes('umbrella') || query.includes('rain') || query.includes('shower') || query.includes('precipitation')) {
    const isNeeded = rec.umbrella?.needed
    const pop = cur.rainProbability ?? 0
    return {
      text: `${isNeeded ? '☔ **' + langStrings.umbrellaYes + '**' : '☀️ **' + langStrings.umbrellaNo + '**'}\n\nIn **${cityName}**, current conditions are **${desc}** with a rain probability of **${pop}%**. ${rec.umbrella?.advice || ''}`,
      cards: [targetWeather],
      followUps: [
        `👕 What should I wear in ${cityName}?`,
        `🏃 Outdoor workout in ${cityName}?`,
        `📅 7-day forecast for ${cityName}`
      ]
    }
  }

  // 4. Clothing & Outfit questions
  if (query.includes('wear') || query.includes('clothing') || query.includes('dress') || query.includes('outfit') || query.includes('jacket') || query.includes('sweater')) {
    const clothing = rec.clothing || {}
    return {
      text: `👕 **Smart Clothing Recommendation for ${cityName}**:\n\n• **Current Temp**: ${tempStr} (Feels like: ${feelsStr})\n• **Condition**: ${desc}\n• **Outfit Style**: **${clothing.title}**\n• **Suggested Items**: ${clothing.items?.join(', ')}\n\n💡 *Tip: ${clothing.advice}*`,
      cards: [targetWeather],
      followUps: [
        `☂️ Do I need an umbrella in ${cityName}?`,
        `🍃 Air quality in ${cityName}`,
        `🏃 Best outdoor time in ${cityName}`
      ]
    }
  }

  // 5. Travel & Trip Planning
  if (query.includes('travel') || query.includes('trip') || query.includes('visit') || query.includes('vacation') || query.includes('tour')) {
    const travel = rec.travelTip || {}
    const popMax = targetWeather.list.slice(0, 5).reduce((acc, d) => Math.max(acc, d.rainProbability || 0), 0)
    return {
      text: `✈️ **AI Travel Recommendation for ${cityName}**:\n\n• **Overview**: ${travel.summary || `${cityName} is currently ${tempStr} with ${desc}.`}\n• **5-Day Max Rain Risk**: ~${popMax}%\n• **ZenAI Advisory**: ${travel.verdict}\n\nPack comfortable footwear and check the 5-day trajectory for itinerary planning!`,
      cards: [targetWeather],
      followUps: [
        `📅 7-day forecast for ${cityName}`,
        `🍃 Air quality in ${cityName}`,
        `Compare ${cityName} with Paris`
      ]
    }
  }

  // 6. Outdoor Activities & Running
  if (query.includes('outdoor') || query.includes('run') || query.includes('jog') || query.includes('cycling') || query.includes('exercise') || query.includes('walk') || query.includes('gym')) {
    const outdoor = rec.outdoorActivity || {}
    return {
      text: `🏃 **Outdoor Activities & Exercise in ${cityName}**:\n\n• **Suitability Rating**: **${outdoor.score}** (Activity Index: ${outdoor.runningScore || 80}/100)\n• **Best Window**: ${outdoor.bestTime}\n• **Recommendation**: ${outdoor.activitySuggestion}\n• **Wind & UV**: ${cur.wind.speed} m/s wind | UV Index ${air.uvIndex || 3} (${air.uvLabel || 'Moderate'})`,
      cards: [targetWeather],
      followUps: [
        `👕 What to wear for running in ${cityName}?`,
        `☂️ Will it rain in ${cityName}?`,
        `🍃 Air quality in ${cityName}`
      ]
    }
  }

  // 7. Air Quality & UV
  if (query.includes('air') || query.includes('aqi') || query.includes('pollution') || query.includes('uv') || query.includes('sunscreen') || query.includes('smog')) {
    return {
      text: `🍃 **Air Quality & UV Index for ${cityName}**:\n\n• **Air Quality Index (EAQI)**: **${air.aqi || 20}** (${air.label || 'Good'})\n• **PM2.5 / PM10**: ${air.pm2_5 || '3.5'} µg/m³ / ${air.pm10 || '7.1'} µg/m³\n• **UV Index**: **${air.uvIndex || 3}** (${air.uvLabel || 'Moderate'})\n\n${(air.uvIndex || 0) >= 6 ? '☀️ High UV detected: Wear sunglasses and apply SPF 30+ sunscreen.' : '🌿 Air is clear for open-air strolls.'}`,
      cards: [targetWeather],
      followUps: [
        `🏃 Outdoor activities in ${cityName}`,
        `☂️ Should I carry an umbrella in ${cityName}?`,
        `📅 7-day forecast for ${cityName}`
      ]
    }
  }

  // 8. Severe Weather Alerts & Advisories
  if (query.includes('alert') || query.includes('severe') || query.includes('warning') || query.includes('storm') || query.includes('thunder')) {
    const advisories = targetWeather.advisories || []
    if (advisories.length === 0) {
      return {
        text: `✅ **No Severe Weather Alerts in ${cityName}**\n\nConditions are tranquil. Winds are gentle at ${cur.wind.speed} m/s and temperature is pleasant at ${tempStr}.`,
        cards: [targetWeather],
        followUps: [
          `📅 7-day forecast for ${cityName}`,
          `👕 What should I wear today in ${cityName}?`
        ]
      }
    }
    const alertList = advisories.map(a => `⚠️ **${a.title}**: ${a.message}`).join('\n\n')
    return {
      text: `⚡ **Active Weather Advisories for ${cityName}**:\n\n${alertList}`,
      cards: [targetWeather],
      followUps: [
        `Safety advice for ${cityName}`,
        `24-hour hourly rain chart`,
        `What to wear in ${cityName}`
      ]
    }
  }

  // 9. 7-Day / Daily Forecast
  if (query.includes('7-day') || query.includes('forecast') || query.includes('week') || query.includes('tomorrow') || query.includes('weekend')) {
    const days = targetWeather.list.slice(1, 6)
    const formattedDays = days
      .map(d => {
        const date = new Date(d.dt_txt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
        return `• **${date}**: ${formatTemp(d.main.temp_max, unit)} / ${formatTemp(d.main.temp_min, unit)} — *${d.weather[0].description}*`
      })
      .join('\n')

    return {
      text: `📅 **5-Day Weather Trajectory for ${cityName}**:\n\n${formattedDays}\n\nScroll the trajectory cards on the dashboard for detailed hour-by-hour telemetry!`,
      cards: [targetWeather],
      followUps: [
        `☂️ Rain chances this week in ${cityName}`,
        `✈️ Travel tips for ${cityName}`
      ]
    }
  }

  // 10. General Weather Query or Default Location Context
  return {
    text: `🌤️ **Live Atmospheric Telemetry for ${cityName}**:\n\n• **Temperature**: ${tempStr} (Feels like: ${feelsStr})\n• **Condition**: **${desc}**\n• **High / Low**: ${formatTemp(cur.main.temp_max, unit)} / ${formatTemp(cur.main.temp_min, unit)}\n• **Humidity**: ${cur.main.humidity}%\n• **Wind Speed**: ${cur.wind.speed} m/s\n• **Rain Probability**: ${cur.rainProbability ?? 0}%\n• **Air Quality**: AQI ${air.aqi || 22} (${air.label || 'Good'})\n\nHow can I help you plan your day in ${cityName}?`,
    cards: [targetWeather],
    followUps: [
      `☂️ Umbrella needed in ${cityName}?`,
      `👕 What to wear in ${cityName}?`,
      `🏃 Best time for outdoor exercise in ${cityName}`,
      `Compare ${cityName} with London`
    ]
  }
}
