import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, DollarSign, Users, BarChart3 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface RecentUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  activeCampaigns: number;
  totalRevenue: number;
}

// Format a date string as "X minutes/hours/days ago"
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Skeleton block for loading state
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Run all queries in parallel
        const [usersRes, campaignsRes, revenueRes, recentRes] = await Promise.all([
          // Total users (exclude admin)
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "client"),
          // Active campaigns
          supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "running"),
          // Total completed revenue
          supabase.from("payments").select("amount").eq("status", "completed"),
          // Recent 5 signups
          supabase
            .from("profiles")
            .select("id, full_name, email, role, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        if (usersRes.error) throw usersRes.error;
        if (campaignsRes.error) throw campaignsRes.error;
        if (revenueRes.error) throw revenueRes.error;
        if (recentRes.error) throw recentRes.error;

        const totalRevenue = (revenueRes.data ?? []).reduce(
          (sum, row) => sum + (row.amount ?? 0),
          0
        );

        setStats({
          totalUsers: usersRes.count ?? 0,
          activeCampaigns: campaignsRes.count ?? 0,
          totalRevenue,
        });

        // Filter out admin from recent list
        setRecentUsers(
          (recentRes.data ?? []).filter((u) => u.role !== "admin")
        );
      } catch (err: unknown) {
        console.error("AdminOverview fetch error:", err);
        setError("Failed to load dashboard data. Check your Supabase connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = [
    {
      title: "Total Clients",
      value: stats ? stats.totalUsers.toLocaleString() : "—",
      icon: Users,
      sub: "registered clients",
    },
    {
      title: "Active Campaigns",
      value: stats ? stats.activeCampaigns.toLocaleString() : "—",
      icon: BarChart3,
      sub: "currently running",
    },
    {
      title: "Total Revenue",
      value: stats
        ? `₹${stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
        : "—",
      icon: DollarSign,
      sub: "completed payments",
    },
    {
      title: "System Health",
      value: "99.9%",
      icon: Activity,
      sub: "all systems stable",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent User Signups */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Recent User Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  // Skeleton rows
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-40" />
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-14 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                      No users have signed up yet.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {user.full_name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground capitalize">{user.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant="success">Active</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {timeAgo(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
