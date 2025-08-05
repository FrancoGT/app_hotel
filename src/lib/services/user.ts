import { API_BASE_URL } from "../api"
import { handleResponse } from "../client"
import { UserRegistrationData } from "../types/user"
import { ApiResponse } from "../types/reservation"

export async function registerUser(userData: UserRegistrationData): Promise<ApiResponse<{ id: number }>> {
  const { password, ...rest } = userData
  const payload = { ...rest, pass: password }

  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}