import type {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '@/types/payments'

const resolveApiBaseUrl = (): string => {
  const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim()

  if (rawApiBaseUrl) {
    return rawApiBaseUrl.replace(/\/+$/, '')
  }

  if (import.meta.env.PROD) {
    throw new Error('Missing VITE_API_URL in production. Configure a valid backend URL in Vercel environment variables.')
  }

  console.warn('VITE_API_URL is not set. Falling back to localhost backend URL for development.')
  return 'http://localhost:8000'
}

const API_BASE_URL = resolveApiBaseUrl()

class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let errorMessage = 'Something went wrong. Please try again.'
    const vercelErrorHeader = response.headers.get('x-vercel-error')?.toUpperCase()

    try {
      const responseText = await response.text()
      const isDeploymentNotFound =
        vercelErrorHeader === 'DEPLOYMENT_NOT_FOUND' || responseText.toUpperCase().includes('DEPLOYMENT_NOT_FOUND')

      if (isDeploymentNotFound) {
        console.error('[API] DEPLOYMENT_NOT_FOUND received from backend URL.', {
          endpoint,
          status: response.status,
          apiBaseUrl: API_BASE_URL,
          vercelErrorHeader,
        })

        errorMessage =
          'Service is temporarily unavailable because the backend deployment is no longer active. Please try again shortly.'
      } else if (responseText) {
        try {
          const errorData = JSON.parse(responseText) as { detail?: string }
          if (errorData?.detail) {
            errorMessage = errorData.detail
          }
        } catch {
          // Response was not JSON; keep the generic message.
        }
      }
    } catch {
      // Ignore parsing failures and keep generic message.
    }

    throw new ApiError(errorMessage, response.status)
  }

  return (await response.json()) as T
}

export const paymentsApi = {
  createOrder: (payload: CreateOrderRequest): Promise<CreateOrderResponse> =>
    apiFetch<CreateOrderResponse>('/payments/order', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyPayment: (payload: VerifyPaymentRequest): Promise<VerifyPaymentResponse> =>
    apiFetch<VerifyPaymentResponse>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export { ApiError }
