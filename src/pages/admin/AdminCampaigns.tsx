import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { enrichCampaign } from "@/lib/campaignInsights";
import { useEffect, useMemo, useState } from "react";
import { Filter, Megaphone, Plus, Save, Search, TrendingUp, Users } from "lucide-react";
import type { Campaign, Database } from "@/lib/database.types";

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function AdminCampaigns() {
  const { campaigns, profiles, loading, error, usingDemoData, updateCampaign, createCampaign } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [clientFilterId, setClientFilterId] = useState("all");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saveState, setSaveState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [createState, setCreateState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [form, setForm] = useState({
    userId: "",
    name: "",
    platform: "google" as Campaign["platform"],
    status: "draft" as Campaign["status"],
    budget: "0",
    spent: "0",
    impressions: "0",
    clicks: "0",
    conversions: "0",
  });
  const [createForm, setCreateForm] = useState({
    userId: "",
    name: "",
    platform: "google" as Database["public"]["Tables"]["campaigns"]["Row"]["platform"],
    budget: "",
    duration: "30",
  });

  const clientProfiles = useMemo(() => profiles.filter((profile) => profile.role === "client"), [profiles]);
  const profilesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const enrichedCampaigns = useMemo(() => campaigns.map(enrichCampaign), [campaigns]);
  const filteredCampaigns = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const baseCampaigns =
      clientFilterId === "all" ? enrichedCampaigns : enrichedCampaigns.filter((campaign) => campaign.user_id === clientFilterId);

    if (!normalized) return baseCampaigns;

    return baseCampaigns.filter((campaign) => {
      const owner = profilesById.get(campaign.user_id);
      return [campaign.name, campaign.platform, campaign.status, owner?.full_name ?? "", owner?.company ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [clientFilterId, enrichedCampaigns, profilesById, query]);

  const selectedCampaign = useMemo(
    () => filteredCampaigns.find((campaign) => campaign.id === selectedCampaignId) ?? filteredCampaigns[0] ?? null,
    [filteredCampaigns, selectedCampaignId]
  );
  const selectedOwner = selectedCampaign ? profilesById.get(selectedCampaign.user_id) ?? null : null;
  const assignedClient = form.userId ? profilesById.get(form.userId) ?? null : null;

  useEffect(() => {
    if ((!selectedCampaignId || !filteredCampaigns.some((campaign) => campaign.id === selectedCampaignId)) && filteredCampaigns[0]) {
      setSelectedCampaignId(filteredCampaigns[0].id);
    }
  }, [filteredCampaigns, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaign) return;
    setForm({
      userId: selectedCampaign.user_id,
      name: selectedCampaign.name,
      platform: selectedCampaign.platform,
      status: selectedCampaign.status,
      budget: String(selectedCampaign.budget),
      spent: String(selectedCampaign.spent),
      impressions: String(selectedCampaign.impressions),
      clicks: String(selectedCampaign.clicks),
      conversions: String(selectedCampaign.conversions),
    });
    setSaveState({ error: null, success: null });
  }, [selectedCampaign]);

  useEffect(() => {
    const defaultClientId = clientFilterId !== "all" ? clientFilterId : clientProfiles[0]?.id ?? "";
    setCreateForm((current) => ({
      ...current,
      userId: current.userId || defaultClientId,
    }));
  }, [clientFilterId, clientProfiles]);

  const runningCount = enrichedCampaigns.filter((campaign) => campaign.status === "running").length;
  const activeClients = new Set(enrichedCampaigns.map((campaign) => campaign.user_id)).size;
  const averageScore =
    enrichedCampaigns.length > 0
      ? enrichedCampaigns.reduce((sum, campaign) => sum + campaign.performanceScore, 0) / enrichedCampaigns.length
      : 0;

  const handleSave = async () => {
    if (!selectedCampaign) return;

    setSaving(true);
    setSaveState({ error: null, success: null });

    const numericFields = {
      budget: Number(form.budget),
      spent: Number(form.spent),
      impressions: Number(form.impressions),
      clicks: Number(form.clicks),
      conversions: Number(form.conversions),
    };

    if (!form.name.trim()) {
      setSaveState({ error: "Campaign name is required.", success: null });
      setSaving(false);
      return;
    }

    if (!form.userId) {
      setSaveState({ error: "Choose a client before saving this campaign.", success: null });
      setSaving(false);
      return;
    }

    if (Object.values(numericFields).some((value) => Number.isNaN(value) || value < 0)) {
      setSaveState({ error: "Delivery values must be valid non-negative numbers.", success: null });
      setSaving(false);
      return;
    }

    const { error: updateError } = await updateCampaign(selectedCampaign.id, {
      user_id: form.userId,
      name: form.name.trim(),
      platform: form.platform,
      status: form.status,
      ...numericFields,
    });

    if (updateError) {
      setSaveState({ error: updateError, success: null });
      setSaving(false);
      return;
    }

    setSaveState({
      error: null,
      success: usingDemoData ? "Campaign updated in demo mode." : "Campaign changes saved to the database.",
    });
    setSaving(false);
  };

  const handleCreateCampaign = async () => {
    setCreating(true);
    setCreateState({ error: null, success: null });

    const budget = Number(createForm.budget);
    const duration = Number(createForm.duration);

    if (!createForm.userId) {
      setCreateState({ error: "Choose a client for the new campaign.", success: null });
      setCreating(false);
      return;
    }

    if (!createForm.name.trim()) {
      setCreateState({ error: "Campaign name is required.", success: null });
      setCreating(false);
      return;
    }

    if (!Number.isFinite(budget) || budget < 0) {
      setCreateState({ error: "Budget must be a valid non-negative number.", success: null });
      setCreating(false);
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      setCreateState({ error: "Duration must be at least 1 day.", success: null });
      setCreating(false);
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);

    const { error: createError, campaign: createdCampaign } = await createCampaign({
      user_id: createForm.userId,
      name: createForm.name.trim(),
      platform: createForm.platform,
      status: "draft",
      budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
    });

    if (createError) {
      setCreateState({ error: createError, success: null });
      setCreating(false);
      return;
    }

    if (createdCampaign) {
      setSelectedCampaignId(createdCampaign.id);
      setClientFilterId(createdCampaign.user_id);
    }

    setCreateForm({
      userId: createForm.userId,
      name: "",
      platform: "google",
      budget: "",
      duration: "30",
    });
    setCreateState({
      error: null,
      success: usingDemoData ? "Campaign created in demo mode." : "Campaign created successfully.",
    });
    setIsCreateOpen(false);
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Campaigns</h2>
          <p className="mt-1 text-sm text-muted-foreground">Monitor performance, ownership, and delivery quality for every campaign across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          {usingDemoData && <Badge variant="secondary">Demo admin data</Badge>}
          <Button variant="gradient" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Campaigns", value: campaigns.length.toString(), icon: Megaphone, helper: "across all client workspaces" },
          { title: "Running Now", value: runningCount.toString(), icon: TrendingUp, helper: "actively delivering campaigns" },
          { title: "Active Clients", value: activeClients.toString(), icon: Users, helper: "clients currently assigned campaigns" },
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

      {isCreateOpen && (
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-medium text-foreground">Create Campaign</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Add a new campaign for any existing client, then manage it from this page.</p>
            </div>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Client</label>
                <select
                  value={createForm.userId}
                  onChange={(event) => setCreateForm((current) => ({ ...current, userId: event.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                >
                  <option value="">Select client</option>
                  {clientProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name} {profile.company ? `- ${profile.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Platform</label>
                <select
                  value={createForm.platform}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      platform: event.target.value as Database["public"]["Tables"]["campaigns"]["Row"]["platform"],
                    }))
                  }
                  className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                >
                  {["google", "facebook", "instagram", "linkedin", "twitter"].map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Campaign Name</label>
              <Input
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="e.g. Raj Summer Sale 2026"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Budget</label>
                <Input
                  type="number"
                  min="0"
                  value={createForm.budget}
                  onChange={(event) => setCreateForm((current) => ({ ...current, budget: event.target.value }))}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Duration (Days)</label>
                <Input
                  type="number"
                  min="1"
                  value={createForm.duration}
                  onChange={(event) => setCreateForm((current) => ({ ...current, duration: event.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>

            {createState.error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{createState.error}</div>}
            {createState.success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{createState.success}</div>}

            <div className="flex justify-end">
              <Button variant="gradient" onClick={handleCreateCampaign} disabled={creating}>
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Creating Campaign..." : "Create Campaign"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border bg-card">
        <CardContent className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Client workspace filter
            </div>
            <p className="text-sm text-muted-foreground">
              Pick a client to view only their campaigns, or leave it on all clients to reassign ownership across accounts.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Show campaigns for</label>
            <select
              value={clientFilterId}
              onChange={(event) => setClientFilterId(event.target.value)}
              className="flex h-11 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
            >
              <option value="all">All clients</option>
              {clientProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name} {profile.company ? `- ${profile.company}` : ""}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Campaign Portfolio</CardTitle>
            <div className="relative w-full sm:max-w-md">
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
                      <tr
                        key={campaign.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                          selectedCampaign?.id === campaign.id ? "bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedCampaignId(campaign.id)}
                      >
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
                  {filteredCampaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No campaigns are assigned to this client yet. Switch to All clients and reassign an existing campaign to them.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Edit Campaign</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedCampaign ? (
              <>
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-indigo-200/80">Current ownership</div>
                  <div className="mt-2 text-base font-semibold text-indigo-50">{selectedOwner?.full_name ?? "Unknown client"}</div>
                  <div className="text-sm text-indigo-100/80">{selectedOwner?.company ?? selectedOwner?.email ?? "No company assigned"}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assigned Client</label>
                  <select
                    value={form.userId}
                    onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                  >
                    {clientProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.full_name} {profile.company ? `- ${profile.company}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Move this campaign to any existing client profile and the admin/client dashboards will reflect the new owner.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-background/30 p-4 text-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Will be assigned to</div>
                  <div className="mt-2 text-base font-semibold text-foreground">{assignedClient?.full_name ?? "Select a client"}</div>
                  <div className="text-sm text-muted-foreground">{assignedClient?.company ?? assignedClient?.email ?? "No company assigned"}</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Campaign Name</label>
                  <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value as Campaign["platform"] }))}
                      className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                    >
                      {["google", "facebook", "instagram", "linkedin", "twitter"].map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Campaign["status"] }))}
                      className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                    >
                      {["draft", "pending", "running", "paused", "completed"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Budget", key: "budget" },
                    { label: "Spent", key: "spent" },
                    { label: "Impressions", key: "impressions" },
                    { label: "Clicks", key: "clicks" },
                    { label: "Conversions", key: "conversions" },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-sm font-medium text-foreground">{field.label}</label>
                      <Input
                        type="number"
                        value={form[field.key as keyof typeof form]}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                {saveState.error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{saveState.error}</div>}
                {saveState.success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{saveState.success}</div>}

                <Button variant="gradient" className="w-full" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving Campaign..." : "Save Campaign Changes"}
                </Button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Select a campaign to edit delivery values and budget settings.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
