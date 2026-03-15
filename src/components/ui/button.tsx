import { Link, type Href } from "expo-router";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

type ButtonVariant = "primary" | "secondary";

export function Button({
  label,
  onPress,
  loading,
  variant = "primary",
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: ButtonVariant;
}) {
  const palette = useColorPalette();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className="min-h-11 items-center justify-center rounded-xl px-4"
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        backgroundColor: isPrimary
          ? pressed
            ? palette.text
            : palette.accent
          : pressed
            ? palette.accentSoft
            : "transparent",
        borderColor: isPrimary ? "transparent" : palette.border,
        borderWidth: isPrimary ? 0 : 1,
        opacity: loading ? 0.75 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.surfaceStrong : palette.text} />
      ) : (
        <Text
          className="text-sm"
          style={{
            color: isPrimary ? palette.surfaceStrong : palette.text,
            fontFamily: Fonts.sans,
            fontWeight: isPrimary ? "600" : "500",
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function LinkButton({
  href,
  label,
  variant = "primary",
}: {
  href: Href;
  label: string;
  variant?: ButtonVariant;
}) {
  const palette = useColorPalette();
  const isPrimary = variant === "primary";

  return (
    <Link href={href} asChild>
      <Pressable
        className="min-h-11 items-center justify-center rounded-xl px-4"
        style={({ pressed }) => ({
          backgroundColor: isPrimary
            ? pressed
              ? palette.text
              : palette.accent
            : pressed
              ? palette.accentSoft
              : "transparent",
          borderColor: isPrimary ? "transparent" : palette.border,
          borderWidth: isPrimary ? 0 : 1,
        })}
      >
        <Text
          className="text-sm"
          style={{
            color: isPrimary ? palette.surfaceStrong : palette.text,
            fontFamily: Fonts.sans,
            fontWeight: isPrimary ? "600" : "500",
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
