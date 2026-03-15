import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { PublicLayout } from "@/components/public/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineNotice } from "@/components/ui/inline-notice";
import { LinkRow } from "@/components/ui/link-row";
import { TextField } from "@/components/ui/text-field";
import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";
import { authClient } from "@/lib/auth-client";

function getAuthErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    const message = error.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return "We couldn't log you in with those details. Please try again.";
}

export default function LoginScreen() {
  const router = useRouter();
  const palette = useColorPalette();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      try {
        const { error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: true,
        });

        if (error) {
          setErrorMessage(getAuthErrorMessage(error));
          return;
        }

        router.replace("/app");
      } catch (error) {
        setErrorMessage(getAuthErrorMessage(error));
      }
    },
  });

  return (
    <PublicLayout centered>
      <View className="mx-auto w-full max-w-md">
        <Card
          eyebrow="Timeslip Access"
          title="Login"
          description="Enter your Timeslip account details."
          footer={
            <LinkRow
              prompt="Need an account?"
              label="Sign up"
              href="/sign-up"
            />
          }
        >
          <InlineNotice message={errorMessage} />
          <form.Field name="email">
            {(field) => (
              <TextField
                label="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@studio.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
              />
            )}
          </form.Field>
          <form.Field name="password">
            {(field) => (
              <TextField
                label="Password"
                autoCapitalize="none"
                autoComplete="current-password"
                placeholder="Enter your password"
                secureTextEntry
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                label="Log in"
                onPress={() => void form.handleSubmit()}
                loading={isSubmitting}
              />
            )}
          </form.Subscribe>
          <Link href="/sign-up">
            <Text
              className="text-center text-sm"
              style={{
                color: palette.accent,
                fontFamily: Fonts.sans,
                fontWeight: "500",
              }}
            >
              Create a new Timeslip account
            </Text>
          </Link>
        </Card>
      </View>
    </PublicLayout>
  );
}
