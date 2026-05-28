import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { useMemo, useState } from "react";
import { Building2, Search, Users } from "lucide-react";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminClients() {
  const { profiles, campaigns, payments, loading, error, usingDemoData } = useAdminWorkspace();
  const [query, setQuery] = useState("");

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
                  <tr key={client.id} className="transition-colors hover:bg-muted/40">
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
    </div>
  );
}
