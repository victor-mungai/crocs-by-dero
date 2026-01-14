import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useOrder } from '../context/OrderContext'
import { getPickupLocation, formatDistance, calculateDistance } from '../utils/deliveryUtils'
import { formatPrice } from '../context/ProductContext'
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, Truck, Loader } from 'lucide-react'
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

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to update map center when location changes
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  return null
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { currentOrder, fetchOrder, trackOrder } = useOrder()

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
      const unsubscribe = trackOrder(orderId)
      return () => unsubscribe()
    }
  }, [orderId])

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  const pickupLocation = getPickupLocation()
  const deliveryLocation = currentOrder.deliveryType === 'delivery' 
    ? currentOrder.deliveryLocation 
    : null
  const riderLocation = currentOrder.riderLocation

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-yellow-100 text-yellow-800'
      case 'dispatched': return 'bg-purple-100 text-purple-800'
      case 'in_transit': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return <Package size={20} />
      case 'confirmed': return <Clock size={20} />
      case 'dispatched': return <Truck size={20} />
      case 'in_transit': return <Truck size={20} className="animate-pulse" />
      case 'delivered': return <CheckCircle size={20} />
      default: return <Package size={20} />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'placed': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'dispatched': return 'Order Dispatched'
      case 'in_transit': return 'In Transit'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Calculate distance if delivery
  let distance = null
  if (deliveryLocation && riderLocation) {
    distance = calculateDistance(
      riderLocation.lat,
      riderLocation.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    )
  } else if (deliveryLocation) {
    distance = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      deliveryLocation.lat,
      deliveryLocation.lng
    )
  }

  // Determine map center
  const mapCenter = riderLocation 
    ? [riderLocation.lat, riderLocation.lng]
    : deliveryLocation 
    ? [deliveryLocation.lat, deliveryLocation.lng]
    : [pickupLocation.lat, pickupLocation.lng]
  
  const mapZoom = deliveryLocation ? 13 : 12

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-2">Order ID: {currentOrder.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getStatusColor(currentOrder.status)}`}>
                {getStatusIcon(currentOrder.status)}
                <span className="font-semibold">{getStatusText(currentOrder.status)}</span>
              </div>

              {currentOrder.deliveryType === 'collect' && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Pickup Information</h3>
                  <p className="text-sm text-gray-600">
                    <MapPin size={16} className="inline mr-1" />
                    Nairobi City Stadium
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Please collect your order from our pickup location. We'll notify you when it's ready.
                  </p>
                </div>
              )}

              {distance && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Distance to Delivery</h3>
                  <p className="text-2xl font-bold text-indigo-600">{formatDistance(distance)}</p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {currentOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-sm">{item.product.name}</h3>
                      <p className="text-xs text-gray-600">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Color: ${item.color}`}
                      </p>
                      <p className="text-sm font-bold text-crocs-green mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>{formatPrice(currentOrder.subtotal)}</span>
                </div>
                {currentOrder.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Delivery</span>
                    <span>{formatPrice(currentOrder.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 mt-2">
                  <span>Total</span>
                  <span className="text-crocs-green">{formatPrice(currentOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            {currentOrder.deliveryType === 'delivery' && deliveryLocation && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
                <p className="text-gray-600">{currentOrder.deliveryAddress}</p>
                {currentOrder.customerPhone && (
                  <p className="text-gray-600 mt-2">Phone: {currentOrder.customerPhone}</p>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Live Tracking</h2>
              <div className="rounded-lg overflow-hidden" style={{ height: '500px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <MapUpdater center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Pickup Location */}
                  <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={blueIcon}>
                    <Popup>
                      <div>
                        <h3 className="font-bold">Pickup Location</h3>
                        <p className="text-sm">Nairobi City Stadium</p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Delivery Location */}
                  {deliveryLocation && (
                    <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={redIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-bold">Delivery Location</h3>
                          <p className="text-sm">{currentOrder.deliveryAddress}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Rider Location */}
                  {riderLocation && (
                    <Marker position={[riderLocation.lat, riderLocation.lng]} icon={greenIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-bold">Rider Location</h3>
                          <p className="text-sm">Your order is here</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
