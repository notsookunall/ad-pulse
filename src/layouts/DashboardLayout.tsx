import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Zap,
  Megaphone,
  Bell,
  User,
  Users,
  FileText,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ role = "client" }: { role?: "client" | "admin" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const clientLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const adminLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Clients", href: "/admin/clients", icon: Users },
    { name: "Manage Campaigns", href: "/admin/campaigns", icon: Megaphone },
    { name: "Update Analytics", href: "/admin/analytics", icon: Activity },
    { name: "Payment Monitoring", href: "/admin/payments", icon: CreditCard },
    { name: "Reports", href: "/admin/reports", icon: FileText },
  ];

  const links = role === "admin" ? adminLinks : clientLinks;

  const handleLogout = () => {
    // In a real app, clear auth state here
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card/40 border-r border-border hidden md:flex flex-col fixed h-full backdrop-blur-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">AdPulse AI</span>
          </Link>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            {links.find(l => l.href === location.pathname)?.name || "Dashboard"}
          </h1>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{role === 'admin' ? 'Admin User' : 'Alex Johnson'}</p>
                <p className="text-xs text-muted-foreground">{role === 'admin' ? 'Administrator' : 'Premium Plan'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {role === 'admin' ? 'A' : 'AJ'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
