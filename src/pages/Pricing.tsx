import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import PaymentGateway from "@/components/PaymentGateway";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const plans = [
  {
    name: "Basic",
    price: 49,
    description: "Essential tools for small businesses.",
    features: ["5 Active Campaigns", "Basic Analytics", "Email Support", "Standard Reporting"],
    featured: false,
  },
  {
    name: "Professional",
    price: 149,
    description: "Advanced features for growing agencies.",
    features: ["25 Active Campaigns", "Advanced AI Analytics", "Priority Support", "Custom Reporting", "A/B Testing", "Audience Insights"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: 499,
    description: "Maximum power for large organizations.",
    features: ["Unlimited Campaigns", "Real-time AI Optimization", "Dedicated Account Manager", "White-label Reports", "API Access", "SSO Integration"],
    featured: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[number] | null>(null);

  const handlePurchase = (plan: (typeof plans)[number]) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-[#030712] relative overflow-hidden">
      {/* Subtle Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/20 blur-[150px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20 relative z-10"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Choose the plan that best fits your business needs. No hidden fees.
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="flex"
          >
            <Card
              className={
                plan.featured
                  ? "w-full bg-black/40 backdrop-blur-xl border-indigo-500/50 relative flex flex-col shadow-[0_0_50px_rgba(99,102,241,0.15)] md:scale-105 z-10 ring-1 ring-white/5"
                  : "w-full bg-white/[0.02] backdrop-blur-md border-white/10 flex flex-col hover:border-white/20 transition-colors"
              }
            >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-slate-400">/month</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 mt-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-200">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? "bg-indigo-500" : "bg-white/10"}`}>
                      <Check className={`w-3 h-3 ${plan.featured ? "text-white" : "text-slate-300"}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.featured ? "gradient" : "outline"}
                className={`w-full ${!plan.featured ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : ""}`}
                onClick={() => handlePurchase(plan)}
                disabled={loading}
              >
                Purchase Plan
              </Button>
            </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedPlan && (
        <PaymentGateway
          open={Boolean(selectedPlan)}
          amount={selectedPlan.price}
          description={`AdPulse AI ${selectedPlan.name} plan - monthly subscription`}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}
