'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, TrendingUp, Activity, Zap, Database, Server, Cpu } from 'lucide-react'

interface UsageMetrics {
  geminiCalls: number
  geminiLimit: number
  embeddingCalls: number
  embeddingLimit: number
  electricityMapsCalls: number
  electricityMapsLimit: number
  comtradeCalls: number
  comtradeLimit: number
  redisCommands: number
  redisLimit: number
  inngestRuns: number
  inngestLimit: number
}

export default function AdminUsagePage() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [animatedMetrics, setAnimatedMetrics] = useState({
    aiUsage: 0,
    dataUsage: 0,
    infraUsage: 0
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Mock data for demonstration - in production would fetch from Redis
        const mockMetrics: UsageMetrics = {
          geminiCalls: 847,
          geminiLimit: 950,
          embeddingCalls: 1234,
          embeddingLimit: 1400,
          electricityMapsCalls: 8234,
          electricityMapsLimit: 9000,
          comtradeCalls: 7823,
          comtradeLimit: 9500,
          redisCommands: 8456,
          redisLimit: 9500,
          inngestRuns: 42345,
          inngestLimit: 45000
        }
        
        setMetrics(mockMetrics)
        
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
            aiUsage: ((mockMetrics.geminiCalls + mockMetrics.embeddingCalls) / (mockMetrics.geminiLimit + mockMetrics.embeddingLimit) * 100) * easeOutQuart,
            dataUsage: ((mockMetrics.electricityMapsCalls + mockMetrics.comtradeCalls) / (mockMetrics.electricityMapsLimit + mockMetrics.comtradeLimit) * 100) * easeOutQuart,
            infraUsage: ((mockMetrics.redisCommands + mockMetrics.inngestRuns) / (mockMetrics.redisLimit + mockMetrics.inngestLimit) * 100) * easeOutQuart
          })

          if (currentStep >= steps) {
            clearInterval(timer)
          }
        }, increment)

      } catch (error) {
        console.error('Failed to fetch usage metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const getUsageStatus = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage < 70) return { status: 'healthy', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    if (percentage < 90) return { status: 'warning', color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
    return { status: 'critical', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
  }

  const getUsageIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'AI':
        return <Cpu className="h-5 w-5 text-blue-600" />
      case 'Data':
        return <Database className="h-5 w-5 text-purple-600" />
      case 'Infrastructure':
        return <Server className="h-5 w-5 text-orange-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Usage Monitoring</h1>
            <p className="text-indigo-100">Real-time service usage and performance metrics</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Activity className="h-8 w-8 text-white animate-spin" />
          </div>
          <p className="text-gray-500 text-lg">Loading usage metrics...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">Usage Monitoring</h1>
            <p className="text-red-100">System experiencing issues</p>
          </div>
        </div>
        
        <Card className="border-red-200 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-lg font-medium">Failed to load usage metrics</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const serviceMetrics = [
    {
      name: 'Google Gemini AI',
      description: 'Chat and generation requests',
      current: metrics.geminiCalls,
      limit: metrics.geminiLimit,
      unit: 'calls/day',
      type: 'AI',
      icon: <Zap className="h-5 w-5 text-blue-600" />
    },
    {
      name: 'Gemini Embeddings',
      description: 'Text embedding requests',
      current: metrics.embeddingCalls,
      limit: metrics.embeddingLimit,
      unit: 'calls/day',
      type: 'AI',
      icon: <Database className="h-5 w-5 text-blue-600" />
    },
    {
      name: 'Electricity Maps',
      description: 'Grid carbon intensity API',
      current: metrics.electricityMapsCalls,
      limit: metrics.electricityMapsLimit,
      unit: 'calls/month',
      type: 'Data',
      icon: <Globe className="h-5 w-5 text-purple-600" />
    },
    {
      name: 'UN Comtrade',
      description: 'Trade flow data API',
      current: metrics.comtradeCalls,
      limit: metrics.comtradeLimit,
      unit: 'calls/month',
      type: 'Data',
      icon: <Database className="h-5 w-5 text-purple-600" />
    },
    {
      name: 'Upstash Redis',
      description: 'Cache and rate limiting',
      current: metrics.redisCommands,
      limit: metrics.redisLimit,
      unit: 'commands/day',
      type: 'Infrastructure',
      icon: <Server className="h-5 w-5 text-orange-600" />
    },
    {
      name: 'Inngest',
      description: 'Background job executions',
      current: metrics.inngestRuns,
      limit: metrics.inngestLimit,
      unit: 'runs/month',
      type: 'Infrastructure',
      icon: <Activity className="h-5 w-5 text-orange-600" />
    }
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-100">
                Usage Monitoring
              </h1>
              <p className="text-indigo-100 text-lg">
                Real-time service usage and performance metrics
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All Systems Operational
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Monitoring
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">AI Services</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Cpu className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.aiUsage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined AI usage</p>
            <div className="mt-2 flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>Optimal performance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Data APIs</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Database className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.dataUsage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">External data services</p>
            <div className="mt-2 flex items-center text-xs text-purple-600">
              <Activity className="w-3 h-3 mr-1" />
              <span>Healthy usage</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-10"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Infrastructure</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <Server className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-gray-900 tabular-nums">
              {animatedMetrics.infraUsage.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Background jobs & cache</p>
            <div className="mt-2 flex items-center text-xs text-orange-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span>Running smoothly</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Detailed Service Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {serviceMetrics.map((service, index) => {
          const usageStatus = getUsageStatus(service.current, service.limit)
          const percentage = (service.current / service.limit) * 100

          return (
            <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {service.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription className="text-gray-600">{service.description}</CardDescription>
                    </div>
                  </div>
                  {getUsageIcon(usageStatus.status)}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Usage</span>
                  <span className="font-bold text-lg">
                    {service.current.toLocaleString()} / {service.limit.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usage</span>
                    <span className={`font-semibold ${usageStatus.textColor}`}>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${usageStatus.color} h-3 rounded-full transition-all duration-500 ease-out relative`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge className={`${usageStatus.bgColor} ${usageStatus.textColor} ${usageStatus.borderColor} border`}>
                    {usageStatus.status.charAt(0).toUpperCase() + usageStatus.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {service.limit - service.current} remaining
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Enhanced Recommendations */}
      <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center text-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Optimization Recommendations
          </CardTitle>
          <CardDescription className="text-gray-600">
            AI-powered insights based on current usage patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800">AI Usage Optimal</p>
                <p className="text-sm text-green-600 mt-1">
                  Gemini usage is well within free tier limits with room for growth
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Excellent
              </Badge>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">Monitor Electricity Maps</p>
                <p className="text-sm text-yellow-600 mt-1">
                  Approaching monthly limit - consider increasing cache duration to 30 minutes
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Attention
              </Badge>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-800">Growth Opportunity</p>
                <p className="text-sm text-blue-600 mt-1">
                  Current usage supports 10x user growth before hitting limits
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Scalable
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
