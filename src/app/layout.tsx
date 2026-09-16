import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Solicitud de Operación | La Caja Chica',
  description: 'Completa tus datos y documentos para operar con La Caja Chica.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
