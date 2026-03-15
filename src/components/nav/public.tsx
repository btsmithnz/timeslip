import { Link, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

function NavLink({ href, label }: { href: Href; label: string }) {
  const palette = useColorPalette();

  return (
    <Link href={href} asChild>
      <Pressable className="h-9 items-center justify-center px-2">
        <Text className="text-sm" style={{ color: palette.muted, fontFamily: Fonts.sans, fontWeight: "500" }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export function PublicNavigation() {
  const palette = useColorPalette();

  return (
    <SafeAreaView edges={["top"]} className="absolute left-0 right-0 top-0 z-20">
      <View className="px-4 pt-3">
        <View
          className="mx-auto flex h-12 w-full max-w-4xl flex-row items-center justify-between rounded-2xl border px-3 md:px-4"
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.borderSoft,
            shadowColor: palette.shadow,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <Link href="/" asChild>
            <Pressable className="flex-row items-center gap-2.5">
              <View
                className="h-7 w-7 items-center justify-center rounded-lg border"
                style={{ backgroundColor: palette.accentSoft, borderColor: palette.border }}
              >
                <View className="h-3 w-3 rounded-sm" style={{ backgroundColor: palette.accent }} />
              </View>
              <Text className="text-base" style={{ color: palette.text, fontFamily: Fonts.sans, fontWeight: "600" }}>
                Timeslip
              </Text>
            </Pressable>
          </Link>

          <View className="flex-row items-center gap-2 md:gap-4">
            <View className="hidden md:flex md:flex-row md:items-center md:gap-5">
              <NavLink href="/" label="Workflow" />
            </View>
            <NavLink href="/login" label="Login" />
            <Link href="/sign-up" asChild>
              <Pressable
                className="h-8 items-center justify-center rounded-lg px-3.5"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? palette.text : palette.accent,
                })}
              >
                <Text className="text-xs" style={{ color: palette.surfaceStrong, fontFamily: Fonts.sans, fontWeight: "600" }}>
                  Get Started
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
