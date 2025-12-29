import { useState, useCallback } from "react"
import { reservationService } from "@/lib/services/reservationService"
// 1. Importamos ReservationAdmin para manejar la respuesta enriquecida
import type { 
  Reservation, 
  ReservationAdmin, 
  ReservationPayload, 
  ReservationUpdatePayload 
} from "@/lib/types/reservation"

// 2. Definimos un tipo Unión para manejar ambos casos en el estado
type ReservationItem = Reservation | ReservationAdmin

interface ReservationsState {
  items: ReservationItem[] 
  loading: boolean
  error: string | null
}

export function useReservations() {
  const [state, setState] = useState<ReservationsState>({
    items: [],
    loading: false,
    error: null,
  })

  // Helper interno para manejar errores
  const handleError = (e: any, defaultMsg: string) => {
    console.error(e)
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      error: e.message || defaultMsg 
    }))
  }

  // GET: Admin (Carga ReservationAdmin[] con datos de usuario)
  const loadAllReservations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await reservationService.listAll()
      setState({ items: data, loading: false, error: null })
    } catch (e) {
      handleError(e, "No se pudieron cargar las reservaciones.")
    }
  }, [])

  // GET: Cliente (Carga Reservation[] simple)
  const loadMyReservations = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await reservationService.listMy()
      setState({ items: data, loading: false, error: null })
    } catch (e) {
      handleError(e, "No se pudieron cargar tus reservaciones.")
    }
  }, [])

  // POST: Crear reserva
  // Nota: 'data' puede incluir 'userId' si es un Admin quien crea
  const createReservation = useCallback(async (data: ReservationPayload): Promise<Reservation> => {
    try {
      const created = await reservationService.create(data)
      setState(prev => ({ ...prev, items: [created, ...prev.items] }))
      return created
    } catch (error) {
      throw error
    }
  }, [])

  // PUT: Actualizar reserva
  const updateReservation = useCallback(async (id: number, data: ReservationUpdatePayload): Promise<Reservation> => {
    try {
      // El backend devuelve la reserva actualizada (Reservation) sin el objeto 'user'
      const updated = await reservationService.update(id, data) 
      
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => {
          if (item.id !== updated.id) return item
          
          // TRUCO CLAVE: Si el item en la lista tenía datos de usuario (era ReservationAdmin),
          // se los "pegamos" al objeto actualizado para no perder el nombre en la tabla.
          if ('user' in item) {
            return { ...updated, user: item.user } as ReservationAdmin
          }
          
          return updated
        })
      }))
      return updated
    } catch (error) {
      throw error
    }
  }, [])

  // DELETE: Eliminar reserva
  const deleteReservation = useCallback(async (id: number) => {
    try {
      await reservationService.delete(id)
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }))
    } catch (error) {
      throw error
    }
  }, [])

  return {
    reservations: state.items,
    loading: state.loading,
    error: state.error,
    loadAllReservations, // Usar en Dashboard Admin
    loadMyReservations,  // Usar en Perfil Cliente
    createReservation,
    updateReservation,   
    deleteReservation,   
  }
}