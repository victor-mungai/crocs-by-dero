import { motion } from "motion/react";
import { ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  availability: "in-stock" | "low-stock" | "out-of-stock";
  badge?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const availabilityColors = {
    "in-stock": "bg-black text-white",
    "low-stock": "bg-gray-600 text-white",
    "out-of-stock": "bg-gray-300 text-gray-700",
  };

  const availabilityText = {
    "in-stock": "In Stock",
    "low-stock": "Low Stock",
    "out-of-stock": "Out of Stock",
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => onClick(product)}
      className="group relative bg-white rounded-lg border border-gray-100 hover:border-gray-300 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-black text-white text-xs font-medium rounded"
          >
            {product.badge}
          </motion.span>
        )}
        <span className={`px-3 py-1 text-xs font-medium rounded ${availabilityColors[product.availability]}`}>
          {availabilityText[product.availability]}
        </span>
      </div>

      {/* Like Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsLiked(!isLiked);
        }}
        className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200"
      >
        <Heart
          className={`w-5 h-5 transition-all duration-200 ${
            isLiked ? "fill-black text-black" : "text-gray-600"
          }`}
        />
      </motion.button>

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 p-8">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2 group-hover:text-black transition-colors duration-200">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-light text-black">
            KSH {product.price.toLocaleString()}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.availability === "out-of-stock"}
            className="px-4 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}