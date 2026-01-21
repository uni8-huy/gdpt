"use client";

import { createAuthClient } from "better-auth/react";

// Use relative URL in production (browser will use current origin)
// This avoids needing NEXT_PUBLIC_APP_URL at build time
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""),
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
