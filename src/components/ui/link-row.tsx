import { Link, type Href } from "expo-router";
import { Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export function LinkRow({
  prompt,
  label,
  href,
}: {
  prompt: string;
  label: string;
  href: Href;
}) {
  const palette = useColorPalette();

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Text className="text-sm" style={{ color: palette.muted }}>
        {prompt}
      </Text>
      <Link href={href}>
        <Text
          className="text-sm"
          style={{ color: palette.accent, fontFamily: Fonts.sans, fontWeight: "500" }}
        >
          {label}
        </Text>
      </Link>
    </View>
  );
}
