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
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-black">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Status Badge */}
            {!isAvailable && (
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-xs font-medium bg-black text-white">
                  Sold Out
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-medium bg-black text-white">
                  Sale
                </span>
              </div>
            )}

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="bg-white p-3">
                  <ShoppingBag className="text-black" size={20} strokeWidth={1.5} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="font-medium text-black mb-1 line-clamp-1 group-hover:text-gray-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {hasDiscount ? (
                  <>
                    <span className="text-base font-medium text-black">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-base font-medium text-black">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

