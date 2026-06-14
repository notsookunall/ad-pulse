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
      subject: "Welcome to AdPulse",
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
    // Run all 3 count checks in parallel instead of sequentially
    const [campaignsRes, paymentsRes, messagesRes] = await Promise.all([
      supabase.from("campaigns").select("id", { count: "exact", head: true }),
      supabase.from("payments").select("id", { count: "exact", head: true }),
      supabase.from("messages").select("id", { count: "exact", head: true }),
    ]);

    if (campaignsRes.error) throw campaignsRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    if (messagesRes.error) throw messagesRes.error;

    // Run all needed inserts in parallel
    const insertPromises: Promise<void>[] = [];

    if ((campaignsRes.count ?? 0) === 0) {
      insertPromises.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("campaigns") as any).insert(buildDemoCampaigns(user.id)).then(({ error }: { error: unknown }) => {
          if (error) throw error;
        })
      );
    }

    if ((paymentsRes.count ?? 0) === 0) {
      insertPromises.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("payments") as any).insert(buildDemoPayments(user.id)).then(({ error }: { error: unknown }) => {
          if (error) throw error;
        })
      );
    }

    if ((messagesRes.count ?? 0) === 0) {
      insertPromises.push(
        (async () => {
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

          if (messageInsertError) throw messageInsertError;
        })()
      );
    }

    if (insertPromises.length > 0) {
      await Promise.all(insertPromises);
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

export function getLocalDemoProfiles(): Profile[] {
  const now = new Date().toISOString();

  return [
    {
      id: "demo-admin",
      email: "admin@adpulse.ai",
      full_name: "Admin User",
      role: "admin",
      company: "AdPulse",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-user",
      email: "alex@techcorp.com",
      full_name: "Alex Johnson",
      role: "client",
      company: "TechCorp Inc.",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-user-2",
      email: "maria@stylelane.com",
      full_name: "Maria Singh",
      role: "client",
      company: "StyleLane",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
    {
      id: "demo-user-3",
      email: "rohan@edulift.com",
      full_name: "Rohan Mehta",
      role: "client",
      company: "EduLift",
      avatar_url: null,
      created_at: now,
      updated_at: now,
    },
  ];
}
