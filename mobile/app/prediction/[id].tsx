import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { getPredictionHistory } from "../../src/services/history/historyService";
import { PredictionHistoryItem } from "../../src/types/history";

export default function PredictionDetailScreen() {
  const { theme } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<PredictionHistoryItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        try {
          const data = await getPredictionHistory();
          const found = data.find((x) => String(x.id) === String(id)) || null;

          if (isActive) {
            setItem(found);
          }
        } catch (error) {
          console.log("Detail load error:", error);
          if (isActive) {
            setItem(null);
          }
        }
      })();

      return () => {
        isActive = false;
      };
    }, [id])
  );

  const input = useMemo(() => normalizeInput(item?.input_json), [item?.input_json]);

  const title = useMemo(() => {
    return (
      [input.Marka, input.Seri, input.Model].filter(Boolean).join(" ") || "Tahmin Kaydı"
    );
  }, [input]);

  const detailRows = useMemo(
    () =>
      ([
        ["Marka", formatPlain(firstValue(input, ["Marka", "marka", "brand", "Brand"]))],
        ["Seri", formatPlain(firstValue(input, ["Seri", "seri", "series", "Series"]))],
        ["Model", formatPlain(firstValue(input, ["Model", "model"]))],
        ["Yıl", formatPlain(firstValue(input, ["Yıl", "yil", "year", "Year"]))],
        [
          "Kilometre",
          formatKmValue(firstValue(input, ["Km", "KM", "km", "Kilometre", "kilometre"])),
        ],
        [
          "Vites Tipi",
          formatPlain(
            firstValue(input, ["Vites Tipi", "vites", "transmission", "Transmission"])
          ),
        ],
        [
          "Yakıt Tipi",
          formatPlain(
            firstValue(input, ["Yakıt Tipi", "yakit", "fuel_type", "fuel", "Fuel Type"])
          ),
        ],
        [
          "Kasa Tipi",
          formatPlain(
            firstValue(input, ["Kasa Tipi", "kasa", "body_type", "body", "Body Type"])
          ),
        ],
        ["Renk", formatPlain(firstValue(input, ["Renk", "renk", "color", "Color"]))],
        [
          "Çekiş",
          formatPlain(firstValue(input, ["Çekiş", "cekis", "drive_type", "Drive Type"])),
        ],
        [
          "Motor Hacmi",
          formatPlain(firstValue(input, ["Motor_Hacmi_CC", "motor_hacmi_cc", "engine_cc"])),
        ],
        [
          "Motor Gücü",
          formatPlain(firstValue(input, ["Motor_Gucu_HP", "motor_gucu_hp", "engine_hp"])),
        ],
        [
          "Değişen Parça",
          formatPlain(firstValue(input, ["Degisen_Parca", "degisen_parca"])),
        ],
        [
          "Boyalı Parça",
          formatPlain(firstValue(input, ["Boyali_Parca", "boyali_parca"])),
        ],
      ] as [string, string][])
        .filter((row): row is [string, string] => row[1] !== "-"),
    [input]
  );

  if (!item) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 20 }}
      >
        <InfoCard text="Kayıt yükleniyor veya bulunamadı." />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 18,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 22,
            fontWeight: "800",
          }}
        >
          Tahmin Detayı
        </Text>

        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 24,
            fontWeight: "800",
          }}
        >
          {formatPrice(item.predicted_price)}
        </Text>

        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 14,
          }}
        >
          {formatDate(item.created_at)}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
          gap: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          Özet
        </Text>

        <SummaryLine label="Araç" value={title} strong />
      </View>

      <View
        style={{
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: 16,
          gap: 10,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          Araç Bilgileri
        </Text>

        {detailRows.length === 0 ? (
          <Text style={{ color: theme.colors.muted, fontSize: 14 }}>
            Araç bilgisi bulunamadı.
          </Text>
        ) : (
          detailRows.map(([label, value], index) => (
            <DetailRow
              key={label}
              label={label}
              value={value}
              isLast={index === detailRows.length - 1}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function normalizeInput(raw: unknown): Record<string, any> {
  if (!raw) return {};

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, any>;
      }
      return {};
    } catch {
      return {};
    }
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, any>;
  }

  return {};
}

function firstValue(item: any, keys: string[]) {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
}

function formatPlain(value: any) {
  if (value === undefined || value === null) return "-";
  const str = String(value).trim();
  if (!str) return "-";

  const lowered = str.toLowerCase();
  if (lowered === "nan" || lowered === "null" || lowered === "undefined") {
    return "-";
  }

  return str;
}

function formatKmValue(value: any) {
  if (value === undefined || value === null || value === "") return "-";

  const raw = String(value).replace(/\./g, "").replace(",", ".");
  const asNumber = Number(raw);

  if (!Number.isNaN(asNumber)) {
    return `${Number(asNumber).toLocaleString("tr-TR")} km`;
  }

  return formatPlain(value);
}

function SummaryLine({
  label,
  value,
  strong,
  valueColor,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: theme.colors.muted, fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: valueColor || theme.colors.text,
          fontSize: strong ? 20 : 16,
          fontWeight: "800",
          lineHeight: strong ? 26 : 22,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text style={{ color: theme.colors.muted, fontSize: 14, flex: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "600",
          flex: 1,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function InfoCard({ text }: { text: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 18,
      }}
    >
      <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>
        {text}
      </Text>
    </View>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("tr-TR");
  } catch {
    return value;
  }
}