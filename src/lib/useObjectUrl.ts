import { useEffect, useMemo } from 'react'

/** Crea una object URL para previsualizar un File y la libera al cambiar/desmontar. */
export function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}
