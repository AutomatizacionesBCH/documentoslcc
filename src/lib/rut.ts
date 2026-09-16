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

/** Valida que el RUT tenga formato básico válido (cuerpo numérico + dígito verificador) */
export function validateRut(rut: string): boolean {
  const clean = rut.replace(/\./g, '').trim()
  return /^\d{6,8}-[\dkK]$/.test(clean)
}
