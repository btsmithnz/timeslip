import { FontAwesome6 } from "@expo/vector-icons";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CalendarTaskSegment,
  DayCalendar,
  WeekCalendar,
} from "@/components/time/calendar";
import {
  ClientOption,
  ProjectOption,
  TaskModal,
  TaskModalInitialValues,
  TaskModalSubmitValues,
} from "@/components/time/task-modal";
import { Button } from "@/components/ui/button";
import { InlineNotice } from "@/components/ui/inline-notice";
import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";
import {
  DAY_MS,
  addDays,
  dayKey,
  formatDateLabel,
  formatDateTimeInput,
  formatDuration,
  formatWeekRange,
  getWeekDays,
  roundToQuarterHour,
  startOfDay,
  startOfWeekMonday,
} from "@/lib/time";
import { api } from "../../../../convex/_generated/api";

type ViewMode = "day" | "week";

type ModalState =
  | {
      visible: false;
    }
  | {
      visible: true;
      mode: "create" | "edit";
      taskId?: string;
      locked: boolean;
      initialValues: TaskModalInitialValues;
    };

const EMPTY_MODAL_VALUES: TaskModalInitialValues = {
  title: "",
  description: "",
  clientId: "",
  projectId: "",
  startAtInput: "",
  endAtInput: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function ChevronNavButton({
  direction,
  onPress,
  color,
  borderColor,
  backgroundColor,
}: {
  direction: "left" | "right";
  onPress: () => void;
  color: string;
  borderColor: string;
  backgroundColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-8 w-8 items-center justify-center rounded-lg border"
      style={({ pressed }) => ({
        borderColor,
        backgroundColor: pressed ? borderColor : backgroundColor,
      })}
      accessibilityRole="button"
      accessibilityLabel={direction === "left" ? "Previous" : "Next"}
    >
      <FontAwesome6
        name={direction === "left" ? "chevron-left" : "chevron-right"}
        size={12}
        color={color}
      />
    </Pressable>
  );
}

export default function HomeScreen() {
  const palette = useColorPalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { isAuthenticated } = useConvexAuth();

  const [selectedDate, setSelectedDate] = useState(() => dayjs().toDate());
  const [viewMode, setViewMode] = useState<ViewMode>(
    isDesktop ? "week" : "day",
  );
  const [hasManualViewMode, setHasManualViewMode] = useState(false);
  const [nowMs, setNowMs] = useState(() => dayjs().valueOf());
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ visible: false });

  useEffect(() => {
    if (!hasManualViewMode) {
      setViewMode(isDesktop ? "week" : "day");
    }
  }, [hasManualViewMode, isDesktop]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(dayjs().valueOf()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const weekAnchorMs = useMemo(
    () => startOfWeekMonday(selectedDate).getTime(),
    [selectedDate],
  );

  const data = useQuery(
    api.tasks.homepageWeek,
    isAuthenticated ? { weekAnchorMs } : "skip",
  );
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const createClientInline = useMutation(api.tasks.createClientInline);
  const createProjectInline = useMutation(api.tasks.createProjectInline);

  const clients = data?.clients;
  const projects = data?.projects;
  const weekTasks = data?.tasks;
  const activeTasks = data?.activeTasks;

  const clientById = useMemo(
    () =>
      new Map((clients ?? []).map((client) => [String(client._id), client])),
    [clients],
  );
  const projectById = useMemo(
    () =>
      new Map(
        (projects ?? []).map((project) => [String(project._id), project]),
      ),
    [projects],
  );
  const taskById = useMemo(
    () =>
      new Map(
        [...(weekTasks ?? []), ...(activeTasks ?? [])].map((task) => [
          String(task._id),
          task,
        ]),
      ),
    [activeTasks, weekTasks],
  );

  const projectOptions: ProjectOption[] = useMemo(
    () =>
      (projects ?? []).map((project) => ({
        _id: String(project._id),
        name: project.name,
        client: String(project.client),
      })),
    [projects],
  );
  const clientOptions: ClientOption[] = useMemo(
    () =>
      (clients ?? []).map((client) => ({
        _id: String(client._id),
        name: client.name,
      })),
    [clients],
  );

  const firstClient = clients?.[0];
  const defaultClientId = firstClient ? String(firstClient._id) : "";
  const defaultProject =
    projects?.find((project) => String(project.client) === defaultClientId) ??
    projects?.[0];
  const defaultProjectId = defaultProject ? String(defaultProject._id) : "";
  const defaultProjectClientId = defaultProject
    ? String(defaultProject.client)
    : defaultClientId;

  function openCreateModal(startAt: number, endAt?: number) {
    const safeStartAt = Number.isFinite(startAt)
      ? startAt
      : roundToQuarterHour(dayjs().valueOf());
    const safeEndAt =
      typeof endAt === "number" && Number.isFinite(endAt) && endAt > safeStartAt
        ? endAt
        : typeof endAt === "number"
          ? safeStartAt + 60 * 60 * 1000
          : undefined;

    setErrorMessage(null);
    setModalState({
      visible: true,
      mode: "create",
      locked: false,
      initialValues: {
        title: "",
        description: "",
        clientId: defaultProjectClientId,
        projectId: defaultProjectId,
        startAtInput: formatDateTimeInput(safeStartAt),
        endAtInput: safeEndAt ? formatDateTimeInput(safeEndAt) : "",
      },
    });
  }

  function openEditModal(taskId: string) {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }

    const project = projectById.get(String(task.project));
    const clientId = project ? String(project.client) : "";

    setErrorMessage(null);
    setModalState({
      visible: true,
      mode: "edit",
      taskId,
      locked: Boolean(task.invoice),
      initialValues: {
        title: task.title,
        description: task.description ?? "",
        clientId,
        projectId: String(task.project),
        startAtInput: formatDateTimeInput(task.startAt),
        endAtInput: task.endAt ? formatDateTimeInput(task.endAt) : "",
      },
    });
  }

  function navigatePrevious() {
    setSelectedDate((current) =>
      addDays(current, viewMode === "week" ? -7 : -1),
    );
  }

  function navigateNext() {
    setSelectedDate((current) => addDays(current, viewMode === "week" ? 7 : 1));
  }

  const calendarSegmentsByDay = useMemo(() => {
    const map: Record<string, CalendarTaskSegment[]> = {};
    weekDays.forEach((day) => {
      map[dayKey(day)] = [];
    });

    (weekTasks ?? []).forEach((task) => {
      const project = projectById.get(String(task.project));
      const projectName = project?.name ?? "Project";
      const endAt = task.endAt ?? nowMs;
      const boundedEndAt = Math.max(endAt, task.startAt + 15 * 60 * 1000);

      weekDays.forEach((day) => {
        const dayStart = startOfDay(day).getTime();
        const dayEnd = dayStart + DAY_MS;

        if (task.startAt < dayEnd && boundedEndAt > dayStart) {
          map[dayKey(day)].push({
            id: String(task._id),
            title: task.title,
            projectName,
            startAt: task.startAt,
            endAt: boundedEndAt,
            invoiced: Boolean(task.invoice),
            isActive: task.endAt === undefined,
          });
        }
      });
    });

    Object.values(map).forEach((segments) =>
      segments.sort((a, b) => a.startAt - b.startAt),
    );

    return map;
  }, [nowMs, projectById, weekDays, weekTasks]);

  async function handleDeleteTask(taskId: string) {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }

    if (task.invoice) {
      setErrorMessage("Invoiced tasks cannot be deleted.");
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    try {
      await deleteTask({ taskId: task._id });
      if (modalState.visible && modalState.taskId === taskId) {
        setModalState({ visible: false });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete(taskId: string) {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }
    if (task.invoice) {
      setErrorMessage("Invoiced tasks cannot be deleted.");
      return;
    }

    if (Platform.OS === "web") {
      const confirmed = globalThis.confirm("Delete this time entry?");
      if (!confirmed) {
        return;
      }
      void handleDeleteTask(taskId);
      return;
    }

    Alert.alert("Delete task", "Delete this time entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void handleDeleteTask(taskId);
        },
      },
    ]);
  }

  function handleLongPressTask(taskId: string) {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }

    if (task.invoice) {
      setErrorMessage("Invoiced tasks cannot be modified.");
      return;
    }

    Alert.alert("Task actions", "Choose an action for this entry.", [
      {
        text: "Edit",
        onPress: () => openEditModal(taskId),
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(taskId),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleSubmitTask(values: TaskModalSubmitValues) {
    const project = (projects ?? []).find(
      (item) => String(item._id) === values.projectId,
    );

    if (!project) {
      throw new Error("Choose a valid project.");
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      if (!modalState.visible) {
        return;
      }

      if (modalState.mode === "create") {
        await createTask({
          title: values.title,
          ...(values.description ? { description: values.description } : {}),
          projectId: project._id,
          startAt: values.startAt,
          ...(values.endAt ? { endAt: values.endAt } : {}),
        });
      } else {
        const currentTask = modalState.taskId
          ? taskById.get(modalState.taskId)
          : null;
        if (!currentTask) {
          throw new Error("Task not found.");
        }

        await updateTask({
          taskId: currentTask._id,
          title: values.title,
          ...(values.description ? { description: values.description } : {}),
          projectId: project._id,
          startAt: values.startAt,
          ...(values.endAt ? { endAt: values.endAt } : {}),
        });
      }

      setModalState({ visible: false });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateClient(name: string) {
    setErrorMessage(null);
    const created = await createClientInline({ name });
    if (!created) {
      return null;
    }
    return {
      _id: String(created._id),
      name: created.name,
    };
  }

  async function handleCreateProject(clientId: string, name: string) {
    setErrorMessage(null);
    const matchingClient = (clients ?? []).find(
      (client) => String(client._id) === clientId,
    );
    if (!matchingClient) {
      throw new Error("Choose a client before creating a project.");
    }

    const created = await createProjectInline({
      clientId: matchingClient._id,
      name,
    });
    if (!created) {
      return null;
    }
    return {
      _id: String(created._id),
      name: created.name,
      client: String(created.client),
    };
  }

  async function handleStopTimer(taskId: string) {
    const task = taskById.get(taskId);
    if (!task) {
      return;
    }

    if (task.invoice) {
      setErrorMessage("Invoiced tasks cannot be modified.");
      return;
    }

    setBusy(true);
    setErrorMessage(null);
    try {
      await updateTask({
        taskId: task._id,
        title: task.title,
        ...(task.description ? { description: task.description } : {}),
        projectId: task.project,
        startAt: task.startAt,
        endAt: Math.max(dayjs().valueOf(), task.startAt + 1),
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const activeTimers = (activeTasks ?? [])
    .map((task) => {
      const project = projectById.get(String(task.project));
      const client = project ? clientById.get(String(project.client)) : null;
      return {
        id: String(task._id),
        title: task.title,
        projectName: project?.name ?? "Project",
        clientName: client?.name ?? "Client",
        startAt: task.startAt,
        locked: Boolean(task.invoice),
      };
    })
    .sort((a, b) => a.startAt - b.startAt);

  const isTimersLoading = data === undefined;
  const calendarTitle =
    viewMode === "week"
      ? formatWeekRange(weekDays)
      : formatDateLabel(startOfDay(selectedDate));
  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: Math.max(insets.bottom + 20, 26),
        }}
      >
        <View className="mx-auto w-full max-w-7xl gap-4">
          <View
            className="overflow-hidden rounded-3xl border px-5 py-5 md:px-6 md:py-6"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.surfaceStrong,
              shadowColor: palette.shadow,
              shadowOpacity: 0.14,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 9 },
              elevation: 3,
            }}
          >
            <View className="flex-row flex-wrap items-center justify-between gap-4">
              <Text
                className="text-3xl"
                style={{
                  color: palette.text,
                  fontFamily: Fonts.sans,
                  fontWeight: "700",
                }}
              >
                Timeslip
              </Text>
              <View className="w-full md:w-auto md:min-w-44">
                <Button
                  label="Start Timer"
                  onPress={() => openCreateModal(dayjs().valueOf())}
                />
              </View>
            </View>
            <View className="mt-3">
              <InlineNotice message={errorMessage} />
            </View>
            {activeTimers.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap gap-2">
                {activeTimers.map((timer) => (
                  <Pressable
                    key={timer.id}
                    className="overflow-hidden rounded-xl border px-3 py-3"
                    style={{
                      width: isDesktop ? 340 : "100%",
                      borderColor: palette.border,
                      backgroundColor: palette.surface,
                    }}
                    onPress={() => openEditModal(timer.id)}
                    onLongPress={() => handleLongPressTask(timer.id)}
                  >
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        backgroundColor: palette.accent,
                      }}
                    />
                    <View className="flex-row items-center justify-between gap-2">
                      <Text
                        numberOfLines={1}
                        className="flex-1 text-sm"
                        style={{
                          color: palette.text,
                          fontFamily: Fonts.sans,
                          fontWeight: "600",
                        }}
                      >
                        {timer.title}
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: palette.accent }}
                      >
                        {formatDuration(nowMs - timer.startAt)}
                      </Text>
                      <Pressable
                        className="h-7 w-7 items-center justify-center rounded-md border"
                        onPress={(event) => {
                          event.stopPropagation();
                          void handleStopTimer(timer.id);
                        }}
                        disabled={busy || timer.locked}
                        style={({ pressed }) => ({
                          borderColor: palette.border,
                          backgroundColor: pressed
                            ? palette.accentSoft
                            : palette.surfaceStrong,
                          opacity: busy || timer.locked ? 0.6 : 1,
                        })}
                        accessibilityRole="button"
                        accessibilityLabel={`Stop timer ${timer.title}`}
                      >
                        <FontAwesome6
                          name="stop"
                          size={11}
                          color={palette.text}
                        />
                      </Pressable>
                    </View>
                    <Text
                      className="mt-1 text-xs leading-5"
                      style={{ color: palette.muted }}
                    >
                      {`${timer.clientName} - ${timer.projectName}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View className="flex-row flex-wrap items-center justify-between gap-3 px-1">
            <View className="min-w-56 flex-1">
              <Text
                className="text-[11px] uppercase"
                style={{
                  color: palette.muted,
                  fontFamily: Fonts.mono,
                  letterSpacing: 1.3,
                }}
              >
                Calendar
              </Text>
              <View className="mt-1 max-w-full flex-row items-center self-start gap-2">
                <Text
                  numberOfLines={1}
                  className="text-base"
                  style={{
                    color: palette.text,
                    fontFamily: Fonts.sans,
                    fontWeight: "600",
                    flexShrink: 1,
                  }}
                >
                  {calendarTitle}
                </Text>
                {isTimersLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={palette.muted}
                    accessibilityLabel="Loading timers"
                  />
                ) : null}
              </View>
            </View>

            <View className="flex-row flex-wrap items-center justify-end gap-2">
              <ChevronNavButton
                direction="left"
                onPress={navigatePrevious}
                color={palette.text}
                borderColor={palette.border}
                backgroundColor="transparent"
              />
              <Button
                label="Today"
                variant="secondary"
                size="sm"
                onPress={() => setSelectedDate(dayjs().toDate())}
              />
              <ChevronNavButton
                direction="right"
                onPress={navigateNext}
                color={palette.text}
                borderColor={palette.border}
                backgroundColor="transparent"
              />
              <View
                className="flex-row rounded-xl border p-1"
                style={{
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                }}
              >
                <Pressable
                  onPress={() => {
                    setHasManualViewMode(true);
                    setViewMode("day");
                  }}
                  className="rounded-lg px-3 py-1.5"
                  style={{
                    backgroundColor:
                      viewMode === "day" ? palette.accent : "transparent",
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color:
                        viewMode === "day"
                          ? palette.surfaceStrong
                          : palette.muted,
                      fontFamily: Fonts.sans,
                      fontWeight: "600",
                    }}
                  >
                    Day
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setHasManualViewMode(true);
                    setViewMode("week");
                  }}
                  className="rounded-lg px-3 py-1.5"
                  style={{
                    backgroundColor:
                      viewMode === "week" ? palette.accent : "transparent",
                  }}
                >
                  <Text
                    className="text-xs"
                    style={{
                      color:
                        viewMode === "week"
                          ? palette.surfaceStrong
                          : palette.muted,
                      fontFamily: Fonts.sans,
                      fontWeight: "600",
                    }}
                  >
                    Week
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {viewMode === "week" ? (
            <WeekCalendar
              days={weekDays}
              fluid={isDesktop}
              palette={palette}
              selectedDate={selectedDate}
              onSelectDay={setSelectedDate}
              segmentsByDay={calendarSegmentsByDay}
              onPressSlot={(startAt) => {
                const roundedStart = roundToQuarterHour(startAt);
                openCreateModal(roundedStart, roundedStart + 60 * 60 * 1000);
              }}
              onPressTask={openEditModal}
              onLongPressTask={handleLongPressTask}
              onRightClickTask={confirmDelete}
            />
          ) : (
            <DayCalendar
              palette={palette}
              selectedDate={startOfDay(selectedDate)}
              onSelectDay={setSelectedDate}
              segmentsByDay={calendarSegmentsByDay}
              onPressSlot={(startAt) => {
                const roundedStart = roundToQuarterHour(startAt);
                openCreateModal(roundedStart, roundedStart + 60 * 60 * 1000);
              }}
              onPressTask={openEditModal}
              onLongPressTask={handleLongPressTask}
              onRightClickTask={confirmDelete}
            />
          )}

          {viewMode === "day" ? (
            <View className="flex-row justify-between px-1">
              <Button
                label="Previous day"
                variant="secondary"
                size="sm"
                onPress={() =>
                  setSelectedDate((current) => addDays(current, -1))
                }
              />
              <Button
                label="Next day"
                variant="secondary"
                size="sm"
                onPress={() =>
                  setSelectedDate((current) => addDays(current, 1))
                }
              />
            </View>
          ) : null}
        </View>

        <TaskModal
          visible={modalState.visible}
          mode={modalState.visible ? modalState.mode : "create"}
          locked={modalState.visible ? modalState.locked : false}
          busy={busy}
          initialValues={
            modalState.visible ? modalState.initialValues : EMPTY_MODAL_VALUES
          }
          clients={clientOptions}
          projects={projectOptions}
          onClose={() => setModalState({ visible: false })}
          onSubmit={handleSubmitTask}
          onDelete={
            modalState.visible &&
            modalState.mode === "edit" &&
            modalState.taskId
              ? async () => {
                  confirmDelete(modalState.taskId as string);
                }
              : undefined
          }
          onCreateClient={handleCreateClient}
          onCreateProject={handleCreateProject}
        />
      </ScrollView>
    </View>
  );
}
