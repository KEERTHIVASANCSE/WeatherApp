import { useEffect, useState } from "react"
import { useSearchParams } from 'react-router-dom'
import ErrorHandling from "../components/ErrorHandling"
import Loading from "../components/Loading"
import RecentSearches from "../components/RecentSearches"
import SearchBar from "../components/SearchBar"
import WeatherCard from "../components/WeatherCard"
import Profile from "./Profile"
import { fetchWeatherByCity } from "../services/weatherApi"

export default function DashBoard({ recentSearch, setRecentSearch }) {
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('lastWeather')
    return saved ? JSON.parse(saved) : null
  })
  const [searchParams, setSearchParams] = useSearchParams()

  const city = searchParams.get('city')

  useEffect(() => {
    // If no city query param is passed, preserve existing / cached weather data
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

        // Prevent stale requests from overwriting newer searches
        if (!isCurrent) return

        setData(weatherData)
        setRecentSearch((prev = []) => {
          const filtered = prev.filter(c => c.toLowerCase() !== weatherData.city.name.toLowerCase())
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

  // Direct search action triggered from Dashboard search input or button
  const handleDirectSearch = (query) => {
    const trimmed = (query || "").trim()
    if (!trimmed) {
      setError("Please enter a city name to search.")
      setData(null)
      return
    }
    setSearchParams({ city: trimmed })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff8177] to-[#b12a5b] flex flex-col items-center justify-start pt-24 p-6 gap-6">
      <SearchBar 
        search={search} 
        setSearch={setSearch} 
        onSearch={handleDirectSearch}
      />

      {loading && <Loading />}
      {!loading && error && <ErrorHandling error={error} />}
      {!loading && !error && data && <WeatherCard city={data} />}
    </div>
  )
}