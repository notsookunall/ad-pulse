import type { Campaign } from "@/lib/database.types";

export type InsightPriority = "high" | "medium" | "low";
export type InsightProvider = "gemini" | "local";
export type CampaignHealth = "strong" | "mixed" | "needs-attention";

export interface CampaignWithMetrics extends Campaign {
  ctr: number;
  conversionRate: number;
  budgetUtilization: number;
  costPerClick: number | null;
  costPerConversion: number | null;
  performanceScore: number;
}

export interface CampaignRecommendation {
  campaign: string;
  priority: InsightPriority;
  insight: string;
  action: string;
}

export interface CampaignAnalysis {
  provider: InsightProvider;
  overallHealth: CampaignHealth;
  summary: string;
  recommendations: CampaignRecommendation[];
  generatedAt: string;
  notice?: string;
}

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function percent(part: number, whole: number) {
  if (!whole) return 0;
  return (part / whole) * 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatPercent(value: number) {
  return `${round(value)}%`;
}

export function hasGeminiApiKey() {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

export function enrichCampaign(campaign: Campaign): CampaignWithMetrics {
  const ctr = percent(campaign.clicks, campaign.impressions);
  const conversionRate = percent(campaign.conversions, campaign.clicks);
  const budgetUtilization = percent(campaign.spent, campaign.budget);
  const costPerClick = campaign.clicks > 0 ? campaign.spent / campaign.clicks : null;
  const costPerConversion = campaign.conversions > 0 ? campaign.spent / campaign.conversions : null;

  const score =
    ctr * 10 +
    conversionRate * 7 +
    clamp(100 - Math.abs(75 - budgetUtilization), 15, 100) * 0.2 +
    (campaign.status === "running" ? 12 : campaign.status === "completed" ? 8 : 4);

  return {
    ...campaign,
    ctr: round(ctr),
    conversionRate: round(conversionRate),
    budgetUtilization: round(budgetUtilization),
    costPerClick: costPerClick === null ? null : round(costPerClick),
    costPerConversion: costPerConversion === null ? null : round(costPerConversion),
    performanceScore: Math.round(clamp(score, 0, 100)),
  };
}

function deriveHealth(score: number): CampaignHealth {
  if (score >= 78) return "strong";
  if (score >= 55) return "mixed";
  return "needs-attention";
}

function buildAggregateSummary(campaigns: CampaignWithMetrics[]) {
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0);
  const totalImpressions = campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0);
  const totalClicks = campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0);
  const totalConversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
  const averageScore =
    campaigns.length > 0
      ? campaigns.reduce((sum, campaign) => sum + campaign.performanceScore, 0) / campaigns.length
      : 0;

  const sortedByScore = [...campaigns].sort((a, b) => b.performanceScore - a.performanceScore);

  return {
    totalBudget: round(totalBudget),
    totalSpent: round(totalSpent),
    totalImpressions,
    totalClicks,
    totalConversions,
    blendedCtr: round(percent(totalClicks, totalImpressions)),
    blendedConversionRate: round(percent(totalConversions, totalClicks)),
    averageScore: round(averageScore),
    topCampaign: sortedByScore[0] ?? null,
    lowestCampaign: sortedByScore[sortedByScore.length - 1] ?? null,
  };
}

