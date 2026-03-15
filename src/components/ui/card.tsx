import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/use-color-palette";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function Card({
  title,
  description,
  eyebrow,
  children,
  footer,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const palette = useColorPalette();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      className="rounded-2xl border px-5 py-5 md:px-6 md:py-6"
      style={{
        backgroundColor: palette.surfaceStrong,
        borderColor: palette.border,
        shadowColor: isDark ? "rgba(0, 0, 0, 0.6)" : palette.shadow,
        shadowOpacity: isDark ? 1 : 0.35,
        shadowRadius: isDark ? 20 : 12,
        shadowOffset: { width: 0, height: isDark ? 12 : 8 },
        elevation: 4,
      }}
    >
      {eyebrow ? (
        <Text className="text-[11px]" color="muted" uppercase>
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className={eyebrow ? "mt-3 text-2xl" : "text-2xl"}
        weight="600"
      >
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-sm leading-6" color="muted">
          {description}
        </Text>
      ) : null}
      <View className="mt-5 gap-3.5">{children}</View>
      {footer ? <View className="mt-5">{footer}</View> : null}
    </View>
  );
}
