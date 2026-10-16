import { Link, useLocation } from "react-router-dom"
import { Sparkles, Thermometer } from "lucide-react"

export default function NavBar({ unit = 'C', onToggleUnit }){
  const location = useLocation()
  const currentPath = location.pathname

  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/aboutus', label: 'About Us' },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex flex-wrap px-6 py-3.5 justify-between items-center bg-[#0F172A]/85 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <Link to="/home" className="flex items-center gap-2.5 group">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-teal-300 to-pink-400 flex items-center justify-center text-gray-950 font-black shadow-md group-hover:scale-105 transition-transform">
          <Sparkles size={16} />
        </div>
        <h3
          className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent tracking-widest"
          style={{ fontFamily: "Michroma" }}
        >
          Skyzen
        </h3>
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <ul className="flex items-center gap-4 sm:gap-6 text-white text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? 'text-cyan-300 font-bold'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-400 rounded-full animate-in fade-in" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Global Temperature Unit Toggle */}
        {onToggleUnit && (
          <button
            onClick={onToggleUnit}
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/20 text-cyan-200 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
            title="Toggle Celsius / Fahrenheit"
          >
            <Thermometer size={14} />
            <span>°{unit}</span>
          </button>
        )}
      </div>
    </nav>
  )
}
