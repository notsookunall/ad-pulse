import { motion } from "motion/react";
import { BarChart3, CreditCard, Globe, MessageCircle, Target, Zap } from "lucide-react";

const integrations = [
  { name: "Google Ads", icon: Target, color: "text-blue-500" },
  { name: "Meta", icon: Globe, color: "text-blue-600" },
  { name: "TikTok", icon: Zap, color: "text-pink-500" },
  { name: "LinkedIn", icon: BarChart3, color: "text-cyan-600" },
  { name: "X.com", icon: MessageCircle, color: "text-slate-300" },
  { name: "Stripe", icon: CreditCard, color: "text-indigo-500" },
];

export function InfiniteMarquee() {
  // We double the array to create a seamless infinite loop
  const marqueeItems = [...integrations, ...integrations, ...integrations];

  return (
    <div className="relative w-full overflow-hidden bg-black/40 border-y border-white/5 py-10 backdrop-blur-sm">
      {/* Gradient masks for smooth fading on the edges */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#030712] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#030712] to-transparent z-10 pointer-events-none" />

      <div className="flex w-[200%]">
        <motion.div
          className="flex w-1/2 justify-around items-center gap-12 px-6"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            ease: "linear",
            duration: 20,
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="text-xl font-display font-semibold text-white tracking-wide">
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
        
        {/* Second identical block to complete the loop seamlessly */}
        <motion.div
          className="flex w-1/2 justify-around items-center gap-12 px-6"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            ease: "linear",
            duration: 20,
            repeat: Infinity,
          }}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`second-${index}`}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
            >
              <item.icon className={`w-8 h-8 ${item.color}`} />
              <span className="text-xl font-display font-semibold text-white tracking-wide">
                {item.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
