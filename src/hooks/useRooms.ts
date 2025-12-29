import { useState, useCallback } from "react"
// Asegúrate de que estas rutas coincidan con donde guardaste los archivos anteriores
import { roomService } from "@/lib/fetcher"
import type { Room, RoomPayload } from "@/lib/types/room"

// Definimos la interfaz del estado aquí mismo para no depender de un archivo externo extra,
// a menos que ya tengas un "RoomsState" en types/room.ts
interface RoomsState {
  items: Room[]
  loading: boolean
  error: string | null
}

export function useRooms() {
  const [state, setState] = useState<RoomsState>({
    items: [],
    loading: false,
    error: null,
  })

  // GET: Cargar habitaciones
  const loadRooms = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await roomService.list()
      setState({ items: data, loading: false, error: null })
    } catch (e: any) {
      console.error(e)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "No se pudieron cargar las habitaciones." 
      }))
    }
  }, [])

  // POST: Crear habitación
  const createRoom = useCallback(async (data: RoomPayload): Promise<Room> => {
    try {
      const created = await roomService.create(data)
      // Agregamos la nueva habitación al inicio de la lista localmente
      setState(prev => ({ ...prev, items: [created, ...prev.items] }))
      return created
    } catch (error) {
      // Opcional: manejar error específico de creación si es necesario
      throw error
    }
  }, [])

  // PUT: Actualizar habitación
  const updateRoom = useCallback(async (id: number, data: RoomPayload): Promise<Room> => {
    try {
      const updated = await roomService.update(id, data)
      // Actualizamos el item específico en la lista local
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === updated.id ? updated : item)
      }))
      return updated
    } catch (error) {
      throw error
    }
  }, [])

  // DELETE: Eliminar habitación
  const deleteRoom = useCallback(async (id: number) => {
    try {
      await roomService.delete(id)
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
    rooms: state.items,
    loading: state.loading,
    error: state.error,
    loadRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  }
}