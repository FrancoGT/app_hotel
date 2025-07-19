import { API_BASE_URL } from "./api"

// OBTENER HABITACIONES
export async function fetchRooms() {
  const res = await fetch(`${API_BASE_URL}/rooms/`)
  if (!res.ok) {
    throw new Error("Error al obtener habitaciones")
  }
  return res.json()
}

// REGISTRO DE USUARIO
export async function registerUser(userData: {
  displayName: string
  login: string
  password: string // ← CORREGIDO aquí
  telephone: string
  username: string
}) {
  const res = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error al registrar usuario: ${error}`)
  }

  return res.json()
}

// LOGIN
export async function loginUser(credentials: {
  login: string
  password: string
}) {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Error al iniciar sesión: ${errorText}`)
  }

  return res.json() // { access_token, token_type, user }
}

// LOGOUT
export async function logoutUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // ← agregado para consistencia
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error al cerrar sesión: ${error}`)
  }

  return res.json()
}

// USUARIO AUTENTICADO
export async function fetchCurrentUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("No se pudo obtener el usuario actual")
  }

  return res.json()
}

// Obtener todas las reservas (público)
export async function fetchAllReservations() {
  const res = await fetch(`${API_BASE_URL}/reservations/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("No se pudo obtener la lista de todas las reservas")
  }

  return res.json()
}

// Crear reserva
export async function createReservation(
  token: string,
  reservationData: {
    roomId: number
    checkInDate: string
    checkOutDate: string
    adults: number
    children?: number
    totalAmount: number
    specialRequests?: string
    aiNotes?: string
  }
) {
  const res = await fetch(`${API_BASE_URL}/reservations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reservationData),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Error al crear la reserva: ${errorText}`)
  }

  return res.json()
}

// Obtener reserva por ID
export async function fetchReservationById(id: number, token: string) {
  const res = await fetch(`${API_BASE_URL}/reservations/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error(`No se pudo obtener la reserva con ID ${id}`)
  }

  return res.json()
}

// Obtener mis reservas
export async function fetchMyReservations(token: string) {
  const res = await fetch(`${API_BASE_URL}/reservations/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("No se pudo obtener tus reservas")
  }

  return res.json()
}