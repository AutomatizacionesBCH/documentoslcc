import Image from 'next/image'
import SolicitudForm from '@/components/SolicitudForm'

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="La Caja Chica"
            width={160}
            height={38}
            priority
            className="mb-4 h-auto w-40"
          />
          <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">Solicitud de operación</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Completa tus datos y documentos para que nuestro equipo evalúe tu operación. Toda la información es
            tratada de forma confidencial.
          </p>
        </div>

        <div className="rounded-2xl border border-[#F1F5F9] bg-white p-6 shadow-sm sm:p-8">
          <SolicitudForm />
        </div>
      </div>
    </main>
  )
}
