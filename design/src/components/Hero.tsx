import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface HeroProps {
  onShopNow: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section className="relative min-h-[600px] overflow-hidden bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Headline */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl sm:text-7xl lg:text-8xl font-light leading-none tracking-tight"
              >
                <span className="block text-black">Comfort</span>
                <span className="block text-black">Redefined</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 max-w-xl leading-relaxed"
              >
                Experience footwear that adapts to your lifestyle. Our curated collection 
                combines timeless design with unmatched comfort.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShopNow}
                className="group px-8 py-4 bg-black text-white font-medium rounded-full transition-all duration-300 flex items-center gap-3"
              >
                Explore Collection
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black font-medium rounded-full border border-gray-300 hover:border-black transition-all duration-300"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
              <div className="w-full h-full flex items-center justify-center p-12">
                <div className="text-9xl opacity-20">👟</div>
              </div>
            </div>

            {/* Floating Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 px-6 py-4 bg-white rounded-lg shadow-lg border border-gray-100"
            >
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-2xl font-light text-black">KSH 3,499</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}