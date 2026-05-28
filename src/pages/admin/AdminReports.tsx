import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAdminWorkspace } from "@/hooks/useAdminWorkspace";
import { exportCsv, exportInsightSummaryPdfLike, exportJson } from "@/lib/exporters";
import { readInsightHistory } from "@/lib/insightHistory";
import { useMemo } from "react";
import { Download, FileDown, FileText } from "lucide-react";

function formatCurrency(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function AdminReports() {
  const { profiles, campaigns, payments, usingDemoData } = useAdminWorkspace();
  const insightHistory = useMemo(() => readInsightHistory(), []);
  const profilesById = useMemo(() => new Map(profiles.map((profile) => [profile.id, profile])), [profiles]);

  const handleExportCampaigns = () => {
    exportCsv(
      "adpulse-campaign-report.csv",
      ["Campaign", "Client", "Platform", "Status", "Budget", "Spent", "Impressions", "Clicks", "Conversions"],
      campaigns.map((campaign) => [
        campaign.name,
        profilesById.get(campaign.user_id)?.full_name ?? "Unknown client",
        campaign.platform,
        campaign.status,
        campaign.budget,
        campaign.spent,
        campaign.impressions,
        campaign.clicks,
        campaign.conversions,
      ])
    );
  };

  const handleExportPayments = () => {
    exportCsv(
      "adpulse-payment-report.csv",
      ["Client", "Description", "Status", "Method", "Amount", "Date"],
      payments.map((payment) => [
        profilesById.get(payment.user_id)?.full_name ?? "Unknown client",
        payment.description ?? "Campaign payment",
        payment.status,
        payment.method,
        payment.amount,
        payment.created_at,
      ])
    );
  };

  const handleExportInsights = () => {
    exportJson("adpulse-ai-insights.json", insightHistory);
  };

  const handleExportSummary = () => {
    exportInsightSummaryPdfLike("adpulse-ai-summary.txt", insightHistory);
  };

  const totalRevenue = payments.filter((payment) => payment.status === "completed").reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Exports</h2>
          <p className="mt-1 text-sm text-muted-foreground">Generate downloadable campaign, billing, and AI insight summaries for presentations and reviews.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo report data</Badge>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: "Clients", value: profiles.filter((profile) => profile.role === "client").length.toString() },
          { title: "Campaigns", value: campaigns.length.toString() },
          { title: "Revenue", value: formatCurrency(totalRevenue) },
        ].map((card, index) => (
          <Card key={index} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
              <div className="mt-3 text-2xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Data Exports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="gradient" className="w-full justify-start" onClick={handleExportCampaigns}>
              <Download className="mr-2 h-4 w-4" /> Export Campaign CSV
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleExportPayments}>
              <FileDown className="mr-2 h-4 w-4" /> Export Payment CSV
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleExportInsights}>
              <FileText className="mr-2 h-4 w-4" /> Export Insight JSON
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleExportSummary}>
              <FileText className="mr-2 h-4 w-4" /> Export AI Summary
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Saved Insight Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insightHistory.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No saved insight runs are available yet. Generate an AI analysis from the client dashboard first.
              </div>
            ) : (
              insightHistory.slice(0, 4).map((run) => (
                <div key={run.id} className="rounded-xl border border-border bg-background/30 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant={run.provider === "gemini" ? "success" : "secondary"}>{run.provider}</Badge>
                    <Badge variant={run.overallHealth === "strong" ? "success" : run.overallHealth === "mixed" ? "warning" : "destructive"}>
                      {run.overallHealth}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{run.summary}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(run.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
