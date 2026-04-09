import { Bot, LineChart, ShieldCheck, Zap, Globe, Users, Target, Rocket, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Header Section */}
      <section className="relative py-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Project Deep Dive
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground mb-6">
            About <span className="text-gradient">AdPulse AI</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            An advanced AI-Powered Digital Advertising Management System with a dedicated Client Dashboard, designed to revolutionize transparency and efficiency in digital marketing.
          </p>
          <div className="flex justify-center">
            <a 
              href="https://docs.google.com/document/d/1eCFVudcFL9r9m9viLJsv28kBb54zxWyz/edit?usp=sharing&ouid=113583490983605706815&rtpof=true&sd=true" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="gradient" className="gap-2 shadow-indigo-500/25 shadow-lg px-8">
                <FileText className="w-4 h-4" /> 
                Click here to download Project Report
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">The Industry Problem</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Traditionally, managing digital advertising campaigns across multiple platforms (Google Ads, Facebook, LinkedIn, Instagram) is incredibly fragmented. Advertising agencies are forced to juggle complex spreadsheets, delayed manual reporting, and fragmented analytics.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For the clients paying for these ads, the process is notoriously opaque. They rarely know exactly where their daily budget is being spent, what their real-time Return on Ad Spend (ROAs) is, or how specific campaigns are performing until the end of the month when they receive a static PDF report.
              </p>
            </div>
            <div className="glass-card p-8 rounded-2xl border border-border bg-card/50">
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">The AdPulse Solution</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                <strong className="text-foreground">AdPulse AI</strong> bridges the transparency gap. By centralizing campaign management and leveraging an intuitive Client Dashboard, we eliminate the black box of digital advertising.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time synchronized tracking of budgets and spend.",
                  "Unified campaign creation and multi-platform orchestration.",
                  "Secure, live metric sharing between agency and client.",
                  "Automated role-based access control preventing data leaks."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Technology Stack */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Under The Hood</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with a modern, high-performance technology stack to ensure instantaneous real-time sync and enterprise-grade security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "React & Vite",
                desc: "A lightning-fast frontend architecture utilizing React Router for seamless single-page navigation and Vite for instant module replacement."
              },
              {
                icon: Globe,
                title: "Supabase & PostgreSQL",
                desc: "Powered by Supabase for instantaneous websockets and PostgreSQL triggers, ensuring user states are instantly reflected globally."
              },
              {
                icon: ShieldCheck,
                title: "Mathematical Security",
                desc: "Row-Level Security (RLS) embedded directly into the database engine, guaranteeing that clients mathematically cannot access proprietary agency data."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-border bg-card hover:bg-muted/50 hover:border-indigo-500/50 transition-all text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-8 h-8 text-muted-foreground group-hover:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client vs Admin Capabilities */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Dual-Dashboard Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The true power of AdPulse AI lies in its dual-facing interface, securely separating the administrative overarching control from the client's live transparent view.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Admin Capabilities */}
            <div className="bg-card p-10 rounded-3xl border border-border shadow-lg">
              <div className="flex justify-between items-center mb-8 border-b border-border pb-6">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Bot className="w-8 h-8 text-purple-400" /> Administrative Hub
                </h3>
              </div>
              <ul className="space-y-6">
                {[
                  { title: "Global Client Oversight", desc: "Manage hundreds of client profiles and budgets simultaneously." },
                  { title: "Cross-platform Orchestration", desc: "Deploy and pause ad campaigns across any active global client." },
                  { title: "Centralized Billing & Revenue", desc: "Monitor aggregate revenue flows and oversee failed client payment transactions." },
                  { title: "Platform Health Tracking", desc: "View total registered users, active system health, and cumulative spend metrics." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <Target className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold">{item.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Client Capabilities */}
            <div className="bg-gradient-to-br from-indigo-900/20 to-card p-10 rounded-3xl border border-indigo-500/20 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-center mb-8 border-b border-indigo-500/20 pb-6 relative z-10">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Users className="w-8 h-8 text-indigo-400" /> Client Portal
                </h3>
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  { title: "Live ROI Metrics", desc: "Instantly view performance metrics including impressions, clicks, and hard conversions." },
                  { title: "Budget Transparency", desc: "Clearly monitor exact budget vs actual daily spend so nothing is hidden." },
                  { title: "Immediate Invoicing", desc: "Directly view and fulfill campaign invoices using integrated secure payment endpoints." },
                  { title: "Direct Communication", desc: "Built-in real-time messaging directly bridging the client to their ad manager." }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                      <LineChart className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold">{item.title}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden text-center">
        <div className="max-w-3xl mx-auto px-4 z-10 relative">
          <Rocket className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
            Ready to experience true transparency?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Sign up now to explore the live dashboard and see exactly how AdPulse manages campaigns under the hood.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto px-10 shadow-indigo-500/25 shadow-xl">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 mt-auto border-t border-border text-center text-muted-foreground text-sm">
        made by kunal prajapati
      </footer>
    </div>
  );
}
