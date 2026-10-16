import React from 'react'
import { Wind, ShieldAlert, Sun, Activity } from 'lucide-react'

export default function AirQualityCard({ airQuality, astronomy }) {
  if (!airQuality) return null

  const uv = airQuality.uvIndex ?? 0
  const aqi = airQuality.aqi ?? 20

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl flex-1 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
          <Activity size={18} />
          <span>Air Quality & UV Index</span>
        </h3>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full text-gray-950"
          style={{ backgroundColor: airQuality.color || '#22c55e' }}
        >
          {airQuality.label} (AQI {aqi})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
          <p className="text-xs opacity-60">PM2.5 Level</p>
          <p className="text-lg font-bold text-white mt-1">{airQuality.pm2_5} <span className="text-xs font-normal opacity-70">µg/m³</span></p>
        </div>

        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
          <p className="text-xs opacity-60">PM10 Level</p>
          <p className="text-lg font-bold text-white mt-1">{airQuality.pm10} <span className="text-xs font-normal opacity-70">µg/m³</span></p>
        </div>

        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
          <p className="text-xs opacity-60 flex items-center gap-1">
            <Sun size={12} className="text-yellow-400" />
            UV Index
          </p>
          <p className="text-lg font-bold text-yellow-300 mt-1">{uv} <span className="text-xs font-normal opacity-70">({airQuality.uvLabel})</span></p>
        </div>

        <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
          <p className="text-xs opacity-60">Health Advisory</p>
          <p className="text-xs font-medium text-emerald-300 mt-1 leading-tight">
            {aqi <= 40 ? 'Clean air ideal for all outdoor activities.' : 'Moderate air. Sensitive groups should take care.'}
          </p>
        </div>
      </div>
    </div>
  )
}
