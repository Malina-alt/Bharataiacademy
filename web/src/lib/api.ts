import type {
  CreateOrderRequest,
  CreateOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '@/types/payments'

const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim()
const API_BASE_URL = (rawApiBaseUrl || 'http://localhost:8000').replace(/\/+$/, '')

if (!rawApiBaseUrl && import.meta.env.PROD) {
  console.warn('VITE_API_URL is not set. Falling back to localhost backend URL.')
}

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

    try {
      const responseText = await response.text()

      if (responseText.includes('DEPLOYMENT_NOT_FOUND')) {
        errorMessage =
          'Service is temporarily unavailable due to an outdated deployment link. Please try again in a moment.'
      } else if (responseText) {
        const errorData = JSON.parse(responseText) as { detail?: string }
        if (errorData?.detail) {
          errorMessage = errorData.detail
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
