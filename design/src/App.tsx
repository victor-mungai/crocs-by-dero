import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ProductCard, type Product } from "./components/ProductCard";
import { ProductDetail } from "./components/ProductDetail";
import { Checkout } from "./components/Checkout";
import { Footer } from "./components/Footer";
import { motion } from "motion/react";
import { Toaster, toast } from "sonner@2.0.3";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Sample Products Data
  const products: Product[] = [
    {
      id: "1",
      name: "Classic Comfort Crocs",
      price: 4599,
      image: "https://images.unsplash.com/photo-1727703215357-3522297d66e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGNyb2NzJTIwc2hvZXN8ZW58MXx8fHwxNzY4NDMxNjE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "in-stock",
      badge: "Best Seller",
    },
    {
      id: "2",
      name: "Sport Active Crocs",
      price: 5299,
      image: "https://images.unsplash.com/photo-1759306188476-99169b6259e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2VycyUyMGZvb3R3ZWFyfGVufDF8fHx8MTc2ODQzMTYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "in-stock",
    },
    {
      id: "3",
      name: "Summer Beach Crocs",
      price: 3999,
      image: "https://images.unsplash.com/photo-1743591684800-c8cfba557087?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBzYW5kYWxzfGVufDF8fHx8MTc2ODQzMTYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "low-stock",
      badge: "Limited",
    },
    {
      id: "4",
      name: "Premium Luxury Crocs",
      price: 6999,
      image: "https://images.unsplash.com/photo-1525441451246-3970221d4cbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21mb3J0YWJsZSUyMHNob2VzJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc2ODQzMTYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "in-stock",
      badge: "New",
    },
    {
      id: "5",
      name: "Kids Fun Crocs",
      price: 3499,
      image: "https://images.unsplash.com/photo-1727703215357-3522297d66e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGNyb2NzJTIwc2hvZXN8ZW58MXx8fHwxNzY4NDMxNjE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "in-stock",
    },
    {
      id: "6",
      name: "Work Professional Crocs",
      price: 5899,
      image: "https://images.unsplash.com/photo-1759306188476-99169b6259e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjBzbmVha2VycyUyMGZvb3R3ZWFyfGVufDF8fHx8MTc2ODQzMTYxNnww&ixlib=rb-4.1.0&q=80&w=1080",
      availability: "in-stock",
    },
  ];

  const handleAddToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1, size: "M", color: "blue" }]);
    }
    
    toast.success("Added to cart!", {
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  const handleAddToCartWithDetails = (
    product: Product,
    quantity: number,
    size: string,
    color: string
  ) => {
    const existingItem = cartItems.find(
      (item) => item.id === product.id && item.size === size && item.color === color
    );

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity, size, color }]);
    }

    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name} (${size}, ${color})`,
      duration: 2000,
    });
    
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
    toast.error("Item removed", {
      description: "Product has been removed from your cart.",
      duration: 2000,
    });
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" richColors />
      
      {/* Navbar */}
      <Navbar cartItemsCount={totalCartItems} onCartClick={() => setIsCheckoutOpen(true)} />

      {/* Hero Section */}
      <Hero onShopNow={() => {
        const productsSection = document.getElementById("products");
        productsSection?.scrollIntoView({ behavior: "smooth" });
      }} />

      {/* Featured Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <h2 className="text-5xl font-light text-black">
            Featured Collection
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our handpicked selection of the most popular designs
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onClick={setSelectedProduct}
              />
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            View All Products
          </motion.button>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-12"
          >
            <h2 className="text-5xl font-light text-black">
              Why Choose Us
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Free Shipping",
                description: "Enjoy free delivery on all orders over KSH 5,000. Fast and reliable shipping nationwide.",
              },
              {
                title: "Quality Guaranteed",
                description: "All our products come with a 1-year warranty and quality assurance.",
              },
              {
                title: "Easy Returns",
                description: "Not satisfied? Return your purchase within 30 days for a full refund.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 text-center space-y-4"
              >
                <h3 className="text-xl font-medium text-black">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartWithDetails}
        />
      )}

      {/* Checkout Modal */}
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </div>
  );
}