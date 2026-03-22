import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Download, CreditCard, CheckCircle2 } from "lucide-react";

export default function Payments() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Billing & Payments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-3xl font-bold text-white">Professional Plan</h3>
                <p className="text-indigo-200 mt-1">$149.00 / month</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-indigo-300">
                  <CheckCircle2 className="w-4 h-4" /> Next billing date: July 1, 2026
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-indigo-400/30 text-indigo-100 hover:bg-indigo-500/20">Manage Subscription</Button>
                <Button variant="secondary" className="bg-white text-indigo-900 hover:bg-indigo-50">Upgrade Plan</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border mb-4">
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-blue-800">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">•••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/28</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full text-sm">Update Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { id: "INV-2025-001", date: "Jun 1, 2026", amount: "$149.00", status: "Paid" },
                  { id: "INV-2025-002", date: "May 1, 2026", amount: "$149.00", status: "Paid" },
                  { id: "INV-2025-003", date: "Apr 1, 2026", amount: "$149.00", status: "Paid" },
                  { id: "INV-2025-004", date: "Mar 1, 2026", amount: "$149.00", status: "Failed" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.id}</td>
                    <td className="px-6 py-4 text-foreground">{row.date}</td>
                    <td className="px-6 py-4 text-foreground">{row.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={row.status === 'Paid' ? 'success' : 'destructive'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Download className="w-4 h-4 mr-2" /> PDF
                      </Button>
                    </td>
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
