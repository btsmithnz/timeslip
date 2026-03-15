import { Text, View } from "react-native";

import { useColorPalette } from "@/hooks/use-color-palette";

export type NoticeTone = "error" | "neutral";

export function InlineNotice({
  message,
  tone = "error",
}: {
  message?: string | null;
  tone?: NoticeTone;
}) {
  const palette = useColorPalette();

  if (!message) {
    return null;
  }

  return (
    <View
      className="rounded-xl px-3.5 py-3"
      style={{ backgroundColor: tone === "error" ? palette.notice : palette.accentSoft }}
    >
      <Text className="text-sm leading-6" style={{ color: tone === "error" ? palette.noticeText : palette.text }}>
        {message}
      </Text>
    </View>
  );
}
