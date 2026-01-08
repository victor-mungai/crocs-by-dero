import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '../context/ProductContext'

export default function ProductCard({ product, index = 0 }) {
  const isAvailable = product.status === 'available'
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              whileHover={{ scale: 1.1 }}
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isAvailable
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {isAvailable ? 'Available' : 'Sold Out'}
              </span>
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-crocs-yellow text-gray-900">
                  Sale
                </span>
              </div>
            )}

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-white rounded-full p-3 shadow-lg">
                  <ShoppingBag className="text-crocs-green" size={24} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-crocs-green transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-crocs-green">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-crocs-green">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 capitalize">{product.category}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

