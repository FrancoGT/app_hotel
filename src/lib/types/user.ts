// lib/types/user.ts

export type DocumentType = "DNI" | "CE"

// 1. Payload para REGISTRAR un nuevo usuario (POST /register)
export interface UserRegistrationData {
  first_name: string
  last_name: string
  id_document_type: DocumentType
  id_document_number: string
  login: string        // Email o nombre de usuario único
  password: string     // El backend lo espera como 'password' o 'pass' (alias)
  telephone: string
  position?: string    // Ej: "Cliente", "Recepcionista"
  username: string     // Identificador interno o secundario
  displayName: string  // Nombre para mostrar
}

// 2. El Usuario completo que recibes del Backend (GET /users/)
// Extiende los datos básicos y agrega los campos de sistema (ID, fechas, roles)
export interface User {
  id: number
  first_name: string
  last_name: string
  id_document_type: DocumentType
  id_document_number: string
  telephone: string
  position?: string
  username: string
  login: string
  displayName: string
  
  // Campos de sistema y roles
  status: string       // "A" (Activo), "I" (Inactivo)
  admin: boolean
  employee: boolean
  createdAt: string    // ISO Date string
  updatedAt: string    // ISO Date string
}

// 3. Versión simplificada para selectores (usada en userService)
// Útil cuando solo necesitas listar opciones en un dropdown
export interface UserOption {
  id: number
  first_name: string
  last_name: string
  login: string
  telephone?: string
}

// 4. Payload del admin para CREAR un usuario (POST /users/). La contraseña va en `pass`
export interface UserAdminPayload {
  first_name?: string | null
  last_name?: string | null
  id_document_type?: DocumentType | null
  id_document_number?: string | null
  telephone?: string | null
  position?: string | null
  username?: string | null
  login: string
  displayName: string
  pass: string
  admin: boolean
  employee: boolean
  status: "A" | "I"
}

// 5. Payload del admin para ACTUALIZAR (PUT /users/{id}); `pass` solo si se cambia.
// El estado se cambia aparte con PATCH /users/{id}/status
export type UserAdminUpdatePayload = Partial<Omit<UserAdminPayload, "status">>
