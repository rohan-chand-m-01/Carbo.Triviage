import { Sidebar } from '@/components/shell/Sidebar'
import { EtsTicker } from '@/components/shell/EtsTicker'
import { CarbonPulseBanner } from '@/components/shell/CarbonPulseBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 mesh-gradient opacity-30 pointer-events-none" />
      <EtsTicker />
      <CarbonPulseBanner />
      
      <div className="flex relative z-10">
        <Sidebar userTier="PRO" />
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
