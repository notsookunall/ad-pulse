import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import type { Payment } from "@/lib/database.types";

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

function paymentMethodLabel(method: Payment["method"]) {
  if (method === "upi") return "UPI";
  if (method === "bank_transfer") return "Bank Transfer";
  return "Card";
}

export default function AdminPayments() {
  const { profiles, payments, loading, error, usingDemoData, updatePayment } = useAdminWorkspace();
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });
  const [form, setForm] = useState({
    status: "pending" as Payment["status"],
    method: "razorpay" as Payment["method"],
    amount: "0",
    description: "",
  });

  const profilesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const completedRevenue = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + payment.amount, 0);
  const pendingRevenue = payments.filter((payment) => payment.status === "pending").reduce((sum, payment) => sum + payment.amount, 0);
  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) ?? payments[0] ?? null;

  useEffect(() => {
    if ((!selectedPaymentId || !payments.some((payment) => payment.id === selectedPaymentId)) && payments[0]) {
      setSelectedPaymentId(payments[0].id);
    }
  }, [payments, selectedPaymentId]);

  useEffect(() => {
    if (!selectedPayment) return;
    setForm({
      status: selectedPayment.status,
      method: selectedPayment.method,
      amount: String(selectedPayment.amount),
      description: selectedPayment.description ?? "",
    });
    setSaveState({ error: null, success: null });
  }, [selectedPayment]);

  const handleSave = async () => {
    if (!selectedPayment) return;
    setSaving(true);
    setSaveState({ error: null, success: null });

    const nextAmount = Number(form.amount);
    if (!form.description.trim()) {
      setSaveState({ error: "Payment description is required.", success: null });
      setSaving(false);
      return;
    }

    if (Number.isNaN(nextAmount) || nextAmount < 0) {
      setSaveState({ error: "Amount must be a valid non-negative number.", success: null });
      setSaving(false);
      return;
    }

    const { error: updateError } = await updatePayment(selectedPayment.id, {
      status: form.status,
      method: form.method,
      amount: nextAmount,
      description: form.description.trim(),
    });

    if (updateError) {
      setSaveState({ error: updateError, success: null });
      setSaving(false);
      return;
    }

    setSaveState({
      error: null,
      success: usingDemoData ? "Payment updated in demo mode." : "Payment record saved to the database.",
    });
    setSaving(false);
  };

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.9fr]">
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
                      <tr
                        key={payment.id}
                        className={`cursor-pointer transition-colors hover:bg-muted/40 ${
                          selectedPayment?.id === payment.id ? "bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedPaymentId(payment.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{owner?.full_name ?? "Unknown client"}</div>
                          <div className="text-xs text-muted-foreground">{owner?.email ?? "No email"}</div>
                        </td>
                        <td className="px-6 py-4 text-foreground">{payment.description ?? "Campaign payment"}</td>
                        <td className="px-6 py-4 text-foreground">{paymentMethodLabel(payment.method)}</td>
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

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Edit Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPayment ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as Payment["status"] }))}
                      className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                    >
                      {["pending", "completed", "failed", "refunded"].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Method</label>
                    <select
                      value={form.method}
                      onChange={(event) => setForm((current) => ({ ...current, method: event.target.value as Payment["method"] }))}
                      className="flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring"
                    >
                      {["razorpay", "bank_transfer", "upi"].map((method) => (
                        <option key={method} value={method}>
                          {paymentMethodLabel(method as Payment["method"])}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <Input type="number" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
                </div>

                {saveState.error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{saveState.error}</div>}
                {saveState.success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{saveState.success}</div>}

                <Button variant="gradient" className="w-full" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving Payment..." : "Save Payment Changes"}
                </Button>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Select a payment record to edit billing details and status.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
