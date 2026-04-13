'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Lock, BarChart3, Users, FileText, TrendingUp, Search, Shield, Globe } from 'lucide-react'

const navigation = [
  { name: 'Corporate', href: '/dashboard/corporate', icon: BarChart3, tier: 'PRO' },
  { name: 'Supply Chain', href: '/dashboard/supply-chain', icon: Users, tier: 'PRO' },
  { name: 'Policy', href: '/dashboard/policy', icon: FileText, tier: 'PRO' },
  { name: 'Analyst', href: '/dashboard/analyst', icon: TrendingUp, tier: 'PRO' },
  { name: 'Auditor', href: '/dashboard/auditor', icon: Shield, tier: 'AUDITOR' },
  { name: 'Public', href: '/dashboard/public', icon: Globe, tier: 'FREE' },
]

interface SidebarProps {
  userTier?: string
  className?: string
}

export function Sidebar({ userTier = 'FREE', className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('w-64 bg-white border-r border-gray-200 h-full', className)}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">CarbonLens</h2>
        <p className="text-sm text-gray-500 mt-1">
          {userTier} Tier
        </p>
      </div>
      
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isLocked = userTier !== 'FREE' && userTier !== item.tier && userTier !== 'ENTERPRISE'
          
          return (
            <Link
              key={item.name}
              href={isLocked ? '#' : item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100',
                isLocked && 'opacity-60 cursor-not-allowed'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
              {isLocked && <Lock className="ml-auto h-4 w-4" />}
              {item.tier === 'AUDITOR' && (
                <Badge variant="secondary" className="ml-auto">
                  Pro
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          <p>Need more features?</p>
          <Link
            href="/dashboard/billing"
            className="text-primary hover:underline font-medium"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  )
}
