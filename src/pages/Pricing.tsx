import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import PaymentGateway from "@/components/PaymentGateway";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the plan that best fits your business needs. No hidden fees.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.featured
                ? "bg-secondary border-indigo-500/50 relative flex flex-col shadow-2xl shadow-indigo-500/10 scale-105 z-10"
                : "bg-card border-border flex flex-col"
            }
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4 mt-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-foreground">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? "bg-indigo-500" : "bg-secondary"}`}>
                      <Check className={`w-3 h-3 ${plan.featured ? "text-white" : "text-foreground"}`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.featured ? "gradient" : "outline"}
                className="w-full"
                onClick={() => handlePurchase(plan)}
                disabled={loading}
              >
                Purchase Plan
              </Button>
            </CardFooter>
          </Card>
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
