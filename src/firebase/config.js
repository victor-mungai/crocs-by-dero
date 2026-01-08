// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUilWtfkmHS6xkxfY5fgA_Jc8w8VphpJU",
  authDomain: "crocs-by-dero.firebaseapp.com",
  projectId: "crocs-by-dero",
  storageBucket: "crocs-by-dero.firebasestorage.app",
  messagingSenderId: "610664718482",
  appId: "1:610664718482:web:22b987814f1fa8089a064b"
}

// Check if Firebase is configured
const isFirebaseConfigured = true

// Initialize Firebase only if configured
let app = null
let db = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    console.log('✅ Firebase initialized successfully')
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
  }
} else {
  console.warn('⚠️ Firebase not configured. Using localStorage. See FIREBASE_SETUP.md for setup instructions.')
}

export { db, isFirebaseConfigured }

