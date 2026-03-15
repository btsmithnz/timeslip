import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PublicNavigation } from "@/components/nav/public";
import { PublicBackground } from "@/components/public/background";
import { useColorPalette } from "@/hooks/use-color-palette";

export function PublicLayout({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  const palette = useColorPalette();

  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <PublicBackground />
      <PublicNavigation />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 88,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView edges={["bottom"]} className="flex-1 px-4">
          <View
            className="mx-auto flex w-full max-w-6xl"
            style={{
              flex: centered ? 1 : undefined,
              justifyContent: centered ? "center" : undefined,
            }}
          >
            {children}
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
