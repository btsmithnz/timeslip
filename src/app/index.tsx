import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { Platform, Text, View } from "react-native";

import { PublicLayout } from "@/components/public/layout";
import { PublicStatusScreen } from "@/components/public/status-screen";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export default function LandingScreen() {
  const palette = useColorPalette();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (Platform.OS !== "web") {
    if (isLoading) {
      return (
        <PublicStatusScreen
          title="Opening Timeslip"
          message="Checking your session so we can send you to the right workspace."
        />
      );
    }

    return <Redirect href={isAuthenticated ? "/app" : "/login"} />;
  }

  return (
    <PublicLayout>
      <View className="mx-auto w-full max-w-5xl px-2 pb-8 pt-8 md:pt-14">
        <View className="mx-auto flex w-full max-w-3xl items-center text-center">
          <View
            className="rounded-lg border px-3 py-1.5"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.surface,
            }}
          >
            <Text
              className="text-xs"
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontWeight: "500",
              }}
            >
              Time tracking, client records, and invoices in one running book
            </Text>
          </View>

          <Text
            className="mt-6 max-w-3xl text-center text-4xl leading-[44px] md:text-6xl md:leading-[64px]"
            style={{
              color: palette.text,
              fontFamily: Fonts.sans,
              fontWeight: "700",
            }}
          >
            A steadier way to track work and turn finished hours into invoices.
          </Text>

          <Text
            className="mt-4 max-w-2xl text-center text-base leading-7 md:text-lg"
            style={{ color: palette.muted }}
          >
            Timeslip keeps your sessions, clients, projects, and invoice prep
            aligned so the admin never drifts away from the work.
          </Text>

          <View className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <View className="sm:flex-1">
              <LinkButton
                href="/sign-up"
                label="Create account"
                variant="secondary"
              />
            </View>
            <View className="sm:flex-1">
              <LinkButton href="/login" label="Log in" variant="secondary" />
            </View>
          </View>

          <View className="mt-6 flex w-full max-w-3xl flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {[
              "Start timers on mobile and reconcile on web.",
              "Keep client work grouped by project.",
              "Carry billable hours cleanly into invoices.",
            ].map((item) => (
              <View key={item} className="flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
                <Text
                  className="text-xs md:text-sm"
                  style={{ color: palette.muted }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-10 flex w-full flex-col gap-3 md:flex-row md:items-stretch">
          {[
            {
              title: "Track live sessions",
              body: "Capture work as it happens, then stop, review, and tidy it up later.",
            },
            {
              title: "Keep the client ledger clean",
              body: "Projects and tasks stay attached to the customer they belong to.",
            },
            {
              title: "Invoice from finished work",
              body: "Prepare billable time for invoicing without a separate cleanup pass.",
            },
          ].map((item) => (
            <View key={item.title} className="md:flex-1">
              <Card
                eyebrow="Timeslip Access"
                title={item.title}
                description={item.body}
              >
                <View
                  className="h-px"
                  style={{ backgroundColor: palette.border }}
                />
                <Text
                  className="text-sm leading-6"
                  style={{ color: palette.muted }}
                >
                  Timeslip is shaped for freelancers, consultants, and small
                  studios that need a calmer operational rhythm.
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </View>
    </PublicLayout>
  );
}
