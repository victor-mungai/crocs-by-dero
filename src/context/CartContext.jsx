import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = localStorage.getItem('crocs-cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const saveCart = (newCart) => {
    setCart(newCart)
    localStorage.setItem('crocs-cart', JSON.stringify(newCart))
  }

  const addToCart = (product, size, color) => {
    const cartItem = {
      id: `${product.id}-${size}-${color}-${Date.now()}`,
      productId: product.id,
      product: product,
      size,
      color,
      quantity: 1,
      price: product.price,
    }

    const existingItem = cart.find(
      item => item.productId === product.id && item.size === size && item.color === color
    )

    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      saveCart(updatedCart)
    } else {
      saveCart([...cart, cartItem])
    }
  }

  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId)
    saveCart(updatedCart)
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )
    saveCart(updatedCart)
  }

  const clearCart = () => {
    saveCart([])
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

