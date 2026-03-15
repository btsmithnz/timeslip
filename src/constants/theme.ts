/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#4f6df5';
const tintColorDark = '#eef0f5';

export const Colors = {
  light: {
    text: '#0c1222',
    background: '#f4f6fa',
    tint: tintColorLight,
    icon: '#6b7a90',
    tabIconDefault: '#6b7a90',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#eef0f5',
    background: '#060a14',
    tint: tintColorDark,
    icon: '#7a8594',
    tabIconDefault: '#7a8594',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Figtree_400Regular',
    sansMedium: 'Figtree_500Medium',
    sansSemiBold: 'Figtree_600SemiBold',
    sansBold: 'Figtree_700Bold',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Figtree_400Regular',
    sansMedium: 'Figtree_500Medium',
    sansSemiBold: 'Figtree_600SemiBold',
    sansBold: 'Figtree_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sansMedium: "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sansSemiBold: "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    sansBold: "'Figtree', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
