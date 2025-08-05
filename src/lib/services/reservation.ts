import { API_BASE_URL } from "../api"
import { handleResponse, withAuth } from "../client"
import { ReservationData, ApiResponse } from "../types/reservation"

export async function fetchAllReservations(): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/reservations/all`, {
    headers: { "Content-Type": "application/json" },
  })

  return handleResponse(response)
}

export async function createReservation(
  token: string,
  reservationData: ReservationData
): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/reservations/`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json" }, token),
    body: JSON.stringify(reservationData),
  })

  return handleResponse(response)
}

export async function fetchReservationById(
  id: number,
  token: string
): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    headers: withAuth({}, token),
  })

  return handleResponse(response)
}

export async function fetchMyReservations(token: string): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/reservations/my`, {
    headers: withAuth({}, token),
  })

  return handleResponse(response)
}