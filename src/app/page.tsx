'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FiSend, FiDownload, FiCode, FiShield, FiGlobe, FiZap, 
  FiArrowRight, FiCheck, FiStar, FiUsers, FiTrendingUp,
  FiCreditCard, FiLock, FiRefreshCw, FiEye, FiHeart,
  FiBarChart, FiTarget, FiPlay, FiChevronDown
} from 'react-icons/fi'
import { UnifiedAuthModal } from '@/components/auth/UnifiedAuthModal'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Transactions confirmed in under 3 seconds with our optimized blockchain infrastructure',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      icon: FiShield,
      title: 'Military Grade Security',
      description: 'Bank-level encryption with multi-signature wallets and biometric authentication',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      icon: FiGlobe,
      title: 'Global Reach',
      description: 'Send money anywhere in the world with no borders, no banks, no limits',
      color: 'from-blue-400 to-purple-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      icon: FiCreditCard,
      title: 'Multi-Currency',
      description: 'Support for 100+ cryptocurrencies including Bitcoin, Ethereum, and stablecoins',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      icon: FiCode,
      title: 'Developer Friendly',
      description: 'Powerful APIs and SDKs to integrate payments into any application',
      color: 'from-cyan-400 to-blue-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      icon: FiUsers,
      title: 'Team Collaboration',
      description: 'Built for teams with role-based access, spending limits, and approval workflows',
      color: 'from-pink-400 to-rose-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ]

  const stats = [
    { label: 'Happy Users', value: '250K+', icon: FiUsers, color: 'text-emerald-600' },
    { label: 'Volume Processed', value: '$50M+', icon: FiTrendingUp, color: 'text-blue-600' },
    { label: 'Countries Served', value: '180+', icon: FiGlobe, color: 'text-purple-600' },
    { label: 'Uptime', value: '99.99%', icon: FiZap, color: 'text-yellow-600' }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Freelance Developer",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=100&h=100&fit=crop&crop=face",
      content: "LancerPay revolutionized how I receive payments from clients. Instant, secure, and global!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "E-commerce Owner",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "The API integration was seamless. Our conversion rate increased by 40% after implementing crypto payments.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Digital Nomad",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Finally, a payment platform that works everywhere I travel. No more bank restrictions!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 right-20 w-40 h-40 bg-gradient-to-r from-purple-300/20 to-pink-300/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, 200, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="LancerPay Logo"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-lg"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 blur-sm"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                LancerPay
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Pricing', 'About', 'Rates'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-slate-600 hover:text-cyan-600 font-medium transition-colors relative group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {item}
                  <div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 group-hover:w-full transition-all duration-300"
                  />
                </motion.a>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link
                    href="/home"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-semibold"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button
                      onClick={() => {
                        setAuthModalOpen(true)
                        setAuthModalOpen(true)
                      }}
                      className="text-slate-600 hover:text-cyan-600 font-medium transition-colors"
                    >
                      Sign In
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.6 }}
                  >
                    <button
                      onClick={() => {
                        setAuthModalOpen(true)
                        setAuthModalOpen(true)
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2.5 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-semibold"
                    >
                      Get Started
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-full px-6 py-2 mb-8"
              >
                <FiZap className="w-4 h-4 text-cyan-600 mr-2" />
                <span className="text-cyan-700 font-semibold text-sm">The Future of Digital Payments is Here</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold leading-tight mb-8">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Crypto Payments
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg"
              >
                Send, receive, and manage cryptocurrency payments with 
                <span className="font-semibold text-cyan-600"> lightning speed</span>, 
                <span className="font-semibold text-emerald-600"> bank-grade security</span>, and 
                <span className="font-semibold text-purple-600"> zero boundaries</span>.
                <br />
                <span className="text-base text-slate-500">
                  Perfect for freelancers, creators, and anyone who values global freedom.
                </span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        window.location.href = '/home'
                      } else {
                        setAuthModalOpen(true)
                        setAuthModalOpen(true)
                      }
                    }}
                    className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden w-full"
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10 mr-2">
                      {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                    </span>
                    <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    href="/send"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-300 shadow-lg"
                  >
                    <FiPlay className="mr-2 group-hover:scale-110 transition-transform" />
                    Try Demo
                  </Link>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center space-x-8 text-sm text-slate-500"
              >
                {[
                  { icon: FiCheck, text: "No setup fees" },
                  { icon: FiCheck, text: "Global coverage" },
                  { icon: FiCheck, text: "Instant transfers" }
                ].map((item, index) => (
                  <div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.3 + index * 0.1, type: "spring" }}
                    className="flex items-center"
                  >
                    <item.icon className="w-4 h-4 text-emerald-500 mr-2" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Demo Card */}
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: 45 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Floating elements */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl opacity-80 blur-sm"
                />
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl opacity-60 blur-sm"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Send Payment</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <FiSend className="w-6 h-6 text-cyan-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</label>
                      <div
                        key={activeFeature}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                      >
                        ${(1250.00 + activeFeature * 127.50).toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">To</label>
                      <div className="text-lg text-slate-700 font-medium">john@example.com</div>
                    </div>
                    
                    <button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                    >
                      Send Now
                    </button>
                  </div>
                  
                  {/* Live indicators */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                      />
                      <span className="text-xs text-slate-500">Live network</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      <motion.span
                        key={activeFeature}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono"
                      >
                        {Math.random().toFixed(2)}s avg
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '100%', '0%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by thousands worldwide
            </h2>
            <p className="text-xl text-slate-300">Real numbers from real users</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                  className="text-4xl font-bold text-white mb-2"
                >
                  {stat.value}
                </div>
                <div className="text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-cyan-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 rounded-full px-6 py-2 mb-6"
            >
              <FiTarget className="w-4 h-4 text-cyan-600 mr-2" />
              <span className="text-cyan-700 font-semibold text-sm">Powerful Features</span>
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Everything you need for
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                crypto payments
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Built with security, speed, and simplicity in mind. Start accepting and sending 
              cryptocurrency payments with our cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`}
                />
                
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl hover:border-slate-300 transition-all duration-300">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  
                  {/* Hover effect indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                    className={`h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6`}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 animate-pulse"></div>
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-4xl font-bold mb-6">
                  Real-time transaction monitoring
                </h3>
                <p className="text-slate-300 text-xl leading-relaxed mb-8">
                  Track every payment with millisecond precision. Our advanced monitoring 
                  system provides instant updates and detailed analytics.
                </p>
                
                <div className="space-y-4">
                  {[
                    { label: "Average confirmation time", value: "2.3s", color: "text-green-400" },
                    { label: "Success rate", value: "99.97%", color: "text-blue-400" },
                    { label: "Network fees", value: "$0.02", color: "text-purple-400" }
                  ].map((metric, index) => (
                    <div
                      key={metric.label}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-slate-400">{metric.label}</span>
                      <span className={`font-bold text-xl ${metric.color}`}>{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"
                />
                <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                          className="w-3 h-3 bg-green-400 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-sm text-slate-300">Payment #{1234 + index}</div>
                          <div className="text-xs text-slate-500">Confirmed</div>
                        </div>
                        <div className="text-green-400 font-mono text-sm">
                          +{(Math.random() * 1000).toFixed(2)} USDC
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-br from-cyan-50 to-blue-50 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-cyan-300/20 to-blue-300/20 rounded-full blur-2xl"
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Loved by creators
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                worldwide
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of satisfied users who trust LancerPay for their crypto payments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50, rotateY: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: i * 0.1 + index * 0.1 }}
                        >
                          <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/20"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                        <div className="text-slate-500 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 relative overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-6 py-2 mb-8"
            >
              <FiHeart className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-cyan-300 font-semibold text-sm">Join the Revolution</span>
            </div>

            <h2 className="text-6xl font-bold text-white mb-8 leading-tight">
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                your payments?
              </span>
            </h2>
            <p className="text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who trust LancerPay for fast, secure, 
              and global cryptocurrency transactions.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      window.location.href = '/home'
                    } else {
                      setAuthModalOpen(true)
                      setAuthModalOpen(true)
                    }
                  }}
                  className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden"
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <span className="relative z-10 mr-3">
                    {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  </span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FiArrowRight className="relative z-10 w-6 h-6" />
                  </div>
                </button>
              </div>

              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Link
                  href="/send"
                  className="group inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-2xl font-bold text-xl hover:bg-white/20 transition-all duration-300"
                >
                  <FiEye className="mr-3 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </div>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 text-slate-400"
            >
              {[
                "256-bit encryption",
                "Multi-signature security",
                "24/7 monitoring",
                "Global compliance"
              ].map((feature, index) => (
                <div
                  key={feature}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                  className="flex items-center space-x-2"
                >
                  <FiShield className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-5 gap-8 mb-16">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 mb-6"
              >
                <div className="relative">
                  <Image
                    src="/images/logo.png"
                    alt="LancerPay Logo"
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 blur-sm"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  LancerPay
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-md">
                The future of digital payments. Fast, secure, and global cryptocurrency 
                transactions for the modern world.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social, index) => (
                  <motion.a
                    key={social}
                    href="#"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 transition-all duration-300"
                  >
                    <span className="text-xs font-bold">{social.charAt(0)}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { name: "Send Money", href: "/send" },
                  { name: "Receive Money", href: "/receive" },
                  { name: "Exchange Rates", href: "/rates" },
                  { name: "Mobile App", href: "#" }
                ]
              },
              {
                title: "Company",
                links: [
                  { name: "About", href: "#about" },
                  { name: "Careers", href: "#" },
                  { name: "Blog", href: "#" },
                  { name: "Press", href: "#" }
                ]
              },
              {
                title: "Support",
                links: [
                  { name: "Help Center", href: "#" },
                  { name: "Contact Us", href: "#" },
                  { name: "Privacy Policy", href: "#" },
                  { name: "Terms of Service", href: "#" }
                ]
              }
            ].map((section, sectionIndex) => (
              <div key={section.title}>
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="font-bold mb-6 text-white"
                >
                  {section.title}
                </motion.h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: sectionIndex * 0.1 + linkIndex * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-cyan-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-slate-400 mb-4 md:mb-0">
              © 2024 LancerPay. All rights reserved.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-2 text-slate-400"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
              <span className="text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center z-50"
      >
        <FiChevronDown className="w-5 h-5 rotate-180" />
      </button>

      {/* Web3 Auth Modal */}
      {/* Unified Auth Modal */}
      <UnifiedAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  )
}

