import { useEffect, useState, useRef } from "react"
import { useSearchParams } from 'react-router-dom'
import ErrorHandling from "../components/ErrorHandling"
import Loading from "../components/Loading"
import RecentSearches from "../components/RecentSearches"
import SearchBar from "../components/SearchBar"
import WeatherCard from "../components/WeatherCard"
import HourlyChart from "../components/HourlyChart"
import RecommendationsCard from "../components/RecommendationsCard"
import AirQualityCard from "../components/AirQualityCard"
import AstronomyCard from "../components/AstronomyCard"
import SevereAlertsCard from "../components/SevereAlertsCard"
import WeatherMap from "../components/WeatherMap"
import { fetchWeatherByCity } from "../services/weatherApi"
import { MapPin, Star, Sparkles, Navigation } from 'lucide-react'

// Background Videos
import defaultBgVideo from "../assets/855437-hd_1920_1080_25fps.mp4"
import clearBgVideo from "../assets/4196175-hd_1920_1080_30fps.mp4"
import cloudBgVideo from "../assets/5930986-hd_1920_1080_30fps.mp4"
import rainBgVideo from "../assets/20351897-hd_720_1280_30fps.mp4"
import hazeBgVideo from "../assets/15024250_1080_1920_24fps.mp4"
import nightBgVideo from "../assets/2629919-hd_1920_1080_30fps.mp4"

