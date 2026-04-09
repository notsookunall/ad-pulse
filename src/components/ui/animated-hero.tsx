import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => [
      "Mathematical Precision", 
      "Intelligent Analytics", 
      "Predictive Modeling", 
      "Real-time Metrics", 
      "Automated Bids"
    ],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[0_0_20px_rgba(99,102,241,0.1)] mb-8 backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-medium text-slate-300">Introducing AdPulse AI 2.0</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight text-white mb-8 max-w-5xl mx-auto leading-[1.1] flex flex-col items-center">
        <span>Scale your ads with</span>
        
        {/* Animated Rotating Text Container */}
        <span className="relative flex w-full justify-center overflow-hidden h-[1.3em] mt-2">
          {titles.map((title, index) => (
            <motion.span
              key={index}
              className="absolute font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x"
              initial={{ opacity: 0, y: "-100%" }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              animate={
                titleNumber === index
                  ? { y: 0, opacity: 1 }
                  : { y: titleNumber > index ? "-150%" : "150%", opacity: 0 }
              }
            >
              {title}
            </motion.span>
          ))}
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed text-center">
        Ditch the spreadsheets. Fully automate cross-platform ad campaigns, centralize client budgets, and track real-time ROAs through a stunning unified portal.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
        <Link to="/pricing">
          <Button 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 bg-white text-black hover:bg-slate-200 transition-all text-base font-semibold shadow-[0_0_40px_rgba(255,255,255,0.1)] group rounded-full"
          >
            Start Building Now
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link to="/about">
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto h-14 px-8 border-white/10 text-white hover:bg-white/5 transition-all text-base font-medium rounded-full bg-black/20 backdrop-blur-md"
          >
            Read Whitepaper
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export { AnimatedHero };
