import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Zap, BarChart3, Target, Globe, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { SolarSystemBackground } from "@/components/ui/SolarSystemBackground";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      return;
    }

    // Profile is populated by AuthContext after signIn; read role from fresh profile
    // We re-read from supabase via the context's onAuthStateChange, so we wait briefly
    // and use the updated profile set by context. Since context updates asynchronously
    // we navigate based on email as a fallback until onAuthStateChange fires.
    // The ProtectedRoute will enforce the correct role regardless.
    // Clear spinner before navigating
    setIsLoading(false);

    if (email === "admin@adpulse.ai") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const features = [
    { icon: BarChart3, text: "Real-time campaign analytics" },
    { icon: Target, text: "AI-powered ad optimization" },
    { icon: Globe, text: "Multi-platform management" },
    { icon: ShieldCheck, text: "Enterprise-grade security" },
  ];

  return (
    <div className="min-h-screen flex bg-[#030712] selection:bg-indigo-500/30">
      
      {/* Left Panel — Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Solar System Canvas */}
        <div className="absolute inset-0 opacity-50">
          <SolarSystemBackground />
        </div>

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-[#030712]/40 to-purple-950/60" />
        
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
              Manage your ads with <span className="text-gradient">intelligence</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              Join thousands of agencies using AI-powered campaign management to maximize ROI across every platform.
            </p>

            <div className="space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-slate-300 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-12 p-5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10"
          >
            <p className="text-slate-400 text-sm italic leading-relaxed">
              "AdPulse transformed how we manage campaigns. Our ROAS improved by 340% within the first quarter."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                AK
              </div>
              <div>
                <div className="text-sm font-medium text-white">Arun Kumar</div>
                <div className="text-xs text-slate-500">Digital Marketing Lead</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative px-4">
        {/* Subtle glow behind the form */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

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
              <CardTitle className="text-2xl font-display font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-300">Password</label>
                    <Link to="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
                  </div>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
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
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
                  <label htmlFor="remember" className="text-sm text-slate-400">Remember me</label>
                </div>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  className="w-full shadow-lg shadow-indigo-500/25 h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="justify-center border-t border-white/5 pt-6">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-slate-600 mt-6">
            Protected by enterprise-grade encryption
          </p>
        </motion.div>
      </div>
    </div>
  );
}
