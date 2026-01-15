import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { getRiderOrders, updateOrderStatus, updateRiderLocation, updateOrderRiderLocation, subscribeToRiderLocation, createOrUpdateRider } from '../firebase/ordersService'
import { formatPrice } from '../context/ProductContext'
import { useAuth } from '../context/AuthContext'
import { isRiderAuthorized } from '../firebase/riderAuthService'
import { Package, MapPin, Play, CheckCircle, Navigation, LogOut, Loader, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  iconSize: [35, 55],
  iconAnchor: [17, 55],
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

const defaultCenter = {
  lat: -1.2921,
  lng: 36.8219
}

export default function RiderDashboard() {
  const navigate = useNavigate()
  const { user, signIn, signOut, loading: authLoading } = useAuth()
  const [riderId, setRiderId] = useState(null)
  const [riderName, setRiderName] = useState('')
  const [orders, setOrders] = useState([])
  const [activeOrder, setActiveOrder] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const watchIdRef = useRef(null)
  const locationUpdateInterval = useRef(null)
  const currentLocationRef = useRef(null)

  // Check rider authorization when user logs in
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        if (!authLoading) {
          // Redirect to login if not authenticated
          navigate('/login?redirect=/rider-dashboard')
        }
        setCheckingAuth(false)
        return
      }

      try {
        console.log('🔐 Checking authorization for user:', {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName
        })
        const authorized = await isRiderAuthorized(user.email)
        console.log('🎯 Authorization result:', authorized)
        setIsAuthorized(authorized)
        
        if (authorized && !riderId) {
          const userId = user.uid
          setRiderId(userId)
          setRiderName(user.displayName || user.email || 'Rider')
          
          // Create or update rider profile
          createOrUpdateRider(userId, {
            name: user.displayName || user.email || 'Rider',
            email: user.email,
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || '',
            isActive: true
          }).catch(error => {
            console.error('Error creating rider profile:', error)
          })
        }
      } catch (error) {
        console.error('❌ Error checking authorization:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          email: user?.email
        })
        setIsAuthorized(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthorization()
  }, [user, riderId, authLoading, navigate])

  useEffect(() => {
    if (!riderId) {
      return
    }

    loadOrders()
    
    // Set up real-time location tracking if active order exists
    const active = orders.find(o => o.status === 'in_transit' && o.riderId === riderId)
    if (active) {
      setActiveOrder(active)
      startLocationTracking(active.id)
    }

    return () => {
      stopLocationTracking()
    }
  }, [riderId])

  const loadOrders = async () => {
    try {
      const riderOrders = await getRiderOrders(riderId)
      setOrders(riderOrders)
      const active = riderOrders.find(o => o.status === 'in_transit' && o.riderId === riderId)
      if (active) {
        setActiveOrder(active)
        startLocationTracking(active.id)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const startLocationTracking = async (orderId) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      currentLocationRef.current = location
      setCurrentLocation(location)
      
      // Update rider location in Firebase
      try {
        await updateRiderLocation(riderId, location)
        await updateOrderRiderLocation(orderId, location)
      } catch (error) {
        console.error('Error updating location:', error)
      }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please enable location services.')
      }
    )

    // Set up interval to update location every 5 seconds
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current)
    }
    
    locationUpdateInterval.current = setInterval(async () => {
      const location = currentLocationRef.current
      if (location) {
        try {
          await updateRiderLocation(riderId, location)
          if (orderId) {
            await updateOrderRiderLocation(orderId, location)
          }
        } catch (error) {
          console.error('Error updating location:', error)
        }
      }
    }, 5000)

    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        currentLocationRef.current = location
        setCurrentLocation(location)
        
        // Update immediately when location changes
        try {
          await updateRiderLocation(riderId, location)
          if (orderId) {
            await updateOrderRiderLocation(orderId, location)
          }
        } catch (error) {
          console.error('Error updating location:', error)
        }
      },
      (error) => {
        console.error('Error watching location:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current)
      locationUpdateInterval.current = null
    }
    setIsTracking(false)
  }

  const handleBeginTrip = async (order) => {
    try {
      await updateOrderStatus(order.id, 'in_transit')
      setActiveOrder(order)
      await startLocationTracking(order.id)
      await loadOrders() // Refresh orders
    } catch (error) {
      console.error('Error beginning trip:', error)
      alert('Failed to begin trip. Please try again.')
    }
  }

  const handleCompleteDelivery = async (order) => {
    if (!confirm('Mark this order as delivered?')) {
      return
    }

    try {
      await updateOrderStatus(order.id, 'delivered')
      stopLocationTracking()
      setActiveOrder(null)
      setCurrentLocation(null)
      await loadOrders() // Refresh orders
    } catch (error) {
      console.error('Error completing delivery:', error)
      alert('Failed to complete delivery. Please try again.')
    }
  }

  const handleLogout = async () => {
    if (confirm('Log out from rider dashboard?')) {
      stopLocationTracking()
      await signOut()
      navigate('/')
    }
  }

  const pendingOrders = orders.filter(o => o.status === 'dispatched' && o.riderId === riderId)
  const activeOrders = orders.filter(o => o.status === 'in_transit' && o.riderId === riderId)
  const completedOrders = orders.filter(o => o.status === 'delivered' && o.riderId === riderId)

  // Determine map center
  const mapCenter = currentLocation 
    ? [currentLocation.lat, currentLocation.lng]
    : activeOrder?.deliveryLocation
    ? [activeOrder.deliveryLocation.lat, activeOrder.deliveryLocation.lng]
    : [defaultCenter.lat, defaultCenter.lng]
  
  const mapZoom = currentLocation ? 15 : 12

  // Show loading state while checking authorization
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    )
  }

  // Show unauthorized message if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Your email ({user?.email}) is not authorized to access the Rider Dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Please check:
          </p>
          <ul className="text-sm text-gray-500 mb-6 list-disc list-inside space-y-1">
            <li>Your email is in the <code className="bg-gray-100 px-1 rounded">authorizedRiders</code> collection in Firestore</li>
            <li>The email matches exactly (case-insensitive): <code className="bg-gray-100 px-1 rounded">{user?.email?.toLowerCase()}</code></li>
            <li>Firestore security rules allow reading the collection</li>
          </ul>
          <p className="text-xs text-gray-400 mb-6">
            Check the browser console (F12) for detailed error messages.
          </p>
          <button
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="px-6 py-2 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Rider Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {riderName || 'Rider'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Order */}
            {activeOrder && (
              <div className="bg-indigo-50 border-2 border-indigo-500 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Active Trip</h2>
                  <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-semibold">
                    In Transit
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold">{activeOrder.id}</p>
                  </div>
                  {activeOrder.deliveryAddress && (
                    <div>
                      <p className="text-sm text-gray-600">Delivery Address</p>
                      <p className="font-semibold">{activeOrder.deliveryAddress}</p>
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCompleteDelivery(activeOrder)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle size={20} />
                      <span>Complete Delivery</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Orders */}
            {pendingOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Deliveries</h2>
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-sm font-bold text-crocs-green">{formatPrice(order.total)}</span>
                      </div>
                      {order.deliveryAddress && (
                        <p className="text-sm text-gray-600 mb-3">{order.deliveryAddress}</p>
                      )}
                      <button
                        onClick={() => handleBeginTrip(order)}
                        className="w-full px-4 py-2 bg-crocs-green text-white rounded-lg hover:bg-crocs-dark transition-colors flex items-center justify-center space-x-2"
                      >
                        <Play size={18} />
                        <span>Begin Trip</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Orders */}
            {completedOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Deliveries</h2>
                <div className="space-y-3">
                  {completedOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Order #{order.id.slice(0, 8)}</span>
                        <span className="text-sm font-bold text-green-600">Delivered</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingOrders.length === 0 && !activeOrder && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No pending deliveries</p>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Live Map</h2>
                {isTracking && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Tracking Active</span>
                  </div>
                )}
              </div>
              <div className="rounded-lg overflow-hidden" style={{ height: '400px' }}>
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
                  
                  {/* Current Location (Rider) */}
                  {currentLocation && (
                    <Marker position={[currentLocation.lat, currentLocation.lng]} icon={greenIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-bold">Your Location</h3>
                          <p className="text-sm">Rider position</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Dispatch Location */}
                  {activeOrder && (
                    <Marker position={[defaultCenter.lat, defaultCenter.lng]} icon={blueIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-bold">Dispatch Location</h3>
                          <p className="text-sm">1°17'47.7"S 36°52'24.6"E</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Delivery Location */}
                  {activeOrder?.deliveryLocation && (
                    <Marker position={[activeOrder.deliveryLocation.lat, activeOrder.deliveryLocation.lng]} icon={redIcon}>
                      <Popup>
                        <div>
                          <h3 className="font-bold">Delivery Location</h3>
                          <p className="text-sm">{activeOrder.deliveryAddress}</p>
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
