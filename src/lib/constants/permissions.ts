import type { PermissionType } from "@/lib/types/permission"

export const PERMISSION_TYPE_LABELS: Record<PermissionType, string> = {
  r: "Lectura",
  w: "Escritura",
  d: "Eliminación",
  a: "Administración",
}

export const PERMISSION_TYPE_OPTIONS = (Object.keys(PERMISSION_TYPE_LABELS) as PermissionType[]).map((value) => ({
  value,
  label: `${PERMISSION_TYPE_LABELS[value]} (${value})`,
}))

// Opciones de estado "A"/"I" para los formularios de maestros
export const ACTIVE_STATUS_OPTIONS = [
  { value: "A", label: "Activo" },
  { value: "I", label: "Inactivo" },
]
