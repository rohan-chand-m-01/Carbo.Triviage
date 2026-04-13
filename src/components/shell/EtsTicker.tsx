'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface EtsPriceData {
  date: string
  priceEur: number
}

export function EtsTicker() {
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/carbon/ets-price?history=true')
        const data: EtsPriceData[] = await response.json()
        
        if (data.length >= 2) {
          const current = data[data.length - 1].priceEur
          const previous = data[data.length - 2].priceEur
          const changePercent = ((current - previous) / previous) * 100
          
          setPrice(current)
          setChange(changePercent)
        }
      } catch (error) {
        console.error('Failed to fetch ETS price:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-900 text-white px-4 py-2 text-sm">
        Loading EU ETS price...
      </div>
    )
  }

  if (!price) {
    return (
      <div className="bg-red-900 text-white px-4 py-2 text-sm">
        EU ETS price unavailable
      </div>
    )
  }

  const isPositive = change !== null && change > 0

  return (
    <div className="bg-gray-900 text-white px-4 py-2 text-sm flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span className="font-medium">EU ETS</span>
        <span className="font-bold">EUR {price.toFixed(2)}/t</span>
      </div>
      
      {change !== null && (
        <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="text-xs">
            {isPositive ? ' +' : ' '}{change.toFixed(1)}%
          </span>
        </div>
      )}
      
      <div className="text-xs text-gray-400">
        {new Date().toLocaleDateString()}
      </div>
    </div>
  )
}