function dedupeRecommendations(recommendations: CampaignRecommendation[]) {
  const seen = new Set<string>();

  return recommendations.filter((recommendation) => {
    const key = `${recommendation.campaign}-${recommendation.priority}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateLocalCampaignAnalysis(campaigns: Campaign[]): CampaignAnalysis {
  const enriched = campaigns.map(enrichCampaign);
  const aggregate = buildAggregateSummary(enriched);

  if (enriched.length === 0) {
    return {
      provider: "local",
      overallHealth: "needs-attention",
      summary: "No campaign data is available yet, so there is nothing to analyze.",
      recommendations: [],
      generatedAt: new Date().toISOString(),
      notice: "Create or seed at least one campaign to unlock AI recommendations.",
    };
  }

  const recommendations: CampaignRecommendation[] = [];

  const lowEfficiency = [...enriched]
    .filter((campaign) => campaign.impressions >= 10000 && campaign.conversionRate < 2 && campaign.status === "running")
    .sort((a, b) => a.conversionRate - b.conversionRate)[0];

  if (lowEfficiency) {
    recommendations.push({
      campaign: lowEfficiency.name,
      priority: "high",
      insight: `${lowEfficiency.platform} is generating reach with ${lowEfficiency.impressions.toLocaleString()} impressions, but the conversion rate is only ${formatPercent(lowEfficiency.conversionRate)}.`,
      action: "Tighten audience targeting and align the landing page copy with the ad message before scaling more budget.",
    });
  }

  const strongPerformer = [...enriched]
    .filter((campaign) => campaign.status === "running" && campaign.performanceScore >= 75)
    .sort((a, b) => b.performanceScore - a.performanceScore)[0];

  if (strongPerformer) {
    recommendations.push({
      campaign: strongPerformer.name,
      priority: "medium",
      insight: `${strongPerformer.platform} is the strongest active campaign with a ${formatPercent(strongPerformer.conversionRate)} conversion rate and a performance score of ${strongPerformer.performanceScore}.`,
      action: "Test a modest budget increase and reuse its messaging as a benchmark for weaker campaigns.",
    });
  }

  const dormantCampaign = [...enriched]
    .filter((campaign) => (campaign.status === "draft" || campaign.status === "pending") && campaign.impressions === 0)
    .sort((a, b) => b.budget - a.budget)[0];

  if (dormantCampaign) {
    recommendations.push({
      campaign: dormantCampaign.name,
      priority: "medium",
      insight: `${dormantCampaign.name} has a budget of $${dormantCampaign.budget.toLocaleString()} but has not started collecting delivery data yet.`,
      action: "Launch a small test variant first so the dashboard can capture enough clicks and conversions for future optimization.",
    });
  }

  const overspendRisk = [...enriched]
    .filter((campaign) => campaign.budget > 0 && campaign.budgetUtilization >= 85 && campaign.status === "running")
    .sort((a, b) => b.budgetUtilization - a.budgetUtilization)[0];

  if (overspendRisk) {
    recommendations.push({
      campaign: overspendRisk.name,
      priority: "low",
      insight: `${overspendRisk.name} has already used ${formatPercent(overspendRisk.budgetUtilization)} of its allocated budget.`,
      action: "Review spend pacing and refresh creatives if performance is flattening to avoid wasting the final stretch of budget.",
    });
  }

  const finalRecommendations = dedupeRecommendations(recommendations).slice(0, 3);
  const overallHealth = deriveHealth(aggregate.averageScore);
  const topCampaignLine = aggregate.topCampaign
    ? `${aggregate.topCampaign.name} is currently the strongest performer at ${formatPercent(aggregate.topCampaign.conversionRate)} conversion rate.`
    : "No clear top performer is available yet.";
  const weakestLine = aggregate.lowestCampaign
    ? `${aggregate.lowestCampaign.name} needs the most attention with a score of ${aggregate.lowestCampaign.performanceScore}.`
    : "";

  return {
    provider: "local",
    overallHealth,
    summary: `Across ${campaigns.length} campaigns, the blended CTR is ${formatPercent(aggregate.blendedCtr)} and the blended conversion rate is ${formatPercent(aggregate.blendedConversionRate)}. ${topCampaignLine} ${weakestLine}`.trim(),
    recommendations: finalRecommendations,
    generatedAt: new Date().toISOString(),
    notice: hasGeminiApiKey()
      ? "Gemini was unavailable for this request, so the built-in insight engine generated this analysis."
      : "This analysis was generated by the built-in insight engine for the current session.",
  };
}

function buildPromptPayload(campaigns: CampaignWithMetrics[]) {
  const aggregate = buildAggregateSummary(campaigns);

  return {
    overview: {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((campaign) => campaign.status === "running").length,
      totalBudget: aggregate.totalBudget,
      totalSpent: aggregate.totalSpent,
      blendedCtr: aggregate.blendedCtr,
      blendedConversionRate: aggregate.blendedConversionRate,
      averagePerformanceScore: aggregate.averageScore,
    },
    campaigns: campaigns.map((campaign) => ({
      name: campaign.name,
      platform: campaign.platform,
      status: campaign.status,
      budget: campaign.budget,
      spent: campaign.spent,
      impressions: campaign.impressions,
      clicks: campaign.clicks,
      conversions: campaign.conversions,
      ctr: campaign.ctr,
      conversionRate: campaign.conversionRate,
      budgetUtilization: campaign.budgetUtilization,
      costPerClick: campaign.costPerClick,
      costPerConversion: campaign.costPerConversion,
      performanceScore: campaign.performanceScore,
    })),
  };
}

function parseJsonBlock(text: string) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return JSON.parse(objectMatch[0]);
  }

  throw new Error("Model response did not contain valid JSON.");
}

function normalizePriority(value: string | undefined): InsightPriority {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function normalizeHealth(value: string | undefined): CampaignHealth {
  if (value === "strong" || value === "mixed" || value === "needs-attention") return value;
  return "mixed";
}

async function generateGeminiCampaignAnalysis(campaigns: Campaign[]): Promise<CampaignAnalysis> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key.");
  }

  const campaignData = campaigns.map(enrichCampaign);
  const payload = buildPromptPayload(campaignData);

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "You are an advertising analyst helping a college project dashboard.",
                "Analyze the following campaign metrics and return JSON only.",
                "Schema:",
                '{"overallHealth":"strong|mixed|needs-attention","summary":"string","recommendations":[{"campaign":"string","priority":"high|medium|low","insight":"string","action":"string"}]}',
                "Rules:",
                "- Mention exact metrics where relevant.",
                "- Keep summary under 60 words.",
                "- Return exactly 3 recommendations when enough data exists.",
                "- Be practical, specific, and non-hype.",
                "",
                JSON.stringify(payload, null, 2),
              ].join("\n"),
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const data = await response.json();
  const modelText = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text ?? "")
    .join("")
    .trim();

  if (!modelText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = parseJsonBlock(modelText) as {
    overallHealth?: string;
    summary?: string;
    recommendations?: Array<{
      campaign?: string;
      priority?: string;
      insight?: string;
      action?: string;
    }>;
  };

  return {
    provider: "gemini",
    overallHealth: normalizeHealth(parsed.overallHealth),
    summary: parsed.summary?.trim() || "Gemini analyzed the campaign portfolio and produced concise recommendations.",
    recommendations: (parsed.recommendations ?? [])
      .filter((item) => item.campaign && item.insight && item.action)
      .slice(0, 3)
      .map((item) => ({
        campaign: item.campaign!,
        priority: normalizePriority(item.priority),
        insight: item.insight!,
        action: item.action!,
      })),
    generatedAt: new Date().toISOString(),
  };
}

export async function analyzeCampaigns(campaigns: Campaign[]): Promise<CampaignAnalysis> {
  if (!campaigns.length) {
    return generateLocalCampaignAnalysis(campaigns);
  }

  if (!hasGeminiApiKey()) {
    return generateLocalCampaignAnalysis(campaigns);
  }

  try {
    const analysis = await generateGeminiCampaignAnalysis(campaigns);

    if (!analysis.recommendations.length) {
      return generateLocalCampaignAnalysis(campaigns);
    }

    return analysis;
  } catch (error) {
    console.error("Gemini campaign analysis failed:", error);
    return generateLocalCampaignAnalysis(campaigns);
  }
}
