import NativeDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export type DateTimePickerProps = {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  helperText?: string;
  placeholder?: string;
  onBlur?: () => void;
};

type AndroidStep = "date" | "time" | null;

function mergeDate(base: Date, nextDatePart: Date) {
  const merged = new Date(base);
  merged.setFullYear(
    nextDatePart.getFullYear(),
    nextDatePart.getMonth(),
    nextDatePart.getDate(),
  );
  return merged;
}

function mergeTime(base: Date, nextTimePart: Date) {
  const merged = new Date(base);
  merged.setHours(
    nextTimePart.getHours(),
    nextTimePart.getMinutes(),
    0,
    0,
  );
  return merged;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  disabled = false,
  minimumDate,
  maximumDate,
  helperText,
  placeholder = "Select date and time",
  onBlur,
}: DateTimePickerProps) {
  const palette = useColorPalette();
  const [iosOpen, setIosOpen] = useState(false);
  const [androidStep, setAndroidStep] = useState<AndroidStep>(null);
  const [androidDraft, setAndroidDraft] = useState<Date>(value ?? new Date());
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    [],
  );

  const isOpen = iosOpen || androidStep !== null;
  const pickerValue = value ?? new Date();

  function closePicker() {
    setIosOpen(false);
    setAndroidStep(null);
    onBlur?.();
  }

  function openPicker() {
    if (disabled) {
      return;
    }

    if (Platform.OS === "android") {
      const initial = value ?? new Date();
      setAndroidDraft(initial);
      setAndroidStep("date");
      return;
    }

    setIosOpen(true);
  }

  function handleIosChange(_: DateTimePickerEvent, selected?: Date) {
    if (selected) {
      onChange(selected);
    }
  }

  function handleAndroidChange(event: DateTimePickerEvent, selected?: Date) {
    if (!androidStep) {
      return;
    }

    if (event.type === "dismissed" || !selected) {
      closePicker();
      return;
    }

    if (androidStep === "date") {
      const nextDraft = mergeDate(androidDraft, selected);
      setAndroidDraft(nextDraft);
      setAndroidStep("time");
      return;
    }

    const resolved = mergeTime(androidDraft, selected);
    onChange(resolved);
    closePicker();
  }

  return (
    <View className="gap-2">
      <Text
        className="text-[11px] uppercase"
        style={{ color: palette.muted, fontFamily: Fonts.mono, letterSpacing: 1.6 }}
      >
        {label}
      </Text>

      <Pressable
        onPress={openPicker}
        disabled={disabled}
        className="min-h-11 flex-row items-center justify-between rounded-xl border px-3.5 py-3"
        style={({ pressed }) => ({
          backgroundColor: palette.input,
          borderColor: isOpen ? palette.accent : palette.inputBorder,
          opacity: disabled ? 0.55 : 1,
          ...(pressed && !disabled ? { backgroundColor: palette.accentSoft } : null),
        })}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          className="flex-1 text-sm"
          style={{ color: value ? palette.text : palette.muted, fontFamily: Fonts.sans }}
        >
          {value ? formatter.format(value) : placeholder}
        </Text>
        <FontAwesome6 name="clock" size={14} color={palette.muted} />
      </Pressable>

      {helperText ? (
        <Text className="text-xs" style={{ color: palette.muted, fontFamily: Fonts.sans }}>
          {helperText}
        </Text>
      ) : null}

      {Platform.OS === "ios" && iosOpen ? (
        <View
          className="gap-2 rounded-xl border px-2 py-2"
          style={{ borderColor: palette.inputBorder, backgroundColor: palette.surface }}
        >
          <NativeDateTimePicker
            mode="datetime"
            display="default"
            value={pickerValue}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleIosChange}
          />
          <View className="items-end pr-1">
            <Pressable
              onPress={closePicker}
              className="rounded-lg px-3 py-1.5"
              style={({ pressed }) => ({
                backgroundColor: pressed ? palette.accentSoft : "transparent",
              })}
              accessibilityRole="button"
              accessibilityLabel={`Done selecting ${label}`}
            >
              <Text
                className="text-sm"
                style={{ color: palette.accent, fontFamily: Fonts.sans, fontWeight: "600" }}
              >
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {Platform.OS === "android" && androidStep ? (
        <NativeDateTimePicker
          mode={androidStep}
          display="default"
          value={androidDraft}
          minimumDate={androidStep === "date" ? minimumDate : undefined}
          maximumDate={androidStep === "date" ? maximumDate : undefined}
          is24Hour={false}
          onChange={handleAndroidChange}
        />
      ) : null}
    </View>
  );
}
