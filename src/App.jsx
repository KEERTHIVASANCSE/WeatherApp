import { Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import NavBar from './components/Navbar'
import DashBoard from './pages/Dashboard'
import HomePage from './pages/Home'
import Profile from './pages/Profile'
import AboutUs from './pages/AboutUs'
import AIChatbot from './components/AIChatbot'

function App() {
  const navigate = useNavigate()

  // Temperature unit (°C / °F)
  const [unit, setUnit] = useState(() => {
    try {
      const saved = localStorage.getItem('weatherUnit')
      return saved ? saved : 'C'
    } catch {
      return 'C'
    }
  })

  // Toggle unit and persist
  const handleToggleUnit = () => {
    setUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C'
      localStorage.setItem('weatherUnit', next)
      return next
    })
  }

  // Recent Searches
  const [recentSearch, setRecentSearch] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearch')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Last weather data for ZenAI context
  const [cachedWeather, setCachedWeather] = useState(() => {
    try {
      const saved = localStorage.getItem('lastWeather')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sync cached weather from localStorage periodically or when changed
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('lastWeather')
        if (saved) setCachedWeather(JSON.parse(saved))
      } catch {}
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const handleChatSelectCity = (cityName) => {
    navigate(`/dashboard?city=${encodeURIComponent(cityName)}`)
  }

  return (
    <>
      <NavBar unit={unit} onToggleUnit={handleToggleUnit} />

      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <DashBoard
              recentSearch={recentSearch}
              setRecentSearch={setRecentSearch}
              unit={unit}
              setUnit={setUnit}
              onWeatherUpdate={setCachedWeather}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <Profile
              recentSearch={recentSearch}
              setRecentSearch={setRecentSearch}
            />
          }
        />
        <Route path="/aboutus" element={<AboutUs />} />
      </Routes>

      {/* Global ZenAI Floating Weather Copilot */}
      <AIChatbot
        currentWeather={cachedWeather}
        unit={unit}
        onSelectCity={handleChatSelectCity}
      />
    </>
  )
}

export default App