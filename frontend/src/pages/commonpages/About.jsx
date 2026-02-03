import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Users, Target, Award, Heart, Zap, Shield, Star, ArrowRight, CheckCircle, Globe, TrendingUp, Smartphone } from 'lucide-react';
import TeamImage from '../../assets/Boys photo.jpg';
import FounderImage from '../../assets/Ak photo.jpg';

export default function About() {
    const isAuthenticated = !!sessionStorage.getItem('access_token');
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Scissors className="text-white w-6 h-6" />
                </div>
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                GroomNet
              </span>
            </Link>

            <div className="flex items-center space-x-6">

            {!isAuthenticated && (
                <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                Get Started
                </Link>
            )}
            </div>
          </nav>
        </div>
      </header>

     
      <section className="relative py-20 px-4 overflow-hidden">
      
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 font-medium mb-8">
              <Heart className="w-4 h-4 mr-2 text-orange-400" />
              Our Story
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="text-white">Transforming</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-orange-400 bg-clip-text text-transparent">
                Beauty
              </span>
              <br />
              <span className="text-white">Together</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              We're a passionate team of innovators dedicated to revolutionizing the beauty industry 
              through technology, connecting talented professionals with clients worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-6 py-3 bg-black/10 backdrop-blur-sm border border-black/20 rounded-full text-black/70 font-medium mb-8">
                <Target className="w-4 h-4 mr-2 text-blue-500" />
                Our Mission
              </div>

              <h2 className="text-5xl md:text-6xl font-black mb-8">
                <span className="text-black">Empowering</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                  Beauty Dreams
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our mission is to democratize access to premium beauty services while empowering 
                talented professionals to build thriving businesses. We believe everyone deserves 
                to look and feel their absolute best.
              </p>

              <div className="space-y-4">
                {[
                  "Connect clients with verified beauty professionals",
                  "Provide seamless booking and payment experiences", 
                  "Support beauticians in growing their businesses",
                  "Maintain the highest standards of service quality"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-orange-500/20 rounded-3xl blur-xl"></div>
              <img
                src={TeamImage}
                alt="GroomNet Team"
                className="relative w-full h-[600px] object-cover rounded-3xl shadow-2xl"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 font-medium mb-8">
              <Award className="w-4 h-4 mr-2 text-orange-400" />
              Meet Our Founder
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-white">Visionary</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                Leadership
              </span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-orange-500/30 rounded-3xl blur-xl"></div>
                  <img
                    src={FounderImage}
                    alt="Founder - AK"
                    className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                    />
                  <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-sm rounded-2xl p-4">
                    <h3 className="text-2xl font-bold text-white mb-1">ANANDHURAI</h3>
                    <p className="text-blue-400 font-semibold">Founder & CEO</p>
                  </div>
                </div>

                <div>
                  <blockquote className="text-2xl md:text-3xl font-bold text-white mb-8 leading-relaxed">
                    "Beauty is not just about looking good—it's about feeling confident, 
                    empowered, and ready to conquer the world."
                  </blockquote>

                  <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    With over a decade of experience in the beauty industry and technology sector, 
                    AK founded GroomNet with a vision to bridge the gap between talented beauty 
                    professionals and clients seeking exceptional services.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-black text-blue-400 mb-2">10+</div>
                      <div className="text-gray-300 font-semibold">Years Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-orange-400 mb-2">50K+</div>
                      <div className="text-gray-300 font-semibold">Lives Impacted</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      to="/login"
                      className="inline-flex items-center bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                    >
                      Join Our Mission
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-black/10 backdrop-blur-sm border border-black/20 rounded-full text-black/70 font-medium mb-8">
              <Star className="w-4 h-4 mr-2 text-orange-500" />
              Our Core Values
            </div>

            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-black">What Drives</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Our Success
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-white w-10 h-10" />,
                title: "Trust & Safety",
                desc: "Every professional is thoroughly verified and vetted to ensure the highest standards of service and safety for our clients.",
                gradient: "from-blue-500 to-blue-600",
                hoverGradient: "hover:from-blue-600 hover:to-blue-700"
              },
              {
                icon: <Zap className="text-white w-10 h-10" />,
                title: "Innovation First",
                desc: "We continuously innovate with cutting-edge technology to provide seamless, intuitive experiences for both clients and professionals.",
                gradient: "from-orange-500 to-orange-600", 
                hoverGradient: "hover:from-orange-600 hover:to-orange-700"
              },
              {
                icon: <Heart className="text-white w-10 h-10" />,
                title: "Community Focus",
                desc: "Building a supportive community where beauty professionals thrive and clients discover their perfect match with confidence.",
                gradient: "from-blue-600 to-orange-500",
                hoverGradient: "hover:from-blue-700 hover:to-orange-600"
              },
            ].map((value, idx) => (
              <div key={idx} className="group text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-20 h-20 bg-gradient-to-br ${value.gradient} ${value.hoverGradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-black">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-8">
              <span className="text-white">Our Impact</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
                In Numbers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { 
                icon: <Users className="w-8 h-8 text-blue-400" />,
                number: "10,000+", 
                label: "Happy Customers", 
                color: "text-blue-400" 
              },
              { 
                icon: <Scissors className="w-8 h-8 text-orange-400" />,
                number: "2,500+", 
                label: "Verified Professionals", 
                color: "text-orange-400" 
              },
              { 
                icon: <TrendingUp className="w-8 h-8 text-blue-400" />,
                number: "75,000+", 
                label: "Successful Bookings", 
                color: "text-blue-400" 
              },
              { 
                icon: <Globe className="w-8 h-8 text-orange-400" />,
                number: "50+", 
                label: "Cities Covered", 
                color: "text-orange-400" 
              }
            ].map((stat, idx) => (
              <div key={idx} className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className={`text-4xl md:text-5xl font-black ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-gray-300 font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-orange-500">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to Join Our Journey?
          </h2>
          <p className="text-xl text-white/90 mb-12 leading-relaxed">
            Whether you're looking for premium beauty services or want to grow your professional business, 
            GroomNet is here to make your dreams a reality.
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
            Transforming the beauty industry, one connection at a time.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            <a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-500">© 2024 GroomNet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
