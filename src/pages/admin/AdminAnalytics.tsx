import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { enrichCampaign } from "@/lib/campaignInsights";
import { readInsightHistory } from "@/lib/insightHistory";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#818cf8", "#2dd4bf", "#f59e0b", "#f43f5e", "#38bdf8"];

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function AdminAnalytics() {
  const { campaigns, loading, usingDemoData } = useAdminWorkspace();
  const insightHistory = useMemo(() => readInsightHistory(), []);
  const enrichedCampaigns = campaigns.map(enrichCampaign);

  const statusBreakdown = Object.values(
    enrichedCampaigns.reduce<Record<string, { name: string; value: number }>>((acc, campaign) => {
      acc[campaign.status] = acc[campaign.status] ?? { name: campaign.status, value: 0 };
      acc[campaign.status].value += 1;
      return acc;
    }, {})
  );

  const platformPerformance = Object.values(
    enrichedCampaigns.reduce<Record<string, { name: string; score: number; count: number }>>((acc, campaign) => {
      const current = acc[campaign.platform] ?? { name: campaign.platform, score: 0, count: 0 };
      current.score += campaign.performanceScore;
      current.count += 1;
      acc[campaign.platform] = current;
      return acc;
    }, {})
  ).map((platform) => ({
    name: platform.name,
    score: platform.count > 0 ? Math.round(platform.score / platform.count) : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review cross-account delivery trends and AI insight activity from a single control surface.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo analytics mode</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Average Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="score" fill="#818cf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Campaign Status Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" outerRadius={90}>
                    {statusBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {statusBreakdown.map((status, index) => (
              <div key={status.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="uppercase tracking-[0.16em]">{status.name}</span>
                </div>
                <span className="text-foreground">{status.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Saved AI Insight History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No insight runs have been saved yet. Generate AI insights from a client dashboard to populate this section.
            </div>
          ) : (
            insightHistory.slice(0, 5).map((run) => (
              <div key={run.id} className="rounded-xl border border-border bg-background/30 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={run.provider === "gemini" ? "success" : "secondary"}>{run.provider}</Badge>
                  <Badge variant={run.overallHealth === "strong" ? "success" : run.overallHealth === "mixed" ? "warning" : "destructive"}>
                    {run.overallHealth}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">{run.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-foreground">
                  {run.recommendations.map((recommendation) => (
                    <span key={`${run.id}-${recommendation.campaign}`} className="rounded-full border border-border px-3 py-1">
                      {recommendation.campaign} • {formatPercent(recommendation.priority === "high" ? 100 : recommendation.priority === "medium" ? 66 : 33)}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
