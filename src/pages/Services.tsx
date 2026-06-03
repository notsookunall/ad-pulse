import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Layers,
  ShieldCheck,
  Zap,
  Globe,
  BarChart3,
  Bot,
  Target,
  CreditCard,
  Users,
  LineChart,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const services = [
  {
    icon: Layers,
    title: "Cross-Platform Campaign Management",
    description:
      "Deploy, manage, and synchronize ad campaigns across Google Ads, Meta, TikTok, LinkedIn, and X from one unified dashboard. Edit budgets once, sync everywhere instantly.",
    features: [
      "One-click multi-platform deployment",
      "Unified budget allocation",
      "Real-time campaign status sync",
      "Bulk campaign editing tools",
    ],
    color: "indigo",
    gradient: "from-indigo-500/10 to-indigo-500/5",
    borderHover: "hover:border-indigo-500/30",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
  {
    icon: Bot,
    title: "AI-Powered Optimization Engine",
    description:
      "Our machine learning engine continuously analyzes campaign performance data to automatically suggest bid adjustments, audience refinements, and budget reallocations for maximum ROAS.",
    features: [
      "Automated bid optimization",
      "Smart audience targeting",
      "Predictive performance scoring",
      "A/B testing recommendations",
    ],
    color: "purple",
    gradient: "from-purple-500/10 to-purple-500/5",
    borderHover: "hover:border-purple-500/30",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics Dashboard",
    description:
      "Visualize your campaign performance with real-time interactive charts, heatmaps, and conversion funnels. Track every metric that matters — from impressions to lifetime customer value.",
    features: [
      "Real-time interactive charts",
      "Conversion funnel visualization",
      "Custom KPI tracking",
      "Exportable performance reports",
    ],
    color: "cyan",
    gradient: "from-cyan-500/10 to-cyan-500/5",
    borderHover: "hover:border-cyan-500/30",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
  {
    icon: ShieldCheck,
    title: "Client Transparency Portal",
    description:
      "Give your clients their own dedicated portal with live ROI metrics, budget breakdowns, and campaign progress — eliminating the need for delayed PDF reports and endless email chains.",
    features: [
      "Live ROI & spend dashboards",
      "Branded white-label portals",
      "Automated progress updates",
      "Secure role-based data isolation",
    ],
    color: "pink",
    gradient: "from-pink-500/10 to-pink-500/5",
    borderHover: "hover:border-pink-500/30",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-400",
  },
  {
    icon: CreditCard,
    title: "Integrated Invoicing & Payments",
    description:
      "Streamline your billing workflow with built-in secure payment processing. Automatically generate invoices, track payment status, and manage subscription billing for all clients.",
    features: [
      "Automated invoice generation",
      "Secure payment gateway",
      "Subscription management",
      "Revenue analytics & reporting",
    ],
    color: "emerald",
    gradient: "from-emerald-500/10 to-emerald-500/5",
    borderHover: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Team & Client Management",
    description:
      "Manage unlimited team members and clients with granular role-based permissions. Assign campaigns, track workloads, and enable seamless collaboration through built-in real-time messaging.",
    features: [
      "Role-based access control",
      "Real-time team messaging",
      "Client onboarding workflows",
      "Activity logs & audit trails",
    ],
    color: "amber",
    gradient: "from-amber-500/10 to-amber-500/5",
    borderHover: "hover:border-amber-500/30",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
  },
];

const stats = [
  { value: "10K+", label: "Active Campaigns" },
  { value: "340%", label: "Avg. ROAS Lift" },
  { value: "$2.1B", label: "Ad Spend Managed" },
  { value: "99.9%", label: "Platform Uptime" },
];

export default function Services() {
  return (
    <div className="flex flex-col min-h-screen bg-[#030712] selection:bg-indigo-500/30">

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-25 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-[100px] rounded-[100%]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Full-Stack Ad Management Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight mb-6">
              Our <span className="text-gradient">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              Everything you need to manage, optimize, and scale digital advertising campaigns — powered by artificial intelligence and built for modern agencies.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto px-10 shadow-indigo-500/25 shadow-xl gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 bg-white/5 border-white/10 text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 relative">
        {/* Subtle background orb */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative rounded-3xl border border-white/10 bg-gradient-to-b ${service.gradient} to-transparent p-8 overflow-hidden ${service.borderHover} transition-all duration-300 hover:shadow-lg flex flex-col`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className={`w-14 h-14 rounded-2xl ${service.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">{service.description}</p>

                <ul className="mt-auto space-y-3 relative z-10">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${service.iconBg} shrink-0`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get up and running in minutes. Our streamlined onboarding process makes it effortless to start managing campaigns.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30" />

            {[
              {
                step: "01",
                icon: Target,
                title: "Connect Your Platforms",
                desc: "Link your Google Ads, Meta, TikTok, and other accounts in one click via secure OAuth.",
              },
              {
                step: "02",
                icon: LineChart,
                title: "Launch & Monitor",
                desc: "Create campaigns from our unified editor and watch real-time analytics flow in from every platform.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Optimize with AI",
                desc: "Our AI engine continuously analyzes your data, suggesting budget shifts and audience tweaks to maximize ROI.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-2">Step {item.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-4 text-center relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to supercharge your ads?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join thousands of agencies already using AdPulse AI to deliver extraordinary results for their clients.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto px-12 shadow-indigo-500/25 shadow-xl gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
