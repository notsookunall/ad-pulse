import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Database, Profile } from "@/lib/database.types";

const seededUsers = new Set<string>();

function isoDateFromToday(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function buildDemoCampaigns(userId: string): Database["public"]["Tables"]["campaigns"]["Insert"][] {
  return [
    {
      user_id: userId,
      name: "Summer Sale 2026",
      platform: "google",
      status: "running",
      budget: 5000,
      spent: 2340,
      impressions: 45200,
      clicks: 1230,
      conversions: 89,
      start_date: isoDateFromToday(-20),
      end_date: isoDateFromToday(40),
    },
    {
      user_id: userId,
      name: "Brand Awareness",
      platform: "linkedin",
      status: "running",
      budget: 8000,
      spent: 4500,
      impressions: 62000,
      clicks: 1800,
      conversions: 120,
      start_date: isoDateFromToday(-35),
      end_date: isoDateFromToday(60),
    },
    {
      user_id: userId,
      name: "Retargeting Push",
      platform: "instagram",
      status: "completed",
      budget: 3500,
      spent: 3200,
      impressions: 28900,
      clicks: 890,
      conversions: 67,
      start_date: isoDateFromToday(-70),
      end_date: isoDateFromToday(-10),
    },
    {
      user_id: userId,
      name: "Product Launch Test",
      platform: "facebook",
      status: "pending",
      budget: 12000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: isoDateFromToday(5),
      end_date: isoDateFromToday(65),
    },
    {
      user_id: userId,
      name: "Holiday Promo",
      platform: "twitter",
      status: "paused",
      budget: 2500,
      spent: 1100,
      impressions: 18500,
      clicks: 420,
      conversions: 28,
      start_date: isoDateFromToday(-15),
      end_date: isoDateFromToday(20),
    },
  ];
}

function buildDemoPayments(userId: string): Database["public"]["Tables"]["payments"]["Insert"][] {
  return [
    {
      user_id: userId,
      amount: 5000,
      status: "completed",
      method: "razorpay",
      description: "Summer Sale 2026 - Campaign Budget",
    },
    {
      user_id: userId,
      amount: 8000,
      status: "completed",
      method: "bank_transfer",
      description: "Brand Awareness - Campaign Budget",
    },
    {
      user_id: userId,
      amount: 3500,
      status: "completed",
      method: "upi",
      description: "Retargeting Push - Campaign Budget",
    },
    {
      user_id: userId,
      amount: 12000,
      status: "pending",
      method: "razorpay",
      description: "Product Launch Test - Campaign Budget",
    },
  ];
}

export async function ensureDemoWorkspace(user: User, profile: Profile | null) {
  if (!user?.id || profile?.role === "admin" || seededUsers.has(user.id)) {
    return;
  }

  seededUsers.add(user.id);

  try {
    const { count: campaignCount, error: campaignCountError } = await supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true });

    if (campaignCountError) {
      throw campaignCountError;
    }

    if ((campaignCount ?? 0) === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: campaignInsertError } = await (supabase.from("campaigns") as any).insert(
        buildDemoCampaigns(user.id)
      );

      if (campaignInsertError) {
        throw campaignInsertError;
      }
    }

    const { count: paymentCount, error: paymentCountError } = await supabase
      .from("payments")
      .select("id", { count: "exact", head: true });

    if (paymentCountError) {
      throw paymentCountError;
    }

    if ((paymentCount ?? 0) === 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: paymentInsertError } = await (supabase.from("payments") as any).insert(
        buildDemoPayments(user.id)
      );

      if (paymentInsertError) {
        throw paymentInsertError;
      }
    }
  } catch (error) {
    console.error("Failed to seed demo workspace:", error);
    seededUsers.delete(user.id);
  }
}
