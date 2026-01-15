import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, ShoppingCart, Truck, Shield, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { Product } from "./ProductCard";

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, size: string, color: string) => void;
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Black");

  if (!product) return null;

  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#ffffff" },
    { name: "Gray", hex: "#6b7280" },
    { name: "Navy", hex: "#1e3a8a" },
    { name: "Beige", hex: "#d4c5b9" },
  ];

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedSize, selectedColor);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 p-3 bg-white rounded-full border border-gray-200 hover:border-gray-300 transition-all"
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="grid lg:grid-cols-2 gap-12 p-8 lg:p-12">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {[product.image, product.image, product.image, product.image].map((img, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-50 p-2 cursor-pointer border border-gray-200 hover:border-gray-400 transition-all"
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-contain" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-4xl font-light text-black">
                  {product.name}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Experience ultimate comfort with our premium Crocs collection. Designed with innovative materials and 
                  cutting-edge technology to provide all-day comfort and style.
                </p>
              </div>

              {/* Price */}
              <div className="text-4xl font-light text-black">
                KSH {product.price.toLocaleString()}
              </div>

              {/* Color Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">Color</label>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-10 h-10 rounded-full transition-all border-2 ${
                        selectedColor === color.name
                          ? "border-black scale-110"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">Size</label>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all border ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:border-black"
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">Quantity</label>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  
                  <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleAddToCart}
                disabled={product.availability === "out-of-stock"}
                className="w-full py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart — KSH {(product.price * quantity).toLocaleString()}
              </motion.button>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "1 Year Warranty" },
                  { icon: RefreshCw, text: "Easy Returns" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 p-4 text-center"
                  >
                    <feature.icon className="w-5 h-5 text-gray-700" />
                    <span className="text-xs text-gray-600">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}