import { FontAwesome6 } from "@expo/vector-icons";
import { type ChangeEvent, type CSSProperties } from "react";
import { Text, View } from "react-native";

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
  onBlur?: () => void;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateTimeInputValue(date: Date | null) {
  if (!date) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeInputValue(raw: string) {
  if (!raw) {
    return null;
  }
  const [datePart, timePart] = raw.split("T");
  if (!datePart || !timePart) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = datePart.split("-");
  const [hourRaw, minuteRaw] = timePart.split(":");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  disabled = false,
  minimumDate,
  maximumDate,
  helperText,
  onBlur,
}: DateTimePickerProps) {
  const palette = useColorPalette();

  const inputStyle: CSSProperties = {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: palette.inputBorder,
    backgroundColor: palette.input,
    color: palette.text,
    fontFamily: Fonts.sans,
    fontSize: 14,
    padding: "10px 14px",
    minHeight: 44,
    outline: "none",
    opacity: disabled ? 0.55 : 1,
  };

  return (
    <View className="gap-2">
      <Text
        className="text-[11px] uppercase"
        style={{ color: palette.muted, fontFamily: Fonts.mono, letterSpacing: 1.6 }}
      >
        {label}
      </Text>

      <View
        className="min-h-11 flex-row items-center gap-2"
        style={{ opacity: disabled ? 0.55 : 1 }}
      >
        <View style={{ flex: 1 }}>
          <input
            type="datetime-local"
            value={toDateTimeInputValue(value)}
            min={toDateTimeInputValue(minimumDate ?? null) || undefined}
            max={toDateTimeInputValue(maximumDate ?? null) || undefined}
            disabled={disabled}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              onChange(fromDateTimeInputValue(event.currentTarget.value));
            }}
            onBlur={() => onBlur?.()}
            style={inputStyle}
            aria-label={label}
          />
        </View>
        <FontAwesome6 name="clock" size={14} color={palette.muted} />
      </View>

      {helperText ? (
        <Text className="text-xs" style={{ color: palette.muted, fontFamily: Fonts.sans }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
