import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import { ProductProvider } from './context/ProductContext'
import { CartProvider } from './context/CartContext'
import './App.css'

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/checkout" element={<Checkout />} />
              {/* Hidden admin route - not in navigation */}
              <Route path="/manage-dashboard" element={<Admin />} />
              {/* Keep /admin for backward compatibility but robots.txt blocks it */}
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </CartProvider>
    </ProductProvider>
  )
}

export default App

