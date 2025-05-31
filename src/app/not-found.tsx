'use client'

import React, { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Crypto-themed floating elements
const FloatingCrypto = ({ symbol, delay = 0 }: { symbol: string, delay?: number }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 50 - 25,
        y: Math.random() * 30 - 15
      })
    }, 3000 + delay)

    return () => clearInterval(interval)
  }, [delay])

  return (
    <div 
      className="absolute text-4xl opacity-20 transition-all duration-3000 ease-in-out"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        animationDelay: `${delay}ms`
      }}
    >
      {symbol}
    </div>
  )
}

// Interactive wallet cards
const WalletSuggestion = ({ name, icon, path, description }: {
  name: string
  icon: string
  path: string
  description: string
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={path}>
      <div 
        className={`relative p-6 bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
          isHovered 
            ? 'border-cyan-500 shadow-xl transform scale-105' 
            : 'border-neutral-200 hover:border-cyan-300 hover:shadow-lg'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
          isHovered 
            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10' 
            : 'bg-transparent'
        }`} />
        
        <div className="relative z-10">
          <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">{name}</h3>
          <p className="text-sm text-neutral-600">{description}</p>
          
          {/* Hover arrow */}
          <div className={`mt-4 flex items-center text-cyan-500 font-medium transition-all duration-300 ${
            isHovered ? 'translate-x-2 opacity-100' : 'translate-x-0 opacity-0'
          }`}>
            <span className="mr-2">Let's go</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function NotFound() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showEasterEgg, setShowEasterEgg] = useState(false)

  // Popular destinations
  const popularPaths = [
    {
      name: 'Wallets',
      icon: '👛',
      path: '/wallets',
      description: 'Manage your crypto wallets and view balances'
    },
    {
      name: 'Send Money',
      icon: '📤',
      path: '/send',
      description: 'Send crypto to friends and family instantly'
    },
    {
      name: 'Exchange',
      icon: '🔄',
      path: '/exchange',
      description: 'Swap between different cryptocurrencies'
    },
    {
      name: 'Dashboard',
      icon: '📊',
      path: '/',
      description: 'View your portfolio and recent activity'
    }
  ]

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Smart search routing
      const query = searchQuery.toLowerCase()
      if (query.includes('wallet')) router.push('/wallets')
      else if (query.includes('send')) router.push('/send')
      else if (query.includes('exchange') || query.includes('swap')) router.push('/exchange')
      else if (query.includes('dashboard') || query.includes('home')) router.push('/')
      else router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Easter egg
  const handleKonamiCode = () => {
    setShowEasterEgg(true)
    setTimeout(() => setShowEasterEgg(false), 3000)
  }

  return (
    <AppShell>
      <div className="min-h-screen relative overflow-hidden">
        {/* Floating crypto symbols */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10">
            <FloatingCrypto symbol="₿" delay={0} />
          </div>
          <div className="absolute top-40 right-20">
            <FloatingCrypto symbol="Ξ" delay={1000} />
          </div>
          <div className="absolute bottom-40 left-20">
            <FloatingCrypto symbol="◎" delay={2000} />
          </div>
          <div className="absolute top-60 left-1/2">
            <FloatingCrypto symbol="⟐" delay={1500} />
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
          {/* Main 404 Section */}
          <div className="text-center mb-16">
            {/* Animated 404 */}
            <div className="relative mb-8">
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse">
                404
              </h1>
              <div className="absolute inset-0 text-8xl md:text-9xl font-black text-cyan-500/20 blur-sm">
                404
              </div>
            </div>

            {/* Creative message */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Oops! This page went to the moon 🚀
              </h2>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                Looks like this page decided to HODL in a different galaxy. 
                But don't worry - your crypto journey continues here!
              </p>
            </div>

            {/* Interactive search */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for wallets, transactions, or anything..."
                  className="w-full px-6 py-4 text-lg border-2 border-neutral-300 rounded-full focus:border-cyan-500 focus:outline-none transition-all duration-300 pl-14"
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  🔍
                </div>
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full transition-all duration-300"
                >
                  Go
                </button>
              </div>
            </form>
          </div>

          {/* Popular Destinations */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-neutral-900 text-center mb-8">
              🎯 Popular Destinations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularPaths.map((item) => (
                <WalletSuggestion key={item.path} {...item} />
              ))}
            </div>
          </div>

          {/* Fun Stats */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 mb-12">
            <h3 className="text-xl font-bold text-neutral-900 text-center mb-6">
              💎 While you're here, check out these numbers!
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-600">$12M+</div>
                <div className="text-sm text-neutral-600">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-neutral-600">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-neutral-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">⚡</div>
                <div className="text-sm text-neutral-600">Lightning Fast</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🏠 Take me home
              </Link>
              <Link 
                href="/wallets"
                className="px-8 py-4 bg-white border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50 font-bold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                👛 View my wallets
              </Link>
            </div>
            
            {/* Easter egg trigger */}
            <button 
              onClick={handleKonamiCode}
              className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              🎮 Feeling adventurous? Click me!
            </button>
          </div>

          {/* Easter Egg */}
          {showEasterEgg && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-pulse">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-2xl font-bold mb-2">Surprise!</div>
                <div className="text-lg">You found the secret! 🎁</div>
                <div className="text-sm mt-4 text-neutral-300">
                  Fun fact: This 404 page has been viewed {Math.floor(Math.random() * 1000)} times today!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}