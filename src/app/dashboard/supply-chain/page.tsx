'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Truck, AlertTriangle, Plus, TrendingUp, Globe, Shield } from 'lucide-react'

// Mock supplier data
const mockSuppliers = [
  { id: '1', name: 'Steel Components GmbH', country: 'DE', carbonIntensity: 0.8, tier: 1, hsCode: '870323', performance: 'excellent' },
  { id: '2', name: 'Aluminum Parts Ltd', country: 'CN', carbonIntensity: 2.1, tier: 2, hsCode: '760429', performance: 'good' },
  { id: '3', name: 'Chemical Supplies SA', country: 'FR', carbonIntensity: 1.5, tier: 1, hsCode: '290519', performance: 'average' },
  { id: '4', name: 'Electronics Assembly', country: 'JP', carbonIntensity: 0.6, tier: 3, hsCode: '854239', performance: 'excellent' },
  { id: '5', name: 'Plastic Manufacturing Co', country: 'US', carbonIntensity: 1.8, tier: 2, hsCode: '392690', performance: 'good' },
  { id: '6', name: 'Textile Industries Ltd', country: 'IN', carbonIntensity: 2.8, tier: 3, hsCode: '620190', performance: 'poor' }
]

const mockCbamData = [
  { hsCode: '870323', country: 'China', liability: 15678, trend: '+5.2%', risk: 'high' },
  { hsCode: '760429', country: 'China', liability: 8934, trend: '+2.1%', risk: 'medium' },
  { hsCode: '290519', country: 'Germany', liability: 0, trend: '0%', risk: 'low' },
  { hsCode: '854239', country: 'Japan', liability: 2341, trend: '+1.8%', risk: 'low' },
  { hsCode: '392690', country: 'USA', liability: 4567, trend: '+3.4%', risk: 'medium' },
  { hsCode: '620190', country: 'India', liability: 6789, trend: '+8.7%', risk: 'high' }
]

export default function SupplyChainPortal() {
  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalSuppliers: 0,
    cbamLiability: 0,
    avgIntensity: 0,
    riskScore: 0
  })

  useEffect(() => {
    // Animate metrics on mount
    const duration = 2000
    const steps = 60
    const increment = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)

      setAnimatedMetrics({
        totalSuppliers: mockSuppliers.length * easeOutQuart,
        cbamLiability: 26953 * easeOutQuart,
        avgIntensity: 1.25 * easeOutQuart,
        riskScore: 72.8 * easeOutQuart
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, increment)

    return () => clearInterval(timer)
  }, [])

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'average': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-100">
                Supply Chain Portal
              </h1>
              <p className="text-cyan-100 text-lg">
                Advanced supplier emissions and CBAM exposure management
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                  <Globe className="w-3 h-3 mr-1" />
                  Global Coverage
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                  <Shield className="w-3 h-3 mr-1" />
                  Risk Assessment
                </Badge>
              </div>
            </div>
            
            <Button className="bg-white text-teal-600 hover:bg-cyan-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Suppliers</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.totalSuppliers.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active suppliers</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+2 this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">CBAM Liability</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              EUR {animatedMetrics.cbamLiability.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Annual exposure</p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>Monitor closely</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Avg Intensity</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Truck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.avgIntensity.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">tCO2e per unit</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>-8.5% vs target</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Risk Score</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.riskScore.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall risk</p>
            <div className="mt-2 flex items-center text-xs text-yellow-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>Moderate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Supplier Leaderboard */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
              <Users className="h-4 w-4 text-white" />
            </div>
            Supplier Performance Leaderboard
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ranked by carbon intensity and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockSuppliers
              .sort((a, b) => a.carbonIntensity - b.carbonIntensity)
              .map((supplier, index) => (
                <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-gray-800' :
                      index === 2 ? 'bg-orange-400 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{supplier.name}</p>
                      <p className="text-sm text-gray-500">{supplier.country} - Tier {supplier.tier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">{supplier.carbonIntensity} tCO2e/unit</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getPerformanceColor(supplier.performance)}`}>
                        {supplier.performance}
                      </Badge>
                      <span className="text-xs text-gray-500">HS {supplier.hsCode}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced CBAM Exposure */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            CBAM Exposure Analysis
          </CardTitle>
          <CardDescription className="text-gray-600">
            Estimated liability by product category with risk assessment and trends
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockCbamData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(item.risk)}`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">HS {item.hsCode}</p>
                    <p className="text-sm text-gray-500">From {item.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">EUR {item.liability.toLocaleString()}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${
                      item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                    }`}>{item.trend}</span>
                    <Badge className={`text-xs ${
                      item.risk === 'high' ? 'bg-red-100 text-red-800' :
                      item.risk === 'medium' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.risk} risk
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <span className="font-bold text-gray-900">Total Liability</span>
              <span className="font-bold text-xl text-orange-600">EUR 26,953</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
