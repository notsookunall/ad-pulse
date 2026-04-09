import { Button } from "@/components/ui/Button";
import { BarChart3, Globe, Layers, ShieldCheck, Zap, LineChart, Target, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AnimatedHero } from "@/components/ui/animated-hero";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030712] selection:bg-indigo-500/30 overflow-hidden">
      
      {/* 
        ========================================================================
        HERO SECTION - Ultra Modern, Vercel/Linear Inspired 
        ======================================================================== 
      */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[100px] rounded-[100%]" />
        </div>
        
        {/* Subtle Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <AnimatedHero />
          
          {/* Dashboard Preview Abstract - The WOW Factor */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="mt-24 relative max-w-5xl mx-auto"
          >
            {/* Glowing Backdrop behind the dash */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
            
            <div className="glass-card rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
              
              {/* Fake Mac Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.01]">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="mx-auto text-xs text-slate-500 font-medium font-mono">dashboard.adpulse.ai</div>
              </div>

              {/* Fake UI Content */}
              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="col-span-1 border border-white/5 bg-white/[0.02] rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all" />
                  <BarChart3 className="w-6 h-6 text-indigo-400 mb-4" />
                  <div className="text-sm text-slate-400 mb-1">Active Spend</div>
                  <div className="text-3xl font-display font-medium text-white">$45,230</div>
                  <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      className="h-full bg-indigo-500" 
                    />
                  </div>
                </div>

                <div className="col-span-1 border border-white/5 bg-white/[0.02] rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-2xl rounded-full group-hover:bg-emerald-500/20 transition-all" />
                  <Target className="w-6 h-6 text-emerald-400 mb-4" />
                  <div className="text-sm text-slate-400 mb-1">Conversions</div>
                  <div className="text-3xl font-display font-medium text-white">+12,400</div>
                  <div className="mt-4 flex gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: 0.8 + (i * 0.1) }}
                        className="w-full bg-emerald-500/40 rounded-t-sm self-end"
                        style={{ minHeight: '4px' }}
                      />
                    ))}
                  </div>
                </div>

                <div className="col-span-1 border border-white/5 bg-white/[0.02] rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <Bot className="w-6 h-6 text-purple-400 mb-4" />
                    <div className="text-sm text-slate-400">AI Optimization Engine</div>
                  </div>
                  <div className="flex items-center gap-3 mt-4 bg-white/5 rounded-lg p-3 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-slate-300">Running smoothly</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================================================
        BENTO BOX SERVICES - High Density Information UI
        ======================================================================== 
      */}
      <section id="services" className="py-32 relative bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-display font-medium text-white">Everything you need to scale.</h3>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            
            {/* Large Card spanning 2 cols */}
            <div className="md:col-span-2 relative group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 overflow-hidden hover:border-indigo-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Layers className="w-10 h-10 text-indigo-400 mb-6 relative z-10" />
              <h4 className="text-2xl font-medium text-white mb-3 relative z-10">Cross-Platform Sync</h4>
              <p className="text-slate-400 max-w-sm relative z-10 leading-relaxed">
                Seamlessly deploy campaigns across Google Ads, Meta, LinkedIn, and X simultaneously. Edit budgets in one place, sync everywhere.
              </p>
              {/* Decorative Element */}
              <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM0NjY0RTEiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PC9zdmc+')] [mask-image:linear-gradient(to_left,black,transparent)] opacity-50" />
            </div>

            {/* Standard Card */}
            <div className="relative group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 overflow-hidden hover:border-pink-500/30 transition-colors">
              <ShieldCheck className="w-10 h-10 text-pink-400 mb-6" />
              <h4 className="text-xl font-medium text-white mb-2">Total Transparency</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Give your clients a stunning dedicated portal to view live ROI, cutting out endless email threads.
              </p>
            </div>

            {/* Standard Card */}
            <div className="relative group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 overflow-hidden hover:border-purple-500/30 transition-colors">
              <Zap className="w-10 h-10 text-purple-400 mb-6" />
              <h4 className="text-xl font-medium text-white mb-2">Real-Time Data</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Powered by Supabase edge networking, data updates identically on your screen and your client's screen simultaneously.
              </p>
            </div>

            {/* Spanning Bottom Card */}
            <div className="md:col-span-2 relative group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 overflow-hidden hover:border-emerald-500/30 transition-colors flex flex-col justify-center">
              <Globe className="w-10 h-10 text-emerald-400 mb-6" />
              <h4 className="text-2xl font-medium text-white mb-3">Global Invoicing Engine</h4>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                Securely process massive advertising budgets via built-in payment endpoints. Keep digital ledgers perfectly intact with our centralized accounting features.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS - Futuristic Flow
        ======================================================================== 
      */}
      <section className="py-32 bg-[#030712] border-t border-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-6">Designed for velocity.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Connecting line for Desktop */}
            <div className="hidden md:block absolute top-[44px] left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent -z-10" />
            
            {[
              { step: "1", title: "Connect", desc: "Link your ad networks securely into our master dashboard via API." },
              { step: "2", title: "Deploy", desc: "Launch synchronized multi-channel campaigns instantly." },
              { step: "3", title: "Automate", desc: "Let our AI adjust bidding parameters while you sleep." },
              { step: "4", title: "Bill", desc: "Automatically invoice clients based on real platform spend." }
            ].map((item, i) => (
              <div key={i} className="relative text-center flex flex-col items-center group">
                <div className="w-[88px] h-[88px] rounded-full bg-[#030712] border border-white/10 flex items-center justify-center mb-6 group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all duration-300 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-xl font-bold text-indigo-400 font-display">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 max-w-[200px] mx-auto leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        CTA SECTION - Massive Glowing Prompt
        ======================================================================== 
      */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#030712] to-[#030712] -z-10" />
        
        <div className="max-w-4xl mx-auto px-4 text-center">
          <LineChart className="w-16 h-16 text-indigo-400 mx-auto mb-8 animate-bounce tracking-widest" style={{ animationDuration: '3s' }} />
          <h2 className="text-5xl md:text-7xl font-display font-medium text-white mb-8 tracking-tight leading-[1.1]">
            Stop managing.<br/>Start scaling.
          </h2>
          <div className="flex justify-center mt-12">
            <Link to="/pricing">
              <Button 
                size="lg" 
                className="h-16 px-12 rounded-full bg-white text-black hover:bg-slate-200 text-lg font-bold shadow-[0_0_60px_rgba(99,102,241,0.3)] transition-all hover:scale-105"
              >
                Launch AdPulse Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 border-t border-white/5 text-center bg-black">
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          MADE BY KUNAL PRAJAPATI
        </p>
      </footer>
    </div>
  );
}
