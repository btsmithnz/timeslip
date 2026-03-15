import dayjs from "dayjs";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import type { ColorPalette } from "@/hooks/use-color-palette";
import { HOUR_MS, MINUTE_MS, dayKey, formatTime, startOfDay } from "@/lib/time";

export const HOUR_ROW_HEIGHT = 52;
const HEADER_HEIGHT = 52;
const TIME_GUTTER_WIDTH = 72;
const DAY_HEIGHT = HOUR_ROW_HEIGHT * 24;

export type CalendarTaskSegment = {
  id: string;
  title: string;
  projectName: string;
  startAt: number;
  endAt: number;
  invoiced: boolean;
  isActive: boolean;
};

type DayColumnProps = {
  date: Date;
  palette: ColorPalette;
  segments: CalendarTaskSegment[];
  isSelected?: boolean;
  onSelectDay?: (date: Date) => void;
  onPressSlot: (startAt: number) => void;
  onPressTask: (taskId: string) => void;
  onLongPressTask: (taskId: string) => void;
  onRightClickTask: (taskId: string) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type SlotPressNativeEvent = {
  locationY?: number;
  offsetY?: number;
  layerY?: number;
};

function getSlotPressY(nativeEvent: SlotPressNativeEvent) {
  const candidates = [nativeEvent.locationY, nativeEvent.offsetY, nativeEvent.layerY];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return 0;
}

function getDayLabel(date: Date) {
  return dayjs(date).format("ddd").toUpperCase();
}

function getDateLabel(date: Date) {
  return dayjs(date).format("DD");
}

function getHourLabel(hour: number) {
  return dayjs().startOf("day").add(hour, "hour").format("h:mm A");
}

function TaskBlock({
  segment,
  palette,
  onPress,
  onLongPress,
  onRightClick,
  top,
  height,
}: {
  segment: CalendarTaskSegment;
  palette: ColorPalette;
  onPress: () => void;
  onLongPress: () => void;
  onRightClick: () => void;
  top: number;
  height: number;
}) {
  const webOnlyProps =
    Platform.OS === "web"
      ? ({
          onContextMenu: (event: { preventDefault: () => void }) => {
            event.preventDefault();
            onRightClick();
          },
        } as const)
      : ({} as const);

  return (
    <Pressable
      {...(webOnlyProps as object)}
      onPress={onPress}
      onLongPress={onLongPress}
      className="absolute left-1 right-1 rounded-md border px-2 py-1"
      style={{
        top,
        minHeight: 20,
        height,
        backgroundColor: segment.invoiced
          ? palette.borderSoft
          : segment.isActive
            ? palette.accent
            : palette.accentSoft,
        borderColor: segment.invoiced ? palette.border : palette.accent,
        opacity: segment.invoiced ? 0.85 : 1,
      }}
    >
      <Text
        numberOfLines={1}
        className="text-[11px]"
        style={{
          color: segment.isActive ? palette.surfaceStrong : palette.text,
          fontFamily: Fonts.sans,
          fontWeight: "600",
        }}
      >
        {segment.title}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[10px]"
        style={{
          color: segment.isActive ? palette.surfaceStrong : palette.muted,
        }}
      >
        {segment.projectName}
      </Text>
      <Text
        numberOfLines={1}
        className="text-[10px]"
        style={{
          color: segment.isActive ? palette.surfaceStrong : palette.muted,
        }}
      >
        {`${formatTime(segment.startAt)} - ${formatTime(segment.endAt)}`}
      </Text>
    </Pressable>
  );
}

export function CalendarDayColumn({
  date,
  palette,
  segments,
  isSelected = false,
  onSelectDay,
  onPressSlot,
  onPressTask,
  onLongPressTask,
  onRightClickTask,
}: DayColumnProps) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = dayStart + 24 * HOUR_MS;

  const clampedSegments = segments
    .filter((segment) => segment.endAt > dayStart && segment.startAt < dayEnd)
    .map((segment) => ({
      ...segment,
      startAt: clamp(segment.startAt, dayStart, dayEnd - 15 * MINUTE_MS),
      endAt: clamp(segment.endAt, dayStart + 15 * MINUTE_MS, dayEnd),
    }))
    .sort((a, b) => a.startAt - b.startAt);

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => onSelectDay?.(date)}
        className="items-center justify-center border-b"
        style={{
          height: HEADER_HEIGHT,
          borderColor: isSelected ? palette.accent : palette.border,
          backgroundColor: isSelected ? palette.accentSoft : "transparent",
        }}
      >
        <Text
          className="text-[10px]"
          style={{
            color: isSelected ? palette.accent : palette.muted,
            fontFamily: Fonts.mono,
            letterSpacing: 1.1,
          }}
        >
          {getDayLabel(date)}
        </Text>
        <Text
          className="text-sm"
          style={{
            color: palette.text,
            fontFamily: Fonts.sans,
            fontWeight: "600",
          }}
        >
          {getDateLabel(date)}
        </Text>
      </Pressable>

      <Pressable
        className="relative"
        style={{
          height: DAY_HEIGHT,
          backgroundColor: palette.surfaceStrong,
        }}
        onPress={(event) => {
          const y = clamp(getSlotPressY(event.nativeEvent), 0, DAY_HEIGHT);
          const totalMinutes = (y / HOUR_ROW_HEIGHT) * 60;
          const roundedMinutes = clamp(Math.round(totalMinutes / 15) * 15, 0, 23 * 60 + 45);
          onPressSlot(dayStart + roundedMinutes * MINUTE_MS);
        }}
      >
        {Array.from({ length: 24 }).map((_, hour) => (
          <View
            key={hour}
            className="absolute left-0 right-0 border-t"
            style={{
              top: hour * HOUR_ROW_HEIGHT,
              borderColor: palette.borderSoft,
            }}
          />
        ))}
        {clampedSegments.map((segment) => {
          const offsetMinutes = (segment.startAt - dayStart) / MINUTE_MS;
          const durationMs = Math.max(15 * MINUTE_MS, segment.endAt - segment.startAt);
          const top = (offsetMinutes / 60) * HOUR_ROW_HEIGHT;
          const height = Math.max(20, (durationMs / HOUR_MS) * HOUR_ROW_HEIGHT - 2);

          return (
            <TaskBlock
              key={segment.id}
              segment={segment}
              palette={palette}
              onPress={() => onPressTask(segment.id)}
              onLongPress={() => onLongPressTask(segment.id)}
              onRightClick={() => onRightClickTask(segment.id)}
              top={top}
              height={height}
            />
          );
        })}
      </Pressable>
    </View>
  );
}

