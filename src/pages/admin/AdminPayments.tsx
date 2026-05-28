import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { useMemo } from "react";

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminPayments() {
  const { profiles, payments, loading, error, usingDemoData } = useAdminWorkspace();
  const profilesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const completedRevenue = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + payment.amount, 0);
  const pendingRevenue = payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Monitoring</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track completed revenue, unresolved billing, and client transaction history in one place.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo billing mode</Badge>}
      </div>

      {error && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "Completed Revenue", value: formatCurrency(completedRevenue), helper: "successful client payments" },
          { title: "Pending Amount", value: formatCurrency(pendingRevenue), helper: "awaiting settlement" },
          { title: "Transactions", value: payments.length.toString(), helper: "payment events recorded" },
        ].map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
              <div className="mt-3 text-2xl font-bold text-foreground">{loading ? "..." : card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Transaction Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => {
                  const owner = profilesById.get(payment.user_id);
                  return (
                    <tr key={payment.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{owner?.full_name ?? "Unknown client"}</div>
                        <div className="text-xs text-muted-foreground">{owner?.email ?? "No email"}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{payment.description ?? "Campaign payment"}</td>
                      <td className="px-6 py-4 text-foreground">{payment.method}</td>
                      <td className="px-6 py-4 text-foreground">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge variant={payment.status === "completed" ? "success" : payment.status === "pending" ? "warning" : "destructive"}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(payment.created_at)}</td>
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
