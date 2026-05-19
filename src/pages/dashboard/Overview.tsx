import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  BrainCircuit,
  DollarSign,
  MousePointerClick,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useClientCampaigns } from "@/hooks/useClientCampaigns";
import {
  analyzeCampaigns,
  enrichCampaign,
  hasGeminiApiKey,
  type CampaignAnalysis,
} from "@/lib/campaignInsights";

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function healthVariant(health: CampaignAnalysis["overallHealth"]) {
  if (health === "strong") return "success";
  if (health === "mixed") return "warning";
  return "destructive";
}

function priorityVariant(priority: "high" | "medium" | "low") {
  if (priority === "high") return "destructive";
  if (priority === "medium") return "warning";
  return "secondary";
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function Overview() {
  const { campaigns, loading, error, usingDemoData } = useClientCampaigns();
  const [analysis, setAnalysis] = useState<CampaignAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const enrichedCampaigns = campaigns.map(enrichCampaign);
  const sortedCampaigns = [...enrichedCampaigns].sort((a, b) => b.performanceScore - a.performanceScore);
  const activeCampaigns = enrichedCampaigns.filter((campaign) => campaign.status === "running").length;
  const totalBudget = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalImpressions = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalConversions = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const blendedConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  const spendChartData = sortedCampaigns.slice(0, 5).map((campaign) => ({
    name: campaign.name.length > 14 ? `${campaign.name.slice(0, 14)}...` : campaign.name,
    budget: campaign.budget,
    spent: campaign.spent,
  }));

  const reachChartData = sortedCampaigns.slice(0, 5).map((campaign) => ({
    name: campaign.name.length > 14 ? `${campaign.name.slice(0, 14)}...` : campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
  }));

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const nextAnalysis = await analyzeCampaigns(campaigns);
    setAnalysis(nextAnalysis);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active Campaigns", value: activeCampaigns.toString(), icon: Activity, helper: "currently running" },
          { title: "Total Budget", value: formatCurrency(totalBudget), icon: DollarSign, helper: "allocated across campaigns" },
          { title: "Blended CTR", value: formatPercent(blendedCtr), icon: MousePointerClick, helper: "clicks from impressions" },
          { title: "Total Conversions", value: totalConversions.toLocaleString(), icon: Target, helper: "captured actions" },
        ].map((kpi, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <kpi.icon className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              {loading ? (
                <>
                  <SkeletonBlock className="mb-2 h-8 w-28" />
                  <SkeletonBlock className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.helper}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6">
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 via-card to-card">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">AI Campaign Insights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Analyze your real Supabase campaign data and turn it into action-ready recommendations.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={hasGeminiApiKey() ? "success" : "secondary"}>
                  {hasGeminiApiKey() ? "Gemini live" : "Built-in AI ready"}
                </Badge>
                {analysis && (
                  <Badge variant={healthVariant(analysis.overallHealth)}>
                    {analysis.overallHealth.replace("-", " ")}
                  </Badge>
                )}
              </div>
            </div>

            <Button
              variant="gradient"
              onClick={() => void handleAnalyze()}
              disabled={loading || analyzing || campaigns.length === 0}
              className="sm:min-w-[220px]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {analyzing ? "Analyzing campaigns..." : "Analyze My Campaigns"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <SkeletonBlock className="h-5 w-48" />
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-24 w-full" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/30 p-6 text-sm text-muted-foreground">
                Create or seed at least one campaign first, then come back here to generate insights.
              </div>
            ) : analysis ? (
              <>
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">Summary</span>
                    <Badge variant={analysis.provider === "gemini" ? "success" : "secondary"}>
                      {analysis.provider === "gemini" ? "Powered by Gemini" : "Built-in insight engine"}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{analysis.summary}</p>
                </div>

                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={`${recommendation.campaign}-${index}`} className="rounded-xl border border-border bg-background/30 p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{recommendation.campaign}</span>
                        <Badge variant={priorityVariant(recommendation.priority)}>
                          {recommendation.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendation.insight}</p>
                      <p className="mt-2 text-sm text-foreground">{recommendation.action}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>Generated on {formatDate(analysis.generatedAt)}</span>
                  {analysis.notice && <span>{analysis.notice}</span>}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-indigo-500/25 bg-indigo-500/5 p-6 text-sm text-muted-foreground">
                Generate tailored recommendations from campaign metrics like CTR, conversion rate, budget utilization, and performance score.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
              </>
            ) : sortedCampaigns.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Campaign rankings will appear here once data is available.
              </div>
            ) : (
              sortedCampaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {campaign.platform} • {campaign.status}
                      </p>
                    </div>
                    <Badge variant={campaign.performanceScore >= 75 ? "success" : campaign.performanceScore >= 55 ? "warning" : "destructive"}>
                      {campaign.performanceScore}/100
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em]">CTR</p>
                      <p className="mt-1 text-foreground">{formatPercent(campaign.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em]">Conversion</p>
                      <p className="mt-1 text-foreground">{formatPercent(campaign.conversionRate)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Budget vs Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <SkeletonBlock className="h-full w-full" />
              ) : spendChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  No budget data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Bar dataKey="budget" fill="#3730a3" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Clicks vs Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loading ? (
                <SkeletonBlock className="h-full w-full" />
              ) : reachChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  No delivery data available yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reachChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Bar dataKey="impressions" fill="#0f766e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="clicks" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">Campaign</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Budget</th>
                  <th className="px-6 py-3">Conversion Rate</th>
                  <th className="px-6 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4"><SkeletonBlock className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><SkeletonBlock className="h-5 w-20" /></td>
                      <td className="px-6 py-4"><SkeletonBlock className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><SkeletonBlock className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><SkeletonBlock className="h-4 w-28" /></td>
                    </tr>
                  ))
                ) : sortedCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No campaigns found for this account yet.
                    </td>
                  </tr>
                ) : (
                  sortedCampaigns.slice(0, 5).map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{campaign.name}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{campaign.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            campaign.status === "running"
                              ? "success"
                              : campaign.status === "pending"
                                ? "warning"
                                : campaign.status === "completed"
                                  ? "secondary"
                                  : "default"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground">{formatCurrency(campaign.budget)}</td>
                      <td className="px-6 py-4 text-foreground">{formatPercent(campaign.conversionRate)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(campaign.updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {!loading && campaigns.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
          {usingDemoData ? "Demo mode snapshot: " : "Campaign portfolio snapshot: "}
          <span className="text-foreground">{totalClicks.toLocaleString()}</span> clicks from{" "}
          <span className="text-foreground">{totalImpressions.toLocaleString()}</span> impressions with a blended conversion rate of{" "}
          <span className="text-foreground">{formatPercent(blendedConversionRate)}</span>.
        </div>
      )}

      {!loading && usingDemoData && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          The dashboard is using built-in demo campaign data right now so your presentation can continue even if the live Supabase response is slow.
        </div>
      )}
    </div>
  );
}
