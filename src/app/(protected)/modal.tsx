import { Link } from "expo-router";
import { StyleSheet } from "react-native";

import { Text } from "@/components/ui/text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text weight="700" style={{ fontSize: 32, lineHeight: 32 }}>This is a modal</Text>
      <Link href="/app" dismissTo style={styles.link}>
        <Text color="accent" style={{ fontSize: 16, lineHeight: 30 }}>Go to home screen</Text>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
