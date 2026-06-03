import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Payment } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { getLocalDemoPayments } from "@/lib/demoData";

const LIVE_QUERY_TIMEOUT_MS = 15000;

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

export function useClientPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const refreshPayments = useCallback(async () => {
    if (!user) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentsPromise = supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Payments query timed out after 15 seconds.")), LIVE_QUERY_TIMEOUT_MS);
      });

      const { data, error: paymentsError } = await Promise.race([paymentsPromise, timeoutPromise]);

      if (paymentsError) {
        throw paymentsError;
      }

      setPayments(data ?? []);
      setUsingDemoData(false);
    } catch (err) {
      const message = getReadableErrorMessage(err);
      console.error("Failed to load payments:", err);
      setPayments(getLocalDemoPayments());
      setUsingDemoData(true);
      setError(`Live payment data was unavailable, so demo billing data is being shown. ${message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshPayments();
  }, [refreshPayments]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`client-payments-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void refreshPayments();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshPayments, user]);

  return {
    payments,
    loading,
    error,
    usingDemoData,
    refreshPayments,
  };
}
