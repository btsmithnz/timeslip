import { useConvexAuth } from "convex/react";
import { Redirect, Stack } from "expo-router";

import { PublicStatusScreen } from "@/components/public/status-screen";

export default function PublicLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <PublicStatusScreen
        title="Preparing your desk"
        message="Checking your Timeslip session before we render the auth pages."
      />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/app" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
