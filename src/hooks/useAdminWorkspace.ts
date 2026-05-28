import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign, Payment, Profile } from "@/lib/database.types";
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
}

export function useAdminWorkspace(): AdminWorkspaceState {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const refreshWorkspace = async () => {
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
  };

  useEffect(() => {
    void refreshWorkspace();
  }, []);

  return {
    profiles,
    campaigns,
    payments,
    loading,
    error,
    usingDemoData,
    refreshWorkspace,
  };
}
