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
    background: "#f4f6fa",
    surface: "rgba(255, 255, 255, 0.85)",
    surfaceStrong: "#ffffff",
    border: "#e0e5ee",
    borderSoft: "rgba(15, 23, 42, 0.06)",
    text: "#0c1222",
    muted: "#6b7a90",
    accent: "#4f6df5",
    accentSoft: "rgba(79, 109, 245, 0.10)",
    input: "#f5f7fb",
    inputBorder: "#d8dfeb",
    shadow: "rgba(15, 23, 42, 0.06)",
    notice: "rgba(79, 109, 245, 0.10)",
    noticeText: "#3d5bd6",
  },
  dark: {
    background: "#060a14",
    surface: "rgba(255, 255, 255, 0.03)",
    surfaceStrong: "#0f1520",
    border: "rgba(255, 255, 255, 0.08)",
    borderSoft: "rgba(255, 255, 255, 0.04)",
    text: "#eef0f5",
    muted: "#7a8594",
    accent: "#6993ff",
    accentSoft: "rgba(105, 147, 255, 0.12)",
    input: "#0c1018",
    inputBorder: "rgba(255, 255, 255, 0.08)",
    shadow: "rgba(0, 0, 0, 0.5)",
    notice: "rgba(105, 147, 255, 0.10)",
    noticeText: "#93b4ff",
  },
};

export function useColorPalette() {
  const scheme = useColorScheme();

  return palettes[scheme];
}
