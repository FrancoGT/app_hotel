import { API_BASE_URL } from "../api"
import { handleResponse } from "../client"
import { ApiResponse } from "../types/reservation"

export async function fetchRooms(): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/rooms/`)
  return handleResponse(response)
}