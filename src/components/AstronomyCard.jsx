import React from 'react'
import { Sunrise, Sunset, Sun, Moon } from 'lucide-react'

export default function AstronomyCard({ astronomy }) {
  if (!astronomy || (!astronomy.sunrise && !astronomy.sunset)) return null

  const formatTime = (isoString) => {
    if (!isoString) return '--:--'
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return isoString
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
          <Sun size={18} className="text-amber-300" />
          <span>Solar Horizon & Daylight</span>
        </h3>
        <span className="text-xs text-white/60">Local Sun Times</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Sunrise size={22} />
          </div>
          <div>
            <p className="text-xs opacity-60">Sunrise</p>
            <p className="text-base font-bold text-white mt-0.5">{formatTime(astronomy.sunrise)}</p>
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Sunset size={22} />
          </div>
          <div>
            <p className="text-xs opacity-60">Sunset</p>
            <p className="text-base font-bold text-white mt-0.5">{formatTime(astronomy.sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
