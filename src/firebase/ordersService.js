// Orders Service for Firebase
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './config'

const ORDERS_COLLECTION = 'orders'
const RIDERS_COLLECTION = 'riders'

// Create a new order
export async function createOrder(orderData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const order = {
    ...orderData,
    status: 'placed', // placed, confirmed, dispatched, in_transit, delivered, cancelled
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    riderId: null,
    riderLocation: null,
    estimatedDeliveryTime: null,
  }

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order)
  return { id: docRef.id, ...order }
}

// Get order by ID
export async function getOrder(orderId) {
  if (!isFirebaseConfigured || !db) {
    return null
  }

  const docRef = doc(db, ORDERS_COLLECTION, orderId)
  const docSnap = await getDoc(docRef)
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() }
  }
  return null
}

// Update order status
export async function updateOrderStatus(orderId, status, additionalData = {}) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId)
  await updateDoc(orderRef, {
    status,
    updatedAt: Timestamp.now(),
    ...additionalData
  })
}

// Assign rider to order
export async function assignRider(orderId, riderId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId)
  await updateDoc(orderRef, {
    riderId,
    status: 'dispatched',
    updatedAt: Timestamp.now()
  })
}

// Update rider location
export async function updateRiderLocation(riderId, location) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const riderRef = doc(db, RIDERS_COLLECTION, riderId)
  await updateDoc(riderRef, {
    location,
    lastUpdate: Timestamp.now()
  })
}

// Update order with rider location
export async function updateOrderRiderLocation(orderId, riderLocation) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId)
  await updateDoc(orderRef, {
    riderLocation,
    updatedAt: Timestamp.now()
  })
}

// Get all orders (for admin)
export async function getAllOrders() {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Get orders by customer phone/email
export async function getCustomerOrders(customerId) {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('customerPhone', '==', customerId),
    orderBy('createdAt', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Get orders assigned to rider
export async function getRiderOrders(riderId) {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('riderId', '==', riderId),
    orderBy('createdAt', 'desc')
  )
  const querySnapshot = await getDocs(q)
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// Subscribe to order updates (real-time)
export function subscribeToOrder(orderId, callback) {
  if (!isFirebaseConfigured || !db) {
    return () => {}
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId)
  return onSnapshot(orderRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() })
    } else {
      callback(null)
    }
  })
}

// Subscribe to all orders (for admin)
export function subscribeToAllOrders(callback) {
  if (!isFirebaseConfigured || !db) {
    return () => {}
  }

  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(orders)
  })
}

// Create or update rider
export async function createOrUpdateRider(riderId, riderData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase not configured')
  }

  const riderRef = doc(db, RIDERS_COLLECTION, riderId)
  const riderSnap = await getDoc(riderRef)
  
  if (riderSnap.exists()) {
    await updateDoc(riderRef, {
      ...riderData,
      lastUpdate: Timestamp.now()
    })
  } else {
    await addDoc(collection(db, RIDERS_COLLECTION), {
      id: riderId,
      ...riderData,
      createdAt: Timestamp.now(),
      lastUpdate: Timestamp.now()
    })
  }
}

// Get rider by ID
export async function getRider(riderId) {
  if (!isFirebaseConfigured || !db) {
    return null
  }

  const riderRef = doc(db, RIDERS_COLLECTION, riderId)
  const riderSnap = await getDoc(riderRef)
  
  if (riderSnap.exists()) {
    return { id: riderSnap.id, ...riderSnap.data() }
  }
  return null
}

// Subscribe to rider location updates
export function subscribeToRiderLocation(riderId, callback) {
  if (!isFirebaseConfigured || !db) {
    return () => {}
  }

  const riderRef = doc(db, RIDERS_COLLECTION, riderId)
  return onSnapshot(riderRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data()
      callback(data.location || null)
    } else {
      callback(null)
    }
  })
}

// Get all riders
export async function getAllRiders() {
  if (!isFirebaseConfigured || !db) {
    return []
  }

  const querySnapshot = await getDocs(collection(db, RIDERS_COLLECTION))
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

