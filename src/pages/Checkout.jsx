import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { useCart } from '../context/CartContext'
import { useProducts, formatPrice } from '../context/ProductContext'
import { useOrder } from '../context/OrderContext'
import { calculateDeliveryFee, getPickupLocation, formatDistance, calculateDistance } from '../utils/deliveryUtils'
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Loader, CheckCircle, XCircle, Phone, MapPin, Package } from 'lucide-react'

const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px'
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const { getCharms } = useProducts()
  const { placeOrder } = useOrder()
  const [suggestedCharms, setSuggestedCharms] = useState([])
  const [deliveryType, setDeliveryType] = useState('delivery') // 'delivery' or 'collect'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [paymentMessage, setPaymentMessage] = useState('')
  const [map, setMap] = useState(null)

  const charms = getCharms()
  const subtotal = getCartTotal()
  const total = subtotal + (deliveryType === 'delivery' ? deliveryFee : 0)

  useEffect(() => {
    if (cart.some(item => item.product.type === 'crocs') && charms.length > 0) {
      setSuggestedCharms(charms.slice(0, 3))
    }
  }, [cart, charms])

  // Calculate delivery fee when location changes
  useEffect(() => {
    if (deliveryType === 'delivery' && deliveryLocation) {
      const pickupLocation = getPickupLocation()
      const distance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      )
      const fee = calculateDeliveryFee(distance)
      setDeliveryFee(fee)
    } else {
      setDeliveryFee(0)
    }
  }, [deliveryLocation, deliveryType])

  const handleMapClick = (event) => {
    if (deliveryType === 'delivery' && event.latLng) {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      }
      setDeliveryLocation(location)
      
      // Reverse geocode to get address (simplified - in production use Google Geocoding API)
      setDeliveryAddress(`Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`)
    }
  }

  const handleMpesaPayment = async () => {
    // Validation
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPaymentStatus('error')
      setPaymentMessage('Please enter your M-Pesa phone number')
      return
    }

    if (!customerName || customerName.trim() === '') {
      setPaymentStatus('error')
      setPaymentMessage('Please enter your name')
      return
    }

    if (deliveryType === 'delivery') {
      if (!deliveryLocation) {
        setPaymentStatus('error')
        setPaymentMessage('Please select your delivery location on the map')
        return
      }
      if (!deliveryAddress || deliveryAddress.trim() === '') {
        setPaymentStatus('error')
        setPaymentMessage('Please enter your delivery address')
        return
      }
    }

    // Phone validation
    const phoneRegex = /^(\+?254|0)?[17]\d{8}$/
    const cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/^\+/, '')
    if (!phoneRegex.test(cleanPhone) && cleanPhone.length < 9) {
      setPaymentStatus('error')
      setPaymentMessage('Please enter a valid Kenyan phone number')
      return
    }

    setIsProcessing(true)
    setPaymentStatus(null)
    setPaymentMessage('')

    try {
      // Process M-Pesa payment
      const orderRef = `FWK${Date.now()}`
      const functionUrl = window.location.origin.includes('netlify')
        ? `${window.location.origin}/.netlify/functions/mpesa-stk-push`
        : '/.netlify/functions/mpesa-stk-push'

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          amount: total,
          accountReference: orderRef,
          transactionDesc: `Footwear Kenya Order - ${orderRef}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details?.errorMessage || 'Payment initiation failed')
      }

      if (!data.success) {
        throw new Error(data.details?.errorMessage || data.error || 'Payment initiation failed')
      }

      // Create order after successful payment initiation
      const orderData = {
        items: cart.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
            price: item.product.price
          },
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price
        })),
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        deliveryType,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : null,
        deliveryLocation: deliveryType === 'delivery' ? deliveryLocation : null,
        subtotal,
        deliveryFee: deliveryType === 'delivery' ? deliveryFee : 0,
        total,
        paymentMethod: 'mpesa',
        paymentReference: orderRef,
        status: 'placed'
      }

      const newOrder = await placeOrder(orderData)

      // Success
      setPaymentStatus('success')
      setPaymentMessage('Payment initiated! Please check your phone and enter your M-Pesa PIN.')
      
      // Clear cart and redirect to tracking
      setTimeout(() => {
        clearCart()
        navigate(`/track-order/${newOrder.id}`)
      }, 3000)

    } catch (error) {
      console.error('M-Pesa payment error:', error)
      setPaymentStatus('error')
      setPaymentMessage(error.message || 'Failed to initiate payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-crocs-green transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items & Delivery Options */}
          <div className="lg:col-span-2 space-y-4">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Cart ({cart.length} items)</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-lg font-bold text-crocs-green mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-lg hover:bg-gray-100"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Delivery Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Option</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-crocs-green bg-crocs-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin size={24} className={`mx-auto mb-2 ${deliveryType === 'delivery' ? 'text-crocs-green' : 'text-gray-400'}`} />
                  <p className={`font-semibold ${deliveryType === 'delivery' ? 'text-crocs-green' : 'text-gray-700'}`}>
                    Home Delivery
                  </p>
                  {deliveryType === 'delivery' && deliveryFee > 0 && (
                    <p className="text-sm text-gray-600 mt-1">{formatPrice(deliveryFee)}</p>
                  )}
                </button>
                <button
                  onClick={() => setDeliveryType('collect')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    deliveryType === 'collect'
                      ? 'border-crocs-green bg-crocs-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package size={24} className={`mx-auto mb-2 ${deliveryType === 'collect' ? 'text-crocs-green' : 'text-gray-400'}`} />
                  <p className={`font-semibold ${deliveryType === 'collect' ? 'text-crocs-green' : 'text-gray-700'}`}>
                    Collect
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Free</p>
                </button>
              </div>

              {/* Delivery Location Map */}
              {deliveryType === 'delivery' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Delivery Location
                  </label>
                  {GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' ? (
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={deliveryLocation || getPickupLocation()}
                        zoom={13}
                        onClick={handleMapClick}
                        onLoad={(map) => setMap(map)}
                      >
                        {deliveryLocation && (
                          <Marker
                            position={deliveryLocation}
                            icon={{
                              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                            }}
                          />
                        )}
                        <Marker
                          position={getPickupLocation()}
                          icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                          }}
                          title="Pickup Location (Nairobi City Stadium)"
                        />
                      </GoogleMap>
                    </LoadScript>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <p className="text-gray-600">Map requires Google Maps API key</p>
                    </div>
                  )}
                  {deliveryLocation && (
                    <p className="text-sm text-gray-600 mt-2">
                      Distance: {formatDistance(calculateDistance(
                        getPickupLocation().lat,
                        getPickupLocation().lng,
                        deliveryLocation.lat,
                        deliveryLocation.lng
                      ))}
                    </p>
                  )}
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your delivery address"
                    className="w-full mt-4 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                  />
                </motion.div>
              )}

              {/* Collect Information */}
              {deliveryType === 'collect' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-blue-50 rounded-lg"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">Pickup Location</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    Nairobi City Stadium
                  </p>
                  <p className="text-sm text-gray-600">
                    Please collect your order from our pickup location. We'll notify you when it's ready for collection.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <div className="flex items-center space-x-2">
                    <Phone size={18} className="text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0712345678 or 254712345678"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                      disabled={isProcessing}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the phone number registered with M-Pesa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>
                    {deliveryType === 'delivery' 
                      ? formatPrice(deliveryFee) 
                      : <span className="text-crocs-green">Free</span>
                    }
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-crocs-green">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Messages */}
              <AnimatePresence>
                {paymentStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-4 rounded-lg flex items-start space-x-3 ${
                      paymentStatus === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {paymentStatus === 'success' ? (
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${paymentStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {paymentMessage}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Button */}
              <motion.button
                onClick={handleMpesaPayment}
                disabled={isProcessing || !phoneNumber.trim() || !customerName.trim() || (deliveryType === 'delivery' && !deliveryLocation)}
                whileHover={{ scale: isProcessing || !phoneNumber.trim() || !customerName.trim() || (deliveryType === 'delivery' && !deliveryLocation) ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing || !phoneNumber.trim() || !customerName.trim() || (deliveryType === 'delivery' && !deliveryLocation) ? 1 : 0.98 }}
                className="w-full py-4 bg-crocs-green text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-crocs-dark transition-all duration-200 flex items-center justify-center space-x-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader size={24} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    <span>Pay {formatPrice(total)} with M-Pesa</span>
                  </>
                )}
              </motion.button>

              <button
                onClick={clearCart}
                className="w-full py-2 text-gray-600 hover:text-red-500 transition-colors text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
