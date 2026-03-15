import { useForm } from "@tanstack/react-form";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { InlineNotice } from "@/components/ui/inline-notice";
import { TextField } from "@/components/ui/text-field";
import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";
import { DAY_MS, parseDateInput } from "@/lib/time";

export type InvoiceClientOption = {
  _id: string;
  name: string;
};

export type InvoiceProjectOption = {
  _id: string;
  name: string;
  client: string;
};

export type InvoiceModalInitialValues = {
  startDateInput: string;
  endDateInput: string;
  clientId: string;
  projectId: string;
};

export type InvoiceModalSubmitValues = {
  startAt: number;
  endAt: number;
  clientId: string;
  projectId?: string;
};

export function InvoiceModal({
  visible,
  busy = false,
  initialValues,
  clients,
  projects,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  busy?: boolean;
  initialValues: InvoiceModalInitialValues;
  clients: InvoiceClientOption[];
  projects: InvoiceProjectOption[];
  onClose: () => void;
  onSubmit: (values: InvoiceModalSubmitValues) => Promise<void>;
}) {
  const palette = useColorPalette();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(new Animated.Value(visible ? 0 : 24)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      if (!value.clientId) {
        setErrorMessage("Select a client before creating an invoice.");
        return;
      }

      const startAt = parseDateInput(value.startDateInput);
      if (!startAt) {
        setErrorMessage("Start date must use YYYY-MM-DD.");
        return;
      }

      const endAtDayStart = parseDateInput(value.endDateInput);
      if (!endAtDayStart) {
        setErrorMessage("End date must use YYYY-MM-DD.");
        return;
      }

      if (endAtDayStart < startAt) {
        setErrorMessage("End date must be on or after the start date.");
        return;
      }

      await onSubmit({
        startAt,
        endAt: endAtDayStart + DAY_MS - 1,
        clientId: value.clientId,
        ...(value.projectId ? { projectId: value.projectId } : {}),
      });
    },
  });

  useEffect(() => {
    if (!visible) {
      return;
    }
    setErrorMessage(null);
    form.reset(initialValues);
  }, [form, initialValues, visible]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    animationRef.current?.stop();

    if (visible) {
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(24);
      animationRef.current = Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 190,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 230,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      animationRef.current.start();
      return;
    }

    animationRef.current = Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 24,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    animationRef.current.start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
      }
    });
  }, [backdropOpacity, mounted, sheetTranslateY, visible]);

  useEffect(
    () => () => {
      animationRef.current?.stop();
    },
    [],
  );

  const sortedClients = useMemo(
    () =>
      [...clients].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [clients],
  );
  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [projects],
  );
  const clientComboboxOptions = useMemo<ComboboxOption[]>(
    () =>
      sortedClients.map((client) => ({
        value: client._id,
        label: client.name,
      })),
    [sortedClients],
  );

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#020617",
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.54],
            }),
          }}
        />
        <View className="flex-1 justify-end px-3 pb-3 pt-8 md:items-center md:justify-center">
          <Animated.View
            style={{
              width: "100%",
              maxWidth: 860,
              transform: [{ translateY: sheetTranslateY }],
            }}
          >
            <View
              className="w-full overflow-hidden rounded-2xl border"
              style={{
                maxHeight: "92%",
                borderColor: palette.border,
                backgroundColor: palette.surfaceStrong,
              }}
            >
              <View
                className="flex-row items-center justify-between border-b px-4 py-3"
                style={{ borderColor: palette.border }}
              >
                <Text
                  className="text-lg"
                  style={{
                    color: palette.text,
                    fontFamily: Fonts.sans,
                    fontWeight: "600",
                  }}
                >
                  New Invoice Entry
                </Text>
                <Pressable
                  className="h-8 w-8 items-center justify-center rounded-lg border"
                  onPress={onClose}
                  style={({ pressed }) => ({
                    borderColor: palette.border,
                    backgroundColor: pressed ? palette.accentSoft : "transparent",
                  })}
                  accessibilityRole="button"
                  accessibilityLabel="Close invoice modal"
                >
                  <FontAwesome6 name="xmark" size={14} color={palette.text} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  paddingTop: 12,
                  gap: 12,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <InlineNotice message={errorMessage} />

                <form.Field name="startDateInput">
                  {(field) => (
                    <TextField
                      label="Start date (YYYY-MM-DD)"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={field.handleChange}
                      placeholder="2026-03-01"
                      autoCapitalize="none"
                      editable={!busy}
                    />
                  )}
                </form.Field>

                <form.Field name="endDateInput">
                  {(field) => (
                    <TextField
                      label="End date (YYYY-MM-DD)"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChangeText={field.handleChange}
                      placeholder="2026-03-31"
                      autoCapitalize="none"
                      editable={!busy}
                    />
                  )}
                </form.Field>

                <form.Subscribe selector={(state) => state.values}>
                  {(values) => {
                    const availableProjects = sortedProjects.filter(
                      (project) =>
                        !values.clientId || project.client === values.clientId,
                    );
                    const projectComboboxOptions: ComboboxOption[] = [
                      {
                        value: "",
                        label: "All projects for this client",
                      },
                      ...availableProjects.map((project) => ({
                        value: project._id,
                        label: project.name,
                      })),
                    ];

                    return (
                      <View
                        className="gap-3"
                        style={{
                          position: "relative",
                          zIndex: 120,
                        }}
                      >
                        <Combobox
                          label="Client"
                          value={values.clientId}
                          options={clientComboboxOptions}
                          placeholder="Select a client"
                          searchPlaceholder="Search clients..."
                          emptyLabel="No clients found."
                          disabled={busy}
                          onChange={(nextClientId) => {
                            if (busy) {
                              return;
                            }

                            const hasValidProject = availableProjects.some(
                              (project) => project._id === values.projectId,
                            );

                            form.setFieldValue("clientId", nextClientId);
                            if (!hasValidProject) {
                              form.setFieldValue("projectId", "");
                            }
                          }}
                        />

                        <Combobox
                          label="Project (optional)"
                          value={values.projectId}
                          options={projectComboboxOptions}
                          placeholder={
                            values.clientId
                              ? "All projects for this client"
                              : "Choose a client first"
                          }
                          searchPlaceholder="Search projects..."
                          emptyLabel={
                            values.clientId
                              ? "No projects found."
                              : "Choose a client first."
                          }
                          disabled={!values.clientId || busy}
                          onChange={(nextProjectId) => {
                            if (busy) {
                              return;
                            }
                            form.setFieldValue("projectId", nextProjectId);
                          }}
                        />
                      </View>
                    );
                  }}
                </form.Subscribe>

                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button
                      label="Create invoice entry"
                      loading={isSubmitting || busy}
                      onPress={() => void form.handleSubmit()}
                    />
                  )}
                </form.Subscribe>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}
