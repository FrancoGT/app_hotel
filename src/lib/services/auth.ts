// src/lib/auth.ts
import { API_BASE_URL } from "../api"
import { withAuth } from "../client"
import { LoginCredentials } from "../types/auth"

export interface CurrentUser {
  displayName: string
  login: string
  // agrega otros campos si tu API los envía (id, roles, etc.)
}

export interface LoginSuccess {
  access_token: string
  token_type: string
  user: CurrentUser
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginSuccess> {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return (await res.json()) as LoginSuccess
}

export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: withAuth({ Accept: "application/json" }, token),
    cache: "no-store",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return (await res.json()) as CurrentUser
}

export async function logoutUser(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json", Accept: "application/json" }, token),
    cache: "no-store",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
}