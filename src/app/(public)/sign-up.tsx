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

  return "We couldn't create that account just yet. Please review your details and try again.";
}

export default function SignUpScreen() {
  const router = useRouter();
  const palette = useColorPalette();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      try {
        const { error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        });

        console.log(error);

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
          title="Sign Up"
          description="Create a Timeslip account to start tracking billable work."
          footer={
            <LinkRow
              prompt="Already have an account?"
              label="Log in"
              href="/login"
            />
          }
        >
          <InlineNotice message={errorMessage} />
          <form.Field name="name">
            {(field) => (
              <TextField
                label="Name"
                autoCapitalize="words"
                autoComplete="name"
                placeholder="Avery Consultant"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
              />
            )}
          </form.Field>
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
                autoComplete="new-password"
                placeholder="Choose a password"
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
                label="Create account"
                onPress={() => void form.handleSubmit()}
                loading={isSubmitting}
              />
            )}
          </form.Subscribe>
          <Link href="/login">
            <Text
              className="text-center text-sm"
              style={{
                color: palette.accent,
                fontFamily: Fonts.sans,
                fontWeight: "500",
              }}
            >
              Already working in Timeslip? Log in.
            </Text>
          </Link>
        </Card>
      </View>
    </PublicLayout>
  );
}
