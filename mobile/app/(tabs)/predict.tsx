import React, { useEffect, useMemo, useState } from "react";
import AppSelect from "../../src/components/common/AppSelect";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAppTheme } from "../../src/store/theme/ThemeContext";
import {
  DEFAULT_PREDICT_FORM,
  OptionsResponse,
  PredictForm,
  PredictResult,
} from "../../src/types/predict";
import {
  getMarkaOptions,
  getModelDetailOptions,
  getModelOptions,
  getSeriOptions,
} from "../../src/services/predict/optionsService";
import { predictPrice } from "../../src/services/predict/predictService";
import { useAuth } from "../../src/store/auth/AuthContext";

type PredictOptionsState = {
  Marka: string[];
  Seri: string[];
  Model: string[];
  "Vites Tipi": string[];
  "Yakıt Tipi": string[];
  "Kasa Tipi": string[];
  Renk: string[];
  Çekiş: string[];
  Motor_Hacmi_CC: string[];
  Motor_Gucu_HP: string[];
};

const EMPTY_OPTIONS: PredictOptionsState = {
  Marka: [],
  Seri: [],
  Model: [],
  "Vites Tipi": [],
  "Yakıt Tipi": [],
  "Kasa Tipi": [],
  Renk: [],
  Çekiş: [],
  Motor_Hacmi_CC: [],
  Motor_Gucu_HP: [],
};

