import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { enrichCampaign } from "@/lib/campaignInsights";
import { useMemo, useState } from "react";
import { Megaphone, Search, TrendingUp } from "lucide-react";

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function AdminCampaigns() {
  const { campaigns, profiles, loading, error, usingDemoData } = useAdminWorkspace();
  const [query, setQuery] = useState("");

  const profilesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const enrichedCampaigns = useMemo(() => campaigns.map(enrichCampaign), [campaigns]);
  const filteredCampaigns = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return enrichedCampaigns;

    return enrichedCampaigns.filter((campaign) => {
      const owner = profilesById.get(campaign.user_id);
      return [campaign.name, campaign.platform, campaign.status, owner?.full_name ?? "", owner?.company ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [enrichedCampaigns, profilesById, query]);

  const runningCount = enrichedCampaigns.filter((campaign) => campaign.status === "running").length;
  const averageScore =
    enrichedCampaigns.length > 0
      ? enrichedCampaigns.reduce((sum, campaign) => sum + campaign.performanceScore, 0) / enrichedCampaigns.length
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Campaigns</h2>
          <p className="mt-1 text-sm text-muted-foreground">Monitor performance, ownership, and delivery quality for every campaign across the platform.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo admin data</Badge>}
      </div>

      {error && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "Total Campaigns", value: campaigns.length.toString(), icon: Megaphone, helper: "across all client workspaces" },
          { title: "Running Now", value: runningCount.toString(), icon: TrendingUp, helper: "actively delivering campaigns" },
          { title: "Avg. Performance", value: `${Math.round(averageScore)}/100`, icon: TrendingUp, helper: "cross-portfolio health score" },
        ].map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <card.icon className="h-4 w-4 text-purple-300" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{loading ? "..." : card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-medium text-foreground">Campaign Portfolio</CardTitle>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Spend</th>
                  <th className="px-6 py-4">CTR</th>
                  <th className="px-6 py-4">Conversion</th>
                  <th className="px-6 py-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCampaigns.map((campaign) => {
                  const owner = profilesById.get(campaign.user_id);
                  return (
                    <tr key={campaign.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{campaign.name}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{campaign.platform}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{owner?.full_name ?? "Unknown owner"}</div>
                        <div className="text-xs text-muted-foreground">{owner?.company ?? owner?.email ?? "No company"}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</td>
                      <td className="px-6 py-4 text-foreground">{formatPercent(campaign.ctr)}</td>
                      <td className="px-6 py-4 text-foreground">{formatPercent(campaign.conversionRate)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={campaign.performanceScore >= 75 ? "success" : campaign.performanceScore >= 55 ? "warning" : "destructive"}>
                          {campaign.performanceScore}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
