import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Zap, Sparkles, Rocket, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { SolarSystemBackground } from "@/components/ui/SolarSystemBackground";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const { error: signUpError } = await signUp(email, password, fullName);
    if (signUpError) {
      setIsLoading(false);
      setError(signUpError);
      return;
    }

    // Immediately call signIn to log the user in explicitly
    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError);
      return;
    }

    navigate("/dashboard");
  };

  const steps = [
    { icon: Sparkles, title: "Create your account", desc: "Get started in under 60 seconds" },
    { icon: Rocket, title: "Connect your platforms", desc: "Google, Meta, TikTok & more" },
    { icon: TrendingUp, title: "Watch your ROI grow", desc: "AI optimizes every dollar" },
  ];

  return (
    <div className="min-h-screen flex bg-[#030712] selection:bg-indigo-500/30">
      
      {/* Left Panel — Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Solar System Canvas */}
        <div className="absolute inset-0 opacity-50">
          <SolarSystemBackground />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/60 via-[#030712]/40 to-indigo-950/60" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-lg px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">AdPulse AI</span>
            </div>

            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
              Start your <span className="text-gradient">growth journey</span> today
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12">
              Set up your account and start running smarter, AI-optimized campaigns in minutes — not weeks.
            </p>

            {/* Steps */}
            <div className="space-y-8 relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-12 bottom-2 w-px bg-gradient-to-b from-indigo-500/40 to-transparent" />

              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                  className="flex items-start gap-5 relative"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0 relative z-10">
                    <step.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{step.title}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{step.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-14 grid grid-cols-3 gap-4"
          >
            {[
              { value: "10K+", label: "Active Users" },
              { value: "340%", label: "Avg ROAS Lift" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-4">
        {/* Subtle glow behind the form */}
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile-only branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white">AdPulse AI</h1>
          </div>

          <Card className="w-full glass-card border-white/10 shadow-2xl bg-white/[0.02] backdrop-blur-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display font-bold text-white">Create Account</CardTitle>
              <CardDescription className="text-slate-400">
                Start managing your ad campaigns with AdPulse AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <Input
                    type="text"
                    placeholder="John Smith"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email</label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <Input
                      type="password"
                      placeholder="Min. 6 chars"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Confirm</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400"
                  >
                    {error}
                  </motion.div>
                )}
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full shadow-lg shadow-indigo-500/25 h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <p className="text-xs text-slate-600 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-white/5 pt-6">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
