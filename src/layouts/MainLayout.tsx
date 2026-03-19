import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "Features", href: "/#features" },
    { name: "Services", href: "/#services" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/#about" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 w-full z-50 glass-nav border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">AdPulse AI</span>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/pricing">
                <Button variant="gradient" size="sm">Get Started</Button>
              </Link>
            </div>

            <div className="-mr-2 flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden glass border-b border-border">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Log in</Button>
                </Link>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="gradient" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
                <span className="font-display font-bold text-lg text-foreground">AdPulse AI</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automating digital advertising with the power of artificial intelligence. Scale your campaigns effortlessly.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">Features</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground text-sm">Pricing</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">About</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">Blog</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">Twitter</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">LinkedIn</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground text-sm">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2026 AdPulse AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
