import React from 'react'
import { CloudRain, Sun, Cloud, CloudSun, CloudFog, CloudSnow, CloudLightning, CloudDrizzle } from 'lucide-react'
import { formatTemp } from '../services/weatherApi'

export default function HourlyChart({ hourly = [], unit = 'C' }) {
  if (!hourly || hourly.length === 0) return null

  const getIcon = (code) => {
    const c = Number(code)
    if (c === 0 || c === 1) return <Sun size={18} className="text-yellow-300" />
    if (c === 2) return <CloudSun size={18} className="text-yellow-200" />
    if (c === 3) return <Cloud size={18} className="text-blue-200" />
    if (c === 45 || c === 48) return <CloudFog size={18} className="text-gray-300" />
    if (c >= 51 && c <= 57) return <CloudDrizzle size={18} className="text-cyan-300" />
    if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return <CloudRain size={18} className="text-blue-400" />
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return <CloudSnow size={18} className="text-blue-100" />
    if (c >= 95) return <CloudLightning size={18} className="text-amber-400" />
    return <Sun size={18} className="text-yellow-300" />
  }

  return (
    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
          <span>24-Hour Atmospheric Horizon</span>
        </h3>
        <span className="text-xs text-white/60">Temperature & Precipitation Chance</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 pt-2 scrollbar-thin scrollbar-thumb-white/20">
        {hourly.map((hour, idx) => {
          const pop = hour.pop ?? 0
          return (
            <div
              key={idx}
              className="flex flex-col items-center min-w-[72px] bg-black/20 hover:bg-black/40 border border-white/10 rounded-2xl p-3 transition-all hover:scale-105 shrink-0"
            >
              <span className="text-xs font-medium text-white/80 mb-2">{hour.displayTime}</span>

              <div className="my-1">{getIcon(hour.code)}</div>

              <span className="font-bold text-base my-1 text-white">{formatTemp(hour.temp, unit)}</span>

              {/* Rain Chance Bar */}
              <div className="w-full flex flex-col items-center mt-2">
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pop)}%` }}
                  />
                </div>
                <span className="text-[10px] text-cyan-300 mt-1 font-medium flex items-center gap-0.5">
                  <CloudRain size={10} />
                  {pop}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
