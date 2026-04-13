'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ScopeData {
  period: string
  scope1: number
  scope2: number
  scope3: number
}

interface ScopeBreakdownChartProps {
  data: ScopeData[]
  className?: string
}

export function ScopeBreakdownChart({ data, className }: ScopeBreakdownChartProps) {
  const chartData = data.map(item => ({
    period: item.period,
    'Scope 1': item.scope1,
    'Scope 2': item.scope2,
    'Scope 3': item.scope3,
    total: item.scope1 + item.scope2 + item.scope3
  }))

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)} tCO2e`, '']}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Legend />
          <Bar dataKey="Scope 1" fill="#ef4444" stackId="a" />
          <Bar dataKey="Scope 2" fill="#f59e0b" stackId="a" />
          <Bar dataKey="Scope 3" fill="#3b82f6" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
