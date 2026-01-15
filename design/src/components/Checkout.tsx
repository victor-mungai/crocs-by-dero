import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, Trash2, MapPin, Truck, CreditCard, CheckCircle, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "./ProductCard";

interface CartItem extends Product {
  quantity: number;
  size: string;
  color: string;
}

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function Checkout({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }: CheckoutProps) {
  const [deliveryType, setDeliveryType] = useState<"standard" | "express">("standard");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = deliveryType === "express" ? 500 : 200;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (customerInfo.name && customerInfo.phone && customerInfo.address) {
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        onClose();
      }, 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-6xl max-h-[95vh] rounded-t-lg sm:rounded-lg shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-3xl font-light text-black">
                Shopping Cart
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 space-y-4"
                >
                  <ShoppingCart className="w-16 h-16 text-gray-300" />
                  <h3 className="text-2xl font-light text-gray-400">Your cart is empty</h3>
                  <p className="text-gray-500">Add some products to get started</p>
                </motion.div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 p-2 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                          <div className="flex gap-2 text-xs text-gray-600">
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {item.size}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded capitalize">
                              {item.color}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-light text-black">
                              KSH {item.price.toLocaleString()}
                            </span>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </motion.button>
                              <span className="font-medium w-8 text-center text-sm">{item.quantity}</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 h-fit text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </motion.div>
                    ))}

                    {/* Delivery Type */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-medium text-gray-900">Delivery Options</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { type: "standard" as const, name: "Standard", time: "3-5 days", price: 200, icon: Truck },
                          { type: "express" as const, name: "Express", time: "1-2 days", price: 500, icon: Truck },
                        ].map((option) => (
                          <motion.button
                            key={option.type}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => setDeliveryType(option.type)}
                            className={`p-4 rounded-lg border transition-all text-left ${
                              deliveryType === option.type
                                ? "border-black bg-gray-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <option.icon className={`w-5 h-5 ${deliveryType === option.type ? "text-black" : "text-gray-400"}`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{option.name} Delivery</div>
                                <div className="text-xs text-gray-600">{option.time}</div>
                              </div>
                              <div className="font-medium text-black text-sm">KSH {option.price}</div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Customer Info Form */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-black focus:bg-white transition-all outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-black focus:bg-white transition-all outline-none"
                        />
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Delivery Address"
                            value={customerInfo.address}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-black focus:bg-white transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="sticky top-4 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-6"
                    >
                      <h3 className="text-xl font-medium text-gray-900">Order Summary</h3>

                      <div className="space-y-3">
                        <div className="flex justify-between text-gray-700 text-sm">
                          <span>Subtotal</span>
                          <span className="font-medium">KSH {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-700 text-sm">
                          <span>Delivery</span>
                          <span className="font-medium">KSH {deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="h-px bg-gray-300"></div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Total</span>
                          <span className="text-xl font-light text-black">
                            KSH {total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handlePlaceOrder}
                        disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                        className="w-full py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                      >
                        <CreditCard className="w-5 h-5" />
                        Pay with M-Pesa
                      </motion.button>

                      {/* Success Message */}
                      <AnimatePresence>
                        {orderPlaced && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center gap-4 p-6"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.2 }}
                            >
                              <CheckCircle className="w-16 h-16 text-black" />
                            </motion.div>
                            <h3 className="text-xl font-medium text-gray-900">Order Placed!</h3>
                            <p className="text-gray-600 text-center text-sm">Thank you for your purchase.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}