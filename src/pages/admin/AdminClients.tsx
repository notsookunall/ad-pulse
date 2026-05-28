import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { useEffect, useMemo, useState } from "react";
import { Building2, Save, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminClients() {
  const { profiles, campaigns, payments, loading, error, usingDemoData, updateClientProfile } = useAdminWorkspace();
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", company: "", role: "client" as "client" | "admin" });
  const [saveState, setSaveState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [saving, setSaving] = useState(false);

  const clients = useMemo(() => profiles.filter((profile) => profile.role === "client"), [profiles]);
  const filteredClients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return clients;

    return clients.filter((client) =>
      [client.full_name, client.email, client.company ?? ""].join(" ").toLowerCase().includes(normalized)
    );
  }, [clients, query]);

  const campaignsByClient = campaigns.reduce<Record<string, number>>((acc, campaign) => {
    acc[campaign.user_id] = (acc[campaign.user_id] ?? 0) + 1;
    return acc;
  }, {});

  const paymentsByClient = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.user_id] = (acc[payment.user_id] ?? 0) + payment.amount;
    return acc;
  }, {});

  const selectedClient = useMemo(
    () => filteredClients.find((client) => client.id === selectedClientId) ?? filteredClients[0] ?? null,
    [filteredClients, selectedClientId]
  );

  useEffect(() => {
    if (!selectedClientId && filteredClients[0]) {
      setSelectedClientId(filteredClients[0].id);
    }
  }, [filteredClients, selectedClientId]);

  useEffect(() => {
    if (!selectedClient) return;
    setForm({
      fullName: selectedClient.full_name,
      company: selectedClient.company ?? "",
      role: selectedClient.role,
    });
    setSaveState({ error: null, success: null });
  }, [selectedClient?.id]);

  const handleSave = async () => {
    if (!selectedClient) return;

    setSaving(true);
    setSaveState({ error: null, success: null });

    const { error: updateError } = await updateClientProfile(selectedClient.id, {
      full_name: form.fullName.trim(),
      company: form.company.trim() || null,
      role: form.role,
    });

    if (updateError) {
      setSaveState({ error: updateError, success: null });
      setSaving(false);
      return;
    }

    setSaveState({
      error: null,
      success: usingDemoData
        ? "Client details updated in demo mode."
        : "Client details saved to the database.",
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track account ownership, campaign activity, and billing value across all client workspaces.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo admin data</Badge>}
      </div>

      {error && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "Client Accounts", value: clients.length.toString(), icon: Users, helper: "registered client profiles" },
          { title: "Companies", value: clients.filter((client) => client.company).length.toString(), icon: Building2, helper: "profiles with company names" },
          { title: "Active Relationships", value: Object.keys(campaignsByClient).length.toString(), icon: Users, helper: "clients with campaign activity" },
        ].map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <card.icon className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground">{loading ? "..." : card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.9fr]">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Client Directory</CardTitle>
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search clients..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Campaigns</th>
                    <th className="px-6 py-4">Lifetime Billing</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                        selectedClient?.id === client.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{client.full_name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{client.company ?? "Independent"}</td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{campaignsByClient[client.id] ?? 0} campaigns</Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground">${(paymentsByClient[client.id] ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(client.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Edit Client Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedClient ? (
              <>
                <div className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="font-medium text-foreground">{selectedClient.email}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Email is managed by Supabase Auth. Profile details below update the dashboard immediately.
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Client full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company</label>
                  <Input
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    placeholder="Company or brand name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target.value as "client" | "admin",
                      }))
                    }
                    className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                  >
                    <option value="client">client</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campaigns</div>
                    <div className="mt-2 text-xl font-semibold text-foreground">{campaignsByClient[selectedClient.id] ?? 0}</div>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Billing</div>
                    <div className="mt-2 text-xl font-semibold text-foreground">
                      ${(paymentsByClient[selectedClient.id] ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {saveState.error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {saveState.error}
                  </div>
                )}

                {saveState.success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    {saveState.success}
                  </div>
                )}

                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-100">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck className="h-4 w-4" /> Admin control
                  </div>
                  <p className="mt-2 text-indigo-100/90">
                    Changes saved here update the client profile record used across the dashboard, admin workspace, and messaging flows.
                  </p>
                </div>

                <Button variant="gradient" className="w-full" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving Changes..." : "Save Client Changes"}
                </Button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Select a client from the directory to edit their profile details.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
