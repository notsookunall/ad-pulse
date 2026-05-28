import type { CampaignAnalysis } from "@/lib/campaignInsights";
import type { Campaign } from "@/lib/database.types";

const STORAGE_KEY = "adpulse-ai-insight-history";

export interface StoredInsightRun {
  id: string;
  createdAt: string;
  provider: CampaignAnalysis["provider"];
  overallHealth: CampaignAnalysis["overallHealth"];
  summary: string;
  recommendations: CampaignAnalysis["recommendations"];
  campaignCount: number;
  topCampaigns: Array<{
    name: string;
    platform: Campaign["platform"];
    budget: number;
    conversions: number;
  }>;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readInsightHistory(): StoredInsightRun[] {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredInsightRun[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read insight history:", error);
    return [];
  }
}

export function writeInsightHistory(history: StoredInsightRun[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function saveInsightRun(analysis: CampaignAnalysis, campaigns: Campaign[]) {
  const nextRun: StoredInsightRun = {
    id: `insight-${Date.now()}`,
    createdAt: analysis.generatedAt,
    provider: analysis.provider,
    overallHealth: analysis.overallHealth,
    summary: analysis.summary,
    recommendations: analysis.recommendations,
    campaignCount: campaigns.length,
    topCampaigns: campaigns.slice(0, 3).map((campaign) => ({
      name: campaign.name,
      platform: campaign.platform,
      budget: campaign.budget,
      conversions: campaign.conversions,
    })),
  };

  const history = readInsightHistory();
  const nextHistory = [nextRun, ...history].slice(0, 10);
  writeInsightHistory(nextHistory);
  return nextHistory;
}

export function clearInsightHistory() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
