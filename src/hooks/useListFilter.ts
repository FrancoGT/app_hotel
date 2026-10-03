import { useMemo, useState } from "react"

// Búsqueda en memoria + paginación. `getSearchText` devuelve los textos buscables de cada item.
export function useListFilter<T>(
  items: T[],
  getSearchText: (item: T) => (string | number | null | undefined)[],
  pageSize = 8
) {
  const [search, setSearchState] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) =>
      getSearchText(item).some((value) => value != null && String(value).toLowerCase().includes(q))
    )
  }, [items, search, getSearchText])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const setSearch = (value: string) => {
    setSearchState(value)
    setPage(1)
  }

  return { search, setSearch, page: currentPage, setPage, totalPages, filtered, paginated }
}
