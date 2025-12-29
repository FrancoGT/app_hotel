// ===============================
// MODELO PRINCIPAL (Lo que recibes del Backend)
// ===============================
export type Establishment = {
  id: number
  name: string
  address?: string | null
  city?: string | null
  phone?: string | null
  status?: string | null // "A" | "I"

  // Campos extendidos
  description?: string | null
  country?: string | null
  zipCode?: string | null
  email?: string | null
  website?: string | null
  stars?: number | null
  checkInTime?: string | null
  checkOutTime?: string | null
  
  latitude?: number | null
  longitude?: number | null
  
  // Configuración IA (JSON)
  aiSettings?: {
    auto_pricing?: boolean
    welcome_message?: boolean
    [key: string]: any // Para flexibilidad futura
  } | null

  createdBy?: number | null
  updatedBy?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

// ===============================
// PAYLOAD (Lo que envías al Backend)
// ===============================
export type EstablishmentPayload = {
  name: string
  description?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  zipCode?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  stars?: number | null
  checkInTime?: string | null
  checkOutTime?: string | null
  
  latitude?: number | null
  longitude?: number | null

  // Objeto JSON
  aiSettings?: {
    auto_pricing?: boolean
    welcome_message?: boolean
    [key: string]: any
  } | null

  status?: string | null
}

// State para hooks (Opcional, si lo usas en otros lados)
export type EstablishmentsState = {
  items: Establishment[]
  loading: boolean
  error: string | null
}