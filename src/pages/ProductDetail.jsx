import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts, formatPrice } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import { ArrowLeft, ShoppingBag, MessageCircle, Check, X } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct } = useProducts()
  const { addToCart } = useCart()
  const product = getProduct(id)

  // Get available colors
  const availableColors = product?.colors?.filter(c => {
    if (typeof c === 'string') return true
    return c.available
  }) || []

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '')
  const [selectedColor, setSelectedColor] = useState(
    availableColors[0]?.name || (typeof availableColors[0] === 'string' ? availableColors[0] : '')
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageZoomed, setImageZoomed] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (product) {
      const firstAvailable = availableColors[0]
      if (firstAvailable) {
        setSelectedColor(typeof firstAvailable === 'string' ? firstAvailable : firstAvailable.name)
      }
    }
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-crocs-green text-white rounded-lg hover:bg-crocs-dark"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const isAvailable = product.status === 'available'
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const images = product.images || [product.image]

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in: ${product.name} - Size: ${selectedSize}, Color: ${selectedColor} - ${formatPrice(product.price)}`
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.type === 'crocs') {
      alert('Please select a size')
      return
    }
    if (!selectedColor && product.type === 'crocs') {
      alert('Please select a color')
      return
    }
    addToCart(product, selectedSize || null, selectedColor || null)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="page-transition min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-crocs-green transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <motion.img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setImageZoomed(!imageZoomed)}
                  whileHover={{ scale: imageZoomed ? 1 : 1.05 }}
                  animate={{ scale: imageZoomed ? 1.5 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      isAvailable
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-crocs-yellow text-gray-900">
                      Sale
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-crocs-green'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-lg">{product.description}</p>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                {hasDiscount ? (
                  <>
                    <span className="text-4xl font-bold text-crocs-green">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-crocs-green">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Size Selection */}
              {product.type === 'crocs' && product.sizes && product.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Size
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                          selectedSize === size
                            ? 'bg-crocs-green text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Color
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((colorObj) => {
                      const colorName = typeof colorObj === 'string' ? colorObj : colorObj.name
                      const isAvailable = typeof colorObj === 'string' ? true : colorObj.available
                      return (
                        <button
                          key={colorName}
                          onClick={() => isAvailable && setSelectedColor(colorName)}
                          disabled={!isAvailable}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 border-2 ${
                            !isAvailable
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                              : selectedColor === colorName
                              ? 'border-crocs-green bg-crocs-light text-crocs-green'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {colorName} {!isAvailable && '(Out of Stock)'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {isAvailable ? (
                  <>
                    <motion.button
                      onClick={handleAddToCart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-crocs-green text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-crocs-dark transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <AnimatePresence mode="wait">
                        {addedToCart ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center space-x-2"
                          >
                            <Check size={24} />
                            <span>Added to Cart!</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="cart"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center space-x-2"
                          >
                            <ShoppingBag size={24} />
                            <span>Add to Cart</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                    <motion.button
                      onClick={() => navigate('/checkout')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gray-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-gray-900 transition-all duration-200"
                    >
                      View Cart
                    </motion.button>

                    <motion.button
                      onClick={handleWhatsApp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-green-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <MessageCircle size={24} />
                      <span>Order via WhatsApp</span>
                    </motion.button>
                  </>
                ) : (
                  <div className="w-full py-4 bg-gray-300 text-gray-600 rounded-xl font-semibold text-lg text-center flex items-center justify-center space-x-2">
                    <X size={24} />
                    <span>Currently Sold Out</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-lg mb-3">Product Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>Category:</strong> {product.category}</li>
                  {product.sizes && product.sizes.length > 0 && (
                    <li><strong>Available Sizes:</strong> {product.sizes.join(', ')}</li>
                  )}
                  {availableColors.length > 0 && (
                    <li><strong>Available Colors:</strong> {availableColors.map(c => typeof c === 'string' ? c : c.name).join(', ')}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

