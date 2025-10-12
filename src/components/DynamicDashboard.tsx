import React, { useState, useEffect } from 'react';

const DynamicDashboard: React.FC = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: "💳",
      title: "Instant Payments",
      description: "Send and receive payments instantly with zero fees",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🛡️",
      title: "Secure Transactions",
      description: "Military-grade encryption for all your transactions",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "🌍",
      title: "Global Access",
      description: "Send money anywhere in the world, anytime",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Transactions complete in under 3 seconds",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { value: "$2.5M+", label: "Total Volume", growth: "+25%" },
    { value: "10K+", label: "Active Users", growth: "+15%" },
    { value: "99.9%", label: "Uptime", growth: "+0.1%" },
    { value: "< 1s", label: "Avg Speed", growth: "-20%" }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rotate-12 animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/20 to-cyan-500/20 -rotate-12 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className={`pt-32 pb-20 px-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Web3Lancer Pay
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              The future of digital payments is here. Send, receive, and manage your crypto payments with unprecedented ease and security.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-lg flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
                Connect <span>→</span>
              </button>
              
              <button className="px-8 py-4 border-2 border-white/30 rounded-full font-semibold text-lg flex items-center gap-3 backdrop-blur-sm hover:scale-105 transition-transform">
                <span>▶</span> Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:scale-110 transition-transform cursor-pointer">
                    <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-300 mb-2">{stat.label}</div>
                    <div className="text-green-400 text-sm font-semibold">
                      {stat.growth}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Why Choose Web3Lancer Pay?
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                >
                  <div className={`bg-gradient-to-r ${feature.color} p-0.5 rounded-2xl`}>
                    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 h-full hover:-translate-y-2 transition-transform">
                      <div className="text-4xl mb-4">
                        {feature.icon}
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-300">{feature.description}</p>
                      
                      <div className={`h-1 bg-gradient-to-r ${feature.color} mt-4 rounded-full transition-all ${activeCard === index ? 'w-full' : 'w-0'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Feature Showcase */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Experience the Future
                </h3>
                
                <p className="text-gray-300 text-lg mb-8">
                  Our cutting-edge technology ensures your transactions are not just fast and secure, but also incredibly intuitive.
                </p>

                <div className="space-y-4">
                  {['Instant Processing', 'Zero Hidden Fees', 'Global Accessibility', 'Bank-Grade Security'].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-md border border-white/10">
                  <div className="space-y-6">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-300">Transaction Status</span>
                        <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <div className="text-2xl font-bold text-cyan-400">Processing...</div>
                    </div>
                    
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-gray-300 mb-2">Amount</div>
                      <div className="text-3xl font-bold">$1,250.00</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-center animate-pulse">
                      <div className="text-xl font-bold">✓ Transaction Complete</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ready to Transform Your Payments?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12">
              Join thousands of users who have already made the switch to the future of digital payments.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-lg shadow-2xl hover:scale-105 transition-transform">
                Start Sending Money
              </button>
              
              <button className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold text-lg shadow-2xl hover:scale-105 transition-transform">
                Create Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DynamicDashboard;