import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useOrder } from '../context/OrderContext'
import { useAuth } from '../context/AuthContext'
import { getPickupLocation } from '../utils/deliveryUtils'
import { formatPrice } from '../context/ProductContext'
import { subscribeToOrder, subscribeToRiderLocation } from '../firebase/ordersService'
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, Loader, Bike, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Vite
if (L.Icon.Default.prototype._getIconUrl) {
  delete L.Icon.Default.prototype._getIconUrl
}
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icons
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Motorbike icon for rider
const motorbikeIcon = L.divIcon({
  className: 'motorbike-marker',
  html: `<div style="
    background-color: #10b981;
    border: 3px solid white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  ">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
      <path d="M19 7c-.7 0-1.37.1-2 .29V5c0-1.1-.9-2-2-2h-2c-.55 0-1 .45-1 1v1.5c-.5-.5-1.2-.8-2-.8-1.66 0-3 1.34-3 3v2c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V14h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V14h1c.55 0 1-.45 1-1v-2c0-1.1-.9-2-2-2h-1V7c0-1.1-.9-2-2-2zM8 9c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1zm8 0c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1z"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
})

// Component to update map center
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

function getStatusText(status) {
  const statusMap = {
    pending: 'Pending',
    placed: 'Placed',
    confirmed: 'Confirmed',
    dispatched: 'Dispatched',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
}

function getStatusColor(status) {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    dispatched: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800'
}

export default function Orders() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { fetchCustomerOrders, orders, loading } = useOrder()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [riderLocation, setRiderLocation] = useState(null)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      // Try to fetch orders by email first (for Google auth users)
      // Then try by phone if email doesn't work
      const identifier = user.email || user.phoneNumber
      if (identifier) {
        setError(null)
        setHasLoaded(false)
        fetchCustomerOrders(identifier)
          .then(() => {
            setHasLoaded(true)
          })
          .catch(error => {
            console.error('Error fetching orders:', error)
            setError('Failed to load orders. Please try again.')
            setHasLoaded(true)
          })
      } else {
        setError('Unable to identify user. Please ensure you are logged in.')
        setHasLoaded(true)
      }
    } else {
      setError('Please log in to view your orders.')
      setHasLoaded(true)
    }
  }, [user, fetchCustomerOrders])

  // Timeout fallback - if loading takes too long, show no orders
  useEffect(() => {
    if (loading && !hasLoaded) {
      const timeout = setTimeout(() => {
        setHasLoaded(true)
      }, 5000) // 5 second timeout
      return () => clearTimeout(timeout)
    }
  }, [loading, hasLoaded])

  // Subscribe to selected order updates
  useEffect(() => {
    if (!selectedOrder?.id) return

    const unsubscribe = subscribeToOrder(selectedOrder.id, (order) => {
      if (order) {
        setSelectedOrder(order)
        if (order.riderLocation) {
          setRiderLocation(order.riderLocation)
        }
      }
    })

    return () => unsubscribe()
  }, [selectedOrder?.id])

  // Subscribe to rider location if order is dispatched or in_transit
  useEffect(() => {
    if (!selectedOrder?.riderId || (selectedOrder.status !== 'dispatched' && selectedOrder.status !== 'in_transit')) {
      setRiderLocation(null)
      return
    }

    const unsubscribe = subscribeToRiderLocation(selectedOrder.riderId, (location) => {
      setRiderLocation(location)
    })

    return () => unsubscribe()
  }, [selectedOrder?.riderId, selectedOrder?.status])

  // Show loading only if we haven't loaded yet and are still loading
  if (loading && !hasLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto animate-spin text-crocs-green" size={48} />
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  const pickupLocation = getPickupLocation()
  const showMap = selectedOrder && 
    (selectedOrder.status === 'dispatched' || selectedOrder.status === 'in_transit') && 
    selectedOrder.riderId &&
    (riderLocation || selectedOrder.riderLocation)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-crocs-green transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Package size={32} className="text-crocs-green" />
            <span>My Orders</span>
          </h1>
          <p className="text-gray-600 mt-2">View and track your orders</p>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <XCircle size={64} className="mx-auto text-red-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-crocs-green bg-crocs-green/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt?.toDate
                              ? new Date(order.createdAt.toDate()).toLocaleDateString()
                              : 'N/A'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                        <p className="font-semibold text-crocs-green">{formatPrice(order.total || 0)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-6">
                  {/* Order Info Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id.slice(0, 8)}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {selectedOrder.createdAt?.toDate
                            ? new Date(selectedOrder.createdAt.toDate()).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                              <p className="text-sm text-gray-500">
                                {item.quantity}x {item.size} - {item.color}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900">{formatPrice(item.price || 0)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                      </div>
                      {selectedOrder.deliveryFee > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Delivery Fee</span>
                          <span>{formatPrice(selectedOrder.deliveryFee || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span className="text-crocs-green">{formatPrice(selectedOrder.total || 0)}</span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    {selectedOrder.deliveryType === 'delivery' && selectedOrder.deliveryAddress && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>Delivery Address</span>
                        </h3>
                        <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress}</p>
                      </div>
                    )}

                    {selectedOrder.deliveryType === 'collect' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>Pickup Location</span>
                        </h3>
                        <p className="text-sm text-gray-700">Dispatch Location (1°17'47.7"S 36°52'24.6"E)</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex space-x-3">
                      <button
                        onClick={() => navigate(`/track-order/${selectedOrder.id}`)}
                        className="flex-1 px-4 py-2 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-colors flex items-center justify-center space-x-2"
                      >
                        <Truck size={18} />
                        <span>Track Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Map for Dispatched Orders */}
                  {showMap && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Bike size={24} className="text-crocs-green" />
                        <span>Live Delivery Tracking</span>
                      </h3>
                      <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
                        <MapContainer
                          center={
                            riderLocation
                              ? [riderLocation.lat, riderLocation.lng]
                              : selectedOrder.deliveryLocation
                              ? [selectedOrder.deliveryLocation.lat, selectedOrder.deliveryLocation.lng]
                              : [pickupLocation.lat, pickupLocation.lng]
                          }
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapUpdater
                            center={
                              riderLocation
                                ? [riderLocation.lat, riderLocation.lng]
                                : selectedOrder.deliveryLocation
                                ? [selectedOrder.deliveryLocation.lat, selectedOrder.deliveryLocation.lng]
                                : [pickupLocation.lat, pickupLocation.lng]
                            }
                            zoom={13}
                          />

                          {/* Dispatch Location */}
                          <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={blueIcon}>
                            <Popup>
                              <div>
                                <h3 className="font-bold">Dispatch Location</h3>
                                <p className="text-sm">1°17'47.7"S 36°52'24.6"E</p>
                              </div>
                            </Popup>
                          </Marker>

                          {/* Delivery Location */}
                          {selectedOrder.deliveryLocation && (
                            <Marker position={[selectedOrder.deliveryLocation.lat, selectedOrder.deliveryLocation.lng]} icon={redIcon}>
                              <Popup>
                                <div>
                                  <h3 className="font-bold">Delivery Location</h3>
                                  <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                                </div>
                              </Popup>
                            </Marker>
                          )}

                          {/* Rider Location (Motorbike Icon) */}
                          {riderLocation && (
                            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={motorbikeIcon}>
                              <Popup>
                                <div>
                                  <h3 className="font-bold flex items-center space-x-2">
                                    <Bike size={16} />
                                    <span>Rider Location</span>
                                  </h3>
                                  <p className="text-sm">Your order is on the way!</p>
                                </div>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                      {riderLocation ? (
                        <p className="text-sm text-gray-600 mt-3 flex items-center space-x-2">
                          <Bike size={16} className="text-crocs-green" />
                          <span>Rider is on the way to your location</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 mt-3">Waiting for rider to start delivery...</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Package size={64} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Select an Order</h2>
                  <p className="text-gray-600">Click on an order from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

