export interface CustomThemeColors {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  danger: string;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

export function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  return rgbToHex(r + amount, g + amount, b + amount);
}

export function darken(hex: string, amount: number): string {
  return lighten(hex, -amount);
}

export function mix(hex1: string, hex2: string, ratio = 0.5): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return hex1;
  return rgbToHex(
    rgb1[0] * (1 - ratio) + rgb2[0] * ratio,
    rgb1[1] * (1 - ratio) + rgb2[1] * ratio,
    rgb1[2] * (1 - ratio) + rgb2[2] * ratio,
  );
}

export function deriveThemeColors(
  bg: string,
  surface: string,
  accent: string,
  text: string,
  danger = "#f46c6c",
): CustomThemeColors {
  const dark = isDarkColor(bg);
  return {
    bg,
    surface,
    surfaceHover: dark ? lighten(surface, 14) : darken(surface, 8),
    border: dark ? lighten(surface, 28) : darken(surface, 14),
    text,
    textMuted: mix(text, bg, 0.42),
    accent,
    accentHover: dark ? lighten(accent, 22) : darken(accent, 22),
    danger,
  };
}
