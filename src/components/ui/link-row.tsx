import { Link, type Href } from "expo-router";
import { View } from "react-native";

import { Text } from "@/components/ui/text";

export function LinkRow({
  prompt,
  label,
  href,
}: {
  prompt: string;
  label: string;
  href: Href;
}) {
  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <Text className="text-sm" color="muted">
        {prompt}
      </Text>
      <Link href={href}>
        <Text className="text-sm" color="accent" weight="500">
          {label}
        </Text>
      </Link>
    </View>
  );
}
