import React from 'react'
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
  CloudDrizzle
} from 'lucide-react'

export default function WeatherCard({ city }) {
  if (!city || !city.list || city.list.length === 0) return null
  const currentWeather = city.list[0]

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
    if (c === 0 || c === 1) return <Sun className={`${className} text-yellow-300`} />
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

  return (
    <div className="w-full md:max-w-[500px] bg-black/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 flex flex-col items-center justify-start gap-6 hover:shadow-2xl hover:shadow-gray-900 hover:-translate-y-2 transition-all duration-200 lg:max-w-[700px]">
      <div className="bg-white/15 backdrop-blur-md rounded-3xl p-6 text-white w-full shadow-xl">
        <h2 className="text-xl md:text-2xl font-bold text-center">
          {cityName}{countryName}
        </h2>
        <h3 className="text-3xl my-0 md:text-7xl font-black text-center my-3">
          {Math.round(currentWeather.main.temp)}°C
        </h3>

        <div className="flex justify-center my-3">
          <video
            key={currentDesc}
            autoPlay
            loop
            muted
            preload="auto"
            className="w-full h-64 md:h-44 object-cover rounded-2xl lg:h-60"
          >
            <source src={getWeatherVideo(currentDesc)} type="video/mp4" />
          </video>
        </div>

        <p className="text-center capitalize text-lg opacity-90 flex items-center justify-center gap-2">
          {getWeatherIcon(currentCode, "w-6 h-6")}
          <span>{currentDesc}</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-60">Feels Like</p>
            <p className="font-semibold text-lg">{Math.round(currentWeather.main.feels_like)}°C</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-60">High / Low</p>
            <p className="font-semibold text-lg">
              {Math.round(currentWeather.main.temp_max)}°C / {Math.round(currentWeather.main.temp_min)}°C
            </p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-60">Humidity</p>
            <p className="font-semibold text-lg">{currentWeather.main.humidity}%</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-xs opacity-60">Wind</p>
            <p className="font-semibold text-lg">{currentWeather.wind.speed} m/s</p>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Horizon */}
      {forecastItems.length > 0 && (
        <div className="flex gap-5 overflow-x-auto w-full pb-2">
          {forecastItems.map((item) => {
            const desc = item.weather?.[0]?.description || 'Clear sky'
            const code = item.weather?.[0]?.id ?? 0
            const dateObj = new Date(item.dt_txt || item.dt * 1000)

            return (
              <div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-3 text-white text-center min-w-[90px] flex-1 flex flex-col items-center justify-between"
                key={item.dt || item.dt_txt}
              >
                <p className="text-xs opacity-70">
                  {dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                  })}
                </p>

                <p className="font-bold my-1">{Math.round(item.main.temp)}°C</p>

                <video
                  key={desc}
                  autoPlay
                  loop
                  muted
                  preload="auto"
                  className="h-12 w-16 object-cover rounded-lg my-1"
                >
                  <source src={getWeatherVideo(desc)} type="video/mp4" />
                </video>

                <p className="text-xs opacity-80 capitalize flex items-center justify-center gap-1 mt-1">
                  {getWeatherIcon(code, "w-3 h-3")}
                  <span className="truncate max-w-[85px]">{desc}</span>
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}