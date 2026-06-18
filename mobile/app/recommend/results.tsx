import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { RecommendationItem } from "../../src/types/recommendation";
import { useRecommendationResult } from "../../src/store/recommend/RecommendationContext";

export default function RecommendationResultsScreen() {
  const { theme } = useAppTheme();
  const { recommendationResult } = useRecommendationResult();
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);

  const items: RecommendationItem[] =
    recommendationResult?.recommendations ||
    recommendationResult?.results ||
    [];

  const totalCount =
    recommendationResult?.total_found ??
    recommendationResult?.total_count ??
    recommendationResult?.total_matches ??
    items.length ??
    0;

  const returnedCount =
    recommendationResult?.returned_count ??
    items.length ??
    0;

  const handleRestart = () => {
    const rawFilters =
      recommendationResult &&
      typeof recommendationResult === "object" &&
      "filters" in recommendationResult
        ? (recommendationResult as any).filters
        : {};

    const rawBudget =
      recommendationResult &&
      typeof recommendationResult === "object" &&
      "budget" in recommendationResult
        ? (recommendationResult as any).budget
        : {};

    const filters = rawFilters ?? {};
    const budget = rawBudget ?? {};

    router.replace({
      pathname: "/recommend/wizard",
      params: {
        fromResults: "1",
        budget_min: budget?.min != null ? String(budget.min) : "",
        budget_max: budget?.max != null ? String(budget.max) : "",
        year_min: filters?.year_min != null ? String(filters.year_min) : "",
        year_max: filters?.year_max != null ? String(filters.year_max) : "",
        km_min: filters?.km_min != null ? String(filters.km_min) : "",
        km_max: filters?.km_max != null ? String(filters.km_max) : "",
      },
    } as any);
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <SectionCard
          title="Öneriler"
          rightAction={
            <Pressable
              onPress={handleRestart}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                Yeniden Başla
              </Text>
            </Pressable>
          }
        >
          <View
            style={{
              backgroundColor: "rgba(217, 119, 6, 0.10)",
              borderWidth: 1,
              borderColor: "rgba(217, 119, 6, 0.25)",
              borderRadius: 16,
              padding: 14,
              gap: 10,
            }}
          >
            <InfoRow label="Toplam eşleşen araç" value={String(totalCount)} />
            <InfoRow label="Gösterilen araç" value={String(returnedCount)} />
            <InfoRow label="Sıralama" value="KNN uygunluk skoruna göre" />

            <Text
              style={{
                color: theme.colors.muted,
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              Gerçek fiyatı tahmin fiyatından anlamlı şekilde düşük olan araçlar
              fırsat olarak işaretlenir.
            </Text>
          </View>
        </SectionCard>

        {items.length === 0 ? (
          <SectionCard title="Bilgi">
            <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>
              Bu filtrelere uygun öneri bulunamadı.
            </Text>
          </SectionCard>
        ) : (
          items.map((item, index) => (
            <RecommendationCard
              key={index}
              item={item}
              onPress={() => setSelectedItem(item)}
            />
          ))
        )}
      </ScrollView>

      <RecommendationDetailModal
        item={selectedItem}
        visible={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
}

function RecommendationCard({
  item,
  onPress,
}: {
  item: RecommendationItem;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  const title = getItemTitle(item);
  const score = getScore(item);
  const actualPrice = getActualPrice(item);
  const opportunityPercent = getOpportunityPercent(item);
  const isOpportunity = opportunityPercent !== null && opportunityPercent >= 5;
  const meta = buildMeta(item);

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: 18,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <View style={{ flex: 1, gap: 6 }}>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 20,
              fontWeight: "800",
            }}
          >
            {title}
          </Text>

          {meta ? (
            <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
              {meta}
            </Text>
          ) : null}

          {isOpportunity && opportunityPercent !== null ? (
            <View
              style={{
                alignSelf: "flex-start",
                marginTop: 6,
                backgroundColor: "rgba(217, 119, 6, 0.12)",
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: "rgba(217, 119, 6, 0.25)",
              }}
            >
              <Text style={{ color: "#b45309", fontSize: 12, fontWeight: "700" }}>
                🔥 Fırsat %{Math.round(opportunityPercent)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ gap: 8, alignItems: "flex-end" }}>
          {typeof score === "number" ? (
            <View
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                %{Number(score).toFixed(0)} uygunluk
              </Text>
            </View>
          ) : null}

          {typeof actualPrice === "number" ? (
            <View
              style={{
                backgroundColor: "#0f213c",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {formatPrice(actualPrice)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <Text
        style={{
          color: theme.colors.primary,
          fontSize: 13,
          fontWeight: "700",
        }}
      >
        Detay için tıkla →
      </Text>
    </Pressable>
  );
}

function RecommendationDetailModal({
  item,
  visible,
  onClose,
}: {
  item: RecommendationItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  const { theme, themeName } = useAppTheme();

  if (!item) return null;

  const detailRows = ([
    ["Marka", formatPlain(firstValue(item, ["brand", "Brand", "marka", "Marka"]))],
    ["Seri", formatPlain(firstValue(item, ["series", "Series", "seri", "Seri"]))],
    ["Model", formatPlain(firstValue(item, ["model", "Model"]))],
    ["Yıl", formatPlain(firstValue(item, ["year", "Year", "yil", "Yıl"]))],
    ["Kilometre", formatKmValue(firstValue(item, ["km", "KM", "kilometre", "Kilometre"]))],
    ["Vites Tipi", formatPlain(firstValue(item, ["transmission", "Transmission", "vites", "Vites Tipi"]))],
    ["Yakıt Tipi", formatPlain(firstValue(item, ["fuel_type", "Fuel Type", "fuel", "yakit", "Yakıt Tipi"]))],
    ["Kasa Tipi", formatPlain(firstValue(item, ["body_type", "Body Type", "body", "kasa", "Kasa Tipi"]))],
    ["Renk", formatPlain(firstValue(item, ["color", "Color", "renk", "Renk"]))],
    ["Çekiş", formatPlain(firstValue(item, ["drive_type", "Drive Type", "cekis", "Çekiş"]))],
    ["Motor Hacmi", formatPlain(firstValue(item, ["engine_cc", "motor_hacmi_cc", "Motor_Hacmi_CC"]))],
    ["Motor Gücü", formatPlain(firstValue(item, ["engine_hp", "motor_gucu_hp", "Motor_Gucu_HP"]))],
    ["Değişen Parça", formatPlain(firstValue(item, ["degisen_parca", "Degisen_Parca"]))],
    ["Boyalı Parça", formatPlain(firstValue(item, ["boyali_parca", "Boyali_Parca"]))],
  ] as [string, string][])
    .filter((row): row is [string, string] => row[1] !== "-");

  const score = getScore(item);
  const actualPrice = getActualPrice(item);
  const predictedPrice = getPredictedPrice(item);
  const diff = getDiff(item);
  const opportunityPercent = getOpportunityPercent(item);
  const isOpportunity = opportunityPercent !== null && opportunityPercent >= 5;

  const modalBackground =
    themeName === "midnight" ? "#0b1730" : theme.colors.card;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            maxHeight: "92%",
            backgroundColor: modalBackground,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 18,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 22,
                      fontWeight: "800",
                      flexShrink: 1,
                    }}
                  >
                    Araç Detayı ·
                  </Text>

                  {isOpportunity && opportunityPercent !== null ? (
                    <View
                      style={{
                        backgroundColor: "rgba(217, 119, 6, 0.12)",
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderWidth: 1,
                        borderColor: "rgba(217, 119, 6, 0.25)",
                      }}
                    >
                      <Text style={{ color: "#b45309", fontSize: 12, fontWeight: "700" }}>
                        🔥 Fırsat %{Math.round(opportunityPercent)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  style={{
                    color: theme.colors.muted,
                    fontSize: 14,
                  }}
                >
                  Detayları aşağıdan inceleyebilirsiniz.
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: "700" }}>
                  Kapat
                </Text>
              </Pressable>
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

              {formatIdValue(firstValue(item, ["id", "ilan_no", "listing_id"])) !== "-" ? (
                <SummaryLine
                  label="İlan No"
                  value={formatIdValue(firstValue(item, ["id", "ilan_no", "listing_id"]))}
                />
              ) : null}

              {typeof score === "number" ? (
                <SummaryLine
                  label="Uygunluk skoru"
                  value={`%${Number(score).toFixed(0)}`}
                />
              ) : null}

              {typeof actualPrice === "number" ? (
                <SummaryLine label="Gerçek Fiyat" value={formatPrice(actualPrice)} strong />
              ) : null}

              {typeof predictedPrice === "number" ? (
                <SummaryLine label="Tahmin Fiyatı" value={formatPrice(predictedPrice)} />
              ) : null}

              {typeof diff === "number" ? (
                <SummaryLine
                  label="Fark"
                  value={formatSignedPrice(diff)}
                  valueColor={diff < 0 ? "#15803d" : "#b45309"}
                />
              ) : null}
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

              {detailRows.map(([label, value]) => (
                <DetailRow key={label} label={label} value={value} />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
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

function DetailRow({ label, value }: { label: string; value: string }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text
        style={{
          color: theme.colors.muted,
          fontSize: 14,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: theme.colors.text,
          fontSize: 14,
          fontWeight: "700",
          textAlign: "right",
          flexShrink: 1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionCard({
  title,
  children,
  rightAction,
}: {
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}) {
  const { theme } = useAppTheme();

  return (
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 19,
            fontWeight: "800",
            flex: 1,
          }}
        >
          {title}
        </Text>
        {rightAction ? rightAction : null}
      </View>
      {children}
    </View>
  );
}

function getItemTitle(item: RecommendationItem) {
  return (
    item.car_name ||
    item.title ||
    item.name ||
    [item.brand, item.series, item.model].filter(Boolean).join(" ") ||
    "Araç"
  );
}

function getScore(item: RecommendationItem) {
  return (
    item.uygunluk_yuzdesi ??
    item.similarity_score ??
    (typeof item.score === "number" ? item.score * 100 : undefined)
  );
}

function getActualPrice(item: RecommendationItem) {
  return item.actual_price ?? item.price ?? item.fiyat;
}

function getPredictedPrice(item: RecommendationItem) {
  return item.predicted_price ?? item.tahmin_fiyat;
}

function getDiff(item: RecommendationItem) {
  return item.price_diff ?? item.fiyat_farki;
}

function getOpportunityPercent(item: RecommendationItem) {
  const actualPrice = getActualPrice(item);
  const predictedPrice = getPredictedPrice(item);

  if (
    typeof actualPrice === "number" &&
    typeof predictedPrice === "number" &&
    actualPrice > 0
  ) {
    return ((predictedPrice - actualPrice) / actualPrice) * 100;
  }

  return null;
}

function buildMeta(item: RecommendationItem) {
  const year = item.year ?? item.Yıl;
  const km = item.km ?? item.Kilometre;
  const transmission = item.transmission ?? item["Vites Tipi"];
  const fuelType = item.fuel_type ?? item["Yakıt Tipi"];
  const bodyType = item.body_type ?? item["Kasa Tipi"];

  return [
    year,
    typeof km === "number"
      ? `${Number(km).toLocaleString("tr-TR")} km`
      : undefined,
    transmission,
    fuelType,
    bodyType,
  ]
    .filter(Boolean)
    .join(" • ");
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
    return Number(asNumber).toLocaleString("tr-TR");
  }

  return formatPlain(value);
}

function formatIdValue(value: any) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value).trim();
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatSignedPrice(value: number) {
  const formatted = formatPrice(Math.abs(value));
  return value < 0 ? `- ${formatted}` : `+ ${formatted}`;
}