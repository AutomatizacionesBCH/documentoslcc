'use client'

import { useObjectUrl } from '@/lib/useObjectUrl'
import { formatRutForDisplay } from '@/lib/rut'
import { resolveCardBank, type CardFormData } from './TarjetaCard'

export type PreviewData = {
  fullName: string
  rut: string
  email: string
  amount: string
  address: string
  comuna: string
  transferBankFinal: string
  accountNumber: string
  cards: CardFormData[]
  idDocument: File | null
  balanceNational: File | null
  balanceIntl: File | null
}

type Props = {
  data: PreviewData
  error: string | null
  isPending: boolean
  onEdit: () => void
  onConfirm: () => void
}

export default function PreviewSolicitud({ data, error, isPending, onEdit, onConfirm }: Props) {
  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-lg border border-[#ECFDF5] bg-[#ECFDF5] px-4 py-3 text-sm text-[#043D35]">
        Revisa que todos los datos y documentos estén correctos antes de enviar tu solicitud.
      </div>

      <PreviewSection title="Datos personales">
        <PreviewRow label="Nombre completo" value={data.fullName} />
        <PreviewRow label="RUT" value={formatRutForDisplay(data.rut)} />
        <PreviewRow label="Email" value={data.email} />
        <PreviewRow label="Monto a operar" value={data.amount ? `USD ${data.amount}` : ''} />
        <PreviewRow label="Dirección" value={[data.address, data.comuna].filter(Boolean).join(', ')} />
      </PreviewSection>

      <PreviewSection title="Datos para la transferencia">
        <PreviewRow label="Banco" value={data.transferBankFinal} />
        <PreviewRow label="N° de cuenta corriente" value={data.accountNumber} />
      </PreviewSection>

      <PreviewSection title={data.cards.length > 1 ? 'Tarjetas a operar' : 'Tarjeta a operar'}>
        <div className="space-y-4">
          {data.cards.map((card, i) => (
            <div key={card.id} className="rounded-lg border border-[#F1F5F9] p-3">
              {data.cards.length > 1 && (
                <p className="mb-1 text-sm font-semibold text-[#0F172A]">Tarjeta {i + 1}</p>
              )}
              <PreviewRow label="Banco / emisor" value={resolveCardBank(card)} />
              <PreviewRow label="Tipo" value={card.cardBrand} />
              <PreviewRow label="Últimos 4 dígitos" value={card.cardLast4} />
              <PreviewThumb file={card.photo} label="Foto de la tarjeta" />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Documentos">
        <PreviewThumb file={data.idDocument} label="Cédula de identidad" />
        <PreviewThumb file={data.balanceNational} label="Saldo nacional" />
        <PreviewThumb file={data.balanceIntl} label="Saldo internacional" />
      </PreviewSection>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onEdit}
          disabled={isPending}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-[#CBD5E1] px-6 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#043D35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#032B25] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Enviando...' : 'Confirmar y enviar'}
        </button>
      </div>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-[#043D35]">{title}</h2>
      <div className="space-y-1 rounded-xl border border-[#F1F5F9] bg-white p-4">{children}</div>
    </section>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-[#F1F5F9] py-1.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-[#0F172A]">{value || '-'}</span>
    </div>
  )
}

function PreviewThumb({ file, label }: { file: File | null; label: string }) {
  const url = useObjectUrl(file && file.type.startsWith('image/') ? file : null)
  if (!file) return null
  return (
    <div className="flex items-center gap-3 border-b border-[#F1F5F9] py-1.5 text-sm last:border-0">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-12 w-12 rounded-lg border border-[#CBD5E1] object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F1F5F9] text-xs text-slate-400">
          PDF
        </div>
      )}
      <div>
        <p className="text-slate-500">{label}</p>
        <p className="font-medium text-[#0F172A]">{file.name}</p>
      </div>
    </div>
  )
}
