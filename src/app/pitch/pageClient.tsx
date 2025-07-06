'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiPlay, FiPause, FiChevronLeft, FiChevronRight, FiZap, FiShield, 
  FiGlobe, FiTrendingUp, FiUsers, FiDollarSign, FiTarget,
  FiCode, FiCheck
} from 'react-icons/fi'
import Image from 'next/image'

interface Slide {
  id: number
  title: string
  subtitle?: string
  content: React.ReactNode
  bgGradient: string
  textColor: string
}

export function PitchClient() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  const slides: Slide[] = [
    {
      id: 0,
      title: "LancerPay",
      subtitle: "The Future of Digital Payments",
      bgGradient: "from-slate-900 via-blue-900 to-purple-900",
      textColor: "text-white",
      content: (
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="relative mx-auto w-32 h-32"
          >
            <Image
              src="/images/logo.png"
              alt="LancerPay"
              width={128}
              height={128}
              className="rounded-3xl shadow-2xl"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl opacity-30 blur-md"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl text-blue-200 max-w-2xl mx-auto"
          >
            Next-gen payment platform for freelancers, businesses, and the web3 world
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center gap-8 text-cyan-300"
          >
            {[FiZap, FiShield, FiGlobe].map((Icon, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )
    },
    {
      id: 1,
      title: "The Problem",
      bgGradient: "from-red-900 via-red-800 to-orange-900",
      textColor: "text-white",
      content: (
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {[
              "Cross-border payment delays (3-7 days)",
              "High transaction fees (3-8%)",
              "Limited crypto payment options",
              "Complex freelancer payment flows"
            ].map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-4 p-4 bg-red-800/30 rounded-xl"
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                  {i + 1}
                </div>
                <span className="text-xl">{problem}</span>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="text-6xl font-bold text-red-400 mb-4">$50B+</div>
            <div className="text-xl text-red-200">Lost annually to payment inefficiencies</div>
          </motion.div>
        </div>
      )
    },
    {
      id: 2,
      title: "Our Solution",
      bgGradient: "from-emerald-900 via-teal-800 to-cyan-900",
      textColor: "text-white",
      content: (
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FiZap, title: "Instant Transfers", desc: "Sub-3 second confirmations" },
            { icon: FiDollarSign, title: "Low Fees", desc: "0.1-0.5% transaction costs" },
            { icon: FiGlobe, title: "Global Reach", desc: "180+ countries supported" },
            { icon: FiShield, title: "Secure", desc: "Military-grade encryption" },
            { icon: FiCode, title: "API-First", desc: "Easy integration for devs" },
            { icon: FiUsers, title: "Team Features", desc: "Built for collaboration" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <feature.icon className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-cyan-200">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 3,
      title: "Market Opportunity",
      bgGradient: "from-purple-900 via-indigo-800 to-blue-900",
      textColor: "text-white",
      content: (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            {[
              { label: "Global Payment Market", value: "$2.8T", growth: "+8.5% CAGR" },
              { label: "Freelancer Economy", value: "$400B+", growth: "+15% CAGR" },
              { label: "Crypto Payments", value: "$180B", growth: "+45% CAGR" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              >
                <div className="text-4xl font-bold text-purple-300 mb-2">{stat.value}</div>
                <div className="text-xl mb-1">{stat.label}</div>
                <div className="text-green-400 font-semibold">{stat.growth}</div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 opacity-80"
              >
                <FiTrendingUp className="w-24 h-24 text-white" />
              </motion.div>
              <div className="text-2xl text-purple-200">Massive growth trajectory</div>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 4,
      title: "Traction & Metrics",
      bgGradient: "from-cyan-900 via-blue-800 to-indigo-900",
      textColor: "text-white",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { metric: "250K+", label: "Active Users", icon: FiUsers },
            { metric: "$50M+", label: "Volume Processed", icon: FiDollarSign },
            { metric: "180+", label: "Countries", icon: FiGlobe },
            { metric: "99.99%", label: "Uptime", icon: FiZap }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <item.icon className="w-10 h-10 text-white" />
              </motion.div>
              <div className="text-4xl font-bold text-cyan-300 mb-2">{item.metric}</div>
              <div className="text-lg text-blue-200">{item.label}</div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 5,
      title: "Technology Stack",
      bgGradient: "from-slate-900 via-gray-800 to-zinc-900",
      textColor: "text-white",
      content: (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { category: "Frontend", techs: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"] },
              { category: "Backend", techs: ["Appwrite", "Node.js", "PostgreSQL", "Redis"] },
              { category: "Blockchain", techs: ["Bless Network", "Ethereum", "Bitcoin", "USDC/USDT"] }
            ].map((stack, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6"
              >
                <h3 className="text-xl font-bold mb-4 text-cyan-400">{stack.category}</h3>
                <div className="space-y-2">
                  {stack.techs.map((tech, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 + j * 0.1 }}
                      className="flex items-center gap-2"
                    >
                      <FiCheck className="w-4 h-4 text-green-400" />
                      <span>{tech}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-500/30 rounded-full px-6 py-2">
              <FiZap className="w-5 h-5 text-green-400" />
              <span className="text-green-300 font-semibold">Production Ready & Scalable</span>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      id: 6,
      title: "The Ask",
      bgGradient: "from-violet-900 via-purple-800 to-fuchsia-900",
      textColor: "text-white",
      content: (
        <div className="text-center space-y-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="space-y-4"
          >
            <div className="text-7xl font-bold text-violet-300">$2M</div>
            <div className="text-2xl text-violet-200">Seed Funding Round</div>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { percent: "40%", use: "Team Expansion", desc: "Engineering & Growth" },
              { percent: "35%", use: "Product Development", desc: "New Features & Mobile" },
              { percent: "25%", use: "Marketing & Partnerships", desc: "Global Expansion" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              >
                <div className="text-4xl font-bold text-violet-300 mb-2">{item.percent}</div>
                <div className="text-xl font-semibold mb-2">{item.use}</div>
                <div className="text-violet-200">{item.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center gap-4"
          >
            <div className="inline-flex items-center gap-2 bg-violet-800/50 rounded-full px-6 py-3">
              <FiTarget className="w-5 h-5 text-violet-300" />
              <span className="text-violet-200">18-month runway</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-violet-800/50 rounded-full px-6 py-3">
              <FiTrendingUp className="w-5 h-5 text-violet-300" />
              <span className="text-violet-200">10x growth target</span>
            </div>
          </motion.div>
        </div>
      )
    }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 8000)
    }
    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`min-h-screen bg-gradient-to-br ${slides[currentSlide].bgGradient} ${slides[currentSlide].textColor} flex flex-col`}
        >
          {/* Header */}
          <div className="p-8 flex justify-between items-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold"
            >
              {slides[currentSlide].title}
            </motion.h1>
            {slides[currentSlide].subtitle && (
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl opacity-80"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 px-8 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="h-full flex items-center"
            >
              {slides[currentSlide].content}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-4">
          <button
            onClick={prevSlide}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {isAutoPlaying ? (
              <FiPause className="w-6 h-6 text-white" />
            ) : (
              <FiPlay className="w-6 h-6 text-white" />
            )}
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 z-50"
        style={{
          width: `${((currentSlide + 1) / slides.length) * 100}%`
        }}
        initial={{ width: 0 }}
        animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
