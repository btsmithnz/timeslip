import { FontAwesome6 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View, useWindowDimensions } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AppTabsLayout() {
  const colorScheme = useColorScheme();
  const tabPalette = Colors[colorScheme ?? "light"];
  const palette = useColorPalette();
  const { width } = useWindowDimensions();
  const tabBarWidth = 140;
  const tabBarLeft = Math.max((width - tabBarWidth) / 2, 16);

  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenLayout={({ children }) => (
        <View style={{ flex: 1, backgroundColor: palette.background }}>
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 1280,
              alignSelf: "center",
            }}
          >
            {children}
          </View>
        </View>
      )}
      screenOptions={{
        tabBarActiveTintColor: isDark
          ? "#eef0f5"
          : tabPalette.tabIconSelected,
        tabBarInactiveTintColor: tabPalette.tabIconDefault,
        tabBarActiveBackgroundColor: isDark ? "#1e2430" : "#FFFFFF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          borderRadius: 999,
          overflow: "hidden",
          marginHorizontal: 3,
          marginVertical: 4,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: Platform.select({ ios: 28, default: 20 }),
          left: tabBarLeft,
          width: tabBarWidth,
          height: 52,
          borderTopWidth: 0,
          borderRadius: 999,
          overflow: "hidden",
          paddingHorizontal: 4,
          paddingVertical: 2,
          backgroundColor: isDark ? "#111520" : "#eaecf2",
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.4 : 0.14,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Timers",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="clock.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="file-invoice-dollar" size={18} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
