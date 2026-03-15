import {
  Text as RNText,
  type TextProps as RNTextProps,
  StyleSheet,
} from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

type Weight = "400" | "500" | "600" | "700";
type Color = "default" | "muted" | "accent" | "inverted";

export type TextProps = RNTextProps & {
  weight?: Weight;
  color?: Color;
  uppercase?: boolean;
};

const WEIGHT_FONT: Record<Weight, string> = {
  "400": Fonts.sans,
  "500": Fonts.sansMedium,
  "600": Fonts.sansSemiBold,
  "700": Fonts.sansBold,
};

export function Text({
  weight = "400",
  color = "default",
  uppercase,
  style,
  ...rest
}: TextProps) {
  const palette = useColorPalette();

  const colorValue =
    color === "muted"
      ? palette.muted
      : color === "accent"
        ? palette.accent
        : color === "inverted"
          ? palette.surfaceStrong
          : palette.text;

  return (
    <RNText
      style={[
        { fontFamily: WEIGHT_FONT[weight], fontWeight: weight, color: colorValue },
        uppercase && uppercaseStyles.uppercase,
        style,
      ]}
      {...rest}
    />
  );
}

const uppercaseStyles = StyleSheet.create({
  uppercase: {
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
});
