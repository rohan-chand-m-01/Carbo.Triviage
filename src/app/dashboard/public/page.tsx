'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Globe, TrendingUp, Share2, Activity, MapPin, BarChart3, Users } from 'lucide-react'

export default function PublicPortal() {
  const [citySearch, setCitySearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [animatedMetrics, setAnimatedMetrics] = useState({
    carbonIntensity: 0,
    companies: 0,
    products: 0,
    countries: 0
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
        carbonIntensity: 285 * easeOutQuart,
        companies: 3 * easeOutQuart,
        products: 3 * easeOutQuart,
        countries: 156 * easeOutQuart
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, increment)

    return () => clearInterval(timer)
  }, [])

  // Mock data for demonstration
  const mockCityData = {
    name: 'Berlin',
    country: 'Germany',
    carbonIntensity: 285,
    source: 'Electricity Maps',
    timestamp: new Date().toISOString(),
    trend: '-12.3%',
    renewable: 68.5
  }

  const mockProductData = [
    { name: 'Smartphone X', brand: 'TechCorp', footprint: 85, category: 'Electronics', trend: '-8.2%' },
    { name: 'Electric Car Model S', brand: 'AutoMaker', footprint: 4500, category: 'Transport', trend: '-15.7%' },
    { name: 'Cotton T-Shirt', brand: 'EcoWear', footprint: 7.2, category: 'Apparel', trend: '-5.3%' }
  ]

  const mockCompanyRankings = [
    { name: 'GreenTech Inc', scope1_2: 245, revenue: 5000, intensity: 0.049, rating: 'A+' },
    { name: 'EcoManufacturing', scope1_2: 189, revenue: 3200, intensity: 0.059, rating: 'A' },
    { name: 'CarbonNeutral Co', scope1_2: 156, revenue: 2800, intensity: 0.056, rating: 'A-' }
  ]

  const getIntensityColor = (intensity: number) => {
    if (intensity < 100) return 'text-green-600 bg-green-100'
    if (intensity < 300) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRatingColor = (rating: string) => {
    if (rating.includes('+')) return 'text-green-600 bg-green-100'
    if (rating.includes('-')) return 'text-orange-600 bg-orange-100'
    return 'text-blue-600 bg-blue-100'
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
            Public Carbon Portal
          </h1>
          <p className="text-pink-100 text-lg mb-6">
            Explore carbon footprints of cities, products, and companies worldwide
          </p>
          <div className="flex justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              <Globe className="w-3 h-3 mr-1" />
              {animatedMetrics.countries.toFixed(0)} Countries
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              <BarChart3 className="w-3 h-3 mr-1" />
              Real-time Data
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
              <Users className="w-3 h-3 mr-1" />
              Open Access
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced City Grid Carbon */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <Globe className="h-4 w-4 text-white" />
            </div>
            City Grid Carbon Intensity
          </CardTitle>
          <CardDescription className="text-gray-600">
            Real-time carbon intensity of electricity grids worldwide with renewable energy tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex space-x-3">
            <Input
              placeholder="Enter city or country..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{mockCityData.name}, {mockCityData.country}</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4">Source: {mockCityData.source}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Europe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Updated 2 min ago</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 tabular-nums">
                  {animatedMetrics.carbonIntensity.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600 mt-1">gCO2/kWh</p>
                <Badge className={`mt-2 ${getIntensityColor(mockCityData.carbonIntensity)}`}>
                  Low Carbon
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500">Renewable Energy</p>
                <p className="text-xl font-bold text-green-600">{mockCityData.renewable}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-500">Trend</p>
                <p className="text-xl font-bold text-green-600">{mockCityData.trend}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Product Footprint Lookup */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <Search className="h-4 w-4 text-white" />
            </div>
            Product Carbon Footprint Database
          </CardTitle>
          <CardDescription className="text-gray-600">
            Search for carbon footprints of common products with trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex space-x-3">
            <Input
              placeholder="Search by brand or product..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="flex-1"
            />
            <Button className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockProductData.map((product, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  <Badge variant="outline" className="bg-white">
                    {product.category}
                  </Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{product.footprint}</span>
                    <span className="text-sm text-gray-500 ml-1">kgCO2e</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      product.trend.startsWith('-') ? 'text-green-600' : 'text-red-600'
                    }`}>{product.trend}</p>
                    <p className="text-xs text-gray-500">vs last year</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Company Rankings */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Public Company Sustainability Rankings
          </CardTitle>
          <CardDescription className="text-gray-600">
            Ranked by Scope 1&2 emissions intensity with performance ratings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockCompanyRankings.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
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
                    <p className="font-semibold text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">
                      {company.scope1_2} tCO2e from {company.revenue}M revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">
                    {company.intensity.toFixed(3)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getRatingColor(company.rating)}`}>
                      {company.rating}
                    </Badge>
                    <span className="text-xs text-gray-500">tCO2e/M revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Share Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Share Carbon Insights
              </h3>
              <p className="text-blue-100 text-lg">
                Help spread awareness about carbon footprints and drive collective action
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Share2 className="w-3 h-3 mr-1" />
                  Social Sharing
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Globe className="w-3 h-3 mr-1" />
                  Global Impact
                </Badge>
              </div>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
