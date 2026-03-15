import { View } from "react-native";

import { useColorPalette } from "@/hooks/use-color-palette";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function PublicBackground() {
  const palette = useColorPalette();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="absolute inset-0 overflow-hidden">
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.3 : 0.5 }}>
        <View className="absolute left-[8%] top-0 bottom-0 w-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute left-[24%] top-0 bottom-0 w-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute left-[42%] top-0 bottom-0 w-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute left-[62%] top-0 bottom-0 w-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute right-[12%] top-0 bottom-0 w-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute top-[16%] left-0 right-0 h-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute top-[28%] left-0 right-0 h-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute top-[40%] left-0 right-0 h-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute top-[56%] left-0 right-0 h-px" style={{ backgroundColor: palette.borderSoft }} />
        <View className="absolute bottom-[18%] left-0 right-0 h-px" style={{ backgroundColor: palette.borderSoft }} />
      </View>

      <View className="absolute left-[10%] top-[14%] hidden h-10 rounded-md md:flex" style={{ width: "18%", backgroundColor: palette.accentSoft }} />
      <View className="absolute left-[31%] top-[14%] hidden h-10 rounded-md md:flex" style={{ width: "11%", backgroundColor: palette.surface }} />
      <View className="absolute left-[45%] top-[14%] hidden h-10 rounded-md md:flex" style={{ width: "22%", backgroundColor: palette.surface }} />

      <View className="absolute left-[14%] top-[26%] hidden h-9 rounded-md md:flex" style={{ width: "26%", backgroundColor: palette.surface }} />
      <View className="absolute left-[43%] top-[26%] hidden h-9 rounded-md md:flex" style={{ width: "14%", backgroundColor: palette.accentSoft }} />
      <View className="absolute left-[60%] top-[26%] hidden h-9 rounded-md md:flex" style={{ width: "18%", backgroundColor: palette.surface }} />

      <View className="absolute left-[18%] top-[38%] hidden h-8 rounded-md md:flex" style={{ width: "20%", backgroundColor: palette.surface }} />
      <View className="absolute left-[42%] top-[38%] hidden h-8 rounded-md md:flex" style={{ width: "24%", backgroundColor: palette.surface }} />
      <View className="absolute left-[69%] top-[38%] hidden h-8 rounded-md md:flex" style={{ width: "9%", backgroundColor: palette.accentSoft }} />

      <View className="absolute left-[8%] top-[20%] h-8 rounded-md md:hidden" style={{ width: "38%", backgroundColor: palette.accentSoft, opacity: isDark ? 0.6 : 0.8 }} />
      <View className="absolute right-[8%] top-[20%] h-8 rounded-md md:hidden" style={{ width: "28%", backgroundColor: palette.surface, opacity: isDark ? 0.7 : 0.9 }} />
      <View className="absolute left-[8%] top-[32%] h-8 rounded-md md:hidden" style={{ width: "56%", backgroundColor: palette.surface, opacity: isDark ? 0.7 : 0.9 }} />
      <View className="absolute left-[8%] top-[44%] h-8 rounded-md md:hidden" style={{ width: "32%", backgroundColor: palette.surface, opacity: isDark ? 0.6 : 0.8 }} />

      <View className="absolute left-0 right-0 top-0 h-40" style={{ backgroundColor: palette.background, opacity: 0.12 }} />
      <View className="absolute bottom-0 left-0 right-0 h-64" style={{ backgroundColor: palette.background, opacity: isDark ? 0.7 : 0.55 }} />
    </View>
  );
}
