import { Link } from 'react-router-dom'
import { Instagram, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-crocs-green to-crocs-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">👟 Footwear Kenya</h3>
            <p className="text-white/90 mb-4">
              Step into comfort and style with quality footwear. 
              Your trusted source for comfortable, stylish shoes for the whole family.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/footwearkenya"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200"
                aria-label="Shop Instagram"
                title="Shop Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://instagram.com/derroreacts"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200"
                aria-label="Owner Instagram"
                title="Owner Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-white/80">
                <Phone size={18} />
                <a href="tel:+254712080372" className="hover:text-white transition-colors">
                  0712080372
                </a>
              </li>
              <li className="flex items-center space-x-2 text-white/80">
                <Mail size={18} />
                <a href="mailto:derroreacts@gmail.com" className="hover:text-white transition-colors">
                  derroreacts@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
          <p>&copy; {new Date().getFullYear()} Footwear Kenya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

