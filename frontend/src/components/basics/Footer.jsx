import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scissors, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Heart 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-auto relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-50 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          
          <div className="space-y-4">
            <Link to="/home" className="flex items-center gap-2 group w-fit">
              <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg shadow-md group-hover:rotate-6 transition-transform duration-300">
                <Scissors className="text-white w-4 h-4" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                GroomNet
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Experience the future of grooming. connecting you with top-tier barbers and stylists for a premium service experience right at your convenience.
            </p>
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <a 
                  key={index}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {['Home'].map((item) => (
                <li key={item}>
                  <Link 
                    to="#" 
                    className="text-gray-500 hover:text-purple-600 transition-colors text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-200 group-hover:bg-purple-600 transition-colors"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-6">Popular Services</h3>
            <ul className="space-y-3">
              {['Haircut & Styling', 'Beard Trimming', 'Facial Treatments', 'Hair Coloring', 'Grooming Packages'].map((item) => (
                <li key={item}>
                  <Link 
                    to="#" 
                    className="text-gray-500 hover:text-pink-600 transition-colors text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-200 group-hover:bg-pink-600 transition-colors"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin size={16} className="text-purple-600" />
                </div>
                <span className="text-gray-500 text-sm">
                  123 AK Street, <br />
                  Tech Park, Chennai - 600001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-pink-600" />
                </div>
                <span className="text-gray-500 text-sm">+91 6088080039</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-blue-600" />
                </div>
                <span className="text-gray-500 text-sm">groomnet@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 my-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} GroomNet. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
            <span>for better grooming.</span>
          </div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;