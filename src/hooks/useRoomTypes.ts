import { useState, useCallback } from "react"
// Asegúrate de que estas rutas coincidan con donde guardaste los archivos anteriores
import { roomTypeService } from "@/lib/services/roomTypeService" 
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type" // O la ruta donde esté tu interfaz

// Definimos la interfaz del estado local
interface RoomTypesState {
  items: RoomType[]
  loading: boolean
  error: string | null
}

export function useRoomTypes() {
  const [state, setState] = useState<RoomTypesState>({
    items: [],
    loading: false,
    error: null,
  })

  // GET: Cargar tipos de habitación
  const loadRoomTypes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await roomTypeService.list()
      setState({ items: data, loading: false, error: null })
    } catch (e: any) {
      console.error(e)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "No se pudieron cargar los tipos de habitación." 
      }))
    }
  }, [])

  // POST: Crear tipo de habitación
  const createRoomType = useCallback(async (data: RoomTypePayload): Promise<RoomType> => {
    try {
      const created = await roomTypeService.create(data)
      // Agregamos el nuevo tipo al inicio de la lista localmente
      setState(prev => ({ ...prev, items: [created, ...prev.items] }))
      return created
    } catch (error) {
      // Puedes manejar errores específicos aquí si lo necesitas
      throw error
    }
  }, [])

  // PUT: Actualizar tipo de habitación
  // Nota: Usamos Partial<RoomTypePayload> por si no envías todos los campos al editar
  const updateRoomType = useCallback(async (id: number, data: Partial<RoomTypePayload>): Promise<RoomType> => {
    try {
      const updated = await roomTypeService.update(id, data)
      // Actualizamos el item específico en la lista local buscando por ID
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === updated.id ? updated : item)
      }))
      return updated
    } catch (error) {
      throw error
    }
  }, [])

  // DELETE: Eliminar tipo de habitación
  const deleteRoomType = useCallback(async (id: number) => {
    try {
      await roomTypeService.delete(id)
      // Filtramos el item eliminado de la lista local
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }))
    } catch (error) {
      throw error
    }
  }, [])

  return {
    roomTypes: state.items, // Renombrado para claridad
    loading: state.loading,
    error: state.error,
    loadRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  }
}