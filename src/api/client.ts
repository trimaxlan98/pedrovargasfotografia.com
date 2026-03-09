const API_URL = import.meta.env.VITE_API_URL || '/api'

// ─── DIAGNÓSTICO DE DESPLIEGUE ─────────────────────────────────────────────
console.log('%c[DIAGNÓSTICO] Build info', 'color: #gold; font-weight: bold; font-size: 14px')
console.log('[DIAGNÓSTICO] VITE_API_URL env:', import.meta.env.VITE_API_URL)
console.log('[DIAGNÓSTICO] API_URL resuelto:', API_URL)
console.log('[DIAGNÓSTICO] MODE:', import.meta.env.MODE)
console.log('[DIAGNÓSTICO] DEV:', import.meta.env.DEV)
console.log('[DIAGNÓSTICO] PROD:', import.meta.env.PROD)
console.log('[DIAGNÓSTICO] window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A')
// ──────────────────────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = API_URL.startsWith('http')
    ? API_URL
    : `${window.location.origin}${API_URL}`
  const url = new URL(`${base}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return url.toString()
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return false
  }

  try {
    const data = await res.json()
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    return true
  } catch {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return false
  }
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  const url = buildUrl(path, params)

  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  let response = await fetch(url, { ...fetchOptions, headers })

  // Token expirado — intentar renovar y reintentar
  if (response.status === 401) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      const newHeaders = { ...headers, ...getAuthHeader() }
      response = await fetch(url, { ...fetchOptions, headers: newHeaders })
    }
  }

  // Si es 204 No Content, no intentar parsear JSON
  if (response.status === 204) {
    return {} as T
  }

  let data: unknown
  try {
    data = await response.json()
  } catch {
    throw new Error(`Error ${response.status}: respuesta inesperada del servidor`)
  }

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Error ${response.status}`)
  }

  return data as T
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    apiRequest<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  postForm: <T>(path: string, body: FormData) =>
    apiRequest<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  putForm: <T>(path: string, body: FormData) =>
    apiRequest<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    apiRequest<T>(path, { method: 'DELETE' }),
}

export default api
