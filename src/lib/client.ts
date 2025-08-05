export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = "Error en la solicitud"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || JSON.stringify(errorData)
    } catch {
      errorMessage = await response.text()
    }
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return undefined as unknown as T
  }

  return response.json() as Promise<T>
}

export function withAuth(headers: HeadersInit, token?: string): HeadersInit {
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers
}