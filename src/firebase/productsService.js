// Firebase service for products
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

const PRODUCTS_COLLECTION = 'products'

// Get all products from Firebase
export const getProductsFromFirebase = async () => {
  if (!isFirebaseConfigured || !db) {
    return null
  }

  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    // Try to order by createdAt if it exists, otherwise just get all
    let q
    try {
      q = query(productsRef, orderBy('createdAt', 'desc'))
    } catch {
      // If createdAt doesn't exist, just get all products
      q = productsRef
    }
    const snapshot = await getDocs(q)
    
    const products = []
    snapshot.forEach((doc) => {
      // Use Firebase document ID as the product ID
      products.push({ 
        id: doc.id, // Firebase document ID
        ...doc.data() 
      })
    })
    
    console.log(`✅ Loaded ${products.length} products from Firebase`)
    return products
  } catch (error) {
    console.error('Error getting products from Firebase:', error)
    return null
  }
}

// Add a product to Firebase
export const addProductToFirebase = async (product) => {
  if (!isFirebaseConfigured || !db) {
    return null
  }

  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    
    // Remove any existing id field - Firebase will create the document ID
    const { id, ...productData } = product
    
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    // Return with Firebase document ID
    const result = { id: docRef.id, ...productData }
    console.log('✅ Product added to Firebase:', result.id, result.name)
    return result
  } catch (error) {
    console.error('❌ Error adding product to Firebase:', error)
    return null
  }
}

// Update a product in Firebase
export const updateProductInFirebase = async (productId, updates) => {
  if (!isFirebaseConfigured || !db) {
    console.error('❌ Firebase not configured or db not available')
    return false
  }

  try {
    console.log('🔄 Attempting to update Firebase document:', productId)
    console.log('Document path:', `${PRODUCTS_COLLECTION}/${productId}`)
    
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    
    // Check if document exists first
    const docSnapshot = await getDoc(productRef)
    if (!docSnapshot.exists()) {
      console.error('❌ Document does not exist:', productId)
      throw new Error(`No document to update: projects/crocs-by-dero/databases/(default)/documents/products/${productId}`)
    }
    
    console.log('✅ Document exists, proceeding with update')
    
    // Prepare updates object, excluding id field
    const { id, ...updateData } = updates
    
    // Ensure price is a number (not string)
    if (updateData.price !== undefined) {
      const priceNum = typeof updateData.price === 'string' ? parseFloat(updateData.price) : Number(updateData.price)
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Invalid price: must be a positive number')
      }
      updateData.price = priceNum
      console.log('✅ Price validated:', updateData.price, 'Type:', typeof updateData.price)
    }
    
    if (updateData.originalPrice !== undefined && updateData.originalPrice !== null && updateData.originalPrice !== '') {
      const origPriceNum = typeof updateData.originalPrice === 'string' ? parseFloat(updateData.originalPrice) : Number(updateData.originalPrice)
      if (isNaN(origPriceNum) || origPriceNum <= 0) {
        updateData.originalPrice = null // Set to null if invalid
      } else {
        updateData.originalPrice = origPriceNum
      }
    } else if (updateData.originalPrice === '') {
      updateData.originalPrice = null // Empty string means no original price
    }
    
    console.log('📝 Update data (cleaned and validated):', updateData)
    console.log('Price in updateData:', updateData.price, 'Type:', typeof updateData.price)
    
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    
    console.log('✅ Product updated successfully in Firebase:', productId)
    return true
  } catch (error) {
    console.error('❌ Error updating product in Firebase:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Product ID:', productId, 'Type:', typeof productId)
    console.error('Updates:', updates)
    throw error // Re-throw so caller can handle it
  }
}

// Delete a product from Firebase
export const deleteProductFromFirebase = async (productId) => {
  if (!isFirebaseConfigured || !db) {
    console.error('❌ Firebase not configured or db not available')
    return false
  }

  try {
    console.log('🗑️ Attempting to delete Firebase document:', productId)
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    
    // Check if document exists first
    const docSnapshot = await getDoc(productRef)
    if (!docSnapshot.exists()) {
      const errorMsg = `Document does not exist: ${productId}`
      console.error('❌', errorMsg)
      throw new Error(errorMsg)
    }
    
    console.log('✅ Document exists, proceeding with deletion')
    console.log('Document data:', docSnapshot.data())
    
    await deleteDoc(productRef)
    
    console.log('✅ Product deleted successfully from Firebase:', productId)
    return true
  } catch (error) {
    console.error('❌ Error deleting product from Firebase:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Product ID:', productId, 'Type:', typeof productId)
    throw error // Re-throw so caller can handle it
  }
}

// Set up real-time listener for products
export const subscribeToProducts = (callback, errorCallback) => {
  if (!isFirebaseConfigured || !db) {
    console.warn('⚠️ Firebase not configured, real-time listener not available')
    return () => {} // Return empty unsubscribe function
  }

  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION)
    // Try to order by createdAt, fallback to no ordering
    let q
    try {
      q = query(productsRef, orderBy('createdAt', 'desc'))
    } catch (error) {
      console.warn('⚠️ Could not order by createdAt, using default query:', error)
      q = productsRef
    }
    
    console.log('🔄 Setting up real-time listener for products...')
    
    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const products = []
        snapshot.forEach((doc) => {
          products.push({ 
            id: doc.id, // Firebase document ID
            ...doc.data() 
          })
        })
        console.log(`✅ Real-time update received: ${products.length} products`)
        console.log(`📦 Products:`, products.map(p => ({ id: p.id, name: p.name })))
        callback(products)
      }, 
      (error) => {
        console.error('❌ Error in products subscription:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        
        // Check for permission errors
        if (error.code === 'permission-denied') {
          console.error('🚫 Permission denied! Check Firebase security rules.')
          console.error('Make sure Firestore rules allow read access:')
          console.error('  match /products/{productId} {')
          console.error('    allow read: if true;')
          console.error('  }')
        }
        
        // Try to reconnect after a delay
        console.log('🔄 Attempting to reconnect in 3 seconds...')
        setTimeout(() => {
          console.log('🔄 Reconnecting real-time listener...')
          subscribeToProducts(callback, errorCallback)
        }, 3000)
      }
    )
    
    console.log('✅ Real-time listener active and listening for changes')
    return unsubscribe
  } catch (error) {
    console.error('❌ Error setting up products subscription:', error)
    return () => {}
  }
}

// Initialize default products in Firebase (run once)
export const initializeDefaultProducts = async (defaultProducts) => {
  if (!isFirebaseConfigured || !db) {
    return false
  }

  try {
    const existingProducts = await getProductsFromFirebase()
    if (existingProducts && existingProducts.length > 0) {
      console.log('Products already exist in Firebase, skipping initialization')
      return false
    }

    const productsRef = collection(db, PRODUCTS_COLLECTION)
    const promises = defaultProducts.map((product) => 
      addDoc(productsRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    )

    await Promise.all(promises)
    console.log('✅ Default products initialized in Firebase')
    return true
  } catch (error) {
    console.error('Error initializing default products:', error)
    return false
  }
}

