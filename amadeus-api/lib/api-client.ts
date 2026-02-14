// ============================================================
// API Fetch Helpers for Client Components
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || '';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API Error: ${res.status}`);
  }

  return res.json();
}

// ── Flights ─────────────────────────────────────────────────

export const flightsApi = {
  search: (params: any) =>
    apiFetch('/api/flights/search', { method: 'POST', body: JSON.stringify(params) }),

  pricing: (body: any) =>
    apiFetch('/api/flights/pricing', { method: 'POST', body: JSON.stringify(body) }),

  book: (body: any) =>
    apiFetch('/api/flights/book', { method: 'POST', body: JSON.stringify(body) }),

  getOrder: (orderId: string) =>
    apiFetch(`/api/flights/orders/${orderId}`),

  cancelOrder: (orderId: string) =>
    apiFetch(`/api/flights/orders/${orderId}`, { method: 'DELETE' }),

  status: (params: any) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/flights/status?${qs}`);
  },

  seatMaps: (body: any) =>
    apiFetch('/api/flights/seatmaps', { method: 'POST', body: JSON.stringify(body) }),

  cheapestDates: (params: any) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/flights/cheapest-dates?${qs}`);
  },
};

// ── Hotels ──────────────────────────────────────────────────

export const hotelsApi = {
  searchByCity: (params: any) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/hotels/search?${qs}`);
  },

  searchOffers: (body: any) =>
    apiFetch('/api/hotels/offers', { method: 'POST', body: JSON.stringify(body) }),

  autocomplete: (keyword: string) =>
    apiFetch(`/api/hotels/autocomplete?keyword=${encodeURIComponent(keyword)}`),

  book: (body: any) =>
    apiFetch('/api/hotels/book', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Transfers ───────────────────────────────────────────────

export const transfersApi = {
  search: (body: any) =>
    apiFetch('/api/transfers/search', { method: 'POST', body: JSON.stringify(body) }),

  book: (body: any) =>
    apiFetch('/api/transfers/book', { method: 'POST', body: JSON.stringify(body) }),

  cancel: (body: any) =>
    apiFetch('/api/transfers/cancel', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Activities ──────────────────────────────────────────────

export const activitiesApi = {
  search: (params: any) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/activities/search?${qs}`);
  },

  get: (activityId: string) =>
    apiFetch(`/api/activities/${activityId}`),
};

// ── Locations ───────────────────────────────────────────────

export const locationsApi = {
  search: (keyword: string, subType = 'AIRPORT,CITY') =>
    apiFetch(`/api/locations?keyword=${encodeURIComponent(keyword)}&subType=${subType}`),

  airlines: (airlineCodes?: string) =>
    apiFetch(`/api/airlines${airlineCodes ? `?airlineCodes=${airlineCodes}` : ''}`),
};
