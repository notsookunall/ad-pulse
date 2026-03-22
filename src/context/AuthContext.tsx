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
  // If RLS causes an error (e.g. infinite recursion), fall back to auth metadata.
  const fetchProfile = async (userId: string, authUser?: User): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(
        "Error fetching profile (check Supabase RLS policies):",
        error.message
      );
      // Fallback: build a partial profile from auth metadata so the app still works
      if (authUser) {
        const meta = authUser.user_metadata as Record<string, string> | undefined;
        const email = authUser.email ?? "";
        const full_name = meta?.full_name ?? email.split("@")[0] ?? "User";
        const role: "admin" | "client" = email === "admin@adpulse.ai" ? "admin" : "client";
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
    }
    return data as Profile;
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
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
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

    // Insert profile row (role defaults to 'client')
    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (supabase.from("profiles") as any).upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "client",
      });

      if (profileError) {
        console.error("Error creating profile:", profileError.message);
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
