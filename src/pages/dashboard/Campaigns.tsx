import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Campaigns() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Campaign Management</h2>
        <Button variant="gradient" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." className="pl-10 bg-card border-border" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Export</Button>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4">Performance Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { name: "Summer Sale 2025", status: "Running", budget: "$5,000", score: 92 },
                  { name: "New Product Launch", status: "Pending", budget: "$12,000", score: 0 },
                  { name: "Retargeting Q3", status: "Completed", budget: "$3,500", score: 88 },
                  { name: "Brand Awareness", status: "Running", budget: "$8,000", score: 95 },
                  { name: "Holiday Special", status: "Paused", budget: "$2,000", score: 76 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{row.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        row.status === 'Running' ? 'success' : 
                        row.status === 'Pending' ? 'warning' : 
                        row.status === 'Completed' ? 'secondary' : 'default'
                      }>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-foreground">{row.budget}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${row.score > 90 ? 'bg-emerald-500' : row.score > 70 ? 'bg-indigo-500' : 'bg-gray-500'}`} 
                            style={{ width: `${row.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{row.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Campaign Modal (Simplified as conditional rendering for demo) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg bg-background border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Campaign Name</label>
                <Input placeholder="e.g. Summer Sale 2025" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Budget</label>
                  <Input placeholder="$0.00" type="number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duration (Days)</label>
                  <Input placeholder="30" type="number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Audience</label>
                <Input placeholder="e.g. US, 18-35, Tech Enthusiasts" />
              </div>
            </CardContent>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="gradient" onClick={() => setIsModalOpen(false)}>Launch Campaign</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
