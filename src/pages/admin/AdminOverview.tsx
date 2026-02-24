import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Activity, DollarSign, Users, BarChart3 } from "lucide-react";

export default function AdminOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: "1,240", icon: Users, change: "+12%", trend: "up" },
          { title: "Active Campaigns", value: "854", icon: BarChart3, change: "+5.4%", trend: "up" },
          { title: "Total Revenue", value: "$452,000", icon: DollarSign, change: "+22%", trend: "up" },
          { title: "System Health", value: "99.9%", icon: Activity, change: "Stable", trend: "neutral" },
        ].map((kpi, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{kpi.value}</span>
                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {kpi.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent User Signups */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-white">Recent User Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Acme Corp", email: "contact@acme.com", plan: "Enterprise", status: "Active", date: "2 hours ago" },
                  { name: "John Doe", email: "john@gmail.com", plan: "Basic", status: "Pending", date: "5 hours ago" },
                  { name: "TechStart Inc", email: "admin@techstart.io", plan: "Professional", status: "Active", date: "1 day ago" },
                  { name: "Global Media", email: "info@global.com", plan: "Enterprise", status: "Active", date: "2 days ago" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{row.name}</div>
                        <div className="text-xs text-gray-400">{row.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{row.plan}</td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === 'Active' ? 'success' : 'warning'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
