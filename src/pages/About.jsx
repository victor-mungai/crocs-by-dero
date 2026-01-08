import { motion } from 'framer-motion'
import { Heart, Target, Award, Users } from 'lucide-react'

export default function About() {
  return (
    <div className="page-transition min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-crocs-green to-crocs-dark text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About Footwear Kenya
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90"
          >
            Your trusted source for comfortable, stylish footwear
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
          >
            {/* Founder Image */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shadow-xl ring-4 ring-crocs-green/20 ring-offset-4 ring-offset-white">
                  <img
                    src="/images/founder.jpg"
                    alt="Derro - Founder of Footwear Kenya"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-crocs-green text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap"
                >
                  Derro - Founder
                </motion.div>
              </motion.div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Welcome to <strong>Footwear Kenya</strong>! Founded by Derro, we're passionate about bringing you 
                the most comfortable and stylish footwear for the whole family.
              </p>
              <p>
                Derro opened this business with a simple mission: to make quality footwear accessible to everyone. 
                We've built a business around comfort, style, and customer satisfaction. 
                Whether you're looking for classic designs, trendy styles, or kids' favorites, 
                we've got something for everyone.
              </p>
              <p>
                At Footwear Kenya, we believe that great footwear shouldn't break the bank. 
                That's why we offer competitive prices, fast delivery, and authentic products 
                that you can trust. Every pair we sell is carefully selected to ensure quality 
                and comfort.
              </p>
              <p>
                Thank you for choosing Footwear Kenya. We're here to help you step into comfort 
                and style, one pair at a time!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            What We Stand For
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: 'Quality First',
                description: 'We only sell authentic, high-quality Crocs products that meet our strict standards.',
              },
              {
                icon: Target,
                title: 'Customer Focus',
                description: 'Your satisfaction is our top priority. We\'re here to help you find the perfect pair.',
              },
              {
                icon: Award,
                title: 'Affordable Prices',
                description: 'Great footwear shouldn\'t cost a fortune. We offer competitive prices on all our products.',
              },
              {
                icon: Users,
                title: 'Family Friendly',
                description: 'From kids to adults, we have comfortable Crocs for every member of your family.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-crocs-light hover:bg-crocs-green/10 transition-all duration-300"
              >
                <value.icon className="w-12 h-12 text-crocs-green mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-crocs-green to-crocs-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Step Into Comfort?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl mb-8 text-white/90"
          >
            Browse our collection and find your perfect pair today!
          </motion.p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-white text-crocs-green rounded-full font-semibold text-lg shadow-lg hover:bg-gray-100 transition-all duration-200"
          >
            Shop Now
          </motion.a>
        </div>
      </section>
    </div>
  )
}

