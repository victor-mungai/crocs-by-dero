// Order Context for managing orders
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createOrder, 
  getOrder, 
  subscribeToOrder,
  getCustomerOrders,
  updateOrderStatus 
} from '../firebase/ordersService'

const OrderContext = createContext()

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  // Create a new order
  const placeOrder = async (orderData) => {
    setLoading(true)
    try {
      const newOrder = await createOrder(orderData)
      setCurrentOrder(newOrder)
      return newOrder
    } catch (error) {
      console.error('Error placing order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Get order by ID
  const fetchOrder = async (orderId) => {
    setLoading(true)
    try {
      const order = await getOrder(orderId)
      setCurrentOrder(order)
      return order
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to order updates
  const trackOrder = (orderId) => {
    if (!orderId) return () => {}

    const unsubscribe = subscribeToOrder(orderId, (order) => {
      setCurrentOrder(order)
      // Also update in orders list if it exists
      if (order) {
        setOrders(prev => {
          const index = prev.findIndex(o => o.id === orderId)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = order
            return updated
          }
          return prev
        })
      }
    })

    return unsubscribe
  }

  // Get customer orders
  const fetchCustomerOrders = async (customerPhone) => {
    setLoading(true)
    try {
      const customerOrders = await getCustomerOrders(customerPhone)
      setOrders(customerOrders)
      return customerOrders
    } catch (error) {
      console.error('Error fetching customer orders:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      loading,
      placeOrder,
      fetchOrder,
      trackOrder,
      fetchCustomerOrders,
      setCurrentOrder
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrder = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider')
  }
  return context
}

