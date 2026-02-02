export interface RoomType {
  id: number
  name: string
  description: string
  basePrice: number
  capacity: number
  amenities: string[]
  status: string // "A" (Activo), "I" (Inactivo), etc.
  createdBy?: number
  updatedBy?: number
  createdAt?: string // ISO Date string
  updatedAt?: string // ISO Date string
}

// Payload para Crear y Actualizar (Create/Update)
export interface RoomTypePayload {
  name: string
  description: string
  basePrice: number
  capacity: number
  amenities: string[]
  status: string
  createdBy?: number // Opcional, dependiendo de si el backend lo toma del token o del body
}