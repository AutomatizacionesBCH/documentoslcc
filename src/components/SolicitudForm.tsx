'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import FileField from './FileField'
import { EjemploCedula, EjemploTarjeta } from './EjemplosDocumentos'
import { BANCOS_CHILE } from '@/lib/bancos'
import { CARD_BRANDS } from '@/types'
import { submitSolicitud } from '@/lib/actions'

const inputClass =
  'w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#043D35] focus:ring-2 focus:ring-[#ECFDF5] placeholder:text-slate-400'

const REQUIRED_FILES = [
  { field: 'id_document', label: 'la cédula de identidad' },
  { field: 'card_photo', label: 'la foto de la tarjeta' },
  { field: 'balance_national', label: 'el saldo nacional' },
  { field: 'balance_intl', label: 'el saldo internacional' },
] as const

function formatRutInput(value: string): string {
  const clean = value.replace(/[^\dkK]/g, '').toUpperCase()
  if (!clean) return ''
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!body) return dv
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formattedBody}-${dv}`
}

function Field({
  label,
  required = true,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#0F172A]">
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {children}
    </label>
  )
}

export default function SolicitudForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [rut, setRut] = useState('')
  const [bankOption, setBankOption] = useState('')
  const [otroBanco, setOtroBanco] = useState('')
  const [cardLast4, setCardLast4] = useState('')
  const [amount, setAmount] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    const bankFinal = bankOption === 'Otro' ? otroBanco.trim() : bankOption
    if (!bankFinal) {
      setError('Selecciona o escribe el banco de tu tarjeta')
      return
    }
    formData.set('bank_name', bankFinal)

    if (cardLast4.length !== 4) {
      setError('Ingresa los últimos 4 dígitos de tu tarjeta')
      return
    }

    for (const { field, label } of REQUIRED_FILES) {
      const file = formData.get(field)
      if (!(file instanceof File) || file.size === 0) {
        setError(`Falta subir ${label}`)
        return
      }
    }

    startTransition(async () => {
      const result = await submitSolicitud(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.push('/gracias')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Sección 1 — Datos personales */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-[#043D35]">1. Datos personales</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input name="full_name" required className={inputClass} placeholder="Como aparece en tu cédula" />
          </Field>
          <Field label="RUT">
            <input
              name="document_id"
              required
              value={rut}
              onChange={(e) => setRut(formatRutInput(e.target.value))}
              className={inputClass}
              placeholder="12.345.678-9"
              maxLength={12}
            />
          </Field>
          <Field label="Email">
            <input type="email" name="email" required className={inputClass} placeholder="tucorreo@ejemplo.com" />
          </Field>
          <Field label="Monto en USD a operar">
            <input
              name="amount_usd"
              required
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              className={inputClass}
              placeholder="1000"
            />
          </Field>
          <Field label="Dirección">
            <input name="address" required className={inputClass} placeholder="Calle, número, depto" />
          </Field>
          <Field label="Comuna">
            <input name="comuna" required className={inputClass} placeholder="Ej: Providencia" />
          </Field>
        </div>
      </section>

      {/* Sección 2 — Datos bancarios */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-[#043D35]">2. Datos bancarios</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Banco de la tarjeta">
            <select value={bankOption} onChange={(e) => setBankOption(e.target.value)} required className={inputClass}>
              <option value="" disabled>
                Selecciona tu banco
              </option>
              {BANCOS_CHILE.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          {bankOption === 'Otro' && (
            <Field label="¿Cuál banco?">
              <input
                value={otroBanco}
                onChange={(e) => setOtroBanco(e.target.value)}
                required
                className={inputClass}
                placeholder="Nombre del banco"
              />
            </Field>
          )}
          <Field label="Número de cuenta corriente">
            <input name="account_number" required inputMode="numeric" className={inputClass} placeholder="000123456789" />
          </Field>
          <Field label="Tipo de tarjeta">
            <select name="card_brand" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Selecciona
              </option>
              {CARD_BRANDS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Últimos 4 dígitos de la tarjeta">
            <input
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              name="card_last4"
              required
              inputMode="numeric"
              maxLength={4}
              className={inputClass}
              placeholder="1234"
            />
          </Field>
        </div>
      </section>

      {/* Sección 3 — Documentos */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[#043D35]">3. Documentos</h2>

        <FileField
          name="id_document"
          label="Cédula de identidad"
          helpText="Foto de tu cédula por delante. Tapa con tu dedo el N° de documento (serie), dejando visibles tu RUN, nombre y fecha de nacimiento."
          example={<EjemploCedula />}
        />
        <FileField
          name="card_photo"
          label="Foto delantera de la tarjeta"
          helpText="Foto de la tarjeta que vas a usar. Tapa los primeros dígitos, dejando visibles solo los últimos 4 y el nombre del titular."
          example={<EjemploTarjeta />}
        />
        <FileField
          name="balance_national"
          label="Saldo nacional"
          helpText="Captura de pantalla o foto del saldo disponible en tu cuenta nacional."
        />
        <FileField
          name="balance_intl"
          label="Saldo internacional"
          helpText="Captura de pantalla o foto del saldo disponible en tu tarjeta o cuenta internacional."
        />
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#043D35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#032B25] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
