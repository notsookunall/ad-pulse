import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Plus, RefreshCcw, Search } from "lucide-react";
import { useClientCampaigns } from "@/hooks/useClientCampaigns";
import { enrichCampaign } from "@/lib/campaignInsights";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Database } from "@/lib/database.types";

const platforms: Array<Database["public"]["Tables"]["campaigns"]["Row"]["platform"]> = [
  "google",
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
];

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "Not scheduled";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Campaigns() {
  const { user } = useAuth();
  const { campaigns, loading, error, usingDemoData, refreshCampaigns } = useClientCampaigns();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    platform: "google" as Database["public"]["Tables"]["campaigns"]["Row"]["platform"],
    budget: "",
    duration: "30",
  });

  const filteredCampaigns = campaigns
    .map(enrichCampaign)
    .filter((campaign) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;

      return (
        campaign.name.toLowerCase().includes(query) ||
        campaign.platform.toLowerCase().includes(query) ||
        campaign.status.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

  const handleCreateCampaign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const budget = Number(form.budget);
    const duration = Number(form.duration);

    if (!form.name.trim()) {
      setSubmitError("Campaign name is required.");
      return;
    }

    if (!Number.isFinite(budget) || budget < 0) {
      setSubmitError("Budget must be a valid positive number.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setSubmitError("Duration must be at least 1 day.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);

    const newCampaign: Database["public"]["Tables"]["campaigns"]["Insert"] = {
      user_id: user.id,
      name: form.name.trim(),
      platform: form.platform,
      status: "draft",
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    };

    // Generated types are slightly out of sync with the typed client here, so we cast for the insert only.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from("campaigns") as any).insert(newCampaign);

    if (insertError) {
      console.error("Failed to create campaign:", insertError);
      setSubmitError(insertError.message || "Failed to create campaign.");
      setIsSubmitting(false);
      return;
    }

    setForm({
      name: "",
      platform: "google",
      budget: "",
      duration: "30",
    });
    setIsModalOpen(false);
    setIsSubmitting(false);
    await refreshCampaigns();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Campaign Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the live campaign dataset that feeds the AI insights on your dashboard.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      {usingDemoData && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          Demo campaign data is being shown because the live Supabase response was slow. You can still use this view for your project presentation.
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by campaign, platform, or status..."
            className="pl-10 bg-card border-border"
          />
        </div>
        <Button variant="outline" onClick={() => void refreshCampaigns()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-4">Campaign</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Spent</th>
                  <th className="px-6 py-4">CTR</th>
                  <th className="px-6 py-4">Conversion Rate</th>
                  <th className="px-6 py-4">Performance Score</th>
                  <th className="px-6 py-4">Schedule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-muted-foreground">Loading campaign data...</td>
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                    </tr>
                  ))
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                      No campaigns matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
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
                      <td className="px-6 py-4 text-foreground">{formatCurrency(campaign.spent)}</td>
                      <td className="px-6 py-4 text-foreground">{formatPercent(campaign.ctr)}</td>
                      <td className="px-6 py-4 text-foreground">{formatPercent(campaign.conversionRate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={
                                campaign.performanceScore >= 75
                                  ? "h-full rounded-full bg-emerald-500"
                                  : campaign.performanceScore >= 55
                                    ? "h-full rounded-full bg-amber-500"
                                    : "h-full rounded-full bg-red-500"
                              }
                              style={{ width: `${campaign.performanceScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{campaign.performanceScore}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateCampaign}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Campaign Name</label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="e.g. Summer Sale 2026"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          platform: event.target.value as Database["public"]["Tables"]["campaigns"]["Row"]["platform"],
                        }))
                      }
                      className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                    >
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Budget</label>
                    <Input
                      value={form.budget}
                      onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
                      placeholder="5000"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duration (Days)</label>
                  <Input
                    value={form.duration}
                    onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
                    placeholder="30"
                    type="number"
                    min="1"
                  />
                </div>

                <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                  New campaigns are created as <span className="text-foreground">draft</span> entries so you can show real dashboard data without needing a full ad-platform integration.
                </div>

                {submitError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="gradient" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
