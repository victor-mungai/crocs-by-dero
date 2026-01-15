import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts, formatPrice } from '../context/ProductContext'
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Upload, Lock, Download, FileUp, AlertCircle, Package, Truck, User } from 'lucide-react'
import { signInAdmin, signOutAdmin, onAuthStateChange, getCurrentUser } from '../firebase/authService'
import { isFirebaseConfigured } from '../firebase/config'
import { getAllOrders, subscribeToAllOrders, assignRider, getAllRiders } from '../firebase/ordersService'

export default function Admin() {
  const { products, addProduct, updateProduct, deleteProduct, usingFirebase } = useProducts()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showDataWarning, setShowDataWarning] = useState(true)
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrders, setShowOrders] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Men',
    type: 'crocs',
    sizes: '',
    colors: [],
    image: '',
    description: '',
    status: 'available',
    visible: true,
    featured: false,
  })

  // Check authentication state
  useEffect(() => {
    if (isFirebaseConfigured) {
      // Use Firebase Auth
      const unsubscribe = onAuthStateChange((user) => {
        setIsAuthenticated(!!user)
        setIsLoading(false)
      })
      return () => unsubscribe()
    } else {
      // Fallback to localStorage
      const auth = localStorage.getItem('admin-authenticated')
      if (auth === 'true') {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }
  }, [])

  // Load orders and riders when authenticated
  useEffect(() => {
    if (!isAuthenticated || !isFirebaseConfigured) return

    const loadRiders = async () => {
      try {
        const ridersList = await getAllRiders()
        setRiders(ridersList)
      } catch (error) {
        console.error('Error loading riders:', error)
      }
    }

    loadRiders()

    // Subscribe to orders
    const unsubscribe = subscribeToAllOrders((ordersList) => {
      setOrders(ordersList)
    })

    return () => unsubscribe()
  }, [isAuthenticated])

  const handleAssignRider = async (orderId, riderId) => {
    if (!riderId) {
      alert('Please select a rider')
      return
    }

    try {
      await assignRider(orderId, riderId)
      alert('Rider assigned successfully!')
      setSelectedOrder(null)
    } catch (error) {
      console.error('Error assigning rider:', error)
      alert('Failed to assign rider. Please try again.')
    }
  }

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

  const getStatusText = (status) => {
    switch (status) {
      case 'placed': return 'Placed'
      case 'confirmed': return 'Confirmed'
      case 'dispatched': return 'Dispatched'
      case 'in_transit': return 'In Transit'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setIsLoading(true)

    // Fallback password works even with Firebase (as backup)
    const FALLBACK_PASSWORD = 'dero2024'
    
    // Check fallback password first (works regardless of Firebase)
    if (password === FALLBACK_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin-authenticated', 'true')
      setPassword('')
      setEmail('')
      setIsLoading(false)
      return
    }

    // If Firebase is configured, try Firebase authentication
    if (isFirebaseConfigured) {
      try {
        // Require email for Firebase login
        if (!email || email.trim() === '') {
          setLoginError('Please enter your email address for Firebase login, or use the fallback password.')
          setIsLoading(false)
          return
        }
        await signInAdmin(email, password)
        setEmail('')
        setPassword('')
        // Auth state listener will update isAuthenticated
      } catch (error) {
        setLoginError(error.message || 'Login failed. Please check your credentials.')
        setPassword('')
        setIsLoading(false)
      }
    } else {
      // No Firebase, only fallback password
      setLoginError('Incorrect password. Use the fallback password.')
      setPassword('')
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    if (isFirebaseConfigured) {
      await signOutAdmin()
    } else {
      setIsAuthenticated(false)
      localStorage.removeItem('admin-authenticated')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (product) => {
    console.log('Editing product:', product)
    console.log('Product ID:', product.id, 'Type:', typeof product.id)
    setEditingId(product.id)
    // Convert colors to the format needed for editing
    const colors = product.colors?.map(c => {
      if (typeof c === 'string') {
        return { name: c, available: true }
      }
      return c
    }) || []
    
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      type: product.type || 'crocs',
      sizes: product.sizes?.join(', ') || '',
      colors: colors,
      image: product.image,
      description: product.description || '',
      status: product.status,
      visible: product.visible,
      featured: product.featured || false,
    })
    // Don't set showAddForm - the modal will show based on editingId
  }

  const handleColorChange = (index, field, value) => {
    const newColors = [...formData.colors]
    if (field === 'name') {
      newColors[index] = { ...newColors[index], name: value }
    } else if (field === 'available') {
      newColors[index] = { ...newColors[index], available: value }
    }
    setFormData({ ...formData, colors: newColors })
  }

  const addColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { name: '', available: true }]
    })
  }

  const removeColor = (index) => {
    const newColors = formData.colors.filter((_, i) => i !== index)
    setFormData({ ...formData, colors: newColors })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      alert('Please fill in required fields (name and price)')
      return
    }

    // Ensure price is a valid number
    const priceValue = parseFloat(formData.price)
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price (must be a positive number)')
      return
    }
    
    const originalPriceValue = formData.originalPrice && formData.originalPrice.trim() 
      ? parseFloat(formData.originalPrice) 
      : null
    if (originalPriceValue !== null && (isNaN(originalPriceValue) || originalPriceValue <= 0)) {
      alert('Please enter a valid original price or leave it empty')
      return
    }

    const productData = {
      name: formData.name.trim(),
      price: priceValue,
      originalPrice: originalPriceValue,
      category: formData.category,
      type: formData.type,
      sizes: formData.type === 'crocs' ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: formData.colors.filter(c => c.name.trim()),
      image: formData.image,
      images: [formData.image],
      description: formData.description?.trim() || '',
      status: formData.status,
      visible: formData.visible,
      featured: formData.featured,
    }
    
    console.log('📦 Prepared product data:', productData)
    console.log('Price value:', productData.price, 'Type:', typeof productData.price)

    if (editingId) {
      console.log('💾 Saving product with ID:', editingId, 'Type:', typeof editingId)
      console.log('Product data to save:', productData)
      try {
        await updateProduct(editingId, productData)
        // Close the modal after successful update
        // The update function will show success/error messages
        setEditingId(null)
        resetForm()
      } catch (error) {
        console.error('❌ Error updating product:', error)
        alert('❌ Failed to update product: ' + (error.message || 'Please try again.'))
        // Don't close modal on error so user can fix and retry
      }
    } else {
      console.log('Adding new product:', productData)
      try {
        await addProduct(productData)
        setShowAddForm(false)
        alert('✅ Product added successfully!')
      } catch (error) {
        console.error('❌ Error adding product:', error)
        alert('❌ Failed to add product: ' + (error.message || 'Please try again.'))
      }
    }
    resetForm()
  }

  const handleCancel = () => {
    if (editingId) {
      setEditingId(null)
    } else {
      setShowAddForm(false)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      originalPrice: '',
      category: 'Men',
      type: 'crocs',
      sizes: '',
      colors: [],
      image: '',
      description: '',
      status: 'available',
      visible: true,
      featured: false,
    })
  }

  const toggleStatus = (id, currentStatus) => {
    updateProduct(id, { status: currentStatus === 'available' ? 'sold-out' : 'available' })
  }

  const toggleVisibility = (id, currentVisible) => {
    updateProduct(id, { visible: !currentVisible })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(id)
        // The delete function will show success/error messages
      } catch (error) {
        console.error('Error in handleDelete:', error)
        alert('❌ Failed to delete product: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const handleExportProducts = () => {
    const dataStr = JSON.stringify(products, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crocs-products-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    alert('Products exported successfully!')
  }

  const handleImportProducts = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedProducts = JSON.parse(event.target.result)
        if (Array.isArray(importedProducts)) {
          if (window.confirm(`This will replace all ${products.length} current products with ${importedProducts.length} imported products. Continue?`)) {
            localStorage.setItem('crocs-products', JSON.stringify(importedProducts))
            window.location.reload() // Reload to apply changes
          }
        } else {
          alert('Invalid file format. Please import a valid JSON file.')
        }
      } catch (error) {
        alert('Error importing products. Please check the file format.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crocs-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-crocs-green via-crocs-light to-white flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full border-2 border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-crocs-green/10 rounded-full mb-4">
              <Lock className="w-8 h-8 text-crocs-green" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600 text-sm">
              {isFirebaseConfigured 
                ? 'Sign in with Firebase or use fallback password' 
                : 'Enter password to access admin panel'}
            </p>
            {isFirebaseConfigured && (
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: You can use the fallback password if Firebase login fails
              </p>
            )}
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {isFirebaseConfigured && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-gray-400 text-xs">(Optional - for Firebase login)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setLoginError('')
                  }}
                  placeholder="your-email@example.com (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-crocs-green focus:ring-2 focus:ring-crocs-green/20 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty and use fallback password if Firebase login fails
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError('')
                }}
                placeholder={isFirebaseConfigured ? "Enter password (Firebase or fallback)" : "Enter password"}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-crocs-green focus:ring-2 focus:ring-crocs-green/20 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                required
                autoFocus={!isFirebaseConfigured}
              />
            </div>
            
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-start space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Login Failed</p>
                  <p className="text-red-600 mt-1">
                    {loginError.includes('invalid-credential') 
                      ? 'Invalid email or password. Please check your credentials and try again.'
                      : loginError.includes('user-not-found')
                      ? 'No account found with this email. Please create an admin account first.'
                      : loginError.includes('wrong-password')
                      ? 'Incorrect password. Please try again.'
                      : loginError}
                  </p>
                </div>
              </motion.div>
            )}
            
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-crocs-green to-crocs-dark text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </motion.button>
            
            {isFirebaseConfigured && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Your session will persist across all devices</span>
                </p>
              </div>
            )}
          </form>
          
          {isFirebaseConfigured && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-800 text-center">
                <strong>First time?</strong> Make sure you've created an admin account in Firebase Console and added it to the 'admins' collection in Firestore.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-transition min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your products easily</p>
              <div className="flex flex-col gap-1 mt-2">
                {isFirebaseConfigured && getCurrentUser() && (
                  <p className="text-sm text-blue-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Logged in as: {getCurrentUser().email}
                  </p>
                )}
                {usingFirebase ? (
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Connected to Firebase - Changes sync in real-time
                  </p>
                ) : (
                  <p className="text-sm text-yellow-600 flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Using local storage - See FIREBASE_SETUP.md to enable syncing
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 flex-wrap gap-2">
              <motion.button
                onClick={() => setShowOrders(!showOrders)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 ${
                  showOrders 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Package size={20} />
                <span>Orders ({orders.length})</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowAddForm(true)
                  setEditingId(null)
                  resetForm()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-crocs-green text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-crocs-dark transition-all"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </motion.button>
              <motion.button
                onClick={handleExportProducts}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-blue-600 transition-all"
              >
                <Download size={20} />
                <span>Export Products</span>
              </motion.button>
              <label className="px-4 py-3 bg-purple-500 text-white rounded-lg font-semibold flex items-center space-x-2 hover:bg-purple-600 transition-all cursor-pointer">
                <FileUp size={20} />
                <span>Import Products</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProducts}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Add Form (only shown when adding, not editing) */}
        <AnimatePresence>
          {showAddForm && !editingId && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New Product
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                    placeholder="Classic Slip-On Clog - Black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                    placeholder="4500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Original Price (KES) <span className="text-gray-400">(optional, for discounts)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                    placeholder="5500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                  >
                    <option value="crocs">Crocs</option>
                    <option value="charm">Charm/Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {formData.type === 'crocs' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sizes (comma-separated) *
                    </label>
                    <input
                      type="text"
                      value={formData.sizes}
                      onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                      placeholder="7, 8, 9, 10, 11"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Colors with Availability
                  </label>
                  <div className="space-y-2">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={color.name}
                          onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                          placeholder="Color name"
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                        />
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={color.available}
                            onChange={(e) => handleColorChange(index, 'available', e.target.checked)}
                            className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                          />
                          <span className="text-sm text-gray-700">Available</span>
                        </label>
                        <button
                          onClick={() => removeColor(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addColor}
                      className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-crocs-green hover:text-crocs-green transition-all"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Image *
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Or enter image URL"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none mt-2"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none resize-none"
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="sold-out">Sold Out</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                    />
                    <span className="text-sm font-semibold text-gray-700">Visible on website</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                    />
                    <span className="text-sm font-semibold text-gray-700">Featured</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end space-x-4">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-all flex items-center space-x-2"
                  >
                    <Save size={20} />
                    <span>Save Product</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal (shown when editing) */}
        <AnimatePresence>
          {editingId && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleCancel}
                className="fixed inset-0 bg-black/50 z-40"
              />
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Edit Product
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                          placeholder="Classic Slip-On Clog - Black"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Price (KES) *
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                          placeholder="4500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Original Price (KES) <span className="text-gray-400">(optional, for discounts)</span>
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                          placeholder="5500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Type *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                        >
                          <option value="crocs">Crocs</option>
                          <option value="charm">Charm/Accessory</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Kids">Kids</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      {formData.type === 'crocs' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sizes (comma-separated) *
                          </label>
                          <input
                            type="text"
                            value={formData.sizes}
                            onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                            placeholder="7, 8, 9, 10, 11"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Colors with Availability
                        </label>
                        <div className="space-y-2">
                          {formData.colors.map((color, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={color.name}
                                onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                placeholder="Color name"
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                              />
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={color.available}
                                  onChange={(e) => handleColorChange(index, 'available', e.target.checked)}
                                  className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                                />
                                <span className="text-sm text-gray-700">Available</span>
                              </label>
                              <button
                                onClick={() => removeColor(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addColor}
                            className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-crocs-green hover:text-crocs-green transition-all"
                          >
                            + Add Color
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Product Image *
                        </label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                          />
                          {formData.image && (
                            <div className="mt-2">
                              <img
                                src={formData.image}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                              />
                            </div>
                          )}
                          <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="Or enter image URL"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none mt-2"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none resize-none"
                          placeholder="Product description..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none"
                        >
                          <option value="available">Available</option>
                          <option value="sold-out">Sold Out</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.visible}
                            onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                            className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                          />
                          <span className="text-sm font-semibold text-gray-700">Visible on website</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.featured}
                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            className="w-5 h-5 text-crocs-green rounded focus:ring-crocs-green"
                          />
                          <span className="text-sm font-semibold text-gray-700">Featured</span>
                        </label>
                      </div>

                      <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                        >
                          Cancel
                        </button>
                        <motion.button
                          onClick={handleSave}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-2 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-all flex items-center space-x-2"
                        >
                          <Save size={20} />
                          <span>Save Product</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Orders Section */}
        {showOrders && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Package size={28} />
                <span>Orders ({orders.length})</span>
              </h2>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Rider</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-mono text-sm text-gray-600">#{order.id.slice(0, 8)}</div>
                          <div className="text-xs text-gray-500">
                            {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{order.customerName || 'N/A'}</div>
                          <div className="text-sm text-gray-600">{order.customerPhone || 'N/A'}</div>
                          {order.deliveryAddress && (
                            <div className="text-xs text-gray-500 mt-1">{order.deliveryAddress}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-700">
                            {order.items?.length || 0} item(s)
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-crocs-green">{formatPrice(order.total || 0)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {order.riderId ? (
                            <div className="flex items-center space-x-2">
                              <User size={16} className="text-indigo-600" />
                              <span className="text-sm text-gray-700">{order.riderId}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {order.status === 'placed' && !order.riderId && (
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1 bg-crocs-green text-white rounded-lg text-sm font-semibold hover:bg-crocs-dark transition-colors flex items-center space-x-1"
                            >
                              <Truck size={16} />
                              <span>Assign Rider</span>
                            </button>
                          )}
                          {order.riderId && order.status === 'dispatched' && (
                            <span className="text-sm text-gray-600">Assigned</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Assign Rider Modal */}
            {selectedOrder && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedOrder(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Rider</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Order: #{selectedOrder.id.slice(0, 8)}
                    </p>
                    
                    {riders.length === 0 ? (
                      <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          No riders available. Riders need to log in to the rider dashboard first.
                        </p>
                      </div>
                    ) : (
                      <select
                        id="rider-select"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-crocs-green focus:outline-none mb-4"
                        defaultValue=""
                      >
                        <option value="">Select a rider...</option>
                        {riders.map((rider) => (
                          <option key={rider.id} value={rider.id}>
                            {rider.name || rider.id} {rider.phone ? `(${rider.phone})` : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      {riders.length > 0 && (
                        <button
                          onClick={() => {
                            const select = document.getElementById('rider-select')
                            if (select && select.value) {
                              handleAssignRider(selectedOrder.id, select.value)
                            } else {
                              alert('Please select a rider')
                            }
                          }}
                          className="px-4 py-2 bg-crocs-green text-white rounded-lg font-semibold hover:bg-crocs-dark transition-all"
                        >
                          Assign
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Data Storage Warning */}
        {showDataWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg"
          >
            <div className="flex items-start">
              <AlertCircle className="text-yellow-400 mr-3 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                  Important: Data Storage Notice
                </h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Product changes are saved in your browser's local storage. This means:
                </p>
                <ul className="text-sm text-yellow-700 list-disc list-inside mb-3 space-y-1">
                  <li>Changes are only visible on <strong>this browser/device</strong></li>
                  <li>Other users won't see your changes automatically</li>
                  <li>Use <strong>Export/Import</strong> buttons above to share product data</li>
                </ul>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowDataWarning(false)}
                    className="text-sm text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Got it, hide this message
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDataWarning(false)}
                className="text-yellow-400 hover:text-yellow-500 ml-2"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Products List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Products ({products.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Image</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-crocs-green">{formatPrice(product.price)}</div>
                      {product.originalPrice && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-crocs-light text-crocs-green rounded-full text-sm capitalize">
                        {product.type || 'crocs'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => toggleStatus(product.id, product.status)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                            product.status === 'available'
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {product.status === 'available' ? 'Available' : 'Sold Out'}
                        </button>
                        <button
                          onClick={() => toggleVisibility(product.id, product.visible)}
                          className="flex items-center space-x-1 text-xs text-gray-600 hover:text-crocs-green"
                        >
                          {product.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{product.visible ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-crocs-green hover:bg-crocs-light rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
