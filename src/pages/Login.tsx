import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    if (email.includes("admin")) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background -z-10" />
      
      <Card className="w-full max-w-md glass-card border-white/10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <CardTitle className="text-2xl font-display font-bold text-white">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access your dashboard
          </CardDescription>
          <div className="mt-2 p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
            <p><strong>Demo Access:</strong></p>
            <p>Admin: Use any email with "admin" (e.g. admin@adpulse.ai)</p>
            <p>Client: Use any other email (e.g. user@company.com)</p>
            <p>Password: Any value</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <Input 
                type="email" 
                placeholder="name@company.com" 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <Link to="#" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="remember" className="rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/20" />
              <label htmlFor="remember" className="text-sm text-gray-400">Remember me</label>
            </div>
            <Button type="submit" variant="gradient" className="w-full shadow-lg shadow-indigo-500/20">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t border-white/5 pt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/pricing" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
