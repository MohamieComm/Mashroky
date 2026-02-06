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

