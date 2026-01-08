import { createContext, useContext, useState, useEffect } from 'react'
import { 
  getProductsFromFirebase, 
  addProductToFirebase, 
  updateProductInFirebase, 
  deleteProductFromFirebase,
  subscribeToProducts,
  initializeDefaultProducts
} from '../firebase/productsService'
import { isFirebaseConfigured } from '../firebase/config'

const ProductContext = createContext()

// Helper to format prices in KSH
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price)
}

const defaultProducts = [
  {
    id: 1,
    name: 'Classic Slip-On Clog - Black',
    price: 4500,
    originalPrice: 5500,
    category: 'Men',
    type: 'crocs',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [
      { name: 'Black', available: true },
      { name: 'Navy', available: true },
      { name: 'Gray', available: false },
    ],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'The iconic Classic Slip-On Clog. Comfortable, lightweight, and perfect for everyday wear. Features ventilation holes and adjustable heel strap.',
    featured: true,
  },
  {
    id: 2,
    name: 'Classic Slip-On Clog - Green',
    price: 4500,
    originalPrice: 5500,
    category: 'Men',
    type: 'crocs',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [
      { name: 'Green', available: true },
      { name: 'Black', available: true },
      { name: 'Navy', available: true },
    ],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Vibrant green Classic Slip-On Clog. Stand out with style and comfort. Perfect for casual wear.',
    featured: true,
  },
  {
    id: 3,
    name: 'Classic Slip-On Clog - White',
    price: 4500,
    originalPrice: 5500,
    category: 'Women',
    type: 'crocs',
    sizes: ['5', '6', '7', '8', '9', '10'],
    colors: [
      { name: 'White', available: true },
      { name: 'Pink', available: true },
      { name: 'Yellow', available: false },
    ],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Clean and classic white slip-on clog. Versatile and easy to style with any outfit.',
    featured: true,
  },
  {
    id: 4,
    name: 'Kids Classic Slip-On - Rainbow',
    price: 3500,
    originalPrice: 4000,
    category: 'Kids',
    type: 'crocs',
    sizes: ['1', '2', '3', '4', '5', '6'],
    colors: [
      { name: 'Rainbow', available: true },
      { name: 'Blue', available: true },
      { name: 'Pink', available: true },
    ],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Fun and colorful slip-on Crocs for kids. Durable, easy to clean, and perfect for active play.',
    featured: true,
  },
  {
    id: 5,
    name: 'Classic Slip-On Clog - Pink',
    price: 4500,
    originalPrice: 5500,
    category: 'Women',
    type: 'crocs',
    sizes: ['5', '6', '7', '8', '9'],
    colors: [
      { name: 'Pink', available: true },
      { name: 'Rose', available: true },
      { name: 'Lavender', available: false },
    ],
    image: 'https://images.unsplash.com/photo-1605812860427-401443163141?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1605812860427-401443163141?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Sweet and stylish pink slip-on clog. Add a pop of color to your wardrobe.',
    featured: false,
  },
  {
    id: 6,
    name: 'Classic Slip-On Clog - Navy',
    price: 4500,
    originalPrice: 5500,
    category: 'Men',
    type: 'crocs',
    sizes: ['7', '8', '9', '10', '11'],
    colors: [
      { name: 'Navy', available: true },
      { name: 'Black', available: true },
      { name: 'Gray', available: true },
    ],
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Sophisticated navy slip-on clog. Perfect for both casual and semi-formal occasions.',
    featured: false,
  },
  // Charms/Accessories
  {
    id: 101,
    name: 'Jibbitz Charm Pack - Sports',
    price: 800,
    originalPrice: 1000,
    category: 'Accessories',
    type: 'charm',
    sizes: [],
    colors: [],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Set of 4 sports-themed Jibbitz charms. Perfect for personalizing your Crocs!',
    featured: true,
  },
  {
    id: 102,
    name: 'Jibbitz Charm Pack - Animals',
    price: 800,
    originalPrice: 1000,
    category: 'Accessories',
    type: 'charm',
    sizes: [],
    colors: [],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Adorable animal-themed Jibbitz charms. Includes 4 different animal designs.',
    featured: true,
  },
  {
    id: 103,
    name: 'Jibbitz Charm Pack - Emojis',
    price: 800,
    originalPrice: 1000,
    category: 'Accessories',
    type: 'charm',
    sizes: [],
    colors: [],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Fun emoji-themed Jibbitz charms. Express yourself with these colorful designs!',
    featured: false,
  },
  {
    id: 104,
    name: 'Jibbitz Single Charm - Custom',
    price: 250,
    originalPrice: 300,
    category: 'Accessories',
    type: 'charm',
    sizes: [],
    colors: [],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
    ],
    status: 'available',
    visible: true,
    description: 'Single Jibbitz charm. Choose from various designs to personalize your Crocs.',
    featured: false,
  },
]

