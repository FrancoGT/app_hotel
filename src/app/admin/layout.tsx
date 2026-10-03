import type { ReactNode } from "react"
import { RequireAuth } from "@/components/auth/RequireAuth"

// Todas las rutas /admin/* comparten la verificación de rol administrador
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth requireAdmin>
      <div className="min-h-screen bg-[var(--body-color)]">{children}</div>
    </RequireAuth>
  )
}
