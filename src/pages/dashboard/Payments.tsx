import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useClientPayments } from "@/hooks/useClientPayments";
import { CheckCircle2, CreditCard, Download, Landmark, Wallet } from "lucide-react";

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function paymentLabel(method: string) {
  if (method === "upi") return "UPI";
  if (method === "bank_transfer") return "Bank Transfer";
  return "Razorpay";
}

export default function Payments() {
  const { payments, loading, error, usingDemoData } = useClientPayments();

  const totalCompleted = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const lastPayment = payments[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Billing & Payments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor campaign payments, pending invoices, and the overall account billing snapshot.
          </p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo billing mode</Badge>}
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-5 w-5" /> Account Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-3xl font-bold text-white">{formatCurrency(totalCompleted)}</h3>
                <p className="mt-1 text-indigo-200">Total completed payments</p>
                <div className="mt-4 flex items-center gap-2 text-sm text-indigo-300">
                  <CheckCircle2 className="h-4 w-4" />
                  {lastPayment ? `Latest billing activity: ${formatDate(lastPayment.created_at)}` : "No billing activity yet"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="text-indigo-200">Pending</div>
                  <div className="mt-2 text-xl font-semibold text-white">{formatCurrency(totalPending)}</div>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <div className="text-indigo-200">Transactions</div>
                  <div className="mt-2 text-xl font-semibold text-white">{payments.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Preferred Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {payments[0] ? paymentLabel(payments[0].method) : "Razorpay"}
                </p>
                <p className="text-xs text-muted-foreground">Used for the latest recorded transaction</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Landmark className="mr-2 h-4 w-4" /> Manage Billing Preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-muted-foreground">Loading payment records...</td>
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                      <td className="px-6 py-4" />
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No payment records were found for this account.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{payment.description ?? "Campaign Payment"}</div>
                        <div className="text-xs text-muted-foreground">{payment.razorpay_payment_id ?? "Reference generated in dashboard"}</div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{formatDate(payment.created_at)}</td>
                      <td className="px-6 py-4 text-foreground">{paymentLabel(payment.method)}</td>
                      <td className="px-6 py-4 text-foreground">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
