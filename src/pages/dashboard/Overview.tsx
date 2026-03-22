import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRight, BarChart3, DollarSign, MousePointerClick, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const performanceData = [
  { name: "Mon", value: 4000 },
  { name: "Tue", value: 3000 },
  { name: "Wed", value: 2000 },
  { name: "Thu", value: 2780 },
  { name: "Fri", value: 1890 },
  { name: "Sat", value: 2390 },
  { name: "Sun", value: 3490 },
];

const clicksData = [
  { name: "Mon", clicks: 2400, impressions: 4000 },
  { name: "Tue", clicks: 1398, impressions: 3000 },
  { name: "Wed", clicks: 9800, impressions: 2000 },
  { name: "Thu", clicks: 3908, impressions: 2780 },
  { name: "Fri", clicks: 4800, impressions: 1890 },
  { name: "Sat", clicks: 3800, impressions: 2390 },
  { name: "Sun", clicks: 4300, impressions: 3490 },
];

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Campaigns", value: "12", icon: BarChart3, change: "+2.5%", trend: "up" },
          { title: "Total Budget", value: "$12,450", icon: DollarSign, change: "+12%", trend: "up" },
          { title: "Conversion Rate", value: "3.2%", icon: TrendingUp, change: "-0.4%", trend: "down" },
          { title: "ROI", value: "245%", icon: ArrowUpRight, change: "+18%", trend: "up" },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {kpi.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Clicks vs Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clicksData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="impressions" fill="#3730a3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">Campaign Name</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Summer Sale 2025", status: "Running", budget: "$5,000", date: "2 mins ago" },
                  { name: "New Product Launch", status: "Pending", budget: "$12,000", date: "1 hour ago" },
                  { name: "Retargeting Q3", status: "Completed", budget: "$3,500", date: "Yesterday" },
                  { name: "Brand Awareness", status: "Running", budget: "$8,000", date: "2 days ago" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === 'Running' ? 'success' : row.status === 'Pending' ? 'warning' : 'secondary'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-foreground">{row.budget}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.date}</td>
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
