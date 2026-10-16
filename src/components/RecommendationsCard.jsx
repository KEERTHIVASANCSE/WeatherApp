import React from 'react'
import { Umbrella, Shirt, Compass, Activity, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RecommendationsCard({ recommendations, cityName }) {
  if (!recommendations) return null

  const { umbrella, clothing, outdoorActivity, travelTip } = recommendations

  return (
    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
          <Compass size={20} />
          <span>AI Smart Recommendations for {cityName}</span>
        </h3>
        <span className="text-xs bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-medium">
          Personalized
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Umbrella Meter */}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                  umbrella.needed
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                }`}
              >
                <Umbrella size={20} />
              </div>
              <span className="font-bold text-sm text-white">Umbrella Meter</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                umbrella.needed
                  ? 'bg-blue-400 text-gray-950'
                  : 'bg-emerald-400 text-gray-950'
              }`}
            >
              {umbrella.badge}
            </span>
          </div>
          <p className="text-xs opacity-80 mt-3 leading-relaxed">{umbrella.advice}</p>
        </div>

        {/* Clothing Outfit Recommendation */}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center">
                <Shirt size={20} />
              </div>
              <span className="font-bold text-sm text-white">{clothing.title}</span>
            </div>
          </div>
          <div className="my-2">
            <p className="text-xs text-cyan-300 font-medium">
              {clothing.items?.slice(0, 3).join(' • ')}
            </p>
          </div>
          <p className="text-xs opacity-70 leading-relaxed italic">{clothing.advice}</p>
        </div>

        {/* Outdoor Activities & Travel Planning */}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <span className="font-bold text-sm text-white">Outdoor & Exercise</span>
            </div>
            <span className="text-[11px] font-bold bg-amber-400/30 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full">
              {outdoorActivity.score}
            </span>
          </div>
          <p className="text-xs text-white/90 mt-2 font-medium">
            Best Time: <span className="text-cyan-300">{outdoorActivity.bestTime}</span>
          </p>
          <p className="text-xs opacity-70 mt-1 leading-relaxed">
            {outdoorActivity.activitySuggestion}
          </p>
        </div>
      </div>

      {/* Travel Summary Strip */}
      {travelTip && (
        <div className="mt-4 p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-2xl flex items-center justify-between text-xs text-cyan-200">
          <span className="font-medium">
            ✈️ <strong className="text-white">Travel Intelligence:</strong> {travelTip.verdict}
          </span>
        </div>
      )}
    </div>
  )
}
