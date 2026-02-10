const DEFAULT_BACKEND_URL = "https://jubilant-hope-production-a334.up.railway.app";

export const getBackendBaseUrl = () => {
  const value = (import.meta.env.VITE_FLIGHT_API_URL as string | undefined) || DEFAULT_BACKEND_URL;
  return value.replace(/\/$/, "");
};

type JsonRecord = Record<string, unknown>;

export const postJson = async <T = JsonRecord>(path: string, payload: JsonRecord) => {
  const baseUrl = getBackendBaseUrl();
  const res = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body?.error || "request_failed");
    (error as Error & { details?: unknown }).details = body;
    throw error;
  }
  return (await res.json()) as T;
};

