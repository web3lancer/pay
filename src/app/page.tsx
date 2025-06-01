'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  FiSend, FiDownload, FiCode, FiShield, FiGlobe, FiZap, 
  FiArrowRight, FiCheck, FiStar, FiUsers, FiTrendingUp,
  FiCreditCard, FiLock, FiRefreshCw
} from 'react-icons/fi'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: FiSend,
      title: 'Instant Payments',
      description: 'Send crypto payments globally in seconds with minimal fees'
    },
    {
      icon: FiShield,
      title: 'Secure & Safe',
      description: 'Bank-grade security with end-to-end encryption and blockchain technology'
    },
    {
      icon: FiGlobe,
      title: 'Global Access',
      description: 'Available worldwide, no borders or banking restrictions'
    },
    {
      icon: FiCreditCard,
      title: 'Multi-Currency',
      description: 'Support for Bitcoin, Ethereum, USDC, and 100+ cryptocurrencies'
    },
    {
      icon: FiCode,
      title: 'Developer API',
      description: 'Integrate payments into your apps with our powerful API'
    },
    {
      icon: FiUsers,
      title: 'Team Payments',
      description: 'Perfect for freelancers, businesses, and remote teams'
    }
  ]

  const stats = [
    { label: 'Active Users', value: '50K+', icon: FiUsers },
    { label: 'Transactions', value: '$2M+', icon: FiTrendingUp },
    { label: 'Countries', value: '100+', icon: FiGlobe },
    { label: 'Uptime', value: '99.9%', icon: FiZap }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FiZap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900">LancerPay</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900">Features</a>
              <a href="#pricing" className="text-neutral-600 hover:text-neutral-900">Pricing</a>
              <a href="#about" className="text-neutral-600 hover:text-neutral-900">About</a>
              <Link href="/rates" className="text-neutral-600 hover:text-neutral-900">Rates</Link>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href="/home"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {' '}Digital Payments
                </span>
              </h1>
              <p className="text-xl text-neutral-600 mt-6 leading-relaxed">
                Send, receive, and manage cryptocurrency payments instantly. Built for freelancers, 
                businesses, and teams who need fast, secure, global transactions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href={isAuthenticated ? "/home" : "/auth"}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all group"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/send"
                  className="inline-flex items-center justify-center px-8 py-4 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Try Demo Payment
                </Link>
              </div>

              <div className="flex items-center space-x-6 mt-8 text-sm text-neutral-500">
                <div className="flex items-center">
                  <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  No setup fees
                </div>
                <div className="flex items-center">
                  <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  Global coverage
                </div>
                <div className="flex items-center">
                  <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  Instant transfers
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8">
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-neutral-500">Send Payment</span>
                    <FiSend className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-neutral-500">Amount</label>
                      <div className="text-2xl font-bold text-neutral-900">$1,250.00</div>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">To</label>
                      <div className="text-sm text-neutral-700">john@example.com</div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg">
                      Send Now
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-neutral-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything you need for crypto payments
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Built with security, speed, and simplicity in mind. Start accepting and sending 
              cryptocurrency payments in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-cyan-500 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to revolutionize your payments?
            </h2>
            <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust LancerPay for their cryptocurrency transactions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={isAuthenticated ? "/home" : "/auth"}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-cyan-600 rounded-xl hover:bg-neutral-50 transition-colors font-semibold"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                <FiArrowRight className="ml-2" />
              </Link>
              <Link
                href="/send"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FiZap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">LancerPay</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                The future of digital payments. Fast, secure, and global cryptocurrency transactions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><Link href="/send" className="hover:text-white transition-colors">Send Money</Link></li>
                <li><Link href="/receive" className="hover:text-white transition-colors">Receive Money</Link></li>
                <li><Link href="/rates" className="hover:text-white transition-colors">Exchange Rates</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400">© 2024 LancerPay. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

