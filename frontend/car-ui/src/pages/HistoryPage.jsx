import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Trash2 } from "lucide-react";

const formatTRY = (n) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(n));

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

const FieldRow = ({ label, value }) => (
  <div
    className="detail-row flex items-start justify-between gap-4 border-b py-3"
    style={{ borderColor: "rgb(var(--border))" }}
  >
    <div className="ui-soft text-sm font-medium">{label}</div>
    <div className="ui-title max-w-[60%] break-words text-right text-base">
      {value ?? "-"}
    </div>
  </div>
);

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="ui-overlay absolute inset-0" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="detail-modal-card w-full max-w-[1020px] ui-card shadow-xl">
          <div
            className="flex items-start justify-between gap-3 border-b p-6"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <div>
              <h2 className="ui-title text-xl font-semibold">{title}</h2>
              <p className="ui-soft mt-1 text-sm">
                Detayları aşağıdan inceleyebilirsiniz.
              </p>
            </div>
            <button onClick={onClose} className="ui-btn-secondary">
              Kapat
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/me/predictions");
        setItems(res.data);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Geçmiş alınamadı.");
      }
    })();
  }, []);

  const selectedInput = useMemo(() => {
    if (!selected?.input_json) return null;
    return safeParseJSON(selected.input_json);
  }, [selected]);

  const openDetail = (item) => {
    setSelected(item);
    setOpen(true);
  };

  const closeDetail = () => {
    setOpen(false);
    setSelected(null);
  };

  const onDelete = async (id) => {
    const ok = confirm("Bu tahmini geçmişten silmek istiyor musun?");
    if (!ok) return;

    try {
      await api.delete(`/me/predictions/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));

      if (selected?.id === id) closeDetail();
    } catch (e) {
      alert(e?.response?.data?.detail || "Silme başarısız.");
    }
  };

  return (
    <div className="history-page mx-auto max-w-[1240px] px-4 py-8">
      <h1 className="ui-title text-[2rem] font-semibold">Geçmiş Tahminlerim</h1>

      {err ? <div className="mt-5 ui-alert-danger">{err}</div> : null}

      <div className="mt-5 grid gap-4">
        {items.map((x) => (
          <button
            key={x.id}
            onClick={() => openDetail(x)}
            className="relative ui-surface history-item-card p-5 text-left transition hover:translate-y-[-1px]"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(x.id);
              }}
              className="history-delete-btn absolute right-4 top-4 rounded-xl border p-3 transition"
              title="Sil"
            >
              <Trash2 size={20} />
            </button>

            <div className="ui-title text-xl font-semibold">
              {formatTRY(x.predicted_price)} TL
            </div>
            <div className="ui-soft mt-2 text-sm">
              {new Date(x.created_at).toLocaleDateString("tr-TR")}
            </div>
            <div className="ui-soft mt-3 text-sm">Detay için tıkla →</div>
          </button>
        ))}
      </div>

      <Modal
        open={open}
        onClose={closeDetail}
        title={selected ? "Tahmin Detayı •" : "Tahmin Detayı"}
      >
        {selected ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="detail-modal-panel-soft md:col-span-1 ui-surface-soft p-5">
              <div className="ui-soft text-sm">Tahmini Fiyat</div>
              <div className="ui-title mt-2 text-5xl font-semibold leading-tight">
                {formatTRY(selected.predicted_price)}{" "}
                <span className="text-2xl font-medium">TL</span>
              </div>
              <div className="ui-soft mt-4 text-sm">
                Tarih: {new Date(selected.created_at).toLocaleDateString("tr-TR")}
              </div>
            </div>

            <div className="detail-modal-panel md:col-span-2 ui-surface p-5">
              <div className="ui-title text-2xl font-semibold">Araç Bilgileri</div>

              {selectedInput ? (
                <div className="mt-4">
                  <FieldRow label="Marka" value={selectedInput["Marka"]} />
                  <FieldRow label="Seri" value={selectedInput["Seri"]} />
                  <FieldRow label="Model" value={selectedInput["Model"]} />
                  <FieldRow label="Yıl" value={selectedInput["Yıl"]} />
                  <FieldRow label="Kilometre" value={selectedInput["Kilometre"]} />
                  <FieldRow label="Vites Tipi" value={selectedInput["Vites Tipi"]} />
                  <FieldRow label="Yakıt Tipi" value={selectedInput["Yakıt Tipi"]} />
                  <FieldRow label="Kasa Tipi" value={selectedInput["Kasa Tipi"]} />
                  <FieldRow label="Renk" value={selectedInput["Renk"]} />
                  <FieldRow label="Çekiş" value={selectedInput["Çekiş"]} />
                  <FieldRow
                    label="Motor Hacmi (cc)"
                    value={selectedInput["Motor_Hacmi_CC"]}
                  />
                  <FieldRow
                    label="Motor Gücü (hp)"
                    value={selectedInput["Motor_Gucu_HP"]}
                  />
                  <FieldRow
                    label="Değişen Parça"
                    value={selectedInput["Degisen_Parca"]}
                  />
                  <FieldRow
                    label="Boyalı Parça"
                    value={selectedInput["Boyali_Parca"]}
                  />
                </div>
              ) : (
                <div className="ui-muted mt-3 text-base">
                  Bu kaydın detay verisi okunamadı (input_json).
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}