import os
import json
from typing import Optional
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sklearn.neighbors import NearestNeighbors
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from db import Base, engine
from models import User, Prediction
from schemas import RegisterRequest, LoginRequest, TokenResponse
from auth import (
    get_db,
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
)

# Paths (../model klasöründen oku)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "best_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "..", "model", "label_encoders.pkl")
DATA_PATH = os.path.join(BASE_DIR, "..", "model", "araba_verisetim_guncel2026.csv")

FEATURE_ORDER = [
    'Marka', 'Seri', 'Model', 'Yıl', 'Kilometre', 'Vites Tipi', 'Yakıt Tipi',
    'Kasa Tipi', 'Renk', 'Çekiş', 'Motor_Hacmi_CC', 'Motor_Gucu_HP',
    'Degisen_Parca', 'Boyali_Parca'
]

# DB tablolarını oluşturma
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Araç Fiyat Tahmin API", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model + encoder + CSV yükleme
if not (os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH)):
    raise RuntimeError("Model dosyaları bulunamadı! ../model içinde best_model.pkl ve label_encoders.pkl olmalı.")

MODEL = joblib.load(MODEL_PATH)
ENCODERS = joblib.load(ENCODER_PATH)

try:
    DF = pd.read_csv(DATA_PATH)
except Exception as e:
    DF = None
    print(f"UYARI: CSV okunamadı: {e}")

# Request şema
class CarInput(BaseModel):
    Marka: str
    Seri: str
    Model: str
    Yıl: int = Field(ge=1950, le=2026)
    Kilometre: float = Field(ge=0)
    Vites_Tipi: str = Field(alias="Vites Tipi")
    Yakıt_Tipi: str = Field(alias="Yakıt Tipi")
    Kasa_Tipi: str = Field(alias="Kasa Tipi")
    Renk: str
    Çekiş: str
    Motor_Hacmi_CC: float = Field(ge=0)
    Motor_Gucu_HP: float = Field(ge=0)
    Degisen_Parca: int = Field(ge=0)
    Boyali_Parca: int = Field(ge=0)

    class Config:
        populate_by_name = True


def encode_df_like_cli(df: pd.DataFrame, encoders: dict, strict: bool) -> pd.DataFrame:
    for col, le in encoders.items():
        if col in df.columns:
            val = str(df[col].iloc[0]).strip()
            known_classes = list(le.classes_)

            if val in known_classes:
                df[col] = le.transform([val])
                continue
            if val.title() in known_classes:
                df[col] = le.transform([val.title()])
                continue
            if val.upper() in known_classes:
                df[col] = le.transform([val.upper()])
                continue

            giris_lower = val.lower()
            matched = None
            for known in known_classes:
                if str(known).lower() == giris_lower:
                    matched = known
                    break

            if matched is not None:
                df[col] = le.transform([matched])
            else:
                if strict:
                    raise ValueError(f"'{col}' için bilinmeyen değer: '{val}'. (Eğitimde yok)")
                df[col] = 0
    return df

# Auth endpoints
@app.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == req.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    u = User(email=req.email, password_hash=hash_password(req.password))
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"message": "Kayıt başarılı."}

