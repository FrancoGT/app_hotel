import { API_BASE_URL } from "../api"
import { handleResponse, withAuth } from "../client"
import { LoginCredentials } from "../types/auth"
import { ApiResponse } from "../types/reservation"

export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse<{
  access_token: string
  token_type: string
  user: any
}>> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  return handleResponse(response)
}

export async function logoutUser(token: string): Promise<ApiResponse<void>> {
  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }, token),
  })

  return handleResponse(response)
}

export async function fetchCurrentUser(token: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: withAuth({}, token),
  })

  return handleResponse(response)
}