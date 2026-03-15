import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { Platform, View } from "react-native";

import { PublicLayout } from "@/components/public/layout";
import { PublicStatusScreen } from "@/components/public/status-screen";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
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
            <Text className="text-xs" color="muted" weight="500">
              Time, clients, and invoices — one book
            </Text>
          </View>

          <Text
            className="mt-6 max-w-3xl text-center text-4xl leading-[44px] md:text-6xl md:leading-[64px]"
            weight="700"
          >
            Track work. Bill clients. Stay sane.
          </Text>

          <Text className="mt-4 max-w-2xl text-center text-base leading-7 md:text-lg" color="muted">
            Timeslip connects your running clock to your client ledger to your
            invoices — so nothing falls through the gap.
          </Text>

          <View className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <View className="sm:flex-1">
              <LinkButton
                href="/sign-up"
                label="Create account"
                variant="primary"
              />
            </View>
            <View className="sm:flex-1">
              <LinkButton href="/login" label="Log in" variant="secondary" />
            </View>
          </View>

          <View className="mt-6 flex w-full max-w-3xl flex-row flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {[
              "Run timers on mobile, reconcile on web.",
              "Group every session under the right client.",
              "Turn finished hours into invoices in one click.",
            ].map((item) => (
              <View key={item} className="flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.accent }}
                />
                <Text className="text-xs md:text-sm" color="muted">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-10 flex w-full flex-col gap-3 md:flex-row md:items-stretch">
          {[
            {
              title: "Capture every session",
              body: "Start a timer, do the work, stop. Review and adjust later.",
            },
            {
              title: "Clients stay organised",
              body: "Projects and tasks live under the customer they belong to.",
            },
            {
              title: "Invoice without the cleanup",
              body: "Billable hours flow straight into invoices — no second pass.",
            },
          ].map((item) => (
            <View key={item.title} className="md:flex-1">
              <Card
                eyebrow="How it works"
                title={item.title}
                description={item.body}
              >
                <View
                  className="h-px"
                  style={{ backgroundColor: palette.border }}
                />
                <Text className="text-sm leading-6" color="muted">
                  Built for freelancers, consultants, and small studios that
                  want less admin and more flow.
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </View>
    </PublicLayout>
  );
}
