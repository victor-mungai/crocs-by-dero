import { Link } from 'react-router-dom'
import { Instagram, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 tracking-tight">FOOTWEAR KENYA</h3>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Step into comfort and style with quality footwear. 
              Your trusted source for comfortable, stylish shoes for the whole family.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com/footwearkenya"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 hover:border-white transition-colors"
                aria-label="Shop Instagram"
                title="Shop Instagram"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com/derroreacts"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-gray-700 hover:border-white transition-colors"
                aria-label="Owner Instagram"
                title="Owner Instagram"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4 text-sm tracking-wide">QUICK LINKS</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-medium mb-4 text-sm tracking-wide">CONTACT</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone size={16} strokeWidth={1.5} />
                <a href="tel:+254712080372" className="hover:text-white transition-colors text-sm">
                  0712080372
                </a>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail size={16} strokeWidth={1.5} />
                <a href="mailto:derroreacts@gmail.com" className="hover:text-white transition-colors text-sm">
                  derroreacts@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p className="text-xs">&copy; {new Date().getFullYear()} Footwear Kenya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

