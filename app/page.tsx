"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, ChevronRight } from "lucide-react"
import { Icons } from "@/components/icons"

// Force dynamic to debug Vercel 404
export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white" suppressHydrationWarning>
      <header className="px-6 h-16 flex items-center fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5" suppressHydrationWarning>
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
            <Icons.logo className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">PRISM</span>
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-8">
          <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors" href="/login">
            Login
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-48 flex flex-col items-center justify-center overflow-hidden">

          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-zinc-800/40 to-transparent rounded-[100%] blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-400 backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                PRISM v1.0 is now live
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500"
              >
                Code Intelligence <br /> for Modern Teams
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mx-auto max-w-[700px] text-zinc-400 md:text-xl font-light leading-relaxed"
              >
                Replace manual code reviews with AI-powered insights. Detect bugs, security vulnerabilities, and logic errors in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 w-full justify-center"
              >
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="group relative h-12 rounded-full bg-gradient-to-b from-white to-zinc-200 text-black px-8 font-semibold text-[15px] shadow-[0_0_0_1px_rgba(255,255,255,1),0_4px_14px_0_rgba(255,255,255,0.39)] hover:shadow-[0_0_0_1px_rgba(255,255,255,1),0_6px_20px_rgba(255,255,255,0.23)] hover:to-white transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <ChevronRight className="relative z-10 w-4 h-4 stroke-[3px] text-black/70 group-hover:text-black transition-colors delay-75" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                </Link>
                <Link href="https://github.com">
                  <Button variant="outline" className="h-12 px-8 text-base rounded-full border-zinc-800 bg-transparent text-white hover:bg-zinc-900 hover:text-white transition-all w-full sm:w-auto">
                    View on GitHub
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section >

        {/* Features Grid */}
        < section id="features" className="w-full py-24 bg-zinc-950 border-t border-zinc-900" >
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                  <Zap className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Analysis</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Get feedback on your pull requests in seconds. Our AI engine processes diffs purely in memory for maximum speed.
                </p>
              </div>
              <div className="group relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all duration-300">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Bank-Grade Security</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Detect OWASP Top 10 vulnerabilities like SQL injection and XSS before they ever reach production.
                </p>
              </div>
              <div className="group relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 transition-all duration-300">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Code Quality Scoring</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Stop technical debt. Every PR gets a &quot;Merge Confidence Score&quot; based on readability, performance, and style.
                </p>
              </div>
            </div>
          </div>
        </section >

        {/* Technology Section */}
        < section className="w-full py-24 border-t border-zinc-900 bg-black relative overflow-hidden" >
          <div className="absolute inset-0 bg-zinc-900/20 radial-gradient-center" />
          <div className="container px-4 md:px-6 relative z-10 text-center">
            <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-500 mb-12">Powered by Next-Generation Technology</h2>
            <div className="flex justify-center flex-wrap gap-12 sm:gap-24">
              <div className="flex flex-col items-center gap-4 group cursor-default transition-all duration-300 hover:scale-105">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 group-hover:border-yellow-500/50 group-hover:bg-yellow-500/10 transition-all shadow-lg group-hover:shadow-yellow-500/20">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-yellow-500 font-bold text-xs">HF</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-lg text-zinc-300 group-hover:text-yellow-500 transition-colors">Phi-3 Mini</span>
                  <p className="text-xs text-zinc-500">Hugging Face Inference</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 group cursor-default transition-all duration-300 hover:scale-105">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 group-hover:border-white/50 group-hover:bg-white/10 transition-all shadow-lg group-hover:shadow-white/20">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">N</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-lg text-zinc-300 group-hover:text-white transition-colors">Next.js 16</span>
                  <p className="text-xs text-zinc-500">Bleeding Edge React</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 group cursor-default transition-all duration-300 hover:scale-105">
                <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all shadow-lg group-hover:shadow-teal-500/20">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-teal-500" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-lg text-zinc-300 group-hover:text-teal-500 transition-colors">FastAPI</span>
                  <p className="text-xs text-zinc-500">Async Python Backend</p>
                </div>
              </div>
            </div>
          </div>
        </section >
      </main >

      <footer className="py-8 w-full border-t border-zinc-900 bg-black">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 flex items-center gap-2">
            © {new Date().getFullYear()} PRISM Inc. Open Source Project.
            <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500 ml-2">
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Systems Operational
            </span>
          </p>
          <nav className="flex gap-6">
            <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="/terms">
              Terms
            </Link>
            <Link className="text-sm text-zinc-500 hover:text-white transition-colors" href="/privacy">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div >
  )
}
