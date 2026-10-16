import React from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

export default function SevereAlertsCard({ advisories = [] }) {
  if (!advisories || advisories.length === 0) return null

  return (
    <div className="w-full space-y-3">
      {advisories.map((alert, idx) => (
        <div
          key={idx}
          className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 rounded-2xl p-4 text-white shadow-lg flex items-start gap-3.5 animate-pulse"
        >
          <div className="h-8 w-8 rounded-lg bg-amber-500/30 flex items-center justify-center shrink-0 text-amber-300 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-300 tracking-wide uppercase">
              {alert.title}
            </h4>
            <p className="text-xs text-white/90 mt-1 leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
