'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScopeBreakdownChart } from '@/components/charts/ScopeBreakdownChart'
import { Download, FileText, TrendingUp, AlertTriangle, Activity, Target, Shield, Zap } from 'lucide-react'

import { getDashboardData } from '@/app/actions/carbon'

export default function CorporatePortal() {
  const [data, setData] = useState<any>(null)
  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalEmissions: 0,
    cbamLiability: 0,
    sbtTarget: 0,
    reductionRate: 0,
    renewableEnergy: 0
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDashboardData()
        setData(result)
        
        // Animate metrics
        const duration = 2000
        const steps = 60
        const increment = duration / steps
        let currentStep = 0
        
        const timer = setInterval(() => {
          currentStep++
          const progress = currentStep / steps
          const easeOutQuart = 1 - Math.pow(1 - progress, 4)

          setAnimatedMetrics({
            totalEmissions: result.metrics.totalEmissions * easeOutQuart,
            cbamLiability: result.metrics.cbamLiability * easeOutQuart,
            sbtTarget: result.metrics.sbtTarget * easeOutQuart,
            reductionRate: result.metrics.reductionRate * easeOutQuart,
            renewableEnergy: result.metrics.renewableEnergy * easeOutQuart
          })

          if (currentStep >= steps) clearInterval(timer)
        }, increment)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }
    fetchData()
  }, [])

  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )

  const { metrics, chartData } = data


  const totalValue = chartData.reduce((sum: number, period: any) => 
    sum + period.scope1 + period.scope2 + period.scope3, 0
  )

  return (
    <div className="space-y-8">
      {/* Header with premium styling */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Corporate Portal
              </h1>
              <p className="text-blue-100 text-lg">
                Advanced carbon accounting and compliance intelligence
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30 hover:bg-green-500/30 transition-colors">
                  <Shield className="w-3 h-3 mr-1" />
                  Enterprise Grade
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30 hover:bg-blue-500/30 transition-colors">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Data
                </Badge>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                <FileText className="mr-2 h-4 w-4" />
                Generate CSRD Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Emissions</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.totalEmissions.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">tCO2e (2024)</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>-12.3% vs last year</span>
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
            <p className="text-xs text-gray-500 mt-1">Estimated annual</p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              <span>Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">SBTi Target</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.sbtTarget.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">tCO2e target</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <Target className="w-3 h-3 mr-1" />
              <span>1.5°C aligned</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Compliance</CardTitle>
            <Badge className="bg-green-100 text-green-800 border-green-200">On Track</Badge>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-gray-500 mt-1">CSRD ready</p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <Shield className="w-3 h-3 mr-1" />
              <span>Fully compliant</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Renewable</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.renewableEnergy.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Clean energy</p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <Zap className="w-3 h-3 mr-1" />
              <span>Above target</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Scope Breakdown
            </CardTitle>
            <CardDescription className="text-gray-600">
              Emissions by scope across 2024 quarters with trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ScopeBreakdownChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <CardTitle className="flex items-center text-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Target className="h-4 w-4 text-white" />
              </div>
              Target Gap Analysis
            </CardTitle>
            <CardDescription className="text-gray-600">
              Actual vs SBTi 1.5°C pathway with projections
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-700 font-medium">Advanced analytics coming soon</p>
                <p className="text-sm text-gray-500 mt-2">AI-powered trajectory predictions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            Carbon Border Adjustment Mechanism liability by product category with risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              { category: 'Iron & Steel', liability: 18234, risk: 'high', trend: '+5.2%' },
              { category: 'Aluminum', liability: 12456, risk: 'medium', trend: '+2.1%' },
              { category: 'Cement', liability: 8912, risk: 'low', trend: '-1.3%' },
              { category: 'Chemicals', liability: 6076, risk: 'medium', trend: '+3.7%' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    item.risk === 'high' ? 'bg-red-500' : 
                    item.risk === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.category}</p>
                    <p className="text-sm text-gray-500">Risk level: {item.risk}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">EUR {item.liability.toLocaleString()}</p>
                  <p className={`text-sm ${
                    item.trend.startsWith('+') ? 'text-red-600' : 'text-green-600'
                  }`}>{item.trend} vs last quarter</p>
                </div>
              </div>
            ))}
            <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
              <span className="font-bold text-gray-900">Total Liability</span>
              <span className="font-bold text-xl text-orange-600">EUR 45,678</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Carbon Credit Banner */}
      <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <CardContent className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Exceeding SBTi Target?
              </h3>
              <p className="text-green-100 text-lg">
                Purchase verified carbon credits to offset remaining emissions and achieve net-zero
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Gold Standard Verified
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant Offset
                </Badge>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                Gold Standard
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                Verra Registry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
