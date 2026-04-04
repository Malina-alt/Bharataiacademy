export interface CreateOrderRequest {
  amount_paise: number
  currency: string
  course_code: string
  customer_name?: string
  customer_email?: string
  customer_contact?: string
}

export interface CreateOrderResponse {
  order_id: string
  amount_paise: number
  currency: string
  key_id: string
  course_code: string
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface VerifyPaymentResponse {
  verified: boolean
  status: string
  message: string
}
