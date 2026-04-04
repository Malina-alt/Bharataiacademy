import type { CreateOrderResponse, VerifyPaymentResponse } from '@/types/payments'

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance
  }
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  image?: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: {
    color?: string
  }
  modal?: {
    ondismiss?: () => void
  }
  handler: (response: RazorpayPaymentResponse) => void
}

interface RazorpayInstance {
  open: () => void
}

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

export async function loadRazorpayScript(): Promise<boolean> {
  const existing = document.querySelector(`script[src="${RAZORPAY_CHECKOUT_SRC}"]`)

  if (existing) {
    return true
  }

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_CHECKOUT_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface OpenCheckoutParams {
  order: CreateOrderResponse
  customerName?: string
  customerEmail?: string
  customerContact?: string
  onSuccess: (payment: RazorpayPaymentResponse) => Promise<VerifyPaymentResponse>
  onDismiss?: () => void
}

export function openRazorpayCheckout({
  order,
  customerName,
  customerEmail,
  customerContact,
  onSuccess,
  onDismiss,
}: OpenCheckoutParams): void {
  const razorpay = new window.Razorpay({
    key: order.key_id,
    amount: order.amount_paise,
    currency: order.currency,
    name: 'Bharat AI Academy',
    description: '5-Day AI Mastery Program',
    order_id: order.order_id,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerContact,
    },
    notes: {
      course_code: order.course_code,
    },
    theme: {
      color: '#7C3AED',
    },
    modal: {
      ondismiss: onDismiss,
    },
    handler: (response: RazorpayPaymentResponse) => {
      void onSuccess(response)
    },
  })

  razorpay.open()
}
