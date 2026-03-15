import { type ChangeEvent, type CSSProperties } from "react";
import { Text, View } from "react-native";

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
  onBlur?: () => void;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date | null) {
  if (!date) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateInputValue(raw: string) {
  if (!raw) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = raw.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const parsed = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function DatePicker({
  label,
  value,
  onChange,
  disabled = false,
  minimumDate,
  maximumDate,
  helperText,
  onBlur,
}: DatePickerProps) {
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
        className="min-h-11"
        style={{ opacity: disabled ? 0.55 : 1 }}
      >
        <input
          type="date"
          value={toDateInputValue(value)}
          min={toDateInputValue(minimumDate ?? null) || undefined}
          max={toDateInputValue(maximumDate ?? null) || undefined}
          disabled={disabled}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange(fromDateInputValue(event.currentTarget.value));
          }}
          onBlur={() => onBlur?.()}
          style={inputStyle}
          aria-label={label}
        />
      </View>

      {helperText ? (
        <Text className="text-xs" style={{ color: palette.muted, fontFamily: Fonts.sans }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
