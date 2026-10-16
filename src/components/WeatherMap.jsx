import React from 'react'
import { MapPin, Navigation, ExternalLink } from 'lucide-react'

export default function WeatherMap({ city }) {
  if (!city || !city.lat || !city.lon) return null

  const lat = Number(city.lat)
  const lon = Number(city.lon)
  const delta = 0.15

  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`
  const directLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`

  return (
    <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-white shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
          <Navigation size={18} />
          <span>Atmospheric Radar & Geographic Coordinates</span>
        </h3>
        <a
          href={directLink}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>Open Full Map</span>
          <ExternalLink size={12} />
        </a>
      </div>

      <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-white/20 shadow-inner">
        <iframe
          title="Weather Geographic Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={mapSrc}
          className="w-full h-full filter saturate-150 contrast-105"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] text-white flex items-center gap-1 border border-white/20">
          <MapPin size={12} className="text-cyan-400" />
          <span>{city.name} ({lat.toFixed(2)}°, {lon.toFixed(2)}°)</span>
        </div>
      </div>
    </div>
  )
}
