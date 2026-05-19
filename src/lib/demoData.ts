import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Campaign, Database, Message, Payment, Profile } from "@/lib/database.types";

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

export function getLocalDemoCampaigns(): Campaign[] {
  const now = new Date().toISOString();

  return buildDemoCampaigns("demo-user").map((campaign, index) => ({
    id: `demo-campaign-${index + 1}`,
    user_id: "demo-user",
    name: campaign.name ?? `Demo Campaign ${index + 1}`,
    platform: campaign.platform ?? "google",
    status: campaign.status ?? "draft",
    budget: Number(campaign.budget ?? 0),
    spent: Number(campaign.spent ?? 0),
    impressions: Number(campaign.impressions ?? 0),
    clicks: Number(campaign.clicks ?? 0),
    conversions: Number(campaign.conversions ?? 0),
    start_date: campaign.start_date ?? null,
    end_date: campaign.end_date ?? null,
    created_at: now,
    updated_at: now,
  }));
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

function buildDemoMessages(userId: string, adminId: string) {
  return [
    {
      sender_id: adminId,
      receiver_id: userId,
      subject: "Welcome to AdPulse AI",
      body: "Your dashboard is ready. Review the AI insights card to see how your active campaigns are performing this week.",
      is_read: true,
    },
    {
      sender_id: userId,
      receiver_id: adminId,
      subject: "Landing page improvements",
      body: "Please review the updated landing page copy before we increase spend on the Summer Sale campaign.",
      is_read: true,
    },
    {
      sender_id: adminId,
      receiver_id: userId,
      subject: "Weekly optimization note",
      body: "Brand Awareness is delivering strong reach. Consider testing a narrower audience segment to improve conversion efficiency.",
      is_read: false,
    },
  ] satisfies Database["public"]["Tables"]["messages"]["Insert"][];
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

    const { count: messageCount, error: messageCountError } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true });

    if (messageCountError) {
      throw messageCountError;
    }

    if ((messageCount ?? 0) === 0) {
      const { data: adminProfileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin")
        .limit(1)
        .maybeSingle();

      const adminProfile = adminProfileData as Pick<Profile, "id"> | null;
      const adminId = adminProfile?.id ?? user.id;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: messageInsertError } = await (supabase.from("messages") as any).insert(
        buildDemoMessages(user.id, adminId)
      );

      if (messageInsertError) {
        throw messageInsertError;
      }
    }
  } catch (error) {
    console.error("Failed to seed demo workspace:", error);
    seededUsers.delete(user.id);
  }
}

export function getLocalDemoPayments(): Payment[] {
  const now = new Date().toISOString();

  return buildDemoPayments("demo-user").map((payment, index) => ({
    id: `demo-payment-${index + 1}`,
    user_id: "demo-user",
    amount: Number(payment.amount),
    status: payment.status ?? "pending",
    method: payment.method ?? "razorpay",
    razorpay_payment_id: payment.razorpay_payment_id ?? null,
    razorpay_order_id: payment.razorpay_order_id ?? null,
    description: payment.description ?? null,
    created_at: now,
  }));
}

export function getLocalDemoMessages(userId = "demo-user", profileName = "Client User"): Array<Message & {
  sender_name: string;
  receiver_name: string;
}> {
  const adminId = "demo-admin";
  const now = new Date();

  return buildDemoMessages(userId, adminId).map((message, index) => ({
    id: `demo-message-${index + 1}`,
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    subject: message.subject,
    body: message.body,
    is_read: message.is_read ?? false,
    created_at: new Date(now.getTime() - index * 86400000).toISOString(),
    sender_name: message.sender_id === adminId ? "AdPulse Team" : profileName,
    receiver_name: message.receiver_id === adminId ? "AdPulse Team" : profileName,
  }));
}
