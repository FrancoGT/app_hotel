export interface ReservationData {
  roomId: number
  checkInDate: string
  checkOutDate: string
  adults: number
  children?: number
  totalAmount: number
  specialRequests?: string
  aiNotes?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    details?: any
  }
}