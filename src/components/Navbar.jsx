import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { getCartCount } = useCart()
  const { user, signOut } = useAuth()
  const cartCount = getCartCount()

  const isActive = (path) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-2xl font-bold tracking-tight text-black"
            >
              FOOTWEAR KENYA
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Contact
            </Link>
            {user && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive('/orders') 
                    ? 'text-crocs-green font-semibold bg-crocs-light' 
                    : 'text-gray-700 hover:text-crocs-green hover:bg-gray-50'
                }`}
              >
                My Orders
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User size={20} />
                  )}
                  <span className="text-sm font-medium">{user.displayName || user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 text-gray-700 hover:text-red-600 transition-all duration-200 flex items-center space-x-1"
                >
                  <LogOut size={18} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-crocs-green transition-all duration-200 flex items-center space-x-1"
              >
                <User size={20} />
                <span>Sign In</span>
              </Link>
            )}
            <Link
              to="/checkout"
              className="relative ml-4 p-2 text-black hover:bg-gray-50 rounded-full transition-colors"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium px-1"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-black hover:bg-gray-50 rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
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
            className="md:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/') ? 'text-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/about') ? 'text-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/contact') ? 'text-black bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                Contact
              </Link>
              {user && (
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg ${
                    isActive('/orders') ? 'text-crocs-green font-semibold bg-crocs-light' : 'text-gray-700'
                  }`}
                >
                  My Orders
                </Link>
              )}
              {user ? (
                <>
                  <div className="px-3 py-2 rounded-lg text-gray-700 flex items-center space-x-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-6 h-6 rounded-full" />
                    ) : (
                      <User size={18} />
                    )}
                    <span className="text-sm">{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                    className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <User size={18} />
                  <span>Sign In</span>
                </Link>
              )}
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-black text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium px-1">
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

