import { useMemo, useState } from "react";
import { api } from "../api";

const Card = ({ children }) => (
  <div className="ui-card recommend-card p-7 md:p-8">{children}</div>
);

const ChoiceBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="recommend-choice-btn w-full rounded-2xl border px-5 py-4 text-base font-semibold transition hover:translate-y-[-1px]"
  >
    {children}
  </button>
);

const formatTRY = (n) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const OpportunityBadge = ({ ratio = 0 }) => (
  <div
    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[15px] font-semibold shadow-sm whitespace-nowrap"
    style={{
      borderColor: "rgba(var(--warning) / 0.45)",
      background:
        "linear-gradient(135deg, rgba(var(--warning) / 0.18), rgba(var(--danger) / 0.10))",
      color: "rgb(var(--text))",
      boxShadow: "0 6px 18px rgba(245, 158, 11, 0.12)",
    }}
  >
    <span>🔥</span>
    <span>Fırsat %{Math.round((ratio || 0) * 100)}</span>
  </div>
);

const FieldRow = ({ label, value }) => (
  <div
    className="detail-row flex items-start justify-between gap-4 border-b py-2.5"
    style={{ borderColor: "rgb(var(--border))" }}
  >
    <div className="ui-soft text-sm font-medium">{label}</div>
    <div className="ui-title max-w-[60%] break-words text-right text-base">
      {value ?? "-"}
    </div>
  </div>
);

const MinMaxField = ({
  label,
  min,
  max,
  onMin,
  onMax,
  minPh = "Min",
  maxPh = "Max",
}) => {
  return (
    <div>
      <div className="ui-soft text-sm font-medium">{label}</div>

      <div
        className="mt-1.5 flex items-center gap-3 rounded-2xl border p-2.5"
        style={{
          borderColor: "rgb(var(--border))",
          background: "rgba(var(--card) / 0.55)",
        }}
      >
        <input
          type="number"
          value={min}
          onChange={(e) => onMin(e.target.value)}
          placeholder={minPh}
          className="ui-input recommend-range-input"
        />
        <input
          type="number"
          value={max}
          onChange={(e) => onMax(e.target.value)}
          placeholder={maxPh}
          className="ui-input recommend-range-input"
        />
      </div>
    </div>
  );
};

