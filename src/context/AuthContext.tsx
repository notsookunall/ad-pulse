import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the profile row from the `profiles` table.
  // If no row exists (e.g. first login after signup), auto-create it.
  // If RLS causes an error, fall back to auth metadata so the app still works.
  const fetchProfile = async (userId: string, authUser?: User): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data as Profile;
    }

    // PGRST116 = no rows found — profile missing, auto-create it
    if (error?.code === "PGRST116" && authUser) {
      const meta = authUser.user_metadata as Record<string, string> | undefined;
      const email = authUser.email ?? "";
      const full_name = meta?.full_name ?? email.split("@")[0] ?? "User";
      const role: "admin" | "client" = email === "admin@adpulse.ai" ? "admin" : "client";
      const now = new Date().toISOString();

      const newProfile: Profile = {
        id: userId,
        email,
        full_name,
        role,
        company: null,
        avatar_url: null,
        created_at: now,
        updated_at: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from("profiles") as any).upsert(newProfile);
      if (insertError) {
        console.error("Failed to auto-create profile:", insertError.message);
      }
      return newProfile;
    }

    // Any other error — fall back to in-memory profile so login doesn't spin
    if (authUser) {
      const meta = authUser.user_metadata as Record<string, string> | undefined;
      const email = authUser.email ?? "";
      const full_name = meta?.full_name ?? email.split("@")[0] ?? "User";
      const role: "admin" | "client" = email === "admin@adpulse.ai" ? "admin" : "client";
      console.error("Falling back to in-memory profile. Supabase error:", error?.message);
      return {
        id: userId,
        email,
        full_name,
        role,
        company: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } satisfies Profile;
    }

    return null;
  };

  // Bootstrap session on mount + subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const prof = await fetchProfile(currentSession.user.id, currentSession.user);
        if (mounted) setProfile(prof);
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const prof = await fetchProfile(newSession.user.id, newSession.user);
          if (mounted) setProfile(prof);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    // Do NOT call setLoading here — onAuthStateChange already manages loading
    // Calling setLoading(false) here races against the async fetchProfile in onAuthStateChange
    // and causes the ProtectedRoute spinner to lock up indefinitely.
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    // Always insert/upsert the profile row immediately after signup
    if (data.user) {
      const now = new Date().toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (supabase.from("profiles") as any).upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "client",
        created_at: now,
        updated_at: now,
      });

      if (profileError) {
        console.error("Error creating profile row on signup:", profileError.message);
      } else {
        console.log("Profile row created successfully for:", email);
      }
    }

    // Automatically sign in the user after successful sign up
    const { error: signInError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    setLoading(false);

    if (signInError) {
      return { error: signInError.message };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
