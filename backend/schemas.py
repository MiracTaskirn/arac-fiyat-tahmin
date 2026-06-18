from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any, Dict


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PredictionOut(BaseModel):
    id: int
    predicted_price: int
    created_at: datetime
    input_json: str
