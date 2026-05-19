import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/lib/database.types";

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Unknown error";
}

export function useClientCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCampaigns = async () => {
    setLoading(true);
    setError(null);

    try {
      const campaignsPromise = supabase
        .from("campaigns")
        .select("*")
        .order("updated_at", { ascending: false });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "Campaign query timed out after 5 seconds. This usually means a Supabase RLS policy issue."
            )
          );
        }, 5000);
      });

      const { data, error: campaignsError } = await Promise.race([
        campaignsPromise,
        timeoutPromise,
      ]);

      if (campaignsError) {
        throw campaignsError;
      }

      setCampaigns(data ?? []);
    } catch (err) {
      const message = getReadableErrorMessage(err);
      console.error("Failed to load campaigns:", err);
      setError(`Unable to load campaign data right now. ${message}`);
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
