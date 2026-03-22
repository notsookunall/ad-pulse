import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ArrowRight, BarChart3, CheckCircle2, Globe, Layers, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-sm text-indigo-300 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                AI-Powered Advertising 2.0
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 leading-tight">
                AI-Powered <br />
                <span className="text-gradient">Digital Advertising</span> <br />
                Made Simple
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
                Automate your ad campaigns, gain real-time insights, and maximize ROI with our intelligent platform. Transparency and performance, guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/pricing">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto group">
                    Get Started <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    View Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              <div className="relative glass-card rounded-2xl p-6 border border-border shadow-2xl">
                {/* Abstract UI Representation */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="h-2 w-20 bg-secondary rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-foreground">$124,500</div>
                    <div className="text-xs text-emerald-400 mt-1">+12.5% vs last month</div>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Active Campaigns</div>
                    <div className="text-2xl font-bold text-foreground">14</div>
                    <div className="text-xs text-indigo-400 mt-1">Running smoothly</div>
                  </div>
                </div>
                <div className="h-48 bg-card rounded-xl border border-border flex items-end justify-between p-4 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-indigo-500/20 rounded-t-sm relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-500"
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Why Choose AdPulse AI?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge AI technology with expert marketing strategies to deliver unparalleled results for your business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Automation",
                desc: "Set your campaigns on autopilot. Our AI optimizes bids, targets, and creatives 24/7."
              },
              {
                icon: ShieldCheck,
                title: "Transparency",
                desc: "No hidden fees or black-box metrics. See exactly where every dollar of your budget goes."
              },
              {
                icon: BarChart3,
                title: "AI Insights",
                desc: "Get predictive analytics and actionable recommendations to stay ahead of the competition."
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-card border-border hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital advertising solutions tailored to your growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "PPC Management", "Social Media Ads", "Display Advertising",
              "Video Marketing", "Conversion Optimization", "Creative Design"
            ].map((service, i) => (
              <div key={i} className="group p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all hover:border-indigo-500/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Layers className="w-5 h-5 text-muted-foreground group-hover:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{service}</h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Professional {service.toLowerCase()} strategies designed to maximize your reach and conversion rates.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 -z-10"></div>
            {[
              { step: "01", title: "Sign Up", desc: "Create your account in seconds." },
              { step: "02", title: "Choose Plan", desc: "Select the package that fits your needs." },
              { step: "03", title: "Launch", desc: "Set up your campaign parameters." },
              { step: "04", title: "Track", desc: "Monitor performance in real-time." }
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-24 h-24 mx-auto bg-background rounded-full border-4 border-indigo-500/20 flex items-center justify-center mb-6 z-10 relative">
                  <span className="text-2xl font-bold text-indigo-400">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-background -z-10" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
            Ready to Supercharge Your Ads?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of businesses using AdPulse AI to drive growth and efficiency.
          </p>
          <Link to="/pricing">
            <Button variant="gradient" size="lg" className="text-lg px-10 py-6 h-auto shadow-indigo-500/25 shadow-xl">
              Start Your AI Campaign
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 mt-auto border-t border-border text-center text-muted-foreground text-sm">
        made by kunal prajapati
      </footer>
    </div>
  );
}
