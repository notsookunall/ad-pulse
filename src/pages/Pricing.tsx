import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the plan that best fits your business needs. No hidden fees.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Basic</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">$49</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Essential tools for small businesses.</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 mt-4">
              {["5 Active Campaigns", "Basic Analytics", "Email Support", "Standard Reporting"].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">Purchase Plan</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Professional Plan */}
        <Card className="bg-secondary border-indigo-500/50 relative flex flex-col shadow-2xl shadow-indigo-500/10 scale-105 z-10">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Professional</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">$149</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Advanced features for growing agencies.</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 mt-4">
              {[
                "25 Active Campaigns", 
                "Advanced AI Analytics", 
                "Priority Support", 
                "Custom Reporting",
                "A/B Testing",
                "Audience Insights"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="gradient" className="w-full">Purchase Plan</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">Enterprise</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold text-foreground">$499</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Maximum power for large organizations.</p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-4 mt-4">
              {[
                "Unlimited Campaigns", 
                "Real-time AI Optimization", 
                "Dedicated Account Manager", 
                "White-label Reports",
                "API Access",
                "SSO Integration"
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                    <Check className="w-3 h-3 text-foreground" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
