import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import { useAuth } from "../../src/store/auth/AuthContext";
import {
  DEFAULT_RECOMMENDATION_FORM,
  KASA_OPTIONS,
  RecommendationForm,
  VITES_OPTIONS,
  YAKIT_OPTIONS,
} from "../../src/types/recommendation";
import { getRecommendations } from "../../src/services/recommend/recommendationService";
import { useRecommendationResult } from "../../src/store/recommend/RecommendationContext";

type StepKey = "vites" | "yakit" | "kasa";

const steps: StepKey[] = ["vites", "yakit", "kasa"];

function formatWithDots(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("tr-TR");
}

function paramToString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default function RecommendWizardScreen() {
  const { theme } = useAppTheme();
  const { isAuthenticated, isReady } = useAuth();
  const { setRecommendationResult } = useRecommendationResult();
  const params = useLocalSearchParams<{
    fromResults?: string;
    budget_min?: string;
    budget_max?: string;
    year_min?: string;
    year_max?: string;
    km_min?: string;
    km_max?: string;
  }>();

  const [form, setForm] = useState<RecommendationForm>(DEFAULT_RECOMMENDATION_FORM);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace("/(auth)/login" as any);
    }
  }, [isAuthenticated, isReady]);

  useEffect(() => {
    if (paramToString(params.fromResults) !== "1") return;

    setForm({
      ...DEFAULT_RECOMMENDATION_FORM,
      budget_min: formatWithDots(paramToString(params.budget_min)),
      budget_max: formatWithDots(paramToString(params.budget_max)),
      year_min: paramToString(params.year_min).replace(/\D/g, ""),
      year_max: paramToString(params.year_max).replace(/\D/g, ""),
      km_min: formatWithDots(paramToString(params.km_min)),
      km_max: formatWithDots(paramToString(params.km_max)),
      vites: "",
      yakit: "",
      kasa: "",
    });

    setCurrentStep(0);
    setRecommendationResult(null);
  }, [
    params.fromResults,
    params.budget_min,
    params.budget_max,
    params.year_min,
    params.year_max,
    params.km_min,
    params.km_max,
  ]);

  if (!isReady || !isAuthenticated) return null;

  const currentKey = steps[currentStep];

  const currentStepMeta = useMemo(() => {
    if (currentKey === "vites") {
      return {
        title: "Hangi vites türünü tercih edersin?",
        options: VITES_OPTIONS,
      };
    }
    if (currentKey === "yakit") {
      return {
        title: "Yakıt tercihin nedir?",
        options: YAKIT_OPTIONS,
      };
    }
    return {
      title: "Hangi kasa tipini istersin?",
      options: KASA_OPTIONS,
    };
  }, [currentKey]);

  const handleResetAll = () => {
    setForm(DEFAULT_RECOMMENDATION_FORM);
    setCurrentStep(0);
    setRecommendationResult(null);
  };

  const handleResetStepChoices = () => {
    setForm((prev) => ({
      ...prev,
      vites: "",
      yakit: "",
      kasa: "",
    }));
    setCurrentStep(0);
  };

  const validate = () => {
    const requiredFields: Array<[keyof RecommendationForm, string]> = [
      ["budget_min", "Bütçe minimum"],
      ["budget_max", "Bütçe maksimum"],
      ["year_min", "Yıl minimum"],
      ["year_max", "Yıl maksimum"],
      ["km_min", "KM minimum"],
      ["km_max", "KM maksimum"],
    ];

    const missingFields = requiredFields
      .filter(([key]) => !String(form[key] ?? "").trim())
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      return `Lütfen şu alanları doldur:\n\n• ${missingFields.join("\n• ")}`;
    }

    const pairs: Array<[keyof RecommendationForm, keyof RecommendationForm, string]> = [
      ["budget_min", "budget_max", "Bütçe"],
      ["year_min", "year_max", "Yıl"],
      ["km_min", "km_max", "KM"],
    ];

    for (const [minKey, maxKey, label] of pairs) {
      const minRaw = String(form[minKey] ?? "").replace(/\./g, "");
      const maxRaw = String(form[maxKey] ?? "").replace(/\./g, "");

      if (!minRaw || Number.isNaN(Number(minRaw))) {
        return `${label} minimum değeri geçerli bir sayı olmalı.`;
      }

      if (!maxRaw || Number.isNaN(Number(maxRaw))) {
        return `${label} maksimum değeri geçerli bir sayı olmalı.`;
      }

      if (Number(minRaw) > Number(maxRaw)) {
        return `${label} minimum değeri maksimumdan büyük olamaz.`;
      }
    }

    return "";
  };

  const goNextOrSubmit = async (selectedValue: string) => {
    const nextForm = { ...form, [currentKey]: selectedValue };
    setForm(nextForm);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const errorText = validate();
    if (errorText) {
      Alert.alert("Eksik / hatalı bilgi", errorText);
      return;
    }

    try {
      setSubmitting(true);
      const data = await getRecommendations(nextForm);
      console.log("RECOMMENDATION RESPONSE:", JSON.stringify(data, null, 2));
      setRecommendationResult(data);
      router.push("/recommend/results" as any);
    } catch (error: any) {
      console.log("Recommendation error:", error?.response?.data || error);
      const detail = error?.response?.data?.detail;

      let message = "Öneriler alınamadı.";

      if (Array.isArray(detail)) {
        message = detail.map((item: any) => item?.msg || JSON.stringify(item)).join("\n");
      } else if (typeof detail === "string") {
        message = detail;
      } else if (detail) {
        message = JSON.stringify(detail);
      }

      Alert.alert("Hata", message);
    } finally {
      setSubmitting(false);
    }
  };

  const setFormattedField = (key: keyof RecommendationForm, text: string) => {
    if (key === "year_min" || key === "year_max") {
      setForm((prev) => ({ ...prev, [key]: text.replace(/\D/g, "") }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: formatWithDots(text) }));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >
      <SectionCard
        title="Araç Öneri Asistanı"
        rightAction={
          <Pressable
            onPress={handleResetAll}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: theme.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Sıfırla
            </Text>
          </Pressable>
        }
      >
        <Text style={{ color: theme.colors.muted, fontSize: 15, lineHeight: 22 }}>
          Seçimlerine göre en uygun araçları önereceğim.
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <RangeBox
            label="Bütçe"
            minValue={form.budget_min}
            maxValue={form.budget_max}
            onMinChange={(t) => setFormattedField("budget_min", t)}
            onMaxChange={(t) => setFormattedField("budget_max", t)}
          />
          <RangeBox
            label="Yıl"
            minValue={form.year_min}
            maxValue={form.year_max}
            onMinChange={(t) => setFormattedField("year_min", t)}
            onMaxChange={(t) => setFormattedField("year_max", t)}
          />
          <RangeBox
            label="KM"
            minValue={form.km_min}
            maxValue={form.km_max}
            onMinChange={(t) => setFormattedField("km_min", t)}
            onMaxChange={(t) => setFormattedField("km_max", t)}
          />
        </View>

        <View style={{ gap: 4 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
            • Bütçe :{" "}
            <Text style={{ fontWeight: "700", color: theme.colors.text }}>
              {form.budget_min || "0"} - {form.budget_max || "0"}
            </Text>{" "}
            TL
          </Text>

          <Text style={{ color: theme.colors.muted, fontSize: 13 }}>
            • Km :{" "}
            <Text style={{ fontWeight: "700", color: theme.colors.text }}>
              {form.km_min || "0"} - {form.km_max || "0"}
            </Text>
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        title={`Adım ${currentStep + 1} / 3`}
        rightAction={
          <Pressable
            onPress={handleResetStepChoices}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: theme.colors.primarySoft,
            }}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Sıfırla
            </Text>
          </Pressable>
        }
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          {currentStepMeta.title}
        </Text>

        <View style={{ gap: 12 }}>
          {currentStepMeta.options.map((option) => (
            <Pressable
              key={option}
              disabled={submitting}
              onPress={() => goNextOrSubmit(option)}
              style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingVertical: 18,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </SectionCard>
    </ScrollView>
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

function RangeBox({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
}: {
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (text: string) => void;
  onMaxChange: (text: string) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ flex: 1, gap: 8 }}>
      <Text style={{ color: theme.colors.muted, fontSize: 13, fontWeight: "700" }}>
        {label}
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 16,
          padding: 8,
          gap: 8,
          backgroundColor: theme.colors.backgroundSecondary,
        }}
      >
        <TextInput
          value={minValue}
          onChangeText={onMinChange}
          placeholder="Min"
          keyboardType="numeric"
          placeholderTextColor={theme.colors.muted}
          style={{
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
          }}
        />
        <TextInput
          value={maxValue}
          onChangeText={onMaxChange}
          placeholder="Max"
          keyboardType="numeric"
          placeholderTextColor={theme.colors.muted}
          style={{
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
          }}
        />
      </View>
    </View>
  );
}