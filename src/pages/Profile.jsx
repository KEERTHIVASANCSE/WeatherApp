import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RecentSearches from "../components/RecentSearches"
import { FaUserCircle } from 'react-icons/fa'
import { Star, MapPin, ArrowRight, Sparkles } from 'lucide-react'

export default function Profile({ recentSearch = [], setRecentSearch }){
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('weatherFavorites')
      return saved ? JSON.parse(saved) : ['Chennai', 'Tokyo', 'London', 'New York']
    } catch {
      return ['Chennai', 'Tokyo', 'London', 'New York']
    }
  })

  const handleClearHistory = () => {
    if (setRecentSearch) setRecentSearch([])
    localStorage.removeItem('recentSearch')
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#ff8177] to-[#b12a5b] flex flex-col items-center justify-start p-6 pt-24 gap-6">
      {/* User Header */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="relative">
          <FaUserCircle className="h-20 w-20 text-white/80 shadow-2xl rounded-full" />
          <span className="absolute bottom-1 right-1 h-4 w-4 bg-emerald-400 border-2 border-white rounded-full" />
        </div>
        <p className="text-white text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-md">
          Skyzen Explorer
        </p>
        <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full font-medium backdrop-blur-md">
          ZenAI Intelligence Enabled
        </span>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Favorite Cities Card */}
        <div className="bg-black/15 border border-white/20 backdrop-blur-md rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <h2 className="font-bold text-xl md:text-2xl text-amber-300 flex items-center gap-2">
                <Star size={20} className="fill-amber-400" />
                <span>Favorite Cities</span>
              </h2>
              <span className="text-xs bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full font-medium">
                {favorites.length} Saved
              </span>
            </div>

            {favorites.length === 0 ? (
              <p className="text-sm opacity-70 text-center py-6">
                No favorite cities added yet. Star cities on the dashboard to access them here!
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 mt-3 max-h-72 overflow-y-auto">
                {favorites.map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => navigate(`/dashboard?city=${encodeURIComponent(cityName)}`)}
                    className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl flex items-center justify-between transition-all group text-left cursor-pointer"
                  >
                    <span className="font-semibold text-white group-hover:text-amber-300 flex items-center gap-2">
                      <MapPin size={15} className="text-amber-400" />
                      {cityName}
                    </span>
                    <ArrowRight size={15} className="text-white/40 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search History Card */}
        <div className="bg-black/15 border border-white/20 backdrop-blur-md rounded-3xl p-6 text-white shadow-xl">
          <RecentSearches
            recentSearch={recentSearch}
            onClearHistory={handleClearHistory}
          />
        </div>
      </div>
    </div>
  )
}