export default function DashBoard({
  recentSearch = [],
  setRecentSearch,
  unit = 'C',
  setUnit,
  onWeatherUpdate
}) {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLocating, setIsLocating] = useState(false)

  // Favorites state saved in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('weatherFavorites')
      return saved ? JSON.parse(saved) : ['Chennai', 'Tokyo', 'London', 'New York']
    } catch {
      return ['Chennai', 'Tokyo', 'London', 'New York']
    }
  })

  // Weather data: null until a city is searched
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('lastWeather')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const city = searchParams.get('city')

  // Toggle favorite city
  const handleToggleFavorite = (cityName) => {
    setFavorites((prev) => {
      let updated
      if (prev.includes(cityName)) {
        updated = prev.filter((c) => c !== cityName)
      } else {
        updated = [...prev, cityName]
      }
      localStorage.setItem('weatherFavorites', JSON.stringify(updated))
      return updated
    })
  }

  // Geolocation / My Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          // Reverse geocode via free OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`)
          if (res.ok) {
            const geo = await res.json()
            const detectedCity = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || 'Current Location'
            setSearchParams({ city: detectedCity })
          } else {
            setSearchParams({ city: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}` })
          }
        } catch {
          setError("Unable to resolve GPS location address. Please enter city manually.")
        } finally {
          setIsLocating(false)
        }
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setError("Location access denied or timed out.")
        setIsLocating(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  // Main search effect
  useEffect(() => {
    if (city === null) {
      return
    }

    const trimmedCity = city.trim()
    if (!trimmedCity) {
      setError("Please enter a city name to search.")
      setData(null)
      setLoading(false)
      return
    }

    let isCurrent = true
    const abortController = new AbortController()

    const handleSearch = async () => {
      try {
        setError("")
        setLoading(true)

        const weatherData = await fetchWeatherByCity(trimmedCity, abortController.signal)

        // Discard stale responses
        if (!isCurrent) return

        setData(weatherData)
        if (onWeatherUpdate) {
          onWeatherUpdate(weatherData)
        }
        setRecentSearch((prev = []) => {
          const filtered = prev.filter((c) => c.toLowerCase() !== weatherData.city.name.toLowerCase())
          const updated = [weatherData.city.name, ...filtered].slice(0, 10)
          localStorage.setItem('recentSearch', JSON.stringify(updated))
          return updated
        })
        localStorage.setItem('lastWeather', JSON.stringify(weatherData))
        setSearch("")
      } catch (err) {
        if (!isCurrent) return
        if (err.name === 'AbortError') return

        setError(err.message || "Failed to fetch weather data. Please try again.")
        setData(null)
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    handleSearch()

    return () => {
      isCurrent = false
      abortController.abort()
    }
  }, [city, setRecentSearch])

  // Direct Search submission from SearchBar
  const handleDirectSearch = (query) => {
    const trimmed = (query || "").trim()
    if (!trimmed) {
      setError("Please enter a city name to search.")
      setData(null)
      return
    }
    setSearchParams({ city: trimmed })
  }

  // Determine dynamic background video based on weather conditions
  // "Preserve the default background until a city is successfully searched."
  const getDynamicBackgroundVideo = () => {
    if (!data || !data.list || data.list.length === 0) {
      return defaultBgVideo
    }

    const cur = data.list[0]
    const desc = (cur.weather[0].description || '').toLowerCase()
    const code = cur.weather[0].id
    const isDay = cur.weather[0].icon?.includes('d') ?? true

    if (code >= 95 || desc.includes('thunder') || desc.includes('storm')) {
      return rainBgVideo
    }
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || desc.includes('rain') || desc.includes('drizzle')) {
      return rainBgVideo
    }
    if ((code >= 71 && code <= 86) || desc.includes('snow') || desc.includes('blizzard')) {
      return hazeBgVideo
    }
    if (code === 45 || code === 48 || desc.includes('fog') || desc.includes('haze') || desc.includes('mist')) {
      return hazeBgVideo
    }
    if (!isDay && (code === 0 || code === 1)) {
      return nightBgVideo
    }
    if (code === 0 || code === 1 || desc.includes('clear') || desc.includes('sun')) {
      return clearBgVideo
    }
    if (code === 2 || code === 3 || desc.includes('cloud') || desc.includes('overcast')) {
      return cloudBgVideo
    }

    return defaultBgVideo
  }

  const currentBgVideo = getDynamicBackgroundVideo()
  const isCityFavorite = data ? favorites.includes(data.city.name) : false

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start pt-24 pb-16 px-4 md:px-8">
      {/* Dynamic Background Video with Smooth Fade & Readability Overlay */}
      <video
        key={currentBgVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover transition-opacity duration-1000 -z-20"
      >
        <source src={currentBgVideo} type="video/mp4" />
      </video>

      {/* Glassmorphic Gradient Overlay for Contrast & Readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#1e1b4b]/60 to-[#0F172A]/85 backdrop-blur-[2px] -z-10 pointer-events-none" />

      {/* Main Container Shell */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-6 z-10">
        {/* Search Bar + Controls Header */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-full flex-1 max-w-2xl">
              <SearchBar
                search={search}
                setSearch={setSearch}
                onSearch={handleDirectSearch}
              />
            </div>

            {/* GPS Location & Unit Toggle Bar */}
            <div className="flex items-center gap-2 mt-2 sm:mt-8">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className={`px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  isLocating ? 'animate-pulse text-cyan-300' : ''
                }`}
                title="Use Current GPS Location"
              >
                <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                <span className="hidden md:inline">{isLocating ? 'Locating...' : 'My GPS'}</span>
              </button>

              {/* Unit Toggle Button */}
              {setUnit && (
                <button
                  onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
                  className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-cyan-200 text-xs font-bold backdrop-blur-md transition-all shadow-md cursor-pointer"
                  title="Toggle Celsius / Fahrenheit"
                >
                  °{unit}
                </button>
              )}
            </div>
          </div>

          {/* Favorite Cities Chips Row */}
          {favorites.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 shrink-0">
                <Star size={12} className="fill-amber-400" /> Favorites:
              </span>
              {favorites.map((favCity) => (
                <button
                  key={favCity}
                  onClick={() => handleDirectSearch(favCity)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer shrink-0 ${
                    data?.city?.name.toLowerCase() === favCity.toLowerCase()
                      ? 'bg-amber-400/30 text-amber-200 border-amber-300 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20'
                  }`}
                >
                  {favCity}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && <Loading />}

        {/* Error Notification */}
        {!loading && error && <ErrorHandling error={error} />}

        {/* Main Content Sections when City Data Loaded */}
        {!loading && !error && data && (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">
            {/* Severe Weather Advisories if active */}
            {data.advisories && data.advisories.length > 0 && (
              <SevereAlertsCard advisories={data.advisories} />
            )}

            {/* Core Hero Weather Card with 5-Day Horizon */}
            <WeatherCard
              city={data}
              unit={unit}
              isFavorite={isCityFavorite}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* 24-Hour Atmospheric Curve Chart */}
            {data.hourly && data.hourly.length > 0 && (
              <HourlyChart hourly={data.hourly} unit={unit} />
            )}

            {/* AI Smart Recommendations (Umbrella, Outfit, Outdoor, Travel) */}
            {data.recommendations && (
              <RecommendationsCard
                recommendations={data.recommendations}
                cityName={data.city.name}
              />
            )}

            {/* Air Quality & Astronomy Dual Cards Row */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              {data.airQuality && (
                <AirQualityCard
                  airQuality={data.airQuality}
                  astronomy={data.astronomy}
                />
              )}

              {data.astronomy && (
                <AstronomyCard astronomy={data.astronomy} />
              )}
            </div>

            {/* Interactive Atmospheric Map */}
            {data.city && (
              <WeatherMap city={data.city} />
            )}
          </div>
        )}

        {/* Friendly Empty Search State Prompt */}
        {!loading && !error && !data && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center text-white max-w-lg mt-8 shadow-xl">
            <Sparkles className="mx-auto text-cyan-300 mb-3" size={36} />
            <h3 className="text-xl font-bold mb-2">Welcome to WeatherSkyZen Explorer</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              Enter any city worldwide (e.g., Chennai, London, Tokyo, New York) or tap <strong>My GPS</strong> to experience real-time microclimate telemetries, 24-hour charts, and AI recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Chennai', 'Tokyo', 'London', 'Dubai', 'Paris'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleDirectSearch(c)}
                  className="text-xs bg-white/15 hover:bg-cyan-500/30 text-cyan-200 border border-white/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}