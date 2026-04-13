'use client'

import { useEffect, useState } from 'react'
import { useGridCarbon } from '@/hooks/useGridCarbon'

interface GridCarbonData {
  zone: string
  carbonIntensity: number
  datetime: string
  source: string
}

export function CarbonPulseBanner() {
  const [userZone, setUserZone] = useState<string>('DE')
  const { data: gridData, isLoading, error } = useGridCarbon(userZone)

  useEffect(() => {
    // Detect user's timezone and map to grid zone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zoneMap: Record<string, string> = {
      'Europe/Berlin': 'DE',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Madrid': 'ES',
      'Europe/Rome': 'IT',
      'America/New_York': 'US-NYISO',
      'America/Los_Angeles': 'US-CAISO',
      'America/Chicago': 'US-MISO',
      'Asia/Tokyo': 'JP',
      'Asia/Shanghai': 'CN',
      'Australia/Sydney': 'AU-NSW',
    }

    const detectedZone = zoneMap[timezone] || 'DE'
    setUserZone(detectedZone)
  }, [])

  if (isLoading) {
    return (
      <div className="bg-blue-100 text-blue-800 px-4 py-3 text-sm">
        Loading carbon intensity data...
      </div>
    )
  }

  if (error || !gridData) {
    return (
      <div className="bg-yellow-100 text-yellow-800 px-4 py-3 text-sm">
        Carbon intensity data unavailable for {userZone}
      </div>
    )
  }

  const intensity = gridData.carbonIntensity
  let colorClass = 'bg-green-100 text-green-800'
  let label = 'Low Carbon'

  if (intensity > 300) {
    colorClass = 'bg-red-100 text-red-800'
    label = 'High Carbon'
  } else if (intensity > 100) {
    colorClass = 'bg-yellow-100 text-yellow-800'
    label = 'Medium Carbon'
  }

  return (
    <div className={`${colorClass} px-4 py-3 text-sm flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 rounded-full bg-current animate-pulse"></div>
        <span className="font-medium">{label}</span>
        <span>
          Grid intensity: <strong>{intensity.toFixed(0)} gCO2/kWh</strong>
        </span>
        <span className="text-xs opacity-75">
          {userZone} ({gridData.source})
        </span>
      </div>
      
      <div className="text-xs opacity-75">
        {new Date(gridData.datetime).toLocaleTimeString()}
      </div>
    </div>
  )
}
