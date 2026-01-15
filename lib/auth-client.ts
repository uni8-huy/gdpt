"use client";

import { createAuthClient } from "better-auth/react";

// Use NEXT_PUBLIC_APP_URL for auth requests
// Set this to your access URL (e.g., http://10.0.0.111:4004 for network access)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4004",
});

export const { signIn, signOut, signUp, useSession, getSession } = authClient;
