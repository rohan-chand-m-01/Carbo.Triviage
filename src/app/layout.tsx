import './globals.css'
import { Inter } from 'next/font/google'
import { AIProvider } from '@/components/ai-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CarbonLens - Carbon Intelligence Platform',
  description: 'Real-time carbon accounting and compliance platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AIProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AIProvider>
  )
}
