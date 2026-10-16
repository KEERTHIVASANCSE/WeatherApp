import React, { useState, useEffect } from 'react'
import clearVideo from "../assets/4196175-hd_1920_1080_30fps.mp4"
import cloudVideo from "../assets/5930986-hd_1920_1080_30fps.mp4"
import rainVideo from "../assets/20351897-hd_720_1280_30fps.mp4"
import haze from "../assets/15024250_1080_1920_24fps.mp4"
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  Star,
  Share2,
  Clock,
  Check,
  Gauge
} from 'lucide-react'
import { formatTemp } from '../services/weatherApi'

export default function WeatherCard({
  city,
  unit = 'C',
  isFavorite = false,
  onToggleFavorite
}) {
  const [copied, setCopied] = useState(false)
  const [localTime, setLocalTime] = useState('')

  if (!city || !city.list || city.list.length === 0) return null
  const currentWeather = city.list[0]

  // Live local clock for the city's timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const tz = city.city?.timezone || 'auto'
        const options = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }
        if (tz && tz !== 'auto') {
          options.timeZone = tz
        }
        const timeString = new Date().toLocaleTimeString([], options)
        setLocalTime(timeString)
      } catch {
        setLocalTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }))
      }
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [city.city?.timezone])

  const getWeatherVideo = (condition = "") => {
    const cond = condition.toLowerCase()
    if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower"))
      return rainVideo
    if (cond.includes("haze") || cond.includes("fog") || cond.includes("mist"))
      return haze
    if (cond.includes("clear") || cond.includes("sun"))
      return clearVideo
    if (cond.includes("cloud") || cond.includes("overcast"))
      return cloudVideo
    if (cond.includes("thunder") || cond.includes("storm") || cond.includes("squall"))
      return rainVideo
    if (cond.includes("snow") || cond.includes("blizzard") || cond.includes("ice") || cond.includes("sleet"))
      return haze
    return cloudVideo
  }

  const getWeatherIcon = (code, className = "w-6 h-6 inline-block") => {
    const c = Number(code)
    if (c === 0 || c === 1) return <Sun className={`${className} text-yellow-300 animate-spin-slow`} />
    if (c === 2) return <CloudSun className={`${className} text-yellow-200`} />
    if (c === 3) return <Cloud className={`${className} text-blue-200`} />
    if (c === 45 || c === 48) return <CloudFog className={`${className} text-gray-300`} />
    if (c >= 51 && c <= 57) return <CloudDrizzle className={`${className} text-cyan-300`} />
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return <CloudRain className={`${className} text-blue-400`} />
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return <CloudSnow className={`${className} text-blue-100`} />
    if (c >= 95) return <CloudLightning className={`${className} text-amber-400`} />
    return <Sun className={`${className} text-yellow-300`} />
  }

  // 5-day daily forecast cards
  const filteredForecast = city.list
    .filter((item) => item.dt_txt && item.dt_txt.includes("12:00:00"))
    .slice(0, 5)

  const forecastItems = filteredForecast.length > 0 ? filteredForecast : city.list.slice(1, 6)

  const cityName = city.city?.name || 'Unknown Location'
  const countryName = city.city?.country ? `, ${city.city.country}` : ''
  const currentDesc = currentWeather.weather?.[0]?.description || 'Clear sky'
  const currentCode = currentWeather.weather?.[0]?.id ?? 0

  // Copy summary
  const handleCopySummary = () => {
    const summaryText = `🌤️ WeatherSkyZen Daily Summary for ${cityName}${countryName}:
• Temperature: ${formatTemp(currentWeather.main.temp, unit)} (Feels like ${formatTemp(currentWeather.main.feels_like, unit)})
• High / Low: ${formatTemp(currentWeather.main.temp_max, unit)} / ${formatTemp(currentWeather.main.temp_min, unit)}
• Condition: ${currentDesc}
• Humidity: ${currentWeather.main.humidity}% | Wind: ${currentWeather.wind.speed} m/s
Explore live at https://weatherskyzen.netlify.app/home`

    navigator.clipboard.writeText(summaryText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="w-full bg-black/5 backdrop-blur-sm border border-white/20 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-start gap-6 hover:shadow-2xl hover:shadow-gray-900 transition-all duration-300">
      <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 text-white w-full shadow-xl relative overflow-hidden">
        {/* Top Action Bar inside Hero Card */}
        <div className="flex items-center justify-between mb-2">
          {/* Live local time indicator */}
          <div className="flex items-center gap-1.5 text-xs text-white/80 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
            <Clock size={13} className="text-cyan-400" />
            <span className="font-mono">{localTime || 'Local Time'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Copy Summary */}
            <button
              onClick={handleCopySummary}
              className="p-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/15 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs px-2.5"
              title="Copy Weather Summary"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Favorite Star Button */}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(cityName)}
                className="p-1.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/15 transition-colors cursor-pointer"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={18}
                  className={isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white/70 hover:text-white'}
                />
              </button>
            )}
          </div>
        </div>

        {/* City & Temperature */}
        <h2 className="text-xl md:text-3xl font-black text-center tracking-wide">
          {cityName}{countryName}
        </h2>
        <h3 className="text-4xl md:text-7xl font-black text-center my-3 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
          {formatTemp(currentWeather.main.temp, unit)}
        </h3>

        {/* Weather Video Preview */}
        <div className="flex justify-center my-4">
          <div className="relative w-full max-w-xl h-52 md:h-60 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <video
              key={currentDesc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            >
              <source src={getWeatherVideo(currentDesc)} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Condition description & Animated Icon */}
        <p className="text-center capitalize text-lg md:text-xl opacity-90 flex items-center justify-center gap-2 font-semibold">
          {getWeatherIcon(currentCode, "w-6 h-6")}
          <span>{currentDesc}</span>
        </p>

        {/* 4 Primary Atmospheric Telemetries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs opacity-60">Feels Like</p>
            <p className="font-bold text-lg text-white mt-0.5">{formatTemp(currentWeather.main.feels_like, unit)}</p>
          </div>
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs opacity-60">High / Low</p>
            <p className="font-bold text-lg text-white mt-0.5">
              {formatTemp(currentWeather.main.temp_max, unit)} / {formatTemp(currentWeather.main.temp_min, unit)}
            </p>
          </div>
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs opacity-60">Humidity</p>
            <p className="font-bold text-lg text-cyan-200 mt-0.5">{currentWeather.main.humidity}%</p>
          </div>
          <div className="bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <p className="text-xs opacity-60">Wind Speed</p>
            <p className="font-bold text-lg text-white mt-0.5">{currentWeather.wind.speed} m/s</p>
          </div>
        </div>
      </div>

      {/* 5-Day Trajectory Cards */}
      {forecastItems.length > 0 && (
        <div className="w-full">
          <h4 className="text-sm font-bold text-cyan-300 mb-3 px-1">
            5-Day Trajectory Forecast
          </h4>
          <div className="flex gap-3 md:gap-4 overflow-x-auto w-full pb-2 scrollbar-thin scrollbar-thumb-white/20">
            {forecastItems.map((item) => {
              const desc = item.weather?.[0]?.description || 'Clear sky'
              const code = item.weather?.[0]?.id ?? 0
              const dateObj = new Date(item.dt_txt || item.dt * 1000)

              return (
                <div
                  className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-white text-center min-w-[105px] flex-1 flex flex-col items-center justify-between hover:bg-white/15 hover:scale-105 transition-all duration-200"
                  key={item.dt || item.dt_txt}
                >
                  <p className="text-xs opacity-75 font-medium">
                    {dateObj.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>

                  <p className="font-bold text-base my-1 text-white">
                    {formatTemp(item.main.temp, unit)}
                  </p>

                  <div className="relative h-12 w-16 rounded-lg overflow-hidden my-1 shadow-md border border-white/20">
                    <video
                      key={desc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                    >
                      <source src={getWeatherVideo(desc)} type="video/mp4" />
                    </video>
                  </div>

                  <p className="text-xs opacity-80 capitalize flex items-center justify-center gap-1 mt-1 font-medium">
                    {getWeatherIcon(code, "w-3.5 h-3.5")}
                    <span className="truncate max-w-[85px]">{desc}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}