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
      <section className="relative bg-gradient-to-br from-crocs-green via-crocs-light to-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-crocs-yellow rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-crocs-green rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Step Into Comfort & Style
              <br />
              <span className="text-crocs-green">Footwear Kenya</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Discover the perfect pair of Crocs for every occasion. 
              Comfortable, stylish, and built to last.
            </p>
            <motion.a
              href="#products"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-crocs-green text-white rounded-full font-semibold text-lg shadow-lg hover:bg-crocs-dark transition-all duration-200"
            >
              Shop Now
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Quality Guaranteed', desc: 'Authentic Crocs products' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable shipping' },
              { icon: Star, title: 'Affordable Prices', desc: 'Best deals on the market' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-crocs-light hover:bg-crocs-green/10 transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-crocs-green mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section id="products" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-crocs-green focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchQuery('')
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-crocs-green text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-crocs-light'
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

