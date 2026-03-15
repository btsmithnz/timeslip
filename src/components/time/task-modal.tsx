import { useForm } from "@tanstack/react-form";
import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  type ComboboxOption,
} from "@/components/ui/combobox";
import { InlineNotice } from "@/components/ui/inline-notice";
import { TextField } from "@/components/ui/text-field";
import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";
import { parseDateTimeInput } from "@/lib/time";

export type ClientOption = {
  _id: string;
  name: string;
};

export type ProjectOption = {
  _id: string;
  name: string;
  client: string;
};

export type TaskModalInitialValues = {
  title: string;
  description: string;
  clientId: string;
  projectId: string;
  startAtInput: string;
  endAtInput: string;
};

export type TaskModalSubmitValues = {
  title: string;
  description?: string;
  projectId: string;
  startAt: number;
  endAt?: number;
};

export function TaskModal({
  visible,
  mode,
  locked,
  busy = false,
  initialValues,
  clients,
  projects,
  onClose,
  onSubmit,
  onDelete,
  onCreateClient,
  onCreateProject,
}: {
  visible: boolean;
  mode: "create" | "edit";
  locked: boolean;
  busy?: boolean;
  initialValues: TaskModalInitialValues;
  clients: ClientOption[];
  projects: ProjectOption[];
  onClose: () => void;
  onSubmit: (values: TaskModalSubmitValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCreateClient: (name: string) => Promise<ClientOption | null>;
  onCreateProject: (clientId: string, name: string) => Promise<ProjectOption | null>;
}) {
  const palette = useColorPalette();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetTranslateY = useRef(new Animated.Value(visible ? 0 : 24)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setErrorMessage(null);

      const title = value.title.trim();
      if (!title) {
        setErrorMessage("Task title is required.");
        return;
      }

      if (!value.projectId) {
        setErrorMessage("Select or create a project before saving.");
        return;
      }

      const startAt = parseDateTimeInput(value.startAtInput);
      if (!startAt) {
        setErrorMessage("Start time must use YYYY-MM-DD HH:mm.");
        return;
      }

      const trimmedEnd = value.endAtInput.trim();
      const endAt = trimmedEnd ? parseDateTimeInput(trimmedEnd) : null;
      if (trimmedEnd && !endAt) {
        setErrorMessage("End time must use YYYY-MM-DD HH:mm.");
        return;
      }
      if (endAt && endAt <= startAt) {
        setErrorMessage("End time must be after start time.");
        return;
      }

      await onSubmit({
        title,
        description: value.description.trim() || undefined,
        projectId: value.projectId,
        startAt,
        ...(endAt ? { endAt } : {}),
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
              {mode === "create" ? "New Task" : locked ? "Task (Invoiced)" : "Edit Task"}
            </Text>
            <Pressable
              className="h-8 w-8 items-center justify-center rounded-lg border"
              onPress={onClose}
              style={({ pressed }) => ({
                borderColor: palette.border,
                backgroundColor: pressed ? palette.accentSoft : "transparent",
              })}
              accessibilityRole="button"
              accessibilityLabel="Close task modal"
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
            <InlineNotice message={locked ? "Invoiced tasks cannot be edited or deleted." : null} tone="neutral" />
            <InlineNotice message={errorMessage} />

            <form.Field name="title">
              {(field) => (
                <TextField
                  label="Task title"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="What did you work on?"
                  editable={!locked && !busy}
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values}>
              {(values) => {
                const availableProjects = sortedProjects.filter(
                  (project) => !values.clientId || project.client === values.clientId,
                );
                const projectComboboxOptions: ComboboxOption[] =
                  availableProjects.map((project) => ({
                    value: project._id,
                    label: project.name,
                  }));

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
                      disabled={locked || busy}
                      creating={creatingClient}
                      onChange={(nextClientId) => {
                        if (locked || busy) {
                          return;
                        }

                        const firstProjectForClient = sortedProjects.find(
                          (project) => project.client === nextClientId,
                        );
                        const hasExistingProjectForClient = sortedProjects.some(
                          (project) =>
                            project.client === nextClientId &&
                            project._id === values.projectId,
                        );

                        form.setFieldValue("clientId", nextClientId);
                        form.setFieldValue(
                          "projectId",
                          hasExistingProjectForClient
                            ? values.projectId
                            : (firstProjectForClient?._id ?? ""),
                        );
                      }}
                      onCreate={async (input) => {
                        if (locked || busy) {
                          return null;
                        }

                        setCreatingClient(true);
                        try {
                          const client = await onCreateClient(input);
                          if (!client) {
                            return null;
                          }

                          return { value: client._id, label: client.name };
                        } catch (error) {
                          const message =
                            error instanceof Error
                              ? error.message
                              : "Unable to create client.";
                          setErrorMessage(message);
                          return null;
                        } finally {
                          setCreatingClient(false);
                        }
                      }}
                    />

                    <Combobox
                      label="Project"
                      value={values.projectId}
                      options={projectComboboxOptions}
                      placeholder={
                        values.clientId
                          ? "Select a project"
                          : "Choose a client first"
                      }
                      searchPlaceholder="Search projects..."
                      emptyLabel={
                        values.clientId
                          ? "No projects found."
                          : "Choose a client first."
                      }
                      disabled={!values.clientId || locked || busy}
                      creating={creatingProject}
                      onChange={(nextProjectId) => {
                        if (locked || busy) {
                          return;
                        }
                        form.setFieldValue("projectId", nextProjectId);
                      }}
                      onCreate={
                        values.clientId
                          ? async (input) => {
                              if (locked || busy) {
                                return null;
                              }

                              setCreatingProject(true);
                              try {
                                const project = await onCreateProject(
                                  values.clientId,
                                  input,
                                );
                                if (!project) {
                                  return null;
                                }

                                return {
                                  value: project._id,
                                  label: project.name,
                                };
                              } catch (error) {
                                const message =
                                  error instanceof Error
                                    ? error.message
                                    : "Unable to create project.";
                                setErrorMessage(message);
                                return null;
                              } finally {
                                setCreatingProject(false);
                              }
                            }
                          : undefined
                      }
                    />
                  </View>
                );
              }}
            </form.Subscribe>

            <form.Field name="description">
              {(field) => (
                <TextField
                  label="Description (optional)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="Add context for this entry"
                  editable={!locked && !busy}
                />
              )}
            </form.Field>

            <form.Field name="startAtInput">
              {(field) => (
                <TextField
                  label="Start time (YYYY-MM-DD HH:mm)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="2026-03-15 09:30"
                  autoCapitalize="none"
                  editable={!locked && !busy}
                />
              )}
            </form.Field>

            <form.Field name="endAtInput">
              {(field) => (
                <TextField
                  label="End time (optional, YYYY-MM-DD HH:mm)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="Leave blank for active timer"
                  autoCapitalize="none"
                  editable={!locked && !busy}
                />
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <View className="gap-2">
                  {locked ? null : (
                    <Button
                      label={mode === "create" ? "Create task" : "Save changes"}
                      loading={isSubmitting || busy}
                      onPress={() => void form.handleSubmit()}
                    />
                  )}
                  {mode === "edit" && !locked && onDelete ? (
                    <Button
                      label={busy ? "Deleting..." : "Delete task"}
                      variant="secondary"
                      onPress={() => {
                        if (busy) {
                          return;
                        }
                        void onDelete();
                      }}
                    />
                  ) : null}
                </View>
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
