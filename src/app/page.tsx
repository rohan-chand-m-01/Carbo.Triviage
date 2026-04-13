'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { 
  Globe, 
  Shield, 
  Zap, 
  Activity, 
  Target, 
  ArrowRight, 
  BarChart3, 
  Cpu, 
  Lock,
  Leaf,
  BarChart,
  Navigation
} from 'lucide-react'

const features = [
  {
    title: 'Real-time Monitoring',
    description: 'Track carbon emissions across all scopes with live data from 8+ global APIs and IoT sensors.',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'AI Intelligence',
    description: 'Google Gemini AI provides deep insights, predictive analytics, and automated reduction strategies.',
    icon: Cpu,
    color: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Global Compliance',
    description: 'Full support for CBAM, CSRD, and ETS with automated reporting and immutable audit trails.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500'
  }
]

export default function HomePage() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="mesh-gradient absolute inset-0 opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center p-2 transform transition-all duration-500 group-hover:rotate-[360deg]">
              <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-lg" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-glow">CarbonLens</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
            <Link href="#ai" className="hover:text-primary transition-colors">AI Engine</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Enterprise</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="px-4 py-2 text-sm font-medium hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all transform hover:scale-105 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-40 pb-32 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div 
          style={{ opacity, scale, y }}
          className="relative z-10 text-center max-w-5xl px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border-white/10 text-sm font-medium text-primary mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>V2.0 Intelligence Platform Live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            Scale Sustainability with <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Hyper-Intelligence
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The world's first AI-native carbon accounting engine. Engineered for elite enterprises requiring sub-second precision, global compliance, and autonomous reduction strategies.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/dashboard" className="group px-8 py-4 bg-primary text-white rounded-full text-lg font-bold flex items-center justify-center space-x-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all">
              <span>Enter Command Center</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-8 py-4 glass text-white rounded-full text-lg font-bold hover:bg-white/10 transition-all border border-white/10">
              Technical Audit
            </button>
          </motion.div>
        </motion.div>

        {/* Hero Visual - Parallax Image */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
          className="mt-24 relative w-full max-w-6xl px-6 perspective-1000"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] group">
            <Image 
              src="/hero.png" 
              alt="CarbonLens Network" 
              width={1200} 
              height={600} 
              className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            
            {/* Overlay Data Nodes */}
            <div className="absolute top-1/4 left-1/4 glass p-4 rounded-2xl animate-bounce pointer-events-none">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 glass p-4 rounded-2xl animate-pulse pointer-events-none">
              <Zap className="text-emerald-400 w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Engineered for Accuracy</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our infrastructure is built on precision. From sub-second grid data to immutable audit chains.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group p-8 rounded-[2rem] glass border-white/10 hover:border-primary/50 transition-all active:scale-[0.98]"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-x2l flex items-center justify-center mb-8 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                  <feature.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Intelligence Section */}
      <section id="ai" className="py-32 bg-secondary/30 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-6">
              <Cpu className="text-primary w-8 h-8" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              Powered by <br />
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent italic">Google Gemini Ultra</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Leverage the world's most capable LLM for your sustainability data. Our integration provides autonomous anomaly detection, strategy simulation, and automated regulatory draft generation.
            </p>
            <ul className="space-y-4">
              {[
                'Predictive emission forecasting',
                'Autonomous supply chain optimization',
                'Instant CBAM declaration drafting',
                'Real-time regulatory pulse monitoring'
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm font-medium">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
            <div className="glass p-8 rounded-[2.5rem] relative z-10 border-white/10">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <div>
                    <p className="text-sm font-bold">CarbonAI Assistant</p>
                    <p className="text-xs text-muted-foreground">Analysing Scope 3 patterns...</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-2xl bg-white/5 max-w-[80%]">
                    <p className="text-sm">I've detected a 14% anomaly in your logistics emissions. Shall I simulate a rail-first alternative?</p>
                  </div>
                  <div className="glass p-4 rounded-2xl bg-primary/20 ml-auto max-w-[80%] border-primary/20 text-right">
                    <p className="text-sm">Yes, please provide a cost vs. carbon delta analysis.</p>
                  </div>
                  <div className="animate-pulse flex space-x-2">
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                    <div className="w-2 h-2 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="text-xl font-black tracking-tighter">CarbonLens</span>
          </div>
          <p className="text-sm text-muted-foreground italic">
            "The standard for enterprise carbon intelligence."
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Security</Link>
            <Link href="#" className="hover:text-primary transition-colors">Legal</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 text-center text-xs text-muted-foreground opacity-50">
          © 2026 CarbonLens Technologies. Built for the 1.5°C Future.
        </div>
      </footer>
    </div>
  )
}
