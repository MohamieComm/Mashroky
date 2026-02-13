export type MediaType = "video" | "image" | "unknown" | "none";

export const getMediaTypeFromUrl = (url?: string | null): MediaType => {
  if (!url) return "none";
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".m4v")) {
    return "video";
  }
  if (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".webp") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".svg")
  ) {
    return "image";
  }
  return "unknown";
};

const normalizeDomain = (website?: string | null) => {
  if (!website) return "";
  try {
    const url = website.startsWith("http") ? website : `https://${website}`;
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export const getAirlineLogoCandidates = (code?: string | null, website?: string | null) => {
  const iata = String(code || "").trim().toUpperCase();
  const domain = normalizeDomain(website);
  const candidates: string[] = [];
  if (iata) {
    candidates.push(`https://www.gstatic.com/flights/airline_logos/70px/${iata}.png`);
    candidates.push(`https://images.kiwi.com/airlines/64/${iata}.png`);
  }
  if (domain) {
    candidates.push(`https://logo.clearbit.com/${domain}`);
    candidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  }
  return candidates;
};