@app.post("/auth/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == req.email).first()
    if not u or not verify_password(req.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı.")
    token = create_access_token({"sub": str(u.id)})
    return {"access_token": token, "token_type": "bearer"}

# Public endpoints
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/metadata")
def metadata():
    cats = {}
    for col, le in ENCODERS.items():
        cats[col] = [str(x) for x in le.classes_]
    return {"categorical_values": cats, "feature_order": FEATURE_ORDER}

@app.get("/options")
def options(marka: str | None = None, seri: str | None = None, model: str | None = None):
    if DF is None:
        raise HTTPException(status_code=500, detail="Veri seti yüklenemedi (CSV okunamadı).")

    BAD_TOKENS = {"", "-", "nan", "none", "null", "NaN", "NONE", "NULL"}

    def uniq_clean_str(df_local, col):
        if col not in df_local.columns:
            return []
        s = df_local[col].dropna().astype(str).str.strip()
        vals = [v for v in s.tolist() if v not in BAD_TOKENS]
        return sorted(set(vals))

    def uniq_clean_num(df_local, col):
        if col not in df_local.columns:
            return []
        s = pd.to_numeric(df_local[col], errors="coerce").dropna()
        s = s[s > 0]
        return sorted(s.unique().tolist())

    df = DF

    if not marka:
        return {"Marka": uniq_clean_str(df, "Marka")}

    df = df[df["Marka"] == marka]
    seriler = uniq_clean_str(df, "Seri")
    if not seri:
        return {"Marka": marka, "Seri": seriler}

    df = df[df["Seri"] == seri]
    modeller = uniq_clean_str(df, "Model")
    if not model:
        return {"Marka": marka, "Seri": seri, "Model": modeller}

    df = df[df["Model"] == model]
    return {
        "Marka": marka,
        "Seri": seri,
        "Model": model,
        "Vites Tipi": uniq_clean_str(df, "Vites Tipi"),
        "Yakıt Tipi": uniq_clean_str(df, "Yakıt Tipi"),
        "Kasa Tipi": uniq_clean_str(df, "Kasa Tipi"),
        "Renk": uniq_clean_str(df, "Renk"),
        "Çekiş": uniq_clean_str(df, "Çekiş"),
        "Motor_Hacmi_CC": uniq_clean_num(df, "Motor_Hacmi_CC"),
        "Motor_Gucu_HP": uniq_clean_num(df, "Motor_Gucu_HP"),
    }

# Predict
@app.post("/predict")
def predict(
    data: CarInput,
    strict: bool = False,
    user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    try:
        veri = {
            'Marka': data.Marka,
            'Seri': data.Seri,
            'Model': data.Model,
            'Yıl': data.Yıl,
            'Kilometre': data.Kilometre,
            'Vites Tipi': data.Vites_Tipi,
            'Yakıt Tipi': data.Yakıt_Tipi,
            'Kasa Tipi': data.Kasa_Tipi,
            'Renk': data.Renk,
            'Çekiş': data.Çekiş,
            'Motor_Hacmi_CC': data.Motor_Hacmi_CC,
            'Motor_Gucu_HP': data.Motor_Gucu_HP,
            'Degisen_Parca': data.Degisen_Parca,
            'Boyali_Parca': data.Boyali_Parca
        }

        df = pd.DataFrame([veri])
        df = encode_df_like_cli(df, ENCODERS, strict=strict)

        for col in FEATURE_ORDER:
            if col not in df.columns:
                df[col] = 0

        X = df[FEATURE_ORDER]
        pred = float(MODEL.predict(X)[0])
        pred = max(0.0, pred)
        pred_int = int(round(pred))

        # kullanıcı varsa kaydet
        if user is not None:
            p = Prediction(
                user_id=user.id,
                input_json=json.dumps(veri, ensure_ascii=False),
                predicted_price=pred_int
            )
            db.add(p)
            db.commit()

        return {"tahmini_fiyat": pred_int}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sunucu hatası: {e}")

# Protected endpoints
@app.get("/me/predictions")
def my_predictions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preds = (
        db.query(Prediction)
        .filter(Prediction.user_id == user.id)
        .order_by(Prediction.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": p.id,
            "predicted_price": p.predicted_price,
            "created_at": p.created_at,
            "input_json": p.input_json,
        }
        for p in preds
    ]

@app.delete("/me/predictions/{pred_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    pred_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    p = db.query(Prediction).filter(Prediction.id == pred_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı.")
    if p.user_id != user.id:
        raise HTTPException(status_code=403, detail="Bu kaydı silemezsin.")

    db.delete(p)
    db.commit()
    return

# Wizard Recommendations
class WizardRequest(BaseModel):
    budget_min: int = 0
    budget_max: int
    vites: str
    yakit: str
    kasa: str
    year_min: int
    year_max: int
    km_min: int = 0
    km_max: int
    limit: int = 10


def clean_text(val):
    if pd.isna(val):
        return None
    s = str(val).strip()
    bad = {"", "-", "nan", "none", "null", "NaN", "NONE", "NULL"}
    if s in bad:
        return None
    return s


def safe_int(val, default=0):
    try:
        if pd.isna(val):
            return default
        return int(float(val))
    except:
        return default


def safe_float(val, default=0.0):
    try:
        if pd.isna(val):
            return default
        return float(val)
    except:
        return default


def minmax_scale_df(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    out = df.copy()
    for col in cols:
        min_v = out[col].min()
        max_v = out[col].max()
        if pd.isna(min_v) or pd.isna(max_v) or max_v == min_v:
            out[col] = 0.0
        else:
            out[col] = (out[col] - min_v) / (max_v - min_v)
    return out


def build_knn_dataset(filtered_df: pd.DataFrame, req: WizardRequest):

    feat_df = filtered_df.copy()

    # KNN'de kullanacağımız kolonlar
    use_cols = [
        "Vites Tipi",
        "Yakıt Tipi",
        "Kasa Tipi",
        "Yil_num",
        "Km_num",
        "Fiyat_num",
    ]

    feat_df = feat_df[use_cols].copy()

    # Kullanıcı hedef profili
    # Yıl: üst sınıra yakın
    # KM: alt sınıra yakın
    # Fiyat: bütçe merkezine yakın
    user_row = {
        "Vites Tipi": req.vites if req.vites != "Fark etmez" else "Fark etmez",
        "Yakıt Tipi": req.yakit if req.yakit != "Fark etmez" else "Fark etmez",
        "Kasa Tipi": req.kasa if req.kasa != "Fark etmez" else "Fark etmez",
        "Yil_num": req.year_max,
        "Km_num": req.km_min,
        "Fiyat_num": (req.budget_min + req.budget_max) / 2.0,
    }

    # Eğer kullanıcı "Fark etmez" dediyse, o kolonda filtrelenmiş veride en sık görüleni kullan
    for cat_col in ["Vites Tipi", "Yakıt Tipi", "Kasa Tipi"]:
        if user_row[cat_col] == "Fark etmez":
            mode_vals = feat_df[cat_col].dropna().mode()
            user_row[cat_col] = mode_vals.iloc[0] if len(mode_vals) > 0 else "Fark etmez"

    combined = pd.concat([feat_df, pd.DataFrame([user_row])], ignore_index=True)

    # One-hot encode
    combined = pd.get_dummies(
        combined,
        columns=["Vites Tipi", "Yakıt Tipi", "Kasa Tipi"],
        dummy_na=False
    )

    # Numeric scale
    numeric_cols = ["Yil_num", "Km_num", "Fiyat_num"]
    combined = minmax_scale_df(combined, numeric_cols)

    X_candidates = combined.iloc[:-1].copy()
    X_user = combined.iloc[-1:].copy()

    return X_candidates, X_user


def predict_candidate_price(row) -> int:

    veri = {
        "Marka": clean_text(row.get("Marka")) or "",
        "Seri": clean_text(row.get("Seri")) or "",
        "Model": clean_text(row.get("Model")) or "",
        "Yıl": safe_int(row.get("Yil_num"), 0),
        "Kilometre": safe_float(row.get("Km_num"), 0.0),
        "Vites Tipi": clean_text(row.get("Vites Tipi")) or "",
        "Yakıt Tipi": clean_text(row.get("Yakıt Tipi")) or "",
        "Kasa Tipi": clean_text(row.get("Kasa Tipi")) or "",
        "Renk": clean_text(row.get("Renk")) or "",
        "Çekiş": clean_text(row.get("Çekiş")) or "",
        "Motor_Hacmi_CC": safe_float(row.get("Motor_Hacmi_CC"), 0.0),
        "Motor_Gucu_HP": safe_float(row.get("Motor_Gucu_HP"), 0.0),
        "Degisen_Parca": safe_int(row.get("Degisen_Parca"), 0),
        "Boyali_Parca": safe_int(row.get("Boyali_Parca"), 0),
    }

    df_one = pd.DataFrame([veri])
    df_one = encode_df_like_cli(df_one, ENCODERS, strict=False)

    for col in FEATURE_ORDER:
        if col not in df_one.columns:
            df_one[col] = 0

    X = df_one[FEATURE_ORDER]
    pred = float(MODEL.predict(X)[0])
    pred = max(0.0, pred)
    return int(round(pred))


@app.post("/recommendations/wizard")
def recommendations_wizard(req: WizardRequest, user: User = Depends(get_current_user)):
    if DF is None:
        raise HTTPException(status_code=500, detail="CSV yok (veri seti okunamadı).")

    df = DF.copy()

    bad = {"", "-", "nan", "none", "null", "NaN", "NONE", "NULL"}

    # Çöp değer temizliği
    for col in ["Marka", "Seri", "Model", "Vites Tipi", "Yakıt Tipi", "Kasa Tipi"]:
        if col in df.columns:
            df = df[~df[col].astype(str).str.strip().isin(bad)]

    # Sayısal parse
    df["Yil_num"] = pd.to_numeric(df["Yıl"], errors="coerce")

    if np.issubdtype(df["Kilometre"].dtype, np.number):
        df["Km_num"] = pd.to_numeric(df["Kilometre"], errors="coerce")
    else:
        km_clean = (
            df["Kilometre"].astype(str)
            .str.replace("km", "", case=False, regex=False)
            .str.replace(".", "", regex=False)
            .str.replace(" ", "", regex=False)
            .str.strip()
        )
        df["Km_num"] = pd.to_numeric(km_clean, errors="coerce")

    if "Fiyat" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail="CSV içinde 'Fiyat' kolonu yok."
        )

    if np.issubdtype(df["Fiyat"].dtype, np.number):
        df["Fiyat_num"] = pd.to_numeric(df["Fiyat"], errors="coerce")
    else:
        fiyat_clean = (
            df["Fiyat"].astype(str)
            .str.replace("TL", "", regex=False)
            .str.replace("₺", "", regex=False)
            .str.replace(".", "", regex=False)
            .str.replace(" ", "", regex=False)
            .str.strip()
        )
        df["Fiyat_num"] = pd.to_numeric(fiyat_clean, errors="coerce")

    df = df.dropna(subset=["Yil_num", "Km_num", "Fiyat_num"])

    # Hard filter
    df = df[(df["Yil_num"] >= req.year_min) & (df["Yil_num"] <= req.year_max)]
    df = df[(df["Km_num"] >= req.km_min) & (df["Km_num"] <= req.km_max)]
    df = df[(df["Fiyat_num"] >= req.budget_min) & (df["Fiyat_num"] <= req.budget_max)]

    if req.vites != "Fark etmez":
        df = df[df["Vites Tipi"] == req.vites]
    if req.yakit != "Fark etmez":
        df = df[df["Yakıt Tipi"] == req.yakit]
    if req.kasa != "Fark etmez":
        df = df[df["Kasa Tipi"] == req.kasa]

    total_found = len(df)

    if df.empty:
        return {
            "total_found": 0,
            "returned_count": 0,
            "recommendations": [],
            "note": "Filtrelerinize uygun araç bulunamadı."
        }

    # KNN veri seti
    X_candidates, X_user = build_knn_dataset(df, req)

    # Komşu sayısı
    limit = max(1, min(req.limit, 50))
    n_neighbors = min(limit, len(X_candidates))

    knn = NearestNeighbors(n_neighbors=n_neighbors, metric="cosine")
    knn.fit(X_candidates.values)

    distances, indices = knn.kneighbors(X_user.values)

    distances = distances[0]
    indices = indices[0]

    recs = []
    for dist, idx in zip(distances, indices):
        r = df.iloc[int(idx)]

        actual_price = int(round(safe_float(r.get("Fiyat_num"), 0.0)))
        predicted_price = predict_candidate_price(r)
        price_diff = predicted_price - actual_price
        
        opportunity_ratio = 0.0
        if predicted_price > 0:
            opportunity_ratio = price_diff / predicted_price

        opportunity = opportunity_ratio >= 0.05

        similarity_score = max(0.0, min(1.0, 1.0 - float(dist)))
        score_percent = int(round(similarity_score * 100))

        recs.append({
            "ilan_no": str(r.get("İlan No", "")) if "İlan No" in df.columns else "",
            "marka": str(r.get("Marka", "")),
            "seri": str(r.get("Seri", "")),
            "model": str(r.get("Model", "")),
            "yil": safe_int(r.get("Yil_num", 0), 0),
            "km": safe_int(r.get("Km_num", 0), 0),
            "vites": str(r.get("Vites Tipi", "")),
            "yakit": str(r.get("Yakıt Tipi", "")),
            "kasa": str(r.get("Kasa Tipi", "")),
            "renk": str(r.get("Renk", "")),
            "cekis": str(r.get("Çekiş", "")),
            "motor_hacmi_cc": safe_float(r.get("Motor_Hacmi_CC", 0), 0),
            "motor_gucu_hp": safe_float(r.get("Motor_Gucu_HP", 0), 0),
            "degisen_parca": safe_int(r.get("Degisen_Parca", 0), 0),
            "boyali_parca": safe_int(r.get("Boyali_Parca", 0), 0),

            "price": actual_price,
            "predicted_price": predicted_price,
            "price_diff": price_diff,
            "opportunity_ratio": round(opportunity_ratio, 4),

            "score": round(similarity_score, 6),
            "score_percent": score_percent,

            "is_opportunity": opportunity,
            "reason": "KNN algoritmasına göre kullanıcı profilinize en yakın araçlardan biri."
        })

    return {
        "total_found": total_found,
        "returned_count": len(recs),
        "recommendations": recs,
        "note": f"Filtrelerinize uyan {total_found} araç bulundu. KNN algoritmasına göre size en uygun {len(recs)} araç gösteriliyor. Gerçek fiyatı tahmin fiyatından düşük olanlar fırsat olarak işaretlendi.",
        "budget": {"min": req.budget_min, "max": req.budget_max},
        "filters": {
            "vites": req.vites,
            "yakit": req.yakit,
            "kasa": req.kasa,
            "year_min": req.year_min,
            "year_max": req.year_max,
            "km_min": req.km_min,
            "km_max": req.km_max
        }
    }