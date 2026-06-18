import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../store/theme/ThemeContext";
import SelectModal from "./SelectModal";

type AppSelectProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  enabled?: boolean;
  onChange: (value: string) => void;
};

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export default function AppSelect({
  label,
  value,
  options,
  placeholder,
  enabled = true,
  onChange,
}: AppSelectProps) {
  const { theme } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const q = normalizeText(search.trim());

    if (!q) return options;

    return options.filter((item) => normalizeText(item).startsWith(q));
  }, [options, search]);

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>

      <Pressable
        disabled={!enabled}
        onPress={() => {
          setSearch("");
          setVisible(true);
        }}
        style={{
          backgroundColor: enabled
            ? theme.colors.backgroundSecondary
            : theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          minHeight: 54,
          paddingHorizontal: 14,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: enabled ? 1 : 0.65,
        }}
      >
        <Text
          style={{
            color: value ? theme.colors.text : theme.colors.muted,
            fontSize: 15,
            flex: 1,
            marginRight: 10,
          }}
          numberOfLines={1}
        >
          {value || placeholder || `${label} seçiniz`}
        </Text>

        <Ionicons name="chevron-down" size={18} color={theme.colors.muted} />
      </Pressable>

      <SelectModal
        visible={visible}
        title={label}
        options={filteredOptions}
        selectedValue={value}
        onClose={() => setVisible(false)}
        onSelect={onChange}
        searchValue={search}
        onSearchChange={setSearch}
      />
    </View>
  );
}