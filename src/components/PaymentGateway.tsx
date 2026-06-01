import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Receipt,
  ShieldCheck,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import type { Database, Payment } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type SimulatorMethod = "card" | "upi" | "netbanking";

interface PaymentGatewayProps {
  open: boolean;
  amount: number;
  description: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (payment: Payment) => void | Promise<void>;
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getStoredPaymentMethod(method: SimulatorMethod): Payment["method"] {
  if (method === "upi") return "upi";
  if (method === "netbanking") return "bank_transfer";
  return "razorpay";
}

function getSimulatorReference(method: SimulatorMethod) {
  const prefix = method === "upi" ? "upi" : method === "netbanking" ? "bank" : "card";
  return `adp_${prefix}_${Date.now().toString(36)}`;
}

export default function PaymentGateway({ open, amount, description, onOpenChange, onSuccess }: PaymentGatewayProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [method, setMethod] = useState<SimulatorMethod>("card");
  const [cardName, setCardName] = useState(profile?.full_name ?? "");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  const [upiId, setUpiId] = useState("client@upi");
  const [bankName, setBankName] = useState("AdPulse Trust Bank");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const payableAmount = useMemo(() => Number(amount.toFixed(2)), [amount]);
  const amountIsValid = payableAmount > 0;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCompletedPayment(null);
    setProcessing(false);
    setCardName(profile?.full_name ?? "");
  }, [open, profile?.full_name]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !processing) onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open, processing]);

  const insertCompletedPayment = async (paymentDetails: Pick<PaymentInsert, "method" | "razorpay_payment_id" | "razorpay_order_id">) => {
    if (!user) throw new Error("Please sign in before starting checkout.");
    if (!amountIsValid) throw new Error("Enter a valid payment amount.");

    const payload: PaymentInsert = {
      user_id: user.id,
      amount: payableAmount,
      status: "completed",
      method: paymentDetails.method,
      razorpay_payment_id: paymentDetails.razorpay_payment_id,
      razorpay_order_id: paymentDetails.razorpay_order_id,
      description,
      created_at: new Date().toISOString(),
    };

    // The schema still has legacy gateway column names, but this flow is fully simulated.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase.from("payments") as any)
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;

    const payment = data as Payment;
    setCompletedPayment(payment);
    await onSuccess?.(payment);
    return payment;
  };

  const validatePayment = () => {
    if (!amountIsValid) return "Enter a valid payment amount.";
    if (method === "card") {
      const cardDigits = cardNumber.replace(/\D/g, "");
      if (!cardName.trim()) return "Cardholder name is required.";
      if (cardDigits.length < 12) return "Enter a valid card number.";
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return "Use MM/YY for the expiry date.";
      if (cardCvv.replace(/\D/g, "").length < 3) return "Enter a valid CVV.";
    }
    if (method === "upi" && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) return "Enter a valid UPI ID.";
    if (method === "netbanking" && !bankName.trim()) return "Choose a netbanking provider.";
    return null;
  };

  const completePayment = async () => {
    const validationError = validatePayment();
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await insertCompletedPayment({
        method: getStoredPaymentMethod(method),
        razorpay_payment_id: getSimulatorReference(method),
        razorpay_order_id: `adp_order_${Date.now().toString(36)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment could not be recorded.");
    } finally {
      setProcessing(false);
    }
  };

  const closeGateway = () => {
    if (processing) return;
    onOpenChange(false);
  };

  const goToBilling = () => {
    onOpenChange(false);
    navigate("/dashboard/payments");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#090b12] text-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <button
              type="button"
              onClick={closeGateway}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close checkout"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid min-h-[620px] overflow-y-auto lg:grid-cols-[0.85fr_1.15fr]">
              <aside className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-950 p-6 lg:border-b-0 lg:border-r">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Demo Gateway
                    </div>
                    <h2 className="mt-6 text-3xl font-bold leading-tight">AdPulse Secure Checkout</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      This interface demonstrates a complete payment experience without connecting to an external gateway.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-300">Amount due</div>
                        <div className="mt-1 text-3xl font-bold">{formatCurrency(payableAmount)}</div>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                        <Receipt className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl bg-black/25 p-4 text-sm text-slate-200">{description}</div>
                  </div>

                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                    <div className="flex items-center gap-2 font-semibold">
                      <Sparkles className="h-4 w-4" />
                      College project mode
                    </div>
                    <p className="mt-2 text-cyan-100/80">
                      No real payment is processed. Successful demo payments are saved as completed billing records.
                    </p>
                  </div>
                </div>
              </aside>

              <main className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {completedPayment ? (
                    <motion.div
                      key="success"
                      className="flex h-full min-h-[520px] flex-col items-center justify-center text-center"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                    >
                      <motion.div
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      >
                        <CheckCircle2 className="h-10 w-10" />
                      </motion.div>
                      <h3 className="mt-6 text-3xl font-bold">Payment recorded</h3>
                      <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
                        The completed demo transaction is now available in your AdPulse billing history.
                      </p>
                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-sm">
                        <div className="text-slate-400">Reference</div>
                        <div className="mt-1 font-mono text-white">{completedPayment.razorpay_payment_id}</div>
                      </div>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button variant="gradient" onClick={goToBilling}>
                          View Billing <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={closeGateway}>
                          Done
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="simulator"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                    >
                      <div>
                        <h3 className="text-2xl font-bold">Choose a payment method</h3>
                        <p className="mt-2 text-sm text-slate-300">
                          Card, UPI, and netbanking are available as interactive demo flows.
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {[
                          { id: "card", label: "Card", icon: CreditCard },
                          { id: "upi", label: "UPI", icon: Smartphone },
                          { id: "netbanking", label: "Bank", icon: Landmark },
                        ].map((option) => {
                          const Icon = option.icon;
                          const active = method === option.id;
                          return (
                            <button
                              type="button"
                              key={option.id}
                              onClick={() => setMethod(option.id as SimulatorMethod)}
                              className={cn(
                                "flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border text-sm font-medium transition",
                                active
                                  ? "border-emerald-300/50 bg-emerald-300/15 text-emerald-50"
                                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                        {method === "card" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-200">Cardholder Name</label>
                              <Input value={cardName} onChange={(event) => setCardName(event.target.value)} className="border-white/10 bg-black/20 text-white" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-200">Card Number</label>
                              <Input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="border-white/10 bg-black/20 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Expiry</label>
                                <Input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} className="border-white/10 bg-black/20 text-white" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">CVV</label>
                                <Input value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} className="border-white/10 bg-black/20 text-white" />
                              </div>
                            </div>
                          </div>
                        )}

                        {method === "upi" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-slate-200">UPI ID</label>
                              <Input value={upiId} onChange={(event) => setUpiId(event.target.value)} className="border-white/10 bg-black/20 text-white" />
                            </div>
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                              <img
                                src="https://res.cloudinary.com/ddxc2jgfb/image/upload/v1780325513/upi_yrg11k.jpg"
                                alt="UPI QR code for payment"
                                className="mx-auto max-h-[360px] w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                          </div>
                        )}

                        {method === "netbanking" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-200">Netbanking Provider</label>
                            <select
                              value={bankName}
                              onChange={(event) => setBankName(event.target.value)}
                              className="flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-400"
                            >
                              {["AdPulse Trust Bank", "Atlas National Bank", "Northstar Business Bank"].map((bank) => (
                                <option key={bank} value={bank}>
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}

                      <Button variant="gradient" size="lg" className="mt-6 w-full" onClick={completePayment} disabled={processing || !amountIsValid}>
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Authorizing Demo Payment...
                          </>
                        ) : (
                          <>
                            Complete Demo Payment
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
