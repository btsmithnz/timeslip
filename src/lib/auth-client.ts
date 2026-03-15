import { expoClient } from "@better-auth/expo/client";
import {
  convexClient,
  crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const expoScheme = Constants.expoConfig?.scheme;
const scheme = Array.isArray(expoScheme)
  ? expoScheme[0]
  : (expoScheme ?? "app.timeslip");
const storagePrefix = scheme;

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    Platform.OS === "web"
      ? crossDomainClient({ storagePrefix })
      : expoClient({
          scheme,
          storagePrefix,
          storage: SecureStore,
        }),
    convexClient(),
  ],
});
