export type DocumentType = "DNI" | "CE"

export interface UserRegistrationData {
  first_name: string
  last_name: string
  id_document_type: DocumentType
  id_document_number: string
  login: string
  password: string
  telephone: string
  position?: string
  username: string
  displayName: string
}