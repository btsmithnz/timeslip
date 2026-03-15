import { useColorScheme } from "@/hooks/use-color-scheme";

export type ColorPalette = {
  background: string;
  surface: string;
  surfaceStrong: string;
  border: string;
  borderSoft: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  input: string;
  inputBorder: string;
  shadow: string;
  notice: string;
  noticeText: string;
};

const palettes: Record<"light" | "dark", ColorPalette> = {
  light: {
    background: "#f6f8fb",
    surface: "rgba(255, 255, 255, 0.9)",
    surfaceStrong: "#ffffff",
    border: "#e2e8f0",
    borderSoft: "rgba(15, 23, 42, 0.08)",
    text: "#0f172a",
    muted: "#64748b",
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    input: "#f8fafc",
    inputBorder: "#dbe3ee",
    shadow: "rgba(15, 23, 42, 0.08)",
    notice: "#dbeafe",
    noticeText: "#1d4ed8",
  },
  dark: {
    background: "#020817",
    surface: "rgba(15, 23, 42, 0.86)",
    surfaceStrong: "#0f172a",
    border: "#1e293b",
    borderSoft: "rgba(148, 163, 184, 0.18)",
    text: "#f8fafc",
    muted: "#94a3b8",
    accent: "#60a5fa",
    accentSoft: "rgba(96, 165, 250, 0.16)",
    input: "#111827",
    inputBorder: "#334155",
    shadow: "rgba(2, 8, 23, 0.34)",
    notice: "#172554",
    noticeText: "#bfdbfe",
  },
};

export function useColorPalette() {
  const scheme = useColorScheme() ?? "light";

  return palettes[scheme];
}
