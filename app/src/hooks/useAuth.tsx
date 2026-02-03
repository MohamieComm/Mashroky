import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  role?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS ?? "ibrahemest@outlook.sa,ish959@gmail.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async (sessionUser: User | null) => {
    if (!sessionUser) {
      setProfile(null);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sessionUser.id)
      .single();

    const shouldBeAdmin = Boolean(
      sessionUser.email && ADMIN_EMAILS.includes(sessionUser.email.toLowerCase())
    );

    if (profileData) {
      if (shouldBeAdmin && profileData.role !== "admin") {
        const { data: updated } = await supabase
          .from("profiles")
          .update({ role: "admin" })
          .eq("user_id", sessionUser.id)
          .select("*")
          .single();
        setProfile(updated ?? profileData);
        return;
      }
      setProfile(profileData);
    } else {
      const { data: inserted } = await supabase
        .from("profiles")
        .insert({
          user_id: sessionUser.id,
          full_name: sessionUser.user_metadata?.full_name ?? null,
          role: shouldBeAdmin ? "admin" : "user",
        })
        .select("*")
        .single();
      setProfile(inserted ?? null);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await hydrateUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      hydrateUser(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    if (!error && data.user) {
      const shouldBeAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: fullName,
        role: shouldBeAdmin ? "admin" : "user",
      });
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    if (!error && profile) setProfile({ ...profile, ...updates });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAdmin:
      (profile?.role ?? "").toLowerCase() === "admin" ||
      Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())),
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