export default function PredictScreen() {
  const { theme } = useAppTheme();
  const { isAuthenticated } = useAuth();

  const [form, setForm] = useState<PredictForm>(DEFAULT_PREDICT_FORM);
  const [options, setOptions] = useState<PredictOptionsState>(EMPTY_OPTIONS);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);

  const loadMarkaOptions = async () => {
    try {
      setLoadingOptions(true);
      const data = await getMarkaOptions();
      setOptions({
        ...EMPTY_OPTIONS,
        Marka: data.Marka || [],
      });
    } catch (error) {
      console.log("Marka options error:", error);
      Alert.alert("Hata", "Marka seçenekleri alınamadı.");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadMarkaOptions();
  }, []);

  const disableSeri = !form.Marka;
  const disableModel = !form.Marka || !form.Seri;
  const disableAfterModel = !form.Marka || !form.Seri || !form.Model;

  const resetAfterMarka = (marka: string) => {
    setForm({ ...DEFAULT_PREDICT_FORM, Marka: marka });
    setOptions((prev) => ({
      ...prev,
      Seri: [],
      Model: [],
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));
    setResult(null);
  };

  const resetAfterSeri = (seri: string) => {
    setForm((prev) => ({
      ...prev,
      Seri: seri,
      Model: "",
      "Vites Tipi": "",
      "Yakıt Tipi": "",
      "Kasa Tipi": "",
      Renk: "",
      Çekiş: "",
      Motor_Hacmi_CC: "",
      Motor_Gucu_HP: "",
    }));
    setOptions((prev) => ({
      ...prev,
      Model: [],
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));
    setResult(null);
  };

  const resetAfterModel = (model: string) => {
    setForm((prev) => ({
      ...prev,
      Model: model,
      "Vites Tipi": "",
      "Yakıt Tipi": "",
      "Kasa Tipi": "",
      Renk: "",
      Çekiş: "",
      Motor_Hacmi_CC: "",
      Motor_Gucu_HP: "",
    }));
    setOptions((prev) => ({
      ...prev,
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));
    setResult(null);
  };

  const applyModelDetailOptions = (data: OptionsResponse) => {
    const vites = data["Vites Tipi"] || [];
    const yakit = data["Yakıt Tipi"] || [];
    const kasa = data["Kasa Tipi"] || [];
    const renk = data.Renk || [];
    const cekis = data["Çekiş"] || [];
    const hacim = (data.Motor_Hacmi_CC || []).map(String);
    const guc = (data.Motor_Gucu_HP || []).map(String);

    setOptions((prev) => ({
      ...prev,
      "Vites Tipi": vites,
      "Yakıt Tipi": yakit,
      "Kasa Tipi": kasa,
      Renk: renk,
      Çekiş: cekis,
      Motor_Hacmi_CC: hacim,
      Motor_Gucu_HP: guc,
    }));

    setForm((prev) => ({
      ...prev,
      "Vites Tipi": prev["Vites Tipi"] || (vites.length === 1 ? vites[0] : ""),
      "Yakıt Tipi": prev["Yakıt Tipi"] || (yakit.length === 1 ? yakit[0] : ""),
      "Kasa Tipi": prev["Kasa Tipi"] || (kasa.length === 1 ? kasa[0] : ""),
      Renk: prev.Renk || (renk.length === 1 ? renk[0] : ""),
      Çekiş: prev["Çekiş"] || (cekis.length === 1 ? cekis[0] : ""),
      Motor_Hacmi_CC:
        prev.Motor_Hacmi_CC || (hacim.length === 1 ? hacim[0] : ""),
      Motor_Gucu_HP:
        prev.Motor_Gucu_HP || (guc.length === 1 ? guc[0] : ""),
    }));
  };

  const handleMarkaChange = async (value: string) => {
    resetAfterMarka(value);
    if (!value) return;

    try {
      setLoadingOptions(true);
      const data = await getSeriOptions(value);
      setOptions((prev) => ({
        ...prev,
        Seri: data.Seri || [],
      }));
    } catch (error) {
      console.log("Seri options error:", error);
      Alert.alert("Hata", "Seri seçenekleri alınamadı.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSeriChange = async (value: string) => {
    resetAfterSeri(value);
    if (!form.Marka || !value) return;

    try {
      setLoadingOptions(true);
      const data = await getModelOptions(form.Marka, value);
      setOptions((prev) => ({
        ...prev,
        Model: data.Model || [],
      }));
    } catch (error) {
      console.log("Model options error:", error);
      Alert.alert("Hata", "Model seçenekleri alınamadı.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleModelChange = async (value: string) => {
    resetAfterModel(value);
    if (!form.Marka || !form.Seri || !value) return;

    try {
      setLoadingOptions(true);
      const data = await getModelDetailOptions(form.Marka, form.Seri, value);
      applyModelDetailOptions(data);
    } catch (error) {
      console.log("Model detail options error:", error);
      Alert.alert("Hata", "Model detay seçenekleri alınamadı.");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleReset = async () => {
    setForm(DEFAULT_PREDICT_FORM);
    setResult(null);
    await loadMarkaOptions();
  };

  const validate = () => {
    const requiredFields = [
      "Marka",
      "Seri",
      "Model",
      "Vites Tipi",
      "Yakıt Tipi",
      "Kasa Tipi",
      "Renk",
      "Çekiş",
      "Yıl",
      "Kilometre",
      "Motor_Hacmi_CC",
      "Motor_Gucu_HP",
    ] as const;

    for (const field of requiredFields) {
      const value = form[field];
      if (!String(value ?? "").trim()) {
        return `${field} alanı zorunlu.`;
      }
    }

    const yil = Number(form["Yıl"]);
    const km = Number(form.Kilometre);
    const hacim = Number(form.Motor_Hacmi_CC);
    const guc = Number(form.Motor_Gucu_HP);
    const degisen = Number(form.Degisen_Parca);
    const boyali = Number(form.Boyali_Parca);

    if (Number.isNaN(yil) || yil < 1950 || yil > 2026) {
      return "Yıl aralığı geçersiz.";
    }

    if (Number.isNaN(km) || km < 0) {
      return "Kilometre değeri geçersiz.";
    }

    if (Number.isNaN(hacim) || hacim < 0 || Number.isNaN(guc) || guc < 0) {
      return "Motor değerleri geçersiz.";
    }

    if (
      Number.isNaN(degisen) ||
      degisen < 0 ||
      Number.isNaN(boyali) ||
      boyali < 0
    ) {
      return "Parça sayıları geçersiz.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert("Eksik veya hatalı bilgi", validationError);
      return;
    }

    try {
      setSubmitting(true);
      const data = await predictPrice(form);
      setResult(data);

      if (isAuthenticated) {
        Alert.alert("Başarılı", "Tahmin alındı ve hesabına kaydedildi.");
      } else {
        Alert.alert("Başarılı", "Tahmin alındı.");
      }
    } catch (error: any) {
      console.log("Predict error:", error?.response?.data || error);
      const detail = error?.response?.data?.detail || "Tahmin alınamadı.";
      Alert.alert("Hata", String(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const summaryText = useMemo(() => {
    if (!result) return "Henüz tahmin yapılmadı.";
    return formatPrice(result.tahmini_fiyat);
  }, [result]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16 }}
    >

      <SectionCard title="Araç Bilgileri"
        rightAction={
          <Pressable
            onPress={handleReset}
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
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Sıfırla
            </Text>
          </Pressable>
        }>
        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 15,
            lineHeight: 20,
          }}
        >
          Seçimler birbirine bağlıdır. Marka seçmeden seri, seri seçmeden model seçilemez.
        </Text>
        <AppSelect
          label="Marka"
          value={form.Marka}
          onChange={handleMarkaChange}
          options={options.Marka}
          enabled={!loadingOptions}
        />

        <AppSelect
          label="Seri"
          value={form.Seri}
          onChange={handleSeriChange}
          options={options.Seri}
          enabled={!disableSeri && !loadingOptions}
        />

        <AppSelect
          label="Model"
          value={form.Model}
          onChange={handleModelChange}
          options={options.Model}
          enabled={!disableModel && !loadingOptions}
        />

        <InputField
          label="Yıl"
          value={form["Yıl"]}
          onChangeText={(text) => setForm((prev) => ({ ...prev, Yıl: text }))}
          keyboardType="numeric"
        />

        <InputField
          label="Kilometre"
          value={form.Kilometre}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, Kilometre: text }))
          }
          keyboardType="numeric"
        />

        <AppSelect
          label="Vites Tipi"
          value={form["Vites Tipi"]}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, "Vites Tipi": value }))
          }
          options={options["Vites Tipi"]}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options["Vites Tipi"].length !== 1
          }
        />

        <AppSelect
          label="Yakıt Tipi"
          value={form["Yakıt Tipi"]}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, "Yakıt Tipi": value }))
          }
          options={options["Yakıt Tipi"]}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options["Yakıt Tipi"].length !== 1
          }
        />

        <AppSelect
          label="Kasa Tipi"
          value={form["Kasa Tipi"]}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, "Kasa Tipi": value }))
          }
          options={options["Kasa Tipi"]}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options["Kasa Tipi"].length !== 1
          }
        />

        <AppSelect
          label="Renk"
          value={form.Renk}
          onChange={(value) => setForm((prev) => ({ ...prev, Renk: value }))}
          options={options.Renk}
          enabled={!disableAfterModel && !loadingOptions && options.Renk.length !== 1}
        />

        <AppSelect
          label="Çekiş"
          value={form["Çekiş"]}
          onChange={(value) => setForm((prev) => ({ ...prev, Çekiş: value }))}
          options={options["Çekiş"]}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options["Çekiş"].length !== 1
          }
        />

        <AppSelect
          label="Motor Hacmi (CC)"
          value={form.Motor_Hacmi_CC}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, Motor_Hacmi_CC: value }))
          }
          options={options.Motor_Hacmi_CC}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options.Motor_Hacmi_CC.length !== 1
          }
        />

        <AppSelect
          label="Motor Gücü (HP)"
          value={form.Motor_Gucu_HP}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, Motor_Gucu_HP: value }))
          }
          options={options.Motor_Gucu_HP}
          enabled={
            !disableAfterModel &&
            !loadingOptions &&
            options.Motor_Gucu_HP.length !== 1
          }
        />

        <InputField
          label="Değişen Parça"
          value={form.Degisen_Parca}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, Degisen_Parca: text }))
          }
          keyboardType="numeric"
        />

        <InputField
          label="Boyalı Parça"
          value={form.Boyali_Parca}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, Boyali_Parca: text }))
          }
          keyboardType="numeric"
        />
      </SectionCard>

      <Pressable
        onPress={handleSubmit}
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
          paddingVertical: 16,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
          {submitting ? "Tahmin yapılıyor..." : "Tahmin Yap"}
        </Text>
      </Pressable>

      <SectionCard title="Sonuç">
        <Text
          style={{
            color: result ? theme.colors.primary : theme.colors.muted,
            fontSize: 26,
            fontWeight: "800",
          }}
        >
          {summaryText}
        </Text>

        <Text
          style={{
            color: theme.colors.muted,
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          {isAuthenticated
            ? "Giriş yaptığın için başarılı tahminler geçmiş listene otomatik kaydedilir."
            : "Misafir kullanıcı olarak tahmin yapabilirsin. Geçmişe kaydetmek için giriş yapman gerekir."}
        </Text>
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

function InputField({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  const { theme } = useAppTheme();

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: "700" }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={label}
        placeholderTextColor={theme.colors.muted}
        style={{
          backgroundColor: theme.colors.backgroundSecondary,
          color: theme.colors.text,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 15,
        }}
      />
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