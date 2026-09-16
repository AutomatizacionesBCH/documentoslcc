/** Elimina puntos del RUT, mantiene guión: "17.590.573-1" → "17590573-1" */
export function formatRutForStorage(rut: string): string {
  return rut.replace(/\./g, '').trim()
}

/** Formatea RUT chileno con puntos y guión: "17590573-1" → "17.590.573-1" */
export function formatRutForDisplay(rut: string): string {
  const clean = rut.replace(/\./g, '').trim()
  const parts = clean.split('-')
  const body = parts[0] ?? ''
  const dv = parts[1] ?? ''
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return dv ? `${formatted}-${dv}` : formatted
}

/** Calcula el dígito verificador de un RUT chileno (algoritmo módulo 11 del SII) */
function computeCheckDigit(body: string): string {
  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }
  const remainder = 11 - (sum % 11)
  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'
  return String(remainder)
}

/**
 * Valida un RUT chileno: 7 u 8 números antes del guión, un solo dígito o "K"
 * después del guión, y que ese dígito verificador coincida con el algoritmo
 * módulo 11 del SII (detecta errores de tipeo, no solo el formato).
 */
export function validateRut(rut: string): boolean {
  const clean = rut.replace(/\./g, '').trim().toUpperCase()
  if (!/^\d{7,8}-[\dK]$/.test(clean)) return false

  const [body, dv] = clean.split('-')
  return computeCheckDigit(body) === dv
}
