import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

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

  return (
    <View
      className="rounded-2xl border px-5 py-5 md:px-6 md:py-6"
      style={{
        backgroundColor: palette.surfaceStrong,
        borderColor: palette.border,
        shadowColor: palette.shadow,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
      }}
    >
      {eyebrow ? (
        <Text
          className="text-[11px] uppercase"
          style={{ color: palette.muted, fontFamily: Fonts.mono, letterSpacing: 1.6 }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <Text
        className={eyebrow ? "mt-3 text-2xl" : "text-2xl"}
        style={{ color: palette.text, fontFamily: Fonts.sans, fontWeight: "600" }}
      >
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
          {description}
        </Text>
      ) : null}
      <View className="mt-5 gap-3.5">{children}</View>
      {footer ? <View className="mt-5">{footer}</View> : null}
    </View>
  );
}
