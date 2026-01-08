// Firebase Authentication Service
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { db, isFirebaseConfigured } from './config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const auth = isFirebaseConfigured ? getAuth() : null

// Sign in with email and password
export const signInAdmin = async (email, password) => {
  if (!auth) {
    throw new Error('Firebase is not configured')
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Check if user is admin
    const adminDoc = await getDoc(doc(db, 'admins', user.uid))
    if (!adminDoc.exists()) {
      await signOut(auth)
      throw new Error('Access denied. You are not an admin.')
    }
    
    return user
  } catch (error) {
    throw error
  }
}

// Sign out
export const signOutAdmin = async () => {
  if (!auth) return
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// Get current user
export const getCurrentUser = () => {
  if (!auth) return null
  return auth.currentUser
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  if (!auth) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

// Create admin user (one-time setup)
export const createAdminUser = async (email, password) => {
  if (!auth || !db) {
    throw new Error('Firebase is not configured')
  }

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Mark as admin in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      email: email,
      createdAt: new Date().toISOString(),
      isAdmin: true
    })

    return user
  } catch (error) {
    throw error
  }
}

export { auth }

