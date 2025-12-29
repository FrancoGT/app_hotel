export interface Room {
  id: number
  roomNumber: string
  floor: number
  status: string // "available", "maintenance", etc.
  maxOccupancy: number
  pricePerNight: number
  description: string
  features: string[]
  establishmentId: number
  roomTypeId: number
  createdBy?: number // Opcional, ya que a veces el backend lo llena solo
}

// Creamos un tipo específico para el "Create" y "Update" (sin ID)
export interface RoomPayload {
  roomNumber: string
  floor: number
  maxOccupancy: number
  pricePerNight: number
  description: string
  features: string[]
  status: string
  establishmentId: number
  roomTypeId: number
  createdBy: number
}