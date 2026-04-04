const FALLBACK_SITE_URL = 'https://bharataiacademy.com'

export const SITE_URL =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : FALLBACK_SITE_URL
