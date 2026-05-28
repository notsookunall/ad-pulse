import type { StoredInsightRun } from "@/lib/insightHistory";

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = value == null ? "" : String(value);
  if (normalized.includes(",") || normalized.includes('"') || normalized.includes("\n")) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

export function exportCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
    .join("\n");

  downloadFile(filename, csv, "text/csv;charset=utf-8;");
}

export function exportJson(filename: string, payload: unknown) {
  downloadFile(filename, JSON.stringify(payload, null, 2), "application/json;charset=utf-8;");
}

export function exportInsightSummaryPdfLike(filename: string, history: StoredInsightRun[]) {
  const text = history
    .map((run, index) => {
      const recommendations = run.recommendations
        .map((recommendation, recommendationIndex) => `${recommendationIndex + 1}. ${recommendation.campaign}: ${recommendation.action}`)
        .join("\n");

      return [
        `Insight Run ${index + 1}`,
        `Generated: ${run.createdAt}`,
        `Provider: ${run.provider}`,
        `Health: ${run.overallHealth}`,
        `Summary: ${run.summary}`,
        "Recommendations:",
        recommendations || "No recommendations available.",
        "",
      ].join("\n");
    })
    .join("\n");

  downloadFile(filename, text, "text/plain;charset=utf-8;");
}
