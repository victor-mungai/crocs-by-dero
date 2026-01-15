// Cart Service for Firebase
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

const CARTS_COLLECTION = 'carts'

// Get user's cart from Firebase
export async function getUserCart(userId) {
  if (!isFirebaseConfigured || !db || !userId) {
    return []
  }

  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId)
    const cartSnap = await getDoc(cartRef)
    
    if (cartSnap.exists()) {
      return cartSnap.data().items || []
    }
    return []
  } catch (error) {
    console.error('Error getting user cart:', error)
    return []
  }
}

// Save user's cart to Firebase
export async function saveUserCart(userId, cartItems) {
  if (!isFirebaseConfigured || !db || !userId) {
    return
  }

  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId)
    await setDoc(cartRef, {
      items: cartItems,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error('Error saving user cart:', error)
  }
}

// Clear user's cart
export async function clearUserCart(userId) {
  if (!isFirebaseConfigured || !db || !userId) {
    return
  }

  try {
    const cartRef = doc(db, CARTS_COLLECTION, userId)
    await setDoc(cartRef, {
      items: [],
      updatedAt: new Date().toISOString()
    }, { merge: true })
  } catch (error) {
    console.error('Error clearing user cart:', error)
  }
}

