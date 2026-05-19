import { useEffect, useState } from "react";
import type { Payment } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { getLocalDemoPayments } from "@/lib/demoData";

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

export function useClientPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const refreshPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const paymentsPromise = supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Payments query timed out after 5 seconds.")), 5000);
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
  };

  useEffect(() => {
    void refreshPayments();
  }, []);

  return {
    payments,
    loading,
    error,
    usingDemoData,
    refreshPayments,
  };
}
