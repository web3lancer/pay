'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Web3AuthModal } from '@/components/auth/Web3AuthModal'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const { isAuthenticated } = useAuth()

  const menuItems = [
    { name: 'Dashboard', href: '#' },
    { name: 'Send Money', href: '#' },
    { name: 'Receive', href: '#' },
    { name: 'History', href: '#' },
    { name: 'Support', href: '#' }
  ]

  const handleSignIn = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleGetStarted = () => {
    setAuthMode('signup')
    setAuthModalOpen(true)
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 animate-in">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">W3</span>
              </div>
              <span className="text-white font-bold text-xl">Web3Lancer Pay</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors font-medium hover:-translate-y-0.5 transform transition-transform"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg hover:scale-105 hover:shadow-cyan-500/25 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <button 
                    onClick={handleSignIn}
                    className="px-6 py-2 text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-slate-900 transition-all hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleGetStarted}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg hover:scale-105 hover:shadow-cyan-500/25 transition-all"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center space-y-1.5 hover:scale-95 transition-transform"
            >
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-6 pb-4 space-y-4">
              {menuItems.map((item, index) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-cyan-400 py-2 px-4 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="pt-4 space-y-3">
                {isAuthenticated ? (
                  <Link
                    href="/home"
                    className="block w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center rounded-full font-medium shadow-lg"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <button 
                      onClick={handleSignIn}
                      className="w-full px-6 py-3 text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-slate-900 transition-all"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={handleGetStarted}
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Web3 Auth Modal */}
      <Web3AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />
    </>
  )
}

export default Header