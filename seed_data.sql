SET search_path TO public;
INSERT INTO payment_transactions (
    course_code,
    amount_paise,
    currency,
    status,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    customer_name,
    customer_email,
    customer_contact
) VALUES
(
    'AI_MASTERY_5DAY',
    24900,
    'INR',
    'created',
    'order_Q7xA1B2c3D4e5F',
    NULL,
    NULL,
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '919876543210'
),
(
    'AI_MASTERY_5DAY',
    24900,
    'INR',
    'paid',
    'order_Q7xG6H7i8J9k0L',
    'pay_Q7xM1n2O3p4Q5R',
    'b3f4a8c9d2e6f1a7b5c3d9e0f2a4b6c8d1e3f5a7b9c2d4e6f8a1b3c5d7e9f0a',
    'Diya Mehta',
    'diya.mehta@example.com',
    '919812345678'
),
(
    'AI_MASTERY_5DAY',
    24900,
    'INR',
    'verification_failed',
    'order_Q7xS6t7U8v9W0X',
    'pay_Q7xY1z2A3b4C5D',
    'c1d2e3f4a5b6c7d8e9f00112233445566778899aabbccddeeff001122334455',
    'Kabir Verma',
    'kabir.verma@example.com',
    '919900112233'
);