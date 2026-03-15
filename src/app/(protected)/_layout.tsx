import { useConvexAuth } from "convex/react";
import { Redirect, Stack } from "expo-router";

import { PublicStatusScreen } from "@/components/public/status-screen";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <PublicStatusScreen
        title="Unlocking your workspace"
        message="Confirming your session before we load clients, projects, and timers."
      />
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="app" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          title: "Modal",
        }}
      />
    </Stack>
  );
}