// Helper to migrate old format products
const migrateProduct = (p) => {
  if (p.colors && Array.isArray(p.colors) && p.colors.length > 0 && typeof p.colors[0] === 'string') {
    return {
      ...p,
      colors: p.colors.map(c => ({ name: c, available: true })),
      type: p.type || 'crocs',
    }
  }
  return { ...p, type: p.type || 'crocs' }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingFirebase, setUsingFirebase] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    const loadProducts = async () => {
      if (isFirebaseConfigured) {
        try {
          // Try to load from Firebase
          const firebaseProducts = await getProductsFromFirebase()
          
          if (firebaseProducts && firebaseProducts.length > 0) {
            // Migrate format if needed, but preserve Firebase document IDs
            const migrated = firebaseProducts.map(p => {
              const migrated = migrateProduct(p)
              // CRITICAL: Keep the Firebase document ID (it's the doc.id from Firestore)
              // Firebase doc IDs are strings, typically 20+ characters
              if (p.id && typeof p.id === 'string') {
                migrated.id = p.id // Keep Firebase doc ID
              }
              return migrated
            })
            console.log('✅ Loaded products with Firebase IDs:', migrated.map(p => ({ id: p.id, type: typeof p.id, name: p.name })))
            setProducts(migrated)
            setUsingFirebase(true)
            
            // Set up real-time listener
            const unsubscribe = subscribeToProducts((updatedProducts) => {
              setLastSyncTime(new Date())
              setSyncError(null)
              
              const migrated = updatedProducts.map(p => {
                const m = migrateProduct(p)
                // Preserve Firebase doc ID
                if (p.id && typeof p.id === 'string') {
                  m.id = p.id
                }
                return m
              })
              
              // Deduplicate: Remove products with numeric IDs if there's a Firebase version with the same name
              const deduplicated = []
              const seenNames = new Map() // name -> best product (prefer Firebase IDs over numeric)
              
              migrated.forEach(product => {
                const nameKey = product.name?.toLowerCase().trim()
                if (!nameKey) return
                
                const isNumericId = typeof product.id === 'number' || 
                                   (typeof product.id === 'string' && /^\d{10,13}$/.test(String(product.id)))
                const isFirebaseId = typeof product.id === 'string' && product.id.length >= 15 && !isNumericId
                
                if (!seenNames.has(nameKey)) {
                  seenNames.set(nameKey, product)
                } else {
                  const existing = seenNames.get(nameKey)
                  const existingIsNumeric = typeof existing.id === 'number' || 
                                           (typeof existing.id === 'string' && /^\d{10,13}$/.test(String(existing.id)))
                  
                  // Prefer Firebase ID over numeric ID
                  if (existingIsNumeric && isFirebaseId) {
                    console.log(`🔄 Deduplicating: Replacing numeric ID product "${product.name}" with Firebase ID version`)
                    seenNames.set(nameKey, product)
                  } else if (!existingIsNumeric && isNumericId) {
                    console.log(`🔄 Deduplicating: Ignoring numeric ID product "${product.name}" (Firebase version exists)`)
                    // Keep existing Firebase version, ignore this numeric one
                  }
                }
              })
              
              const finalProducts = Array.from(seenNames.values())
              console.log(`✅ Deduplicated: ${migrated.length} → ${finalProducts.length} products`)
              setProducts(finalProducts)
            }, (error) => {
              setSyncError(error.message || 'Sync error occurred')
              console.error('Real-time sync error:', error)
            })
            
            setLoading(false)
            
            // Cleanup on unmount
            return () => unsubscribe()
          } else {
            // Firebase is empty, initialize with defaults
            await initializeDefaultProducts(defaultProducts)
            setProducts(defaultProducts)
            setUsingFirebase(true)
            
            // Set up real-time listener
            const unsubscribe = subscribeToProducts((updatedProducts) => {
              setLastSyncTime(new Date())
              setSyncError(null)
              
              const migrated = updatedProducts.map(migrateProduct)
              
              // Deduplicate: Remove products with numeric IDs if there's a Firebase version with the same name
              const seenNames = new Map()
              
              migrated.forEach(product => {
                const nameKey = product.name?.toLowerCase().trim()
                if (!nameKey) return
                
                const isNumericId = typeof product.id === 'number' || 
                                   (typeof product.id === 'string' && /^\d{10,13}$/.test(String(product.id)))
                const isFirebaseId = typeof product.id === 'string' && product.id.length >= 15 && !isNumericId
                
                if (!seenNames.has(nameKey)) {
                  seenNames.set(nameKey, product)
                } else {
                  const existing = seenNames.get(nameKey)
                  const existingIsNumeric = typeof existing.id === 'number' || 
                                           (typeof existing.id === 'string' && /^\d{10,13}$/.test(String(existing.id)))
                  
                  // Prefer Firebase ID over numeric ID
                  if (existingIsNumeric && isFirebaseId) {
                    console.log(`🔄 Deduplicating: Replacing numeric ID product "${product.name}" with Firebase ID version`)
                    seenNames.set(nameKey, product)
                  } else if (!existingIsNumeric && isNumericId) {
                    console.log(`🔄 Deduplicating: Ignoring numeric ID product "${product.name}" (Firebase version exists)`)
                  }
                }
              })
              
              const finalProducts = Array.from(seenNames.values())
              console.log(`✅ Deduplicated: ${migrated.length} → ${finalProducts.length} products`)
              setProducts(finalProducts)
            }, (error) => {
              setSyncError(error.message || 'Sync error occurred')
              console.error('Real-time sync error:', error)
            })
            
            setLoading(false)
            return () => unsubscribe()
          }
        } catch (error) {
          console.error('Error loading from Firebase, falling back to localStorage:', error)
          // Fall through to localStorage
        }
      }
      
      // Fallback to localStorage
      const savedProducts = localStorage.getItem('crocs-products')
      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts)
          const migrated = parsed.map(migrateProduct)
          setProducts(migrated)
        } catch (e) {
          setProducts(defaultProducts)
          localStorage.setItem('crocs-products', JSON.stringify(defaultProducts))
        }
      } else {
        setProducts(defaultProducts)
        localStorage.setItem('crocs-products', JSON.stringify(defaultProducts))
      }
      setLoading(false)
    }

    loadProducts()
  }, [])

  const updateProducts = async (newProducts) => {
    setProducts(newProducts)
    
    if (usingFirebase) {
      // Sync to Firebase in background (don't wait)
      // Note: This is a simplified sync. In production, you'd update individual documents
      console.log('Products updated, syncing to Firebase...')
    } else {
      // Save to localStorage
      localStorage.setItem('crocs-products', JSON.stringify(newProducts))
    }
  }

  const addProduct = async (product) => {
    const newProduct = {
      ...product,
      // Don't set ID - Firebase will create one, or we'll use Date.now() for localStorage
      images: product.images || [product.image],
      type: product.type || 'crocs',
      colors: product.colors?.map(c => typeof c === 'string' ? { name: c, available: true } : c) || [],
    }

    if (usingFirebase) {
      // Don't add local ID - Firebase will create the document ID
      // Remove any existing ID to ensure Firebase creates a new one
      const { id, ...productWithoutId } = newProduct
      
      console.log('➕ Adding product to Firebase:', productWithoutId.name)
      const firebaseProduct = await addProductToFirebase(productWithoutId)
      if (firebaseProduct) {
        console.log('✅ Product added to Firebase with ID:', firebaseProduct.id)
        // Real-time listener will automatically add it to the state
        return firebaseProduct
      } else {
        throw new Error('Failed to add product to Firebase')
      }
    }

    // Fallback to localStorage
    const productWithId = {
      ...newProduct,
      id: Date.now(), // Only add ID for localStorage
    }
    const updated = [...products, productWithId]
    updateProducts(updated)
    return productWithId
  }

  const updateProduct = async (id, updates) => {
    console.log('🔄 updateProduct called with ID:', id, 'Type:', typeof id)
    console.log('Current products:', products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })))
    
    // Find the product first to get its actual ID (could be Firebase doc ID or numeric)
    const product = products.find(p => {
      // Match by exact ID, string conversion, or numeric conversion
      const matches = p.id === id || 
             p.id === String(id) || 
             String(p.id) === String(id) ||
             (typeof p.id === 'number' && p.id === parseInt(id)) ||
             (typeof id === 'number' && p.id === id)
      if (matches) {
        console.log('✅ Found matching product:', p.name, 'ID:', p.id, 'Type:', typeof p.id)
      }
      return matches
    })

    if (!product) {
      console.error('❌ Product not found for update')
      console.error('Looking for ID:', id, 'Type:', typeof id)
      console.error('Available products:', products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })))
      alert('❌ Product not found. Please refresh the page and try again.')
      return
    }

    console.log('🔄 Updating product:', product.name)
    console.log('Product ID:', product.id, 'Type:', typeof product.id)
    console.log('Updates received:', updates)

    // Clean and validate updates - ensure price is a number
    const cleanUpdates = { ...updates }
    if (cleanUpdates.price !== undefined) {
      cleanUpdates.price = typeof cleanUpdates.price === 'string' ? parseFloat(cleanUpdates.price) : Number(cleanUpdates.price)
      if (isNaN(cleanUpdates.price)) {
        alert('Invalid price. Please enter a valid number.')
        return
      }
    }
    if (cleanUpdates.originalPrice !== undefined && cleanUpdates.originalPrice !== null && cleanUpdates.originalPrice !== '') {
      cleanUpdates.originalPrice = typeof cleanUpdates.originalPrice === 'string' ? parseFloat(cleanUpdates.originalPrice) : Number(cleanUpdates.originalPrice)
      if (isNaN(cleanUpdates.originalPrice)) {
        cleanUpdates.originalPrice = null
      }
    }

    if (usingFirebase) {
      // Firebase document IDs are strings, typically 20 characters long
      // Numeric IDs (from Date.now()) are 13 digits
      // Use the product's ID directly - if it's from Firebase, it's already the doc ID
      let docId = product.id
      
      // Check if it's a numeric ID (old format from localStorage)
      // Numeric IDs are 10-13 digits (Date.now() format like 1765972985862)
      const isNumericId = typeof docId === 'number' || (typeof docId === 'string' && /^\d{10,13}$/.test(String(docId)))
      
      if (isNumericId) {
        console.warn('⚠️ Product has numeric ID (old format):', docId)
        console.warn('Migrating product to Firebase...')
        
        // Check if a product with the same name already exists in Firebase
        // If it does, update that one instead of creating a new one
        const productNameLower = (product.name || '').toLowerCase().trim()
        const existingFirebaseProduct = products.find(p => {
          const pNameLower = (p.name || '').toLowerCase().trim()
          const isSameName = pNameLower === productNameLower
          const hasFirebaseId = typeof p.id === 'string' && p.id.length >= 15 && !/^\d+$/.test(String(p.id))
          return isSameName && hasFirebaseId
        })
        
        if (existingFirebaseProduct) {
          console.log(`🔄 Found existing Firebase product with same name: "${product.name}"`)
          console.log(`🔄 Updating existing product instead of creating duplicate`)
          // Update the existing Firebase product instead
          const existingDocId = existingFirebaseProduct.id
          try {
            const success = await updateProductInFirebase(existingDocId, cleanUpdates)
            if (success) {
              // Remove the old numeric ID product from local state
              const oldProductId = product.id
              setProducts(prevProducts => {
                const filtered = prevProducts.filter(p => {
                  const pid = String(p.id)
                  const oldId = String(oldProductId)
                  return pid !== oldId
                })
                console.log(`🗑️ Removed old product with numeric ID ${oldProductId} from local state`)
                return filtered
              })
              console.log('✅ Updated existing Firebase product instead of creating duplicate')
              alert('✅ Product updated successfully!')
              return
            }
          } catch (error) {
            console.error('❌ Error updating existing product:', error)
            // Fall through to create new one if update fails
          }
        }
        
        // Create a new Firebase document with updated data
        try {
          const newProduct = { ...product, ...cleanUpdates }
          // Remove the old numeric ID - Firebase will create a new document ID
          delete newProduct.id
          
          console.log('Creating new Firebase document for migrated product...')
          const firebaseProduct = await addProductToFirebase(newProduct)
          if (firebaseProduct && firebaseProduct.id) {
            // IMPORTANT: Remove the old product with numeric ID from local state immediately
            // Also remove any other products with the same name that have numeric IDs
            const oldProductId = product.id
            const productNameLower = product.name?.toLowerCase().trim()
            setProducts(prevProducts => {
              const filtered = prevProducts.filter(p => {
                const pid = String(p.id)
                const oldId = String(oldProductId)
                // Remove the exact old product
                if (pid === oldId) {
                  return false
                }
                // Also remove any other products with the same name that have numeric IDs
                const pNameLower = p.name?.toLowerCase().trim()
                const isSameName = pNameLower === productNameLower
                const isNumericId = typeof p.id === 'number' || (typeof p.id === 'string' && /^\d{10,13}$/.test(String(p.id)))
                if (isSameName && isNumericId) {
                  console.log(`🗑️ Removing duplicate product "${p.name}" with numeric ID ${p.id}`)
                  return false
                }
                return true
              })
              console.log(`🗑️ Removed old product with numeric ID ${oldProductId} from local state`)
              return filtered
            })
            
            console.log('✅ Product migrated to Firebase with new ID:', firebaseProduct.id)
            alert('✅ Product migrated and updated successfully! The old version will be removed automatically.')
            // Real-time listener will add the new product and deduplication will handle any remaining duplicates
            return
          } else {
            throw new Error('Failed to create new Firebase document')
          }
        } catch (error) {
          console.error('❌ Error migrating product:', error)
          alert('Error: Could not migrate product. Please delete this product and add it again.')
          return
        }
      }
      
      // Ensure it's a string (Firebase doc IDs are always strings)
      docId = String(docId)
      
      // Verify it looks like a Firebase document ID
      // Firebase doc IDs are typically 20 characters, but can be shorter
      // Just check it's not a numeric ID (which would be 10-13 digits)
      if (docId.length < 10 || /^\d{10,13}$/.test(docId)) {
        console.error('❌ Invalid Firebase document ID format:', docId, 'Length:', docId.length)
        console.error('This looks like a numeric ID. Product needs migration.')
        alert('⚠️ This product needs to be migrated to Firebase. Please refresh the page and try again, or delete and re-add the product.')
        return
      }
      
      console.log('🔄 Updating Firebase document:', docId)
      console.log('Product name:', product.name)
      console.log('Update data:', cleanUpdates)
      
      try {
        // Update Firebase - real-time listener will handle UI updates
        // This prevents duplicates and ensures all devices see changes instantly
        const success = await updateProductInFirebase(docId, cleanUpdates)
        if (!success) {
          console.error('❌ Failed to update product in Firebase')
          alert('❌ Failed to save changes. Please check console for details.')
        } else {
          console.log('✅ Product updated successfully in Firebase!')
          console.log('🔄 Real-time listener will update UI automatically on all devices')
          alert('✅ Product updated successfully! Changes will appear on all devices.')
        }
      } catch (error) {
        console.error('❌ Error updating product:', error)
        console.error('Full error details:', {
          message: error.message,
          code: error.code,
          productId: docId,
          productName: product.name
        })
        
        // Provide helpful error message
        if (error.message && error.message.includes('No document to update')) {
          alert('⚠️ This product is not in Firebase yet. Please refresh the page to sync, or delete and re-add it.')
        } else {
          alert('❌ Error saving changes: ' + (error.message || 'Unknown error. Check console for details.'))
        }
      }
    } else {
      // Fallback to localStorage - update local state immediately
      const updated = products.map(p => {
        if (p.id === product.id || String(p.id) === String(product.id)) {
          const merged = { ...p, ...cleanUpdates }
          if (cleanUpdates.colors) {
            merged.colors = cleanUpdates.colors.map(c => 
              typeof c === 'string' ? { name: c, available: true } : c
            )
          }
          return merged
        }
        return p
      })
      updateProducts(updated)
    }
  }

  const deleteProduct = async (id) => {
    console.log('🗑️ deleteProduct called with ID:', id, 'Type:', typeof id)
    console.log('Current products:', products.map(p => ({ id: p.id, type: typeof p.id, name: p.name })))
    
    // Find the product first
    const product = products.find(p => {
      const matches = p.id === id || 
             p.id === String(id) || 
             String(p.id) === String(id) ||
             (typeof p.id === 'number' && p.id === parseInt(id)) ||
             (typeof id === 'number' && p.id === id)
      if (matches) {
        console.log('✅ Found product to delete:', p.name, 'ID:', p.id, 'Type:', typeof p.id)
      }
      return matches
    })

    if (!product) {
      console.error('❌ Product not found for deletion')
      console.error('Looking for ID:', id, 'Type:', typeof id)
      alert('❌ Product not found. Please refresh the page and try again.')
      return
    }

    if (usingFirebase) {
      let docId = product.id
      
      // Check if it's a numeric ID (old format)
      const isNumericId = typeof docId === 'number' || (typeof docId === 'string' && /^\d{10,13}$/.test(String(docId)))
      
      if (isNumericId) {
        console.warn('⚠️ Product has numeric ID, cannot delete from Firebase directly')
        alert('⚠️ This product is not in Firebase. It will be removed from local storage only. Please refresh the page.')
        // Remove from local state
        const updated = products.filter(p => {
          const pid = String(p.id)
          const targetId = String(product.id)
          return pid !== targetId
        })
        setProducts(updated)
        return
      }
      
      // Ensure it's a string and valid Firebase doc ID
      docId = String(docId)
      
      if (docId.length < 10 || /^\d+$/.test(docId)) {
        console.error('❌ Invalid Firebase document ID format:', docId)
        alert('❌ Invalid product ID format. Please refresh the page.')
        return
      }
      
      console.log('🗑️ Deleting Firebase document:', docId)
      console.log('Product name:', product.name)
      
      try {
        const success = await deleteProductFromFirebase(docId)
        if (!success) {
          console.error('❌ Failed to delete product from Firebase')
          alert('❌ Failed to delete product. Please check console for details.')
        } else {
          console.log('✅ Product deleted successfully from Firebase!')
          console.log('🔄 Real-time listener will update UI automatically')
          alert('✅ Product deleted successfully!')
        }
      } catch (error) {
        console.error('❌ Error deleting product:', error)
        alert('❌ Error deleting product: ' + (error.message || 'Unknown error. Check console for details.'))
      }
    } else {
      // Fallback to localStorage
      console.log('🗑️ Deleting from localStorage')
      const updated = products.filter(p => {
        const pid = String(p.id)
        const targetId = String(id)
        return pid !== targetId && String(p.id) !== String(id)
      })
      updateProducts(updated)
      alert('✅ Product deleted successfully!')
    }
  }

  const getProduct = (id) => {
    const numId = parseInt(id)
    return products.find(p => p.id === numId || p.id === String(id) || p.id === id)
  }

  const getFeaturedProducts = () => {
    return products.filter(p => p.featured && p.visible)
  }

  const getProductsByCategory = (category) => {
    if (!category || category === 'All') return products.filter(p => p.visible)
    if (category === 'Accessories') return products.filter(p => p.type === 'charm' && p.visible)
    return products.filter(p => p.category === category && p.visible && p.type === 'crocs')
  }

  const getCharms = () => {
    return products.filter(p => p.type === 'charm' && p.visible)
  }

  const searchProducts = (query) => {
    if (!query) return products.filter(p => p.visible)
    const lowerQuery = query.toLowerCase()
    return products.filter(p => 
      p.visible && (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      )
    )
  }

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      getFeaturedProducts,
      getProductsByCategory,
      getCharms,
      searchProducts,
      usingFirebase,
      lastSyncTime,
      syncError,
    }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider')
  }
  return context
}
