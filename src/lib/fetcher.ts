// Punto centralizado de acceso a funciones
export * from "./services/auth"
export * from "./services/userService"
export * from "./services/roomService"
export * from "./services/reservationService"

export type { UserRegistrationData } from "./types/user"
export type { LoginCredentials } from "./types/auth"
export type { ReservationData } from "./types/reservation"

export { handleResponse, withAuth } from "./client"
export { API_BASE_URL } from "./api"