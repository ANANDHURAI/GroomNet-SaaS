import { useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, User, Shield, Calendar, Star, CheckCircle, Menu, X, CreditCard, ArrowRight, Zap, Award, Users } from 'lucide-react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Scissors className="text-white w-6 h-6" />
                </div>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                GroomNet
              </span>
            </div>

           
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
                Features
              </a>
              <Link
                to="/about"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                About Us
              </Link>
         
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-800 text-white transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
                  Features
                </a>
                <a href="#about" className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
                  About
                </a>
                <a href="#contact" className="text-gray-300 hover:text-white font-medium transition-colors duration-300">
                  Contact
                </a>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl font-semibold text-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 font-medium mb-8">
              <Zap className="w-4 h-4 mr-2 text-orange-400" />
              The Future of Beauty Services
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="text-white">Your Beauty</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-orange-400 bg-clip-text text-transparent">
                Revolution
              </span>
              <br />
              <span className="text-white">Starts Here</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with elite beauticians get with premium clients. 
              GroomNet transforms beauty services into extraordinary experiences.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/login"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-blue-500/25 flex items-center"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
            </div>
          </div>

          {/* User Type Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {/* Customer Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500">
                      <User className="text-white w-12 h-12" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h3 className="text-4xl font-black text-white mb-4">I'm a Customer</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Discover and book premium beauty services with verified professionals near you
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      "Browse Premium Services",
                      "Instant Booking System", 
                      "Verified Reviews & Ratings"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/login"
                    className="w-full inline-block text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    Start Booking
                  </Link>
                </div>
              </div>
            </div>

            {/* Beautician Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                <div className="text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-orange-500/50 transition-all duration-500">
                      <Scissors className="text-white w-12 h-12" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <h3 className="text-4xl font-black text-white mb-4">I'm a Beautician</h3>
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Grow your business exponentially and connect with premium clients worldwide
                  </p>

                  <div className="space-y-4 mb-10">
                    {[
                      "Smart Booking Management",
                      "Professional Portfolio Builder",
                      "Premium Client Network"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-300 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/barber-personal"
                    className="w-full inline-block text-center bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                  >
                    Join Network
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-300">
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">Verified Professionals</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <Star className="w-6 h-6 text-orange-400" />
              <span className="font-semibold">5-Star Rated Platform</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-3">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">10K+ Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-black/10 backdrop-blur-sm border border-black/20 rounded-full text-black/70 font-medium mb-8">
              <Zap className="w-4 h-4 mr-2 text-orange-500" />
              Why Choose GroomNet
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-black">Revolutionizing</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Beauty Services
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're transforming the beauty industry by seamlessly connecting customers 
              with world-class professionals through cutting-edge technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-white w-10 h-10" />,
                title: "Smart Discovery",
                desc: "AI-powered matching system finds the perfect beautician based on your preferences, location, and service requirements.",
                gradient: "from-blue-500 to-blue-600",
                hoverGradient: "hover:from-blue-600 hover:to-blue-700"
              },
              {
                icon: <Calendar className="text-white w-10 h-10" />,
                title: "Instant Booking",
                desc: "Real-time availability, instant confirmations, automated reminders, and seamless rescheduling at your fingertips.",
                gradient: "from-orange-500 to-orange-600", 
                hoverGradient: "hover:from-orange-600 hover:to-orange-700"
              },
              {
                icon: <CreditCard className="text-white w-10 h-10" />,
                title: "Secure Payments",
                desc: "Multiple payment options with bank-level security, instant refunds, and complete transaction protection.",
                gradient: "from-blue-600 to-orange-500",
                hoverGradient: "hover:from-blue-700 hover:to-orange-600"
              },
            ].map((feature, idx) => (
              <div key={idx} className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} ${feature.hoverGradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Happy Customers", color: "text-blue-400" },
              { number: "2K+", label: "Professional Beauticians", color: "text-orange-400" },
              { number: "50K+", label: "Successful Bookings", color: "text-blue-400" },
              { number: "4.9★", label: "Average Rating", color: "text-orange-400" }
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className={`text-5xl md:text-6xl font-black ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-300 font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to Transform Your Beauty Experience?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Join thousands of satisfied customers and professionals who trust GroomNet for their beauty needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/login"
              className="bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Start Your Journey
            </Link>
            <Link
              to="/barber-personal"
              className="bg-black/20 backdrop-blur-sm border border-white/30 text-white hover:bg-black/30 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Join as Professional
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Scissors className="text-white w-6 h-6" />
              </div>
            </div>
            <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
              GroomNet
            </span>
          </div>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Your trusted platform for premium beauty services. Connect, book, and grow with confidence.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Support</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500">© 2025 GroomNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
