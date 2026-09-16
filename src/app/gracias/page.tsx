import Image from 'next/image'
import Link from 'next/link'

export default function GraciasPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="max-w-md rounded-2xl border border-[#F1F5F9] bg-white p-8 text-center shadow-sm">
        <Image
          src="/logo.png"
          alt="La Caja Chica"
          width={140}
          height={33}
          className="mx-auto mb-6 h-auto w-32"
        />
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] text-[#043D35]">
          <CheckIcon />
        </div>
        <h1 className="text-xl font-bold text-[#0F172A]">¡Solicitud enviada!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Recibimos tus datos y documentos correctamente. Nuestro equipo se pondrá en contacto contigo a la brevedad.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#043D35] hover:underline">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}
