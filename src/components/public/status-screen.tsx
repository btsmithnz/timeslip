import { ActivityIndicator, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/use-color-palette";

export function PublicStatusScreen({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const palette = useColorPalette();

  return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: palette.background }}>
      <View
        className="w-full max-w-sm rounded-2xl border px-6 py-6"
        style={{
          backgroundColor: palette.surfaceStrong,
          borderColor: palette.border,
          shadowColor: palette.shadow,
          shadowOpacity: 0.45,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}
      >
        <ActivityIndicator color={palette.accent} />
        <Text className="mt-4 text-center text-2xl">
          {title}
        </Text>
        <Text className="mt-2 text-center text-sm leading-6" color="muted">
          {message}
        </Text>
      </View>
    </View>
  );
}
