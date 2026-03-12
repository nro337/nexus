/**
 * Attempts to extract a page title and favicon from a URL.
 * Uses a CORS proxy approach or falls back to URL-based heuristics.
 */
export interface UrlMetadata {
  title: string;
  favicon?: string;
  description?: string;
  thumbnail?: string;
}

/**
 * Extract metadata from a URL. This works for some sites via fetch,
 * but many will block CORS. Falls back to heuristics.
 */
async function fetchHtml(url: string): Promise<string> {
  // Try direct fetch first (works for CORS-permissive sites)
  try {
    const res = await fetch(url, { mode: "cors", signal: AbortSignal.timeout(5000) });
    if (res.ok) return res.text();
  } catch {
    // fall through to proxy
  }

  // Fall back to CORS proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("proxy failed");
  return res.text();
}

export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  const fallback = getFallbackMetadata(url);

  try {
    const html = await fetchHtml(url);
    const doc = new DOMParser().parseFromString(html, "text/html");

    const title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      doc.querySelector("title")?.textContent ||
      fallback.title;

    const description =
      doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      undefined;

    const thumbnail =
      doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
      getYouTubeThumbnailUrl(url) ||
      undefined;

    const favicon = getFaviconUrl(url);

    return { title: title.trim(), favicon, description, thumbnail };
  } catch {
    return fallback;
  }
}

function getFallbackMetadata(url: string): UrlMetadata {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    const pathname = parsed.pathname
      .replace(/\/$/, "")
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ");

    const title = pathname ? `${pathname} — ${hostname}` : hostname;
    const favicon = getFaviconUrl(url);
    const thumbnail = getYouTubeThumbnailUrl(url);

    return { title, favicon, thumbnail };
  } catch {
    return { title: url };
  }
}

function getFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return "";
  }
}

/**
 * Extract the YouTube video ID from a YouTube URL.
 * Supports youtube.com/watch?v=... and youtu.be/... formats.
 */
export function getYouTubeThumbnailUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let videoId: string | null = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.slice(1).split("/")[0] || null;
    } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      videoId = parsed.searchParams.get("v");
    }

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Detect the likely source platform from a URL.
 */
export function detectSource(url: string): string {
  if (!url) return "manual";
  const host = new URL(url).hostname.toLowerCase();

  if (host.includes("reddit.com")) return "reddit";
  if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
  if (host.includes("bsky.app") || host.includes("bluesky")) return "bluesky";
  if (host.includes("notion.so") || host.includes("notion.site")) return "notion";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  if (host.includes("github.com")) return "github";

  return "web";
}
