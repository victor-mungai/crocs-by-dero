import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import { Search, Shield, Truck, Star } from 'lucide-react'

export default function Home() {
  const { getFeaturedProducts, getProductsByCategory, searchProducts } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  
  const categories = ['All', 'Men', 'Women', 'Kids', 'Accessories', 'New Arrivals', 'Best Sellers']
  
  let products = []
  if (searchQuery) {
    products = searchProducts(searchQuery)
  } else if (selectedCategory === 'New Arrivals') {
    products = getFeaturedProducts().slice(0, 4)
  } else if (selectedCategory === 'Best Sellers') {
    products = getFeaturedProducts()
  } else {
    products = getProductsByCategory(selectedCategory)
  }

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <section className="relative bg-white py-24 md:py-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-black mb-6 tracking-tight leading-none">
              Step Into
              <br />
              Comfort
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl">
              Discover premium footwear designed for everyday comfort and style.
            </p>
            <motion.a
              href="#products"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block px-8 py-4 bg-black text-white font-medium text-sm tracking-wide hover:bg-gray-900 transition-colors"
            >
              SHOP NOW
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Search and Filters */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchQuery('')
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm">No products found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Shield, title: 'Quality Guaranteed', desc: 'Authentic products only' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable shipping' },
              { icon: Star, title: 'Best Prices', desc: 'Competitive market rates' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <item.icon className="w-10 h-10 text-black mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="font-medium text-black text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

