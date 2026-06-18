import { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { api } from "../api";

const formatTRY = (n) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

const Card = ({ children, className = "" }) => (
  <div className={`ui-card predict-card p-6 md:p-7 ${className}`}>{children}</div>
);

const Field = ({ label, hint, children }) => (
  <label className="block">
    <div className="flex items-end justify-between">
      <span className="ui-title text-[15px] font-medium">{label}</span>
      {hint ? <span className="ui-soft text-xs">{hint}</span> : null}
    </div>
    <div className="mt-1.5">{children}</div>
  </label>
);

const Input = (props) => (
  <input {...props} className="ui-input predict-input disabled:opacity-60" />
);

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Seçiniz...",
  isDisabled = false,
}) => {
  const opts = (options || []).map((o) => ({ value: o, label: o }));
  const selected = value ? { value, label: value } : null;

  return (
    <ReactSelect
      value={selected}
      onChange={(opt) => onChange(opt ? opt.value : "")}
      options={opts}
      isClearable
      isSearchable
      isDisabled={isDisabled}
      placeholder={placeholder}
      noOptionsMessage={() => "Sonuç yok"}
      styles={{
        control: (base, state) => ({
          ...base,
          borderRadius: 14,
          borderColor: state.isFocused
            ? "rgb(var(--primary))"
            : "rgb(var(--border))",
          boxShadow: state.isFocused
            ? "0 0 0 3px rgba(var(--ring), 0.55)"
            : "none",
          minHeight: 48,
          backgroundColor: isDisabled
            ? "rgba(var(--card), 0.55)"
            : "rgba(var(--card), 0.85)",
          ":hover": {
            borderColor: "rgb(var(--primary))",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          color: "rgb(var(--text))",
          paddingTop: 4,
          paddingBottom: 4,
        }),
        input: (base) => ({
          ...base,
          color: "rgb(var(--text))",
        }),
        singleValue: (base) => ({
          ...base,
          color: "rgb(var(--text))",
        }),
        placeholder: (base) => ({
          ...base,
          color: "rgb(var(--muted2))",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          boxShadow: "0 12px 30px rgba(2, 6, 23, 0.18)",
        }),
        menuList: (base) => ({
          ...base,
          backgroundColor: "rgb(var(--card))",
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? "rgba(var(--primary), 0.18)"
            : state.isFocused
              ? "rgba(var(--primary), 0.10)"
              : "rgb(var(--card))",
          color: "rgb(var(--text))",
          cursor: "pointer",
        }),
        clearIndicator: (base) => ({
          ...base,
          color: "rgb(var(--muted))",
          ":hover": { color: "rgb(var(--text))" },
        }),
        dropdownIndicator: (base) => ({
          ...base,
          color: "rgb(var(--muted))",
          ":hover": { color: "rgb(var(--text))" },
        }),
        indicatorSeparator: (base) => ({
          ...base,
          backgroundColor: "rgb(var(--border))",
        }),
      }}
    />
  );
};

const DEFAULT_FORM = {
  Marka: "",
  Seri: "",
  Model: "",
  Yıl: "",
  Kilometre: "",
  "Vites Tipi": "",
  "Yakıt Tipi": "",
  "Kasa Tipi": "",
  Renk: "",
  Çekiş: "",
  Motor_Hacmi_CC: "",
  Motor_Gucu_HP: "",
  Degisen_Parca: 0,
  Boyali_Parca: 0,
};

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(DEFAULT_FORM);

  const [opt, setOpt] = useState({
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
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/options");
        setOpt((s) => ({ ...s, Marka: res.data.Marka || [] }));
      } catch {
        setErr("Seçenekler alınamadı. API çalışıyor mu? (/options)");
      }
    })();
  }, []);

  const validate = () => {
    const required = [
      "Marka",
      "Seri",
      "Model",
      "Vites Tipi",
      "Yakıt Tipi",
      "Kasa Tipi",
      "Renk",
      "Çekiş",
    ];
    for (const r of required) {
      if (!String(form[r] ?? "").trim()) return `${r} alanı zorunlu.`;
    }
    if (Number(form["Yıl"]) < 1950 || Number(form["Yıl"]) > 2026)
      return "Yıl aralığı geçersiz.";
    if (Number(form.Kilometre) < 0) return "Kilometre negatif olamaz.";
    if (Number(form.Motor_Hacmi_CC) < 0 || Number(form.Motor_Gucu_HP) < 0)
      return "Motor değerleri negatif olamaz.";
    if (Number(form.Degisen_Parca) < 0 || Number(form.Boyali_Parca) < 0)
      return "Parça sayıları negatif olamaz.";
    return "";
  };

  const fetchSeries = async (marka) => {
    const res = await api.get("/options", { params: { marka } });
    setOpt((s) => ({
      ...s,
      Seri: res.data.Seri || [],
      Model: [],
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));
  };

  const fetchModels = async (marka, seri) => {
    const res = await api.get("/options", { params: { marka, seri } });
    setOpt((s) => ({
      ...s,
      Model: res.data.Model || [],
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));
  };

  const fetchModelFilters = async (marka, seri, model) => {
    const res = await api.get("/options", { params: { marka, seri, model } });

    const vites = res.data["Vites Tipi"] || [];
    const yakit = res.data["Yakıt Tipi"] || [];
    const kasa = res.data["Kasa Tipi"] || [];
    const renk = res.data["Renk"] || [];
    const cekis = res.data["Çekiş"] || [];
    const mh = (res.data["Motor_Hacmi_CC"] || []).map(String);
    const mg = (res.data["Motor_Gucu_HP"] || []).map(String);

    setOpt((s) => ({
      ...s,
      "Vites Tipi": vites,
      "Yakıt Tipi": yakit,
      "Kasa Tipi": kasa,
      Renk: renk,
      Çekiş: cekis,
      Motor_Hacmi_CC: mh,
      Motor_Gucu_HP: mg,
    }));

    setForm((prev) => ({
      ...prev,
      "Vites Tipi": prev["Vites Tipi"] || (vites.length === 1 ? vites[0] : ""),
      "Yakıt Tipi": prev["Yakıt Tipi"] || (yakit.length === 1 ? yakit[0] : ""),
      "Kasa Tipi": prev["Kasa Tipi"] || (kasa.length === 1 ? kasa[0] : ""),
      Renk: prev.Renk || (renk.length === 1 ? renk[0] : ""),
      Çekiş: prev["Çekiş"] || (cekis.length === 1 ? cekis[0] : ""),
      Motor_Hacmi_CC:
        prev.Motor_Hacmi_CC || (mh.length === 1 ? Number(mh[0]) : ""),
      Motor_Gucu_HP:
        prev.Motor_Gucu_HP || (mg.length === 1 ? Number(mg[0]) : ""),
    }));
  };

  const onMarkaChange = async (v) => {
    setErr("");
    setResult(null);

    setForm({ ...DEFAULT_FORM, Marka: v });

    setOpt((s) => ({
      ...s,
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

    if (!v) return;

    try {
      await fetchSeries(v);
    } catch {
      setErr("Seri seçenekleri alınamadı. (/options?marka=...)");
    }
  };

  const onSeriChange = async (v) => {
    setErr("");
    setResult(null);

    const marka = form.Marka;

    setForm((s) => ({
      ...s,
      Seri: v,
      Model: "",
      "Vites Tipi": "",
      "Yakıt Tipi": "",
      "Kasa Tipi": "",
      Renk: "",
      Çekiş: "",
      Motor_Hacmi_CC: "",
      Motor_Gucu_HP: "",
    }));

    setOpt((s) => ({
      ...s,
      Model: [],
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));

    if (!marka || !v) return;

    try {
      await fetchModels(marka, v);
    } catch {
      setErr("Model seçenekleri alınamadı. (/options?marka=...&seri=...)");
    }
  };

  const onModelChange = async (v) => {
    setErr("");
    setResult(null);

    const marka = form.Marka;
    const seri = form.Seri;

    setForm((s) => ({
      ...s,
      Model: v,
      "Vites Tipi": "",
      "Yakıt Tipi": "",
      "Kasa Tipi": "",
      Renk: "",
      Çekiş: "",
      Motor_Hacmi_CC: "",
      Motor_Gucu_HP: "",
    }));

    setOpt((s) => ({
      ...s,
      "Vites Tipi": [],
      "Yakıt Tipi": [],
      "Kasa Tipi": [],
      Renk: [],
      Çekiş: [],
      Motor_Hacmi_CC: [],
      Motor_Gucu_HP: [],
    }));

    if (!marka || !seri || !v) return;

    try {
      await fetchModelFilters(marka, seri, v);
    } catch {
      setErr("Model filtreleri alınamadı. (/options?marka=...&seri=...&model=...)");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setResult(null);

    const v = validate();
    if (v) return setErr(v);

    try {
      setLoading(true);
      const payload = {
        ...form,
        Motor_Hacmi_CC: Number(form.Motor_Hacmi_CC),
        Motor_Gucu_HP: Number(form.Motor_Gucu_HP),
      };

      const res = await api.post("/predict", payload, {
        params: { strict: false },
      });
      setResult(res.data);
    } catch (e2) {
      const msg =
        e2?.response?.data?.detail || e2?.message || "Tahmin alınamadı.";
      setErr(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const disableSeri = !form.Marka;
  const disableModel = !form.Marka || !form.Seri;
  const disableAfterModel = !form.Marka || !form.Seri || !form.Model;

  return (
    <div className="predict-page-wrap mx-auto max-w-[1400px] px-0 py-4">
      <div className="grid grid-cols-1 gap-7 xl:grid-cols-[2.2fr_1fr]">
        <div>
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="ui-title text-[2rem] font-semibold leading-none md:text-[2.1rem]">
                  Araç Bilgileri
                </h2>
                <p className="ui-muted mt-3 text-base">
                  Seçimler birbirine bağlıdır: Marka seçmeden Seri, Seri seçmeden
                  Model seçilemez.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setErr("");
                    setResult(null);
                    setForm(DEFAULT_FORM);
                    setOpt((s) => ({
                      ...s,
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
                  }}
                  className="ui-btn-secondary predict-reset-btn"
                >
                  Sıfırla
                </button>
              </div>
            </div>

            {err ? <div className="mt-5 ui-alert-danger">{err}</div> : null}

            <form
              onSubmit={onSubmit}
              className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <Field label="Marka">
                <SearchableSelect
                  value={form.Marka}
                  onChange={onMarkaChange}
                  options={opt.Marka}
                  placeholder="Marka seç / ara..."
                />
              </Field>

              <Field label="Seri">
                <SearchableSelect
                  value={form.Seri}
                  onChange={onSeriChange}
                  options={opt.Seri}
                  placeholder="Seri seç / ara..."
                  isDisabled={disableSeri}
                />
              </Field>

              <Field label="Model">
                <SearchableSelect
                  value={form.Model}
                  onChange={onModelChange}
                  options={opt.Model}
                  placeholder="Model seç / ara..."
                  isDisabled={disableModel}
                />
              </Field>

              <Field label="Yıl">
                <Input
                  type="number"
                  value={form["Yıl"]}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, Yıl: Number(e.target.value) }))
                  }
                  disabled={!form.Marka}
                />
              </Field>

              <Field label="Kilometre" hint="km">
                <Input
                  type="number"
                  value={form.Kilometre}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, Kilometre: Number(e.target.value) }))
                  }
                  disabled={!form.Marka}
                />
              </Field>

              <Field label="Vites Tipi">
                <SearchableSelect
                  value={form["Vites Tipi"]}
                  onChange={(v) => setForm((s) => ({ ...s, "Vites Tipi": v }))}
                  options={opt["Vites Tipi"]}
                  placeholder="Vites seç / ara..."
                  isDisabled={
                    disableAfterModel || opt["Vites Tipi"]?.length === 1
                  }
                />
              </Field>

              <Field label="Yakıt Tipi">
                <SearchableSelect
                  value={form["Yakıt Tipi"]}
                  onChange={(v) => setForm((s) => ({ ...s, "Yakıt Tipi": v }))}
                  options={opt["Yakıt Tipi"]}
                  placeholder="Yakıt seç / ara..."
                  isDisabled={
                    disableAfterModel || opt["Yakıt Tipi"]?.length === 1
                  }
                />
              </Field>

              <Field label="Kasa Tipi">
                <SearchableSelect
                  value={form["Kasa Tipi"]}
                  onChange={(v) => setForm((s) => ({ ...s, "Kasa Tipi": v }))}
                  options={opt["Kasa Tipi"]}
                  placeholder="Kasa seç / ara..."
                  isDisabled={
                    disableAfterModel || opt["Kasa Tipi"]?.length === 1
                  }
                />
              </Field>

              <Field label="Renk">
                <SearchableSelect
                  value={form.Renk}
                  onChange={(v) => setForm((s) => ({ ...s, Renk: v }))}
                  options={opt.Renk}
                  placeholder="Renk seç / ara..."
                  isDisabled={disableAfterModel || opt.Renk?.length === 1}
                />
              </Field>

              <Field label="Çekiş">
                <SearchableSelect
                  value={form["Çekiş"]}
                  onChange={(v) => setForm((s) => ({ ...s, "Çekiş": v }))}
                  options={opt["Çekiş"]}
                  placeholder="Çekiş seç / ara..."
                  isDisabled={disableAfterModel || opt["Çekiş"]?.length === 1}
                />
              </Field>

              <Field label="Motor Hacmi" hint="cc">
                <SearchableSelect
                  value={form.Motor_Hacmi_CC ? String(form.Motor_Hacmi_CC) : ""}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, Motor_Hacmi_CC: Number(v) }))
                  }
                  options={opt.Motor_Hacmi_CC}
                  placeholder="Motor hacmi seç / ara..."
                  isDisabled={
                    disableAfterModel || opt.Motor_Hacmi_CC?.length === 1
                  }
                />
              </Field>

              <Field label="Motor Gücü" hint="hp">
                <SearchableSelect
                  value={form.Motor_Gucu_HP ? String(form.Motor_Gucu_HP) : ""}
                  onChange={(v) =>
                    setForm((s) => ({ ...s, Motor_Gucu_HP: Number(v) }))
                  }
                  options={opt.Motor_Gucu_HP}
                  placeholder="Motor gücü seç / ara..."
                  isDisabled={
                    disableAfterModel || opt.Motor_Gucu_HP?.length === 1
                  }
                />
              </Field>

              <Field label="Değişen Parça">
                <Input
                  type="number"
                  value={form.Degisen_Parca}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      Degisen_Parca: Number(e.target.value),
                    }))
                  }
                  disabled={!form.Marka}
                />
              </Field>

              <Field label="Boyalı Parça">
                <Input
                  type="number"
                  value={form.Boyali_Parca}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      Boyali_Parca: Number(e.target.value),
                    }))
                  }
                  disabled={!form.Marka}
                />
              </Field>

              <div className="mt-3 flex items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="ui-btn-primary predict-submit-btn"
                >
                  {loading ? "Tahmin ediliyor..." : "Fiyatı Tahmin Et"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <div className="ui-surface-soft predict-result-box mt-0 p-5">
              {result?.tahmini_fiyat != null ? (
                <>
                  <div className="ui-soft text-xl">Tahmini Fiyat</div>
                  <div className="ui-title mt-2 text-4xl font-semibold leading-tight">
                    {formatTRY(result.tahmini_fiyat)}{" "}
                    <span className="text-xl font-medium">TL</span>
                  </div>
                  <div className="ui-soft mt-3 text-sm">
                    Seçim: {form.Marka} / {form.Seri} / {form.Model}
                  </div>
                </>
              ) : (
                <div className="ui-muted text-lg leading-8">
                  Henüz tahmin yok. 
                  <h1>Marka → Seri → Model seçip devam et.</h1>
                </div>
                
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}