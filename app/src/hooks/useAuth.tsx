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
export function AuthProvider({ children }: { children: ReactNode }) {
  const adminEmails =
    (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateUser = async (sessionUser: User | null) => {
    if (!sessionUser) {
      setProfile(null);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", sessionUser.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    } else {
      const isAdminEmail = adminEmails.includes((sessionUser.email ?? "").toLowerCase());
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({
          user_id: sessionUser.id,
          full_name: sessionUser.user_metadata?.full_name ?? null,
          role: isAdminEmail ? "admin" : "user",
        })
        .select("*")
        .maybeSingle();

      if (insertError || profileError) {
        setProfile({
          id: sessionUser.id,
          user_id: sessionUser.id,
          full_name: sessionUser.user_metadata?.full_name ?? null,
          phone: null,
          avatar_url: null,
          address: null,
          role: isAdminEmail ? "admin" : "user",
        });
        return;
      }
      setProfile(inserted ?? null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const forceTimeout = window.setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 8000);

    const stopLoading = () => {
      if (!isMounted) return;
      window.clearTimeout(forceTimeout);
      setLoading(false);
    };

    const runWithTimeout = <T,>(p: Promise<T>, ms: number) => {
      return Promise.race([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
      ]);
    };

    const safeHydrate = async (sessionUser: User | null) => {
      try {
        // avoid hanging indefinitely if supabase call stalls
        await runWithTimeout(hydrateUser(sessionUser), 5000);
      } catch (error) {
        console.error("Failed to hydrate auth profile", error);
        setProfile(null);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await safeHydrate(session?.user ?? null);
      stopLoading();
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // ensure hydrate can't hang forever
      safeHydrate(session?.user ?? null).finally(() => stopLoading());
    });

    return () => {
      isMounted = false;
      window.clearTimeout(forceTimeout);
      subscription.unsubscribe();
    };
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
      await supabase.from("profiles").upsert({
        user_id: data.user.id,
        full_name: fullName,
        role: "user",
      });
    }
    return { error };
  };

  const signOut = async () => {
    // optimistically clear local state first so UI updates immediately
    setUser(null);
    setSession(null);
    setProfile(null);

    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.warn("Local sign out failed", error);
    }
    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.warn("Global sign out failed", error);
    }
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const ref = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : "";
      Object.keys(localStorage || {}).forEach((key) => {
        if (key.startsWith("sb-") && (!ref || key.includes(ref))) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn("Failed to clear auth storage", error);
    }

    if (typeof window !== "undefined") {
      // use replace to avoid leaving a history entry
      window.location.replace("/auth");
    }
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
      (!!user && adminEmails.includes((user.email ?? "").toLowerCase())),
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
