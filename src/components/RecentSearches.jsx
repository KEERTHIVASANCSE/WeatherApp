import { useNavigate } from "react-router-dom"
import { Clock, ArrowRight, Trash2 } from "lucide-react"

export default function RecentSearches({ recentSearch = [], onClearHistory }) {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b border-white/20">
        <h2 className="font-bold text-xl md:text-2xl text-cyan-300 flex items-center gap-2">
          <Clock size={20} />
          <span>Search History</span>
        </h2>
        {recentSearch.length > 0 && onClearHistory && (
          <button
            onClick={onClearHistory}
            className="text-xs text-white/60 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
            title="Clear history"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {recentSearch.length === 0 ? (
        <p className="text-sm opacity-70 text-center py-6">
          No search history recorded yet. Explore cities on the dashboard!
        </p>
      ) : (
        <ul className="divide-y divide-white/15 max-h-72 overflow-y-auto mt-2">
          {recentSearch.map((item, idx) => (
            <li
              key={idx}
              onClick={() => navigate(`/dashboard?city=${encodeURIComponent(item)}`)}
              className="py-3 px-2 flex items-center justify-between hover:bg-white/10 rounded-xl transition-all cursor-pointer group"
            >
              <span className="text-white text-sm md:text-base font-medium group-hover:text-cyan-300 transition-colors">
                {item}
              </span>
              <ArrowRight size={15} className="text-white/40 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}