function TimeGutter({ palette }: { palette: ColorPalette }) {
  return (
    <View
      className="border-r"
      style={{
        width: TIME_GUTTER_WIDTH,
        borderColor: palette.border,
        backgroundColor: palette.surface,
      }}
    >
      <View className="border-b" style={{ borderColor: palette.border, height: HEADER_HEIGHT }} />
      <View style={{ height: DAY_HEIGHT, position: "relative" }}>
        {Array.from({ length: 24 }).map((_, hour) => (
          hour === 0 ? null : (
          <Text
            key={hour}
            className="absolute text-[10px]"
            style={{
              top: hour * HOUR_ROW_HEIGHT - 6,
              left: 6,
              color: palette.muted,
              fontFamily: Fonts.mono,
            }}
          >
            {getHourLabel(hour)}
          </Text>
          )
        ))}
      </View>
    </View>
  );
}

type BaseCalendarProps = {
  palette: ColorPalette;
  selectedDate: Date;
  onSelectDay: (date: Date) => void;
  onPressSlot: (startAt: number) => void;
  onPressTask: (taskId: string) => void;
  onLongPressTask: (taskId: string) => void;
  onRightClickTask: (taskId: string) => void;
  segmentsByDay: Record<string, CalendarTaskSegment[]>;
};

export function WeekCalendar({
  days,
  fluid = false,
  palette,
  selectedDate,
  onSelectDay,
  onPressSlot,
  onPressTask,
  onLongPressTask,
  onRightClickTask,
  segmentsByDay,
}: BaseCalendarProps & { days: Date[]; fluid?: boolean }) {
  const dayColumns = days.map((day) => (
    <View
      key={dayKey(day)}
      className="border-l"
      style={fluid ? { flex: 1, minWidth: 0, borderColor: palette.border } : { width: 168, borderColor: palette.border }}
    >
      <CalendarDayColumn
        date={day}
        palette={palette}
        segments={segmentsByDay[dayKey(day)] ?? []}
        isSelected={dayKey(day) === dayKey(selectedDate)}
        onSelectDay={onSelectDay}
        onPressSlot={onPressSlot}
        onPressTask={onPressTask}
        onLongPressTask={onLongPressTask}
        onRightClickTask={onRightClickTask}
      />
    </View>
  ));

  if (fluid) {
    return (
      <View
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: palette.border, backgroundColor: palette.surfaceStrong }}
      >
        <View className="flex-row">
          <TimeGutter palette={palette} />
          <View className="flex-1 flex-row">{dayColumns}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: palette.border, backgroundColor: palette.surfaceStrong }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          <TimeGutter palette={palette} />
          {dayColumns}
        </View>
      </ScrollView>
    </View>
  );
}

export function DayCalendar({
  palette,
  selectedDate,
  onSelectDay,
  onPressSlot,
  onPressTask,
  onLongPressTask,
  onRightClickTask,
  segmentsByDay,
}: BaseCalendarProps) {
  const selectedKey = dayKey(selectedDate);

  return (
    <View
      className="overflow-hidden rounded-2xl border"
      style={{ borderColor: palette.border, backgroundColor: palette.surfaceStrong }}
    >
      <View className="flex-row">
        <TimeGutter palette={palette} />
        <View className="flex-1 border-l" style={{ borderColor: palette.border }}>
          <CalendarDayColumn
            date={selectedDate}
            palette={palette}
            segments={segmentsByDay[selectedKey] ?? []}
            isSelected
            onSelectDay={onSelectDay}
            onPressSlot={onPressSlot}
            onPressTask={onPressTask}
            onLongPressTask={onLongPressTask}
            onRightClickTask={onRightClickTask}
          />
        </View>
      </View>
    </View>
  );
}
