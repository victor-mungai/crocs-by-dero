import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, MessageCircle, Instagram, Send } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you'd send this to a backend
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', message: '' })
    }, 3000)
  }

  const handleWhatsApp = () => {
    const message = `Hi! I have a question about Footwear Kenya.`
    const whatsappUrl = `https://wa.me/254712080372?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="page-transition min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            We'd love to hear from you! Reach out with any questions or inquiries.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-black mb-6">Contact Information</h2>
                <p className="text-gray-500">
                  Have a question? We're here to help! Choose your preferred method of contact.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+254712080372"
                  className="flex items-center space-x-4 p-4 border border-gray-100 hover:border-black transition-colors group"
                >
                  <div className="p-3 bg-gray-50 group-hover:bg-black transition-colors">
                    <Phone className="text-black group-hover:text-white" size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <p className="text-gray-500 text-sm">0712080372</p>
                  </div>
                </a>

                <a
                  href="mailto:derroreacts@gmail.com"
                  className="flex items-center space-x-4 p-4 border border-gray-100 hover:border-black transition-colors group"
                >
                  <div className="p-3 bg-gray-50 group-hover:bg-black transition-colors">
                    <Mail className="text-black group-hover:text-white" size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-black">Email</p>
                    <p className="text-gray-500 text-sm">derroreacts@gmail.com</p>
                  </div>
                </a>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center space-x-4 p-4 border border-gray-100 hover:border-black transition-colors group"
                >
                  <div className="p-3 bg-gray-50 group-hover:bg-black transition-colors">
                    <MessageCircle className="text-black group-hover:text-white" size={20} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-black">WhatsApp</p>
                    <p className="text-gray-500 text-sm">Chat with us instantly</p>
                  </div>
                </button>

                <div className="flex items-center space-x-4 p-4 border border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <MapPin className="text-black" size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-black">Location</p>
                    <p className="text-gray-500 text-sm">Available for delivery nationwide</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-6">
                <h3 className="font-medium text-sm tracking-wide mb-4">FOLLOW US</h3>
                <div className="flex space-x-3">
                  {[
                    { icon: Instagram, url: 'https://instagram.com/footwearkenya', name: 'Instagram' },
                    { icon: Instagram, url: 'https://instagram.com/derroreacts', name: 'Owner Instagram' },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-colors"
                      aria-label={social.name}
                    >
                      <social.icon size={20} strokeWidth={1.5} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-bold text-black mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors resize-none text-sm"
                    placeholder="Your message..."
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-black text-white font-medium text-sm tracking-wide hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
                >
                  {submitted ? (
                    <>
                      <span>✓</span>
                      <span>MESSAGE SENT!</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} strokeWidth={1.5} />
                      <span>SEND MESSAGE</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

