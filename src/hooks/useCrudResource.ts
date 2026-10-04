import { useCallback, useState } from "react"

export interface CrudService<T, TCreate, TUpdate = TCreate> {
  list: () => Promise<T[]>
  create: (data: TCreate) => Promise<T>
  update: (id: number, data: TUpdate) => Promise<T>
  // Opcional: hay recursos que no se eliminan (p. ej. usuarios, que solo se desactivan)
  delete?: (id: number) => Promise<void>
}

interface Options<T> {
  loadErrorMessage: string
  // Cómo combinar el registro actualizado con el que ya estaba en la lista
  // (p. ej. conservar datos enriquecidos que el endpoint de update no devuelve)
  mergeUpdated?: (previous: T, updated: T) => T
}

// Estado de lista + operaciones CRUD que actualizan la lista localmente
export function useCrudResource<T extends { id: number }, TCreate, TUpdate = TCreate>(
  service: CrudService<T, TCreate, TUpdate>,
  { loadErrorMessage, mergeUpdated }: Options<T>
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await service.list())
    } catch (e) {
      console.error(e)
      setError(loadErrorMessage)
    } finally {
      setLoading(false)
    }
  }, [service, loadErrorMessage])

  const create = useCallback(
    async (data: TCreate) => {
      const created = await service.create(data)
      setItems((prev) => [created, ...prev])
      return created
    },
    [service]
  )

  const update = useCallback(
    async (id: number, data: TUpdate) => {
      const updated = await service.update(id, data)
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? mergeUpdated?.(item, updated) ?? updated : item))
      )
      return updated
    },
    [service, mergeUpdated]
  )

  const remove = useCallback(
    async (id: number) => {
      if (!service.delete) throw new Error("Este registro no se puede eliminar")
      await service.delete(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [service]
  )

  // Reemplaza un registro de la lista con la versión devuelta por el backend
  const replace = useCallback((updated: T) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }, [])

  return { items, loading, error, load, create, update, remove, replace }
}
