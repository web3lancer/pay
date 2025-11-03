'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const Header: React.FC = () => {
  const { isAuthenticated, redirectToAuth } = useAuth()

  const menuItems = [
    { name: 'Dashboard', href: '#' },
    { name: 'Send Money', href: '#' },
    { name: 'Receive', href: '#' },
    { name: 'History', href: '#' },
    { name: 'Support', href: '#' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-slate-900/50 animate-in">
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
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg shadow-cyan-500/40 hover:scale-105 hover:shadow-cyan-500/50 transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <button 
                onClick={redirectToAuth}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg shadow-cyan-500/40 hover:scale-105 hover:shadow-cyan-500/50 transition-all"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header