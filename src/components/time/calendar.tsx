import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";

import { Text } from "@/components/ui/text";
import type { ColorPalette } from "@/hooks/use-color-palette";
import { HOUR_MS, MINUTE_MS, dayKey, formatTime, startOfDay } from "@/lib/time";

export const HOUR_ROW_HEIGHT = 52;
const HEADER_HEIGHT = 52;
const TIME_GUTTER_WIDTH = 72;
const DAY_HEIGHT = HOUR_ROW_HEIGHT * 24;
const TITLE_ONLY_MAX_HEIGHT = 30;
const TITLE_AND_TIME_MAX_HEIGHT = 44;
const CURRENT_TIME_COLOR = "#f05545";
const WORK_HOURS_START = 7;
const WORK_HOURS_END = 19;

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
  nowMs?: number;
  onSelectDay?: (date: Date) => void;
  onPressSlot: (startAt: number) => void;
  onPressTask: (taskId: string) => void;
  onLongPressTask: (taskId: string) => void;
  onRightClickTask: (taskId: string) => void;
};

function CurrentTimeLine({ nowMs, dayStart }: { nowMs: number; dayStart: number }) {
  const minutesSinceMidnight = (nowMs - dayStart) / MINUTE_MS;
  const top = (minutesSinceMidnight / 60) * HOUR_ROW_HEIGHT;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        zIndex: 50,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: CURRENT_TIME_COLOR,
          marginLeft: -3,
        }}
      />
      <View
        style={{
          flex: 1,
          height: 2,
          backgroundColor: CURRENT_TIME_COLOR,
        }}
      />
    </View>
  );
}

