import { supabase } from "@/integrations/supabase/client";

const FLIGHT_API_BASE =
  (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) ||
  "https://jubilant-hope-production-a334.up.railway.app";

/** Returns the current Supabase JWT access token, or empty string if not logged in. */
export async function getAuthToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? "";
  } catch {
    return "";
  }
}

/** Build headers for authenticated API calls */
export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Base URL for the flight/booking backend API */
export function apiBaseUrl(): string {
  return FLIGHT_API_BASE.replace(/\/$/, "");
}

/**
 * Make an authenticated fetch call to the backend API.
 * Automatically includes the Supabase JWT token.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await authHeaders();
  const existingHeaders = options.headers as Record<string, string> | undefined;
  return fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...existingHeaders,
    },
  });
}

/**
 * POST to the backend API with JSON body, authenticated.
 */
export async function apiPost(path: string, body: unknown): Promise<Response> {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * GET from the backend API, authenticated.
 */
export async function apiGet(path: string): Promise<Response> {
  return apiFetch(path, { method: "GET" });
}
