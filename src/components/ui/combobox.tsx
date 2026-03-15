import { FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Fonts } from "@/constants/theme";
import { useColorPalette } from "@/hooks/use-color-palette";

export type ComboboxOption = {
  value: string;
  label: string;
};

export function Combobox({
  label,
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyLabel = "No results found.",
  disabled = false,
  creating = false,
  helperText,
  onChange,
  onCreate,
}: {
  label: string;
  value: string;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel?: string;
  disabled?: boolean;
  creating?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  onCreate?: (input: string) => Promise<ComboboxOption | null>;
}) {
  const palette = useColorPalette();
  const inputRef = useRef<TextInput>(null);
  const menuPointerDownRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const normalizedSearch = inputValue.trim().toLowerCase();

  useEffect(() => {
    if (!isOpen) {
      setInputValue(selected?.label ?? "");
    }
  }, [isOpen, selected?.label]);

  const filtered = useMemo(() => {
    if (!normalizedSearch) {
      return options;
    }
    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [normalizedSearch, options]);

  const hasExactMatch = useMemo(() => {
    if (!normalizedSearch) {
      return true;
    }
    return options.some(
      (option) => option.label.toLowerCase() === normalizedSearch,
    );
  }, [normalizedSearch, options]);

  const showCreateOption =
    Boolean(onCreate) && normalizedSearch.length > 0 && !hasExactMatch;
  const showEmptyState =
    filtered.length === 0 && !(Boolean(onCreate) && normalizedSearch.length > 0);
  const inputStyle: Record<string, string | number> = {
    color: palette.text,
    fontFamily: Fonts.sans,
  };
  if (Platform.OS === "web") {
    inputStyle.outlineStyle = "none";
    inputStyle.outlineWidth = 0;
  }

  return (
    <View
      className="gap-2"
      style={{
        position: "relative",
        zIndex: isOpen ? 800 : 1,
      }}
    >
      <Text
        className="text-[11px] uppercase"
        style={{
          color: palette.muted,
          fontFamily: Fonts.mono,
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Text>

      <View
        className="min-h-11 flex-row items-center rounded-xl border px-3.5 py-3"
        style={{
          borderColor: isOpen ? palette.accent : palette.inputBorder,
          backgroundColor: palette.input,
          opacity: disabled ? 0.55 : 1,
          borderBottomLeftRadius: isOpen ? 0 : 12,
          borderBottomRightRadius: isOpen ? 0 : 12,
        }}
        accessibilityRole="combobox"
        accessibilityLabel={`${label} combobox`}
      >
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={(text) => {
              setInputValue(text);
              if (!isOpen) {
                setIsOpen(true);
              }
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              setTimeout(() => {
                if (!menuPointerDownRef.current) {
                  setIsOpen(false);
                }
              }, 120);
            }}
            placeholder={isOpen ? searchPlaceholder : placeholder}
            placeholderTextColor={palette.muted}
            editable={!disabled}
            className="flex-1 text-sm"
            style={inputStyle}
          />
        <Pressable
          hitSlop={8}
          disabled={disabled}
          onPress={() => {
            if (isOpen) {
              setIsOpen(false);
              inputRef.current?.blur();
              return;
            }
            setIsOpen(true);
          }}
        >
          <FontAwesome6
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={12}
            color={palette.muted}
          />
        </Pressable>
      </View>

        {isOpen ? (
          <View
            className="overflow-hidden rounded-xl border"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 900,
              borderColor: palette.inputBorder,
              backgroundColor: palette.surfaceStrong,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderTopWidth: 0,
              shadowColor: palette.shadow,
              shadowOpacity: 0.18,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
            onTouchStart={() => {
              menuPointerDownRef.current = true;
            }}
            onTouchEnd={() => {
              setTimeout(() => {
                menuPointerDownRef.current = false;
              }, 0);
            }}
          >
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
            >
              {filtered.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    className="flex-row items-center justify-between px-3 py-2.5"
                    style={({ pressed }) => ({
                      backgroundColor: pressed
                        ? palette.accentSoft
                        : "transparent",
                    })}
                    onPressIn={() => {
                      menuPointerDownRef.current = true;
                    }}
                    onPressOut={() => {
                      setTimeout(() => {
                        menuPointerDownRef.current = false;
                      }, 0);
                    }}
                    onPress={() => {
                      onChange(option.value);
                      setInputValue(option.label);
                      setIsOpen(false);
                      inputRef.current?.blur();
                    }}
                  >
                    <Text
                      className="text-sm"
                      style={{
                        color: palette.text,
                        fontFamily: Fonts.sans,
                        fontWeight: isSelected ? "600" : "500",
                      }}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <FontAwesome6 name="check" size={12} color={palette.accent} />
                    ) : null}
                  </Pressable>
                );
              })}

              {showEmptyState ? (
                <Text
                  className="px-3 py-3 text-sm"
                  style={{ color: palette.muted, fontFamily: Fonts.sans }}
                >
                  {emptyLabel}
                </Text>
              ) : null}

              {showCreateOption && onCreate ? (
                <Pressable
                  className="flex-row items-center px-3 py-2.5"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? palette.accentSoft : "transparent",
                    opacity: creating ? 0.7 : 1,
                  })}
                  disabled={creating}
                  onPressIn={() => {
                    menuPointerDownRef.current = true;
                  }}
                  onPressOut={() => {
                    setTimeout(() => {
                      menuPointerDownRef.current = false;
                    }, 0);
                  }}
                  onPress={() => {
                    void onCreate(inputValue.trim()).then((created) => {
                      if (!created) {
                        return;
                      }
                      onChange(created.value);
                      setInputValue(created.label);
                      setIsOpen(false);
                      inputRef.current?.blur();
                    });
                  }}
                >
                  <Text
                    className="text-sm"
                    style={{
                      color: palette.accent,
                      fontFamily: Fonts.sans,
                      fontWeight: "600",
                    }}
                    >
                    {creating ? "Creating..." : `+ Create "${inputValue.trim()}"`}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        ) : null}

      {helperText ? (
        <Text className="text-xs" style={{ color: palette.muted }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
