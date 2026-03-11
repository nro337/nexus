import { nanoid } from "nanoid";

export function generateId(): string {
  return nanoid(12);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

/**
 * Deterministic color from a string — used for tags.
 * Returns an HSL color with good contrast on dark backgrounds.
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 65%)`;
}

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  link: "Link",
  snippet: "Snippet",
  image: "Image",
  note: "Note",
  file: "File",
};

export const SOURCE_LABELS: Record<string, string> = {
  web: "Web",
  reddit: "Reddit",
  twitter: "Twitter/X",
  bluesky: "Bluesky",
  notion: "Notion",
  youtube: "YouTube",
  github: "GitHub",
  manual: "Manual",
  other: "Other",
};

export const CONNECTION_TYPE_LABELS: Record<string, string> = {
  related_to: "Related to",
  builds_on: "Builds on",
  contradicts: "Contradicts",
  source_for: "Source for",
  inspired_by: "Inspired by",
  part_of: "Part of",
  custom: "Custom",
};
