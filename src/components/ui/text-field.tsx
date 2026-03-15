import { Text, TextInput, type TextInputProps, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  const palette = useColorPalette();

  return (
    <View className="gap-2">
      <Text
        className="text-[11px] uppercase"
        style={{ color: palette.muted, fontFamily: Fonts.mono, letterSpacing: 1.6 }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={palette.muted}
        className="rounded-xl border px-3.5 py-3 text-sm"
        style={{
          backgroundColor: palette.input,
          borderColor: palette.inputBorder,
          color: palette.text,
        }}
        {...props}
      />
    </View>
  );
}
