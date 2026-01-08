import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-crocs-green to-crocs-yellow bg-clip-text text-transparent"
            >
              👟 Footwear Kenya
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/') 
                  ? 'text-crocs-green font-semibold bg-crocs-light' 
                  : 'text-gray-700 hover:text-crocs-green hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/about') 
                  ? 'text-crocs-green font-semibold bg-crocs-light' 
                  : 'text-gray-700 hover:text-crocs-green hover:bg-gray-50'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/contact') 
                  ? 'text-crocs-green font-semibold bg-crocs-light' 
                  : 'text-gray-700 hover:text-crocs-green hover:bg-gray-50'
              }`}
            >
              Contact
            </Link>
            <Link
              to="/checkout"
              className="relative px-4 py-2 text-gray-700 hover:text-crocs-green transition-all duration-200"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-crocs-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  isActive('/') ? 'text-crocs-green font-semibold bg-crocs-light' : 'text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  isActive('/about') ? 'text-crocs-green font-semibold bg-crocs-light' : 'text-gray-700'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg ${
                  isActive('/contact') ? 'text-crocs-green font-semibold bg-crocs-light' : 'text-gray-700'
                }`}
              >
                Contact
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-700 flex items-center justify-between"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-crocs-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

