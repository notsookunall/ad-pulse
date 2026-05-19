import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useClientCampaigns } from "@/hooks/useClientCampaigns";
import { useClientPayments } from "@/hooks/useClientPayments";
import { enrichCampaign } from "@/lib/campaignInsights";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, DollarSign, Target } from "lucide-react";

const pieColors = ["#818cf8", "#2dd4bf", "#f59e0b", "#f43f5e", "#38bdf8"];
type PlatformBreakdown = { name: string; spend: number; conversions: number };

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function Analytics() {
  const { campaigns, loading, usingDemoData } = useClientCampaigns();
  const { payments } = useClientPayments();

  const enrichedCampaigns = campaigns.map(enrichCampaign);
  const totalSpend = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalImpressions = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalConversions = enrichedCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const blendedConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const averageScore =
    enrichedCampaigns.length > 0
      ? enrichedCampaigns.reduce((sum, campaign) => sum + campaign.performanceScore, 0) / enrichedCampaigns.length
      : 0;
  const totalPaid = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const performanceChartData = enrichedCampaigns.map((campaign) => ({
    name: campaign.name.length > 14 ? `${campaign.name.slice(0, 14)}...` : campaign.name,
    score: campaign.performanceScore,
    ctr: campaign.ctr,
  }));

  const platformBreakdown: PlatformBreakdown[] = Object.values(
    enrichedCampaigns.reduce<Record<string, PlatformBreakdown>>((acc, campaign) => {
      const current = acc[campaign.platform] ?? { name: campaign.platform, spend: 0, conversions: 0 };
      current.spend += campaign.spent;
      current.conversions += campaign.conversions;
      acc[campaign.platform] = current;
      return acc;
    }, {} as Record<string, PlatformBreakdown>)
  ) as PlatformBreakdown[];

  const conversionLeaderboard = [...enrichedCampaigns]
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaign Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore campaign efficiency, platform mix, and conversion momentum across your account.
          </p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo analytics mode</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Spend", value: formatCurrency(totalSpend), icon: DollarSign, helper: "campaign delivery cost" },
          { title: "Impressions", value: totalImpressions.toLocaleString(), icon: Activity, helper: "combined audience reach" },
          { title: "Conversions", value: totalConversions.toLocaleString(), icon: Target, helper: "tracked actions" },
          { title: "Avg. Score", value: `${Math.round(averageScore)}/100`, icon: BarChart3, helper: "overall health snapshot" },
        ].map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <card.icon className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              {loading ? (
                <>
                  <SkeletonBlock className="mb-2 h-8 w-24" />
                  <SkeletonBlock className="h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{card.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Performance Score by Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {loading ? (
                <SkeletonBlock className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Bar dataKey="score" fill="#818cf8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Platform Spend Mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[220px] w-full">
              {loading ? (
                <SkeletonBlock className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={platformBreakdown} dataKey="spend" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                      {platformBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-3">
              {platformBreakdown.map((platform, index) => (
                <div key={platform.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                    <span className="uppercase tracking-[0.16em]">{platform.name}</span>
                  </div>
                  <span className="text-foreground">{formatCurrency(platform.spend)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Conversion Leaders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <>
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
              </>
            ) : (
              conversionLeaderboard.map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-foreground">{campaign.name}</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{campaign.platform}</div>
                    </div>
                    <Badge variant={campaign.conversionRate >= 6 ? "success" : campaign.conversionRate >= 3 ? "warning" : "secondary"}>
                      {formatPercent(campaign.conversionRate)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em]">CTR</div>
                      <div className="mt-1 text-foreground">{formatPercent(campaign.ctr)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em]">Conversions</div>
                      <div className="mt-1 text-foreground">{campaign.conversions}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Revenue Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-xl border border-border bg-background/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Completed Payments</div>
              <div className="mt-2 text-3xl font-bold text-foreground">{formatCurrency(totalPaid)}</div>
            </div>
            <div className="rounded-xl border border-border bg-background/30 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Blended Conversion Rate</div>
              <div className="mt-2 text-3xl font-bold text-foreground">{formatPercent(blendedConversionRate)}</div>
            </div>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-muted-foreground">
              Campaign analytics combine real spend, impression, click, and conversion data from Supabase so the AI insight layer has meaningful business context.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
