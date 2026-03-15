import NativeDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { FontAwesome6 } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export type DatePickerProps = {
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

function normalizeDate(value: Date) {
  return dayjs(value).startOf("day").toDate();
}

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  minimumDate,
  maximumDate,
  helperText,
  placeholder = "Select date",
  onBlur,
}: DatePickerProps) {
  const palette = useColorPalette();
  const [isOpen, setIsOpen] = useState(false);
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const pickerValue = normalizeDate(value ?? new Date());

  function closePicker() {
    setIsOpen(false);
    onBlur?.();
  }

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === "android") {
      if (event.type !== "dismissed" && selected) {
        onChange(normalizeDate(selected));
      }
      closePicker();
      return;
    }

    if (selected) {
      onChange(normalizeDate(selected));
    }
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
        onPress={() => {
          if (!disabled) {
            setIsOpen(true);
          }
        }}
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
        <FontAwesome6 name="calendar-days" size={14} color={palette.muted} />
      </Pressable>

      {helperText ? (
        <Text className="text-xs" style={{ color: palette.muted, fontFamily: Fonts.sans }}>
          {helperText}
        </Text>
      ) : null}

      {Platform.OS === "ios" && isOpen ? (
        <View
          className="gap-2 rounded-xl border px-2 py-2"
          style={{ borderColor: palette.inputBorder, backgroundColor: palette.surface }}
        >
          <NativeDateTimePicker
            mode="date"
            display="inline"
            value={pickerValue}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
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

      {Platform.OS === "android" && isOpen ? (
        <NativeDateTimePicker
          mode="date"
          display="default"
          value={pickerValue}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}