type PositionedCalendarTaskSegment = CalendarTaskSegment & {
  laneIndex: number;
  laneCount: number;
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

function sortCalendarSegments(a: CalendarTaskSegment, b: CalendarTaskSegment) {
  if (a.startAt !== b.startAt) {
    return a.startAt - b.startAt;
  }

  const aDuration = a.endAt - a.startAt;
  const bDuration = b.endAt - b.startAt;
  if (aDuration !== bDuration) {
    return bDuration - aDuration;
  }

  return a.id.localeCompare(b.id);
}

function layoutOverlappingSegments(
  segments: CalendarTaskSegment[],
): PositionedCalendarTaskSegment[] {
  const sortedSegments = [...segments].sort(sortCalendarSegments);
  const positionedSegments: PositionedCalendarTaskSegment[] = [];

  let group: CalendarTaskSegment[] = [];
  let groupMaxEndAt = -Infinity;

  const flushGroup = () => {
    if (group.length === 0) {
      return;
    }

    const activeLanes: { laneIndex: number; endAt: number }[] = [];
    const assignedLanes: { segment: CalendarTaskSegment; laneIndex: number }[] = [];
    let laneCount = 0;

    group.forEach((segment) => {
      for (let i = activeLanes.length - 1; i >= 0; i -= 1) {
        if (activeLanes[i].endAt <= segment.startAt) {
          activeLanes.splice(i, 1);
        }
      }

      const occupiedLanes = new Set(activeLanes.map((lane) => lane.laneIndex));
      let laneIndex = 0;
      while (occupiedLanes.has(laneIndex)) {
        laneIndex += 1;
      }

      activeLanes.push({ laneIndex, endAt: segment.endAt });
      assignedLanes.push({ segment, laneIndex });
      laneCount = Math.max(laneCount, laneIndex + 1);
    });

    assignedLanes.forEach(({ segment, laneIndex }) => {
      positionedSegments.push({
        ...segment,
        laneIndex,
        laneCount,
      });
    });

    group = [];
    groupMaxEndAt = -Infinity;
  };

  sortedSegments.forEach((segment) => {
    if (group.length === 0) {
      group.push(segment);
      groupMaxEndAt = segment.endAt;
      return;
    }

    if (segment.startAt < groupMaxEndAt) {
      group.push(segment);
      groupMaxEndAt = Math.max(groupMaxEndAt, segment.endAt);
      return;
    }

    flushGroup();
    group.push(segment);
    groupMaxEndAt = segment.endAt;
  });

  flushGroup();

  return positionedSegments;
}

function TaskBlock({
  segment,
  palette,
  onPress,
  onLongPress,
  onRightClick,
  top,
  height,
  leftPercent,
  widthPercent,
}: {
  segment: PositionedCalendarTaskSegment;
  palette: ColorPalette;
  onPress: () => void;
  onLongPress: () => void;
  onRightClick: () => void;
  top: number;
  height: number;
  leftPercent: number;
  widthPercent: number;
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

  const showTitleOnly = height <= TITLE_ONLY_MAX_HEIGHT;
  const showFullDetails = height > TITLE_AND_TIME_MAX_HEIGHT;
  const showTimeLine = !showTitleOnly;

  return (
    <Pressable
      {...(webOnlyProps as object)}
      onPress={onPress}
      onLongPress={onLongPress}
      className="absolute rounded-md border px-2"
      style={{
        top,
        minHeight: 20,
        height,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        paddingTop: showTitleOnly ? 1 : 4,
        paddingBottom: showTitleOnly ? 1 : 4,
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
        color={segment.isActive ? "inverted" : "default"}
        weight="600"
        style={{ lineHeight: 13 }}
      >
        {segment.title}
      </Text>
      {showFullDetails ? (
        <Text
          numberOfLines={1}
          className="text-[10px]"
          color={segment.isActive ? "inverted" : "muted"}
          style={{ lineHeight: 11 }}
        >
          {segment.projectName}
        </Text>
      ) : null}
      {showTimeLine ? (
        <Text
          numberOfLines={1}
          className="text-[10px]"
          color={segment.isActive ? "inverted" : "muted"}
          style={{ lineHeight: 11 }}
        >
          {`${formatTime(segment.startAt)} - ${formatTime(segment.endAt)}`}
        </Text>
      ) : null}
    </Pressable>
  );
}

function HoverIndicator({
  top,
  palette,
  label,
}: {
  top: number;
  palette: ColorPalette;
  label: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        zIndex: 40,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: palette.accent,
          opacity: 0.5,
        }}
      />
      <View
        style={{
          backgroundColor: palette.accent,
          borderRadius: 4,
          paddingHorizontal: 4,
          paddingVertical: 1,
          marginRight: 2,
          opacity: 0.7,
        }}
      >
        <Text
          style={{ fontSize: 9, lineHeight: 12 }}
          color="inverted"
          weight="600"
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

function snapToQuarterHour(y: number): { top: number; minutes: number } {
  const totalMinutes = (y / HOUR_ROW_HEIGHT) * 60;
  const roundedMinutes = clamp(Math.round(totalMinutes / 15) * 15, 0, 23 * 60 + 45);
  const top = (roundedMinutes / 60) * HOUR_ROW_HEIGHT;
  return { top, minutes: roundedMinutes };
}

export function CalendarDayColumn({
  date,
  palette,
  segments,
  isSelected = false,
  nowMs,
  onSelectDay,
  onPressSlot,
  onPressTask,
  onLongPressTask,
  onRightClickTask,
}: DayColumnProps) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = dayStart + 24 * HOUR_MS;

  const todayStart = startOfDay(new Date()).getTime();
  const isToday = dayStart === todayStart;
  const showTimeLine = isToday && typeof nowMs === "number" && nowMs >= dayStart && nowMs < dayEnd;

  const [hoverSlot, setHoverSlot] = useState<{ top: number; minutes: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = clamp(e.clientY - rect.top, 0, DAY_HEIGHT);
    setHoverSlot(snapToQuarterHour(y));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverSlot(null);
  }, []);

  const clampedSegments = segments
    .filter((segment) => segment.endAt > dayStart && segment.startAt < dayEnd)
    .map((segment) => ({
      ...segment,
      startAt: clamp(segment.startAt, dayStart, dayEnd - 15 * MINUTE_MS),
      endAt: clamp(segment.endAt, dayStart + 15 * MINUTE_MS, dayEnd),
    }));

  const positionedSegments = layoutOverlappingSegments(clampedSegments);

  const hoverWebProps =
    Platform.OS === "web"
      ? ({
          onMouseMove: handleMouseMove,
          onMouseLeave: handleMouseLeave,
        } as const)
      : ({} as const);

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => onSelectDay?.(date)}
        className="items-center justify-center border-b"
        style={{
          height: HEADER_HEIGHT,
          borderColor: palette.border,
          backgroundColor: "transparent",
        }}
      >
        <Text
          className="text-[10px]"
          color={isSelected ? "accent" : "muted"}
          style={{ letterSpacing: 1.1 }}
        >
          {getDayLabel(date)}
        </Text>
        {isSelected ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: palette.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-sm" color="inverted" weight="600">
              {getDateLabel(date)}
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-sm" weight="600">
              {getDateLabel(date)}
            </Text>
            {isToday ? (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: palette.accent,
                  marginTop: 2,
                }}
              />
            ) : null}
          </>
        )}
      </Pressable>

      <Pressable
        {...(hoverWebProps as object)}
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
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: WORK_HOURS_START * HOUR_ROW_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.12)",
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: WORK_HOURS_END * HOUR_ROW_HEIGHT,
            height: (24 - WORK_HOURS_END) * HOUR_ROW_HEIGHT,
            backgroundColor: "rgba(0,0,0,0.12)",
          }}
        />
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
        {showTimeLine ? (
          <CurrentTimeLine nowMs={nowMs} dayStart={dayStart} />
        ) : null}
        {positionedSegments.map((segment) => {
          const offsetMinutes = (segment.startAt - dayStart) / MINUTE_MS;
          const durationMs = Math.max(15 * MINUTE_MS, segment.endAt - segment.startAt);
          const top = (offsetMinutes / 60) * HOUR_ROW_HEIGHT;
          const height = Math.max(20, (durationMs / HOUR_MS) * HOUR_ROW_HEIGHT - 2);
          const widthPercent = 100 / segment.laneCount;
          const leftPercent = segment.laneIndex * widthPercent;

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
              leftPercent={leftPercent}
              widthPercent={widthPercent}
            />
          );
        })}
        {Platform.OS === "web" && hoverSlot ? (
          <HoverIndicator
            top={hoverSlot.top}
            palette={palette}
            label={formatTime(dayStart + hoverSlot.minutes * MINUTE_MS)}
          />
        ) : null}
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
        backgroundColor: palette.surfaceStrong,
      }}
    >
      <View className="border-b" style={{ borderColor: palette.border, height: HEADER_HEIGHT }} />
      <View style={{ height: DAY_HEIGHT, position: "relative" }}>
        {Array.from({ length: 24 }).map((_, hour) => (
          hour === 0 ? null : (
          <Text
            key={hour}
            className="absolute text-[10px]"
            color="muted"
            style={{
              top: hour * HOUR_ROW_HEIGHT - 6,
              left: 6,
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
  nowMs?: number;
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
  nowMs,
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
        nowMs={nowMs}
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
  nowMs,
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
            nowMs={nowMs}
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
