import { createContext, useContext, useState, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
// TEMPORARY DEMO MODE - AUTH DISABLED
// Supabase import kept for compatibility, but not used for auth
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// TEMPORARY DEMO MODE - Mock authenticated user
const mockUser = {
  id: "demo-user",
  email: "demo@example.com",
  user_metadata: { role: "admin" },
  app_metadata: {},
  aud: "authenticated",
  confirmation_sent_at: null,
  sign_in_provider: "email",
  role: "authenticated",
  updated_at: new Date().toISOString(),
  phone: "",
  last_sign_in_at: new Date().toISOString(),
} as unknown as User;

const mockSession = {
  access_token: "demo-token",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "demo-refresh-token",
  user: mockUser,
} as unknown as Session;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // TEMPORARY DEMO MODE - Always authenticated, no session checks
  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false);

  // TEMPORARY DEMO MODE - No-op signOut for demo
  const signOut = async () => {
    console.log("TEMPORARY DEMO MODE: signOut called but disabled for testing");
    // In demo mode, we don't actually sign out
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};