import { useCallback, useEffect, useState } from "react"

export type ToastState = {
  type: "success" | "error" | "warning"
  message: string
  title?: string
}

export function useToast(durationMs = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), durationMs)
    return () => clearTimeout(timer)
  }, [toast, durationMs])

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success", title?: string) =>
      setToast({ message, type, title }),
    []
  )
  const hideToast = useCallback(() => setToast(null), [])

  return { toast, showToast, hideToast }
}
