interface ValidationError {
  type: string
  loc: string[]
  msg: string
  input: any
  ctx?: Record<string, any>
}

interface ServerErrorResponse {
  detail: ValidationError[] | string
}

export function parseServerError(error: any): {
  generalError?: string
  fieldErrors?: Record<string, string>
} {
  try {
    // Si el error ya es un objeto con detail, usarlo directamente
    if (error && typeof error === "object" && error.detail) {
      return parseErrorDetail(error)
    }
    // Si el error es un Error object, extraer el mensaje
    if (error instanceof Error) {
      const message = error.message
      // Intentar parsear el mensaje como JSON
      try {
        const jsonMatch = message.match(/\{.*\}/)
        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0])
          return parseErrorDetail(errorData)
        }
      } catch {
        // Si no se puede parsear como JSON, devolver el mensaje tal como está
      }
      return { generalError: message }
    }
    // Si es un string, intentar parsearlo como JSON
    if (typeof error === "string") {
      try {
        const errorData = JSON.parse(error)
        return parseErrorDetail(errorData)
      } catch {
        return { generalError: error }
      }
    }
    return { generalError: "Error desconocido" }
  } catch (parseError) {
    console.error("Error parsing server error:", parseError)
    return { generalError: error?.message || "Error desconocido" }
  }
}

function parseErrorDetail(errorData: ServerErrorResponse): {
  generalError?: string
  fieldErrors?: Record<string, string>
} {
  // Si detail es un string, es un error general
  if (typeof errorData.detail === "string") {
    let friendlyMessage = errorData.detail
    // Convertir mensajes específicos del servidor a mensajes amigables
    if (
      friendlyMessage.toLowerCase().includes("credenciales inválidas") ||
      friendlyMessage.toLowerCase().includes("invalid credentials")
    ) {
      friendlyMessage = "Correo electrónico o contraseña incorrectos"
    } else if (
      friendlyMessage.toLowerCase().includes("usuario no encontrado") ||
      friendlyMessage.toLowerCase().includes("user not found")
    ) {
      friendlyMessage = "No existe una cuenta con este correo electrónico"
    } else if (
      friendlyMessage.toLowerCase().includes("cuenta bloqueada") ||
      friendlyMessage.toLowerCase().includes("account blocked")
    ) {
      friendlyMessage = "Tu cuenta ha sido bloqueada. Contacta soporte"
    } else if (
      friendlyMessage.toLowerCase().includes("email no verificado") ||
      friendlyMessage.toLowerCase().includes("email not verified")
    ) {
      friendlyMessage = "Debes verificar tu correo electrónico antes de iniciar sesión"
    }
    return { generalError: friendlyMessage }
  }
  // Si detail es un array, son errores de validación
  if (Array.isArray(errorData.detail)) {
    const fieldErrors: Record<string, string> = {}
    errorData.detail.forEach((validationError: ValidationError) => {
      const fieldName = validationError.loc[validationError.loc.length - 1]
      const errorType = validationError.type
      const ctx = validationError.ctx
      let friendlyMessage: string
      switch (errorType) {
        case "string_too_short":
          const minLength = ctx?.min_length || 8
          if (fieldName === "password") {
            friendlyMessage = `La contraseña debe tener al menos ${minLength} caracteres`
          } else {
            friendlyMessage = `Este campo debe tener al menos ${minLength} caracteres`
          }
          break
        case "string_too_long":
          const maxLength = ctx?.max_length || 100
          friendlyMessage = `Este campo no puede tener más de ${maxLength} caracteres`
          break
        case "value_error":
          if (validationError.msg.includes("email")) {
            friendlyMessage = "Ingresa un correo electrónico válido"
          } else {
            friendlyMessage = "El valor ingresado no es válido"
          }
          break
        case "missing":
          friendlyMessage = "Este campo es requerido"
          break
        case "type_error":
          if (validationError.msg.includes("email")) {
            friendlyMessage = "Ingresa un correo electrónico válido"
          } else {
            friendlyMessage = "El formato del campo no es válido"
          }
          break
        default:
          // Mensajes específicos por campo
          if (fieldName === "login" || fieldName === "email") {
            if (validationError.msg.includes("email") || validationError.msg.includes("format")) {
              friendlyMessage = "Ingresa un correo electrónico válido"
            } else {
              friendlyMessage = "El correo electrónico no es válido"
            }
          } else if (fieldName === "password") {
            friendlyMessage = "La contraseña no cumple con los requisitos"
          } else {
            friendlyMessage = validationError.msg
          }
      }
      // Mapear nombres de campos del servidor a nombres del frontend
      const fieldMapping: Record<string, string> = {
        login: "login",
        email: "login",
        password: "password",
        first_name: "first_name",
        last_name: "last_name",
        username: "username",
        telephone: "telephone",
        id_document_number: "id_document_number",
        check_in_date: "checkInDate", // Añadido para mapear errores de fecha
        check_out_date: "checkOutDate", // Añadido para mapear errores de fecha
      }
      const frontendFieldName = fieldMapping[fieldName] || fieldName
      fieldErrors[frontendFieldName] = friendlyMessage
    })
    return { fieldErrors }
  }
  return { generalError: "Error desconocido del servidor" }
}