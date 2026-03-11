/**
 * Attempts to extract a page title and favicon from a URL.
 * Uses a CORS proxy approach or falls back to URL-based heuristics.
 */
export interface UrlMetadata {
  title: string;
  favicon?: string;
  description?: string;
}

/**
 * Extract metadata from a URL. This works for some sites via fetch,
 * but many will block CORS. Falls back to heuristics.
 */
export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  const fallback = getFallbackMetadata(url);

  try {
    const response = await fetch(url, {
      mode: "cors",
      signal: AbortSignal.timeout(5000),
    });
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const title =
      doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
      doc.querySelector("title")?.textContent ||
      fallback.title;

    const description =
      doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ||
      undefined;

    const favicon = getFaviconUrl(url);

    return { title: title.trim(), favicon, description };
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

    return { title, favicon };
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
