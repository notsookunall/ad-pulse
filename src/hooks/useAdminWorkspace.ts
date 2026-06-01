import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign, Database, Payment, Profile } from "@/lib/database.types";
import { getLocalDemoCampaigns, getLocalDemoPayments, getLocalDemoProfiles } from "@/lib/demoData";

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

export interface AdminWorkspaceState {
  profiles: Profile[];
  campaigns: Campaign[];
  payments: Payment[];
  loading: boolean;
  error: string | null;
  usingDemoData: boolean;
  refreshWorkspace: () => Promise<void>;
  updateClientProfile: (
    profileId: string,
    updates: Partial<Pick<Profile, "full_name" | "company" | "role" | "avatar_url">>
  ) => Promise<{ error: string | null }>;
  updateCampaign: (
    campaignId: string,
    updates: Partial<Pick<Campaign, "user_id" | "name" | "platform" | "status" | "budget" | "spent" | "impressions" | "clicks" | "conversions">>
  ) => Promise<{ error: string | null }>;
  createCampaign: (
    campaign: Database["public"]["Tables"]["campaigns"]["Insert"]
  ) => Promise<{ error: string | null; campaign: Campaign | null }>;
  updatePayment: (
    paymentId: string,
    updates: Partial<Pick<Payment, "status" | "method" | "amount" | "description">>
  ) => Promise<{ error: string | null }>;
}

export function useAdminWorkspace(): AdminWorkspaceState {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const refreshWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const workspacePromise = Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("campaigns").select("*").order("updated_at", { ascending: false }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
      ]);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Admin workspace query timed out after 5 seconds.")), 5000);
      });

      const [profilesRes, campaignsRes, paymentsRes] = await Promise.race([workspacePromise, timeoutPromise]);

      if (profilesRes.error) throw profilesRes.error;
      if (campaignsRes.error) throw campaignsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      setProfiles((profilesRes.data ?? []) as Profile[]);
      setCampaigns((campaignsRes.data ?? []) as Campaign[]);
      setPayments((paymentsRes.data ?? []) as Payment[]);
      setUsingDemoData(false);
    } catch (err) {
      const message = getReadableErrorMessage(err);
      console.error("Failed to load admin workspace:", err);
      setProfiles(getLocalDemoProfiles());
      setCampaigns(getLocalDemoCampaigns());
      setPayments(getLocalDemoPayments());
      setUsingDemoData(true);
      setError(`Live admin data was unavailable, so demo workspace data is being shown. ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-payment-monitoring")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
        },
        () => {
          void refreshWorkspace();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshWorkspace]);

  const updateClientProfile = async (
    profileId: string,
    updates: Partial<Pick<Profile, "full_name" | "company" | "role" | "avatar_url">>
  ) => {
    const nextProfileState = (currentProfiles: Profile[]) =>
      currentProfiles.map((profile) =>
        profile.id === profileId
          ? {
              ...profile,
              ...updates,
              company: updates.company ?? profile.company,
              full_name: updates.full_name ?? profile.full_name,
              role: updates.role ?? profile.role,
              avatar_url: updates.avatar_url ?? profile.avatar_url,
              updated_at: new Date().toISOString(),
            }
          : profile
      );

    if (usingDemoData) {
      setProfiles((currentProfiles) => nextProfileState(currentProfiles));
      return { error: null };
    }

    // Generated types are slightly out of sync for update chaining here.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("profiles") as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    if (updateError) {
      return { error: updateError.message };
    }

    setProfiles((currentProfiles) => nextProfileState(currentProfiles));
    return { error: null };
  };

  const updateCampaign = async (
    campaignId: string,
    updates: Partial<Pick<Campaign, "user_id" | "name" | "platform" | "status" | "budget" | "spent" | "impressions" | "clicks" | "conversions">>
  ) => {
    const nextCampaignState = (currentCampaigns: Campaign[]) =>
      currentCampaigns.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              ...updates,
              updated_at: new Date().toISOString(),
            }
          : campaign
      );

    if (usingDemoData) {
      setCampaigns((currentCampaigns) => nextCampaignState(currentCampaigns));
      return { error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("campaigns") as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaignId);

    if (updateError) {
      return { error: updateError.message };
    }

    setCampaigns((currentCampaigns) => nextCampaignState(currentCampaigns));
    return { error: null };
  };

  const createCampaign = async (campaign: Database["public"]["Tables"]["campaigns"]["Insert"]) => {
    const now = new Date().toISOString();
    const localCampaign: Campaign = {
      id: `admin-campaign-${Date.now()}`,
      user_id: campaign.user_id,
      name: campaign.name,
      platform: campaign.platform ?? "google",
      status: campaign.status ?? "draft",
      budget: Number(campaign.budget ?? 0),
      spent: Number(campaign.spent ?? 0),
      impressions: Number(campaign.impressions ?? 0),
      clicks: Number(campaign.clicks ?? 0),
      conversions: Number(campaign.conversions ?? 0),
      start_date: campaign.start_date ?? null,
      end_date: campaign.end_date ?? null,
      created_at: campaign.created_at ?? now,
      updated_at: campaign.updated_at ?? now,
    };

    if (usingDemoData) {
      setCampaigns((currentCampaigns) => [localCampaign, ...currentCampaigns]);
      return { error: null, campaign: localCampaign };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase.from("campaigns") as any)
      .insert(campaign)
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message, campaign: null };
    }

    const insertedCampaign = data as Campaign;
    setCampaigns((currentCampaigns) => [insertedCampaign, ...currentCampaigns]);
    return { error: null, campaign: insertedCampaign };
  };

  const updatePayment = async (
    paymentId: string,
    updates: Partial<Pick<Payment, "status" | "method" | "amount" | "description">>
  ) => {
    const nextPaymentState = (currentPayments: Payment[]) =>
      currentPayments.map((payment) => (payment.id === paymentId ? { ...payment, ...updates } : payment));

    if (usingDemoData) {
      setPayments((currentPayments) => nextPaymentState(currentPayments));
      return { error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("payments") as any)
      .update(updates)
      .eq("id", paymentId);

    if (updateError) {
      return { error: updateError.message };
    }

    setPayments((currentPayments) => nextPaymentState(currentPayments));
    return { error: null };
  };

  return {
    profiles,
    campaigns,
    payments,
    loading,
    error,
    usingDemoData,
    refreshWorkspace,
    updateClientProfile,
    updateCampaign,
    createCampaign,
    updatePayment,
  };
}
