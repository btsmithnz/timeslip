import { Link, type Href } from "expo-router";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md";

const BUTTON_CONTAINER_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 items-center justify-center rounded-lg px-3",
  md: "min-h-11 items-center justify-center rounded-xl px-4",
};

const BUTTON_LABEL_CLASS: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
};

export function Button({
  label,
  onPress,
  loading,
  variant = "primary",
  size = "md",
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const palette = useColorPalette();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className={BUTTON_CONTAINER_CLASS[size]}
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
          className={BUTTON_LABEL_CLASS[size]}
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
  size = "md",
}: {
  href: Href;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const palette = useColorPalette();
  const isPrimary = variant === "primary";

  return (
    <Link href={href} asChild>
      <Pressable
        className={BUTTON_CONTAINER_CLASS[size]}
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
          className={BUTTON_LABEL_CLASS[size]}
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
