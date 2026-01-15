// Rider Authorization Service
import { db, isFirebaseConfigured } from './config'
import { doc, getDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore'

const AUTHORIZED_RIDERS_COLLECTION = 'authorizedRiders'

// Check if user email is authorized to access rider dashboard
export async function isRiderAuthorized(email) {
  if (!isFirebaseConfigured || !db || !email) {
    console.log('Authorization check failed: Firebase not configured or no email', {
      isFirebaseConfigured,
      hasDb: !!db,
      email
    })
    return false
  }

  try {
    const emailLower = email.toLowerCase().trim()
    console.log('🔍 Checking authorization for email:', emailLower)
    
    // Method 1: Try query with where clause
    try {
      const q = query(
        collection(db, AUTHORIZED_RIDERS_COLLECTION),
        where('email', '==', emailLower)
      )
      const querySnapshot = await getDocs(q)
      
      console.log('📊 Authorization query result:', {
        email: emailLower,
        found: !querySnapshot.empty,
        count: querySnapshot.size,
        docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      })
      
      if (!querySnapshot.empty) {
        console.log('✅ Authorization granted via query')
        return true
      }
    } catch (queryError) {
      console.warn('⚠️ Query method failed, trying fallback:', queryError)
    }
    
    // Method 2: Fallback - fetch all and check in memory
    try {
      console.log('🔄 Trying fallback method: fetching all authorized riders')
      const allRidersSnapshot = await getDocs(collection(db, AUTHORIZED_RIDERS_COLLECTION))
      const allRiders = allRidersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('📋 All authorized riders in database:', allRiders)
      
      const isAuthorized = allRiders.some(rider => {
        const riderEmail = (rider.email || '').toLowerCase().trim()
        const match = riderEmail === emailLower
        if (match) {
          console.log('✅ Found matching rider:', rider)
        }
        return match
      })
      
      console.log('🎯 Final authorization result:', isAuthorized)
      return isAuthorized
    } catch (fallbackError) {
      console.error('❌ Fallback method also failed:', fallbackError)
      throw fallbackError
    }
  } catch (error) {
    console.error('❌ Error checking rider authorization:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    return false
  }
}

// Get all authorized rider emails (for admin use)
export async function getAuthorizedRiders() {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  try {
    const querySnapshot = await getDocs(collection(db, AUTHORIZED_RIDERS_COLLECTION))
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting authorized riders:', error)
    return []
  }
}

// Add authorized rider email (for admin use)
export async function addAuthorizedRider(email, name = '') {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  try {
    // Check if already exists
    const q = query(
      collection(db, AUTHORIZED_RIDERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    )
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      throw new Error('Rider email already authorized')
    }

    // Add to collection
    const docRef = await addDoc(collection(db, AUTHORIZED_RIDERS_COLLECTION), {
      email: email.toLowerCase(),
      name: name || email,
      createdAt: new Date().toISOString()
    })

    return docRef.id
  } catch (error) {
    throw error
  }
}

// Remove authorized rider email (for admin use)
export async function removeAuthorizedRider(email) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  try {
    const q = query(
      collection(db, AUTHORIZED_RIDERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    )
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      throw new Error('Rider email not found')
    }

    // Delete all matching documents
    const deletePromises = querySnapshot.docs.map(doc => 
      doc.ref.delete()
    )
    await Promise.all(deletePromises)
  } catch (error) {
    throw error
  }
}

// Debug function: List all authorized riders (for troubleshooting)
export async function debugListAuthorizedRiders() {
  if (!isFirebaseConfigured || !db) {
    console.error('Firebase not configured')
    return []
  }

  try {
    const querySnapshot = await getDocs(collection(db, AUTHORIZED_RIDERS_COLLECTION))
    const riders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log('📋 All authorized riders:', riders)
    console.table(riders.map(r => ({ id: r.id, email: r.email, name: r.name })))
    
    return riders
  } catch (error) {
    console.error('Error listing authorized riders:', error)
    return []
  }
}

