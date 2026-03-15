import { TextInput, type TextInputProps, View } from "react-native";

import { Text } from "@/components/ui/text";
import { useColorPalette } from "@/hooks/use-color-palette";

export function TextField({ label, ...props }: TextInputProps & { label: string }) {
  const palette = useColorPalette();

  return (
    <View className="gap-2">
      <Text className="text-[11px]" color="muted" uppercase>
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
