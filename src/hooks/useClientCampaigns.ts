import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/lib/database.types";

export function useClientCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("updated_at", { ascending: false });

      if (campaignsError) {
        throw campaignsError;
      }

      setCampaigns(data ?? []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
      setError("Unable to load campaign data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    refreshCampaigns,
  };
}