export default function RecommendWizardPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);

  const DEFAULT_ANSWERS = {
    budget_min: "",
    budget_max: "",
    km_min: "",
    km_max: "",
    vites: "Fark etmez",
    yakit: "Fark etmez",
    kasa: "Fark etmez",
    year_min: "",
    year_max: "",
  };

  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);

  const steps = useMemo(
    () => [
      {
        key: "vites",
        title: "Hangi vites türünü tercih edersin?",
        options: ["Düz", "Otomatik", "Yarı Otomatik", "Fark etmez"],
      },
      {
        key: "yakit",
        title: "Yakıt tercihin nedir?",
        options: ["Benzin", "Dizel", "Elektrik", "Hibrit", "Fark etmez"],
      },
      {
        key: "kasa",
        title: "Hangi kasa tipini istersin?",
        options: ["Sedan", "Hatchback/5", "SUV", "Fark etmez"],
      },
    ],
    []
  );

  const reset = () => {
    setStep(0);
    setErr("");
    setResult(null);
    setSelected(null);
    setAnswers(DEFAULT_ANSWERS);
  };

  const resetWizardOnly = () => {
    setStep(0);
    setErr("");
    setResult(null);
    setSelected(null);

    setAnswers((prev) => ({
      ...prev,
      vites: "Fark etmez",
      yakit: "Fark etmez",
      kasa: "Fark etmez",
    }));
  };

  const validateRanges = (a) => {
    const required = [
      ["budget_min", "Bütçe (min)"],
      ["budget_max", "Bütçe (max)"],
      ["year_min", "Yıl (min)"],
      ["year_max", "Yıl (max)"],
      ["km_min", "KM (min)"],
      ["km_max", "KM (max)"],
    ];

    const emptyFields = [];
    const invalidFields = [];

    for (const [key, name] of required) {
      const raw = String(a[key] ?? "").trim();

      if (raw === "") {
        emptyFields.push(name);
        continue;
      }

      if (Number.isNaN(Number(raw))) {
        invalidFields.push(name);
      }
    }

    const messages = [];

    if (emptyFields.length) {
      messages.push(`${emptyFields.join(", ")} boş bırakılamaz.`);
    }

    if (invalidFields.length) {
      messages.push(`${invalidFields.join(", ")} sayısal olmalı.`);
    }

    if (messages.length) {
      return messages.join(" ");
    }

    if (Number(a.budget_min) > Number(a.budget_max))
      return "Bütçe (min) bütçe (max) değerinden büyük olamaz.";
    if (Number(a.year_min) > Number(a.year_max))
      return "Yıl (min) yıl (max) değerinden büyük olamaz.";
    if (Number(a.km_min) > Number(a.km_max))
      return "KM (min) KM (max) değerinden büyük olamaz.";

    return "";
  };

  const onPick = async (value) => {
    setErr("");
    setResult(null);

    const s = steps[step];
    const nextAnswers = { ...answers, [s.key]: value };
    setAnswers(nextAnswers);

    if (step < steps.length - 1) {
      setStep((x) => x + 1);
      return;
    }

    const v = validateRanges(nextAnswers);
    if (v) {
      setErr(v);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...nextAnswers,
        budget_min: Number(nextAnswers.budget_min),
        budget_max: Number(nextAnswers.budget_max),
        year_min: Number(nextAnswers.year_min),
        year_max: Number(nextAnswers.year_max),
        km_min: Number(nextAnswers.km_min),
        km_max: Number(nextAnswers.km_max),
        limit: 10,
      };

      const res = await api.post("/recommendations/wizard", payload);
      setResult(res.data);
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Öneriler alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommend-page mx-auto max-w-[1240px] px-4 py-8">
      {selected ? (
        <div className="fixed inset-0 z-50">
          <div
            className="ui-overlay absolute inset-0"
            onClick={() => setSelected(null)}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="detail-modal-card w-full max-w-[980px] ui-card shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-start justify-between gap-3 border-b p-6"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="ui-title text-xl font-semibold">
                      Araç Detayı • {selected.marka} {selected.seri} {selected.model}
                    </h2>

                    {selected.is_opportunity ? (
                      <OpportunityBadge ratio={selected.opportunity_ratio} />
                    ) : null}
                  </div>

                  <p className="ui-soft mt-1 text-sm">
                    Detayları aşağıdan inceleyebilirsiniz.
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="ui-btn-secondary"
                >
                  Kapat
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div className="detail-modal-panel-soft md:col-span-1 ui-surface-soft p-5">
                    <div className="ui-soft text-sm">Gerçek Fiyat</div>
                    <div className="ui-title mt-2 text-4xl font-semibold">
                      {formatTRY(selected.price)}{" "}
                      <span className="text-xl font-medium">TL</span>
                    </div>

                    <div className="ui-soft mt-3 text-sm">
                      Uygunluk skoru :{" "}
                      <span className="ui-title font-medium">
                        %{selected.score_percent ?? 0}
                      </span>
                    </div>

                    <div className="ui-soft mt-3 text-sm">
                      Tahmin Fiyatı :{" "}
                      <span className="ui-title font-medium">
                        {formatTRY(selected.predicted_price)} TL
                      </span>
                    </div>

                    <div className="ui-soft mt-3 text-sm">
                      Fark :{" "}
                      <span className="ui-title font-medium">
                        {selected.price_diff >= 0 ? "+" : ""}
                        {formatTRY(selected.price_diff)} TL
                      </span>
                    </div>

                    <div className="ui-soft mt-4 text-sm">
                      İlan No:{" "}
                      <span className="ui-title font-medium">
                        {selected.ilan_no || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="detail-modal-panel md:col-span-2 ui-surface p-5">
                    <div className="ui-title text-2xl font-semibold">
                      Araç Bilgileri
                    </div>

                    <div className="mt-4">
                      <FieldRow label="Marka" value={selected.marka} />
                      <FieldRow label="Seri" value={selected.seri} />
                      <FieldRow label="Model" value={selected.model} />
                      <FieldRow label="Yıl" value={selected.yil} />
                      <FieldRow
                        label="Kilometre"
                        value={Number(selected.km || 0).toLocaleString("tr-TR")}
                      />
                      <FieldRow label="Vites Tipi" value={selected.vites} />
                      <FieldRow label="Yakıt Tipi" value={selected.yakit} />
                      <FieldRow label="Kasa Tipi" value={selected.kasa} />
                      <FieldRow label="Renk" value={selected.renk} />
                      <FieldRow label="Çekiş" value={selected.cekis} />
                      <FieldRow
                        label="Motor Hacmi (cc)"
                        value={selected.motor_hacmi_cc}
                      />
                      <FieldRow
                        label="Motor Gücü (hp)"
                        value={selected.motor_gucu_hp}
                      />
                      <FieldRow
                        label="Değişen Parça"
                        value={selected.degisen_parca}
                      />
                      <FieldRow
                        label="Boyalı Parça"
                        value={selected.boyali_parca}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-7">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="ui-title text-[2rem] font-semibold">
                Araç Öneri Asistanı
              </h1>
              <p className="ui-muted mt-2 text-base">
                Seçimlerine göre en uygun araçları önereceğim.
              </p>
            </div>

            <button onClick={reset} className="ui-btn-secondary recommend-reset-btn">
              Sıfırla
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MinMaxField
              label="Bütçe"
              min={answers.budget_min}
              max={answers.budget_max}
              onMin={(v) => setAnswers((a) => ({ ...a, budget_min: v }))}
              onMax={(v) => setAnswers((a) => ({ ...a, budget_max: v }))}
            />
            <MinMaxField
              label="Yıl"
              min={answers.year_min}
              max={answers.year_max}
              onMin={(v) => setAnswers((a) => ({ ...a, year_min: v }))}
              onMax={(v) => setAnswers((a) => ({ ...a, year_max: v }))}
            />
            <MinMaxField
              label="KM"
              min={answers.km_min}
              max={answers.km_max}
              onMin={(v) => setAnswers((a) => ({ ...a, km_min: v }))}
              onMax={(v) => setAnswers((a) => ({ ...a, km_max: v }))}
            />
          </div>

          <div className="ui-soft mt-4 text-sm">
            Bütçe aralığı: <b>{formatTRY(answers.budget_min) || "Min"}</b> –{" "}
            <b>{formatTRY(answers.budget_max) || "Max"}</b> TL • KM aralığı:{" "}
            <b>{formatTRY(answers.km_min) || "Min"}</b> –{" "}
            <b>{formatTRY(answers.km_max) || "Max"}</b>
          </div>
        </Card>

        <Card>
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="ui-title text-2xl font-semibold">Öneriler</h2>
                <button
                  onClick={resetWizardOnly}
                  className="ui-btn-secondary recommend-restart-btn"
                >
                  Yeniden Başla
                </button>
              </div>

              {result.note ? (
                <div className="mt-5 ui-alert-warn">{result.note}</div>
              ) : null}

              <div className="mt-5 grid gap-4">
                {result.recommendations?.length ? (
                  result.recommendations.map((r, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelected(r)}
                      className="ui-surface recommend-result-card p-5 text-left transition hover:translate-y-[-1px]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="ui-title text-lg font-semibold">
                              {r.marka} {r.seri} {r.model}
                            </div>

                            {r.is_opportunity ? (
                              <OpportunityBadge ratio={r.opportunity_ratio} />
                            ) : null}
                          </div>

                          <div className="ui-muted mt-2 text-sm">
                            {r.yil} • {Number(r.km || 0).toLocaleString("tr-TR")} km •{" "}
                            {r.vites} • {r.yakit} • {r.kasa}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="ui-pill">%{r.score_percent ?? 0} uygunluk</div>
                          <div className="ui-price-badge">{formatTRY(r.price)} TL</div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="ui-surface-soft p-4">
                          <div className="ui-soft text-xs">Gerçek Fiyat</div>
                          <div className="ui-title text-base font-semibold">
                            {formatTRY(r.price)} TL
                          </div>
                        </div>

                        <div className="ui-surface-soft p-4">
                          <div className="ui-soft text-xs">Tahmin Fiyatı</div>
                          <div className="ui-title text-base font-semibold">
                            {formatTRY(r.predicted_price)} TL
                          </div>
                        </div>

                        <div className="ui-surface-soft p-4">
                          <div className="ui-soft text-xs">Fark</div>
                          <div className="ui-title text-base font-semibold">
                            {r.price_diff >= 0 ? "+" : ""}
                            {formatTRY(r.price_diff)} TL
                          </div>
                        </div>
                      </div>

                      <div className="ui-soft mt-4 text-sm">Detay için tıkla →</div>
                    </button>
                  ))
                ) : (
                  <div className="ui-muted text-base"></div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="ui-soft text-sm">
                Adım {step + 1} / {steps.length}
              </div>
              <h2 className="ui-title mt-3 text-[2rem] font-semibold leading-tight">
                {steps[step].title}
              </h2>

              {err ? <div className="mt-5 ui-alert-danger">{err}</div> : null}

              <div className="mt-7 grid gap-4">
                {steps[step].options.map((opt) => (
                  <ChoiceBtn key={opt} onClick={() => onPick(opt)}>
                    {opt}
                  </ChoiceBtn>
                ))}
              </div>

              {loading ? (
                <div className="ui-muted mt-5 text-base">
                  Öneriler hazırlanıyor...
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}