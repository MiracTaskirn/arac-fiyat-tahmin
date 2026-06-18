import { api } from "../api/client";
import { LoginRequest, LoginResponse, RegisterRequest } from "../../types/auth";

export async function loginRequest(payload: LoginRequest) {
  const response = await api.post<LoginResponse>("/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  return response.data;
}

export async function registerRequest(payload: RegisterRequest) {
  const response = await api.post("/auth/register", {
    email: payload.email,
    password: payload.password,
  });

  return response.data;
}