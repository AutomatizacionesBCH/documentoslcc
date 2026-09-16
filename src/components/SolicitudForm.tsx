'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import FileField from './FileField'
import TarjetaCard, { newCard, resolveCardBank, type CardFormData } from './TarjetaCard'
import PreviewSolicitud from './PreviewSolicitud'
import { Field, inputClass } from './FormField'
import { EjemploCedula } from './EjemplosDocumentos'
import { BANCOS_TRANSFERENCIA } from '@/lib/bancos'
import { submitSolicitud } from '@/lib/actions'

function formatRutInput(value: string): string {
  const clean = value.replace(/[^\dkK]/g, '').toUpperCase()
  if (!clean) return ''
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!body) return dv
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formattedBody}-${dv}`
}

export default function SolicitudForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [error, setError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [comuna, setComuna] = useState('')

  const [transferBankOption, setTransferBankOption] = useState('')
  const [transferOtroBanco, setTransferOtroBanco] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  const [cards, setCards] = useState<CardFormData[]>([newCard()])

  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [balanceNational, setBalanceNational] = useState<File | null>(null)
  const [balanceIntl, setBalanceIntl] = useState<File | null>(null)

  function updateCard(id: string, patch: Partial<CardFormData>) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function addCard() {
    setCards((prev) => [...prev, newCard()])
  }
  function removeCard(id: string) {
    setCards((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev))
  }

  const transferBankFinal = transferBankOption === 'Otro' ? transferOtroBanco.trim() : transferBankOption

  function validate(): string | null {
    if (!fullName.trim()) return 'Falta el nombre completo'
    if (!rut.trim()) return 'Falta el RUT'
    if (!email.trim()) return 'Falta el email'
    if (!amount || Number(amount) <= 0) return 'El monto en USD no es válido'
    if (!address.trim()) return 'Falta la dirección'
    if (!comuna.trim()) return 'Falta la comuna'
    if (!transferBankFinal) return 'Selecciona o escribe el banco para la transferencia'
    if (!accountNumber.trim()) return 'Falta el número de cuenta corriente'

    for (const [i, card] of cards.entries()) {
      if (!resolveCardBank(card)) return `Selecciona el banco o emisor de la tarjeta ${i + 1}`
      if (!card.cardBrand) return `Selecciona el tipo de la tarjeta ${i + 1}`
      if (card.cardLast4.length !== 4) return `Ingresa los últimos 4 dígitos de la tarjeta ${i + 1}`
      if (!card.photo) return `Falta la foto de la tarjeta ${i + 1}`
    }

    if (!idDocument) return 'Falta subir la cédula de identidad'
    if (!balanceNational) return 'Falta subir el saldo nacional'
    if (!balanceIntl) return 'Falta subir el saldo internacional'
    return null
  }

  function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setStep('preview')
  }

  function handleConfirm() {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setStep('form')
      return
    }

    const formData = new FormData()
    formData.set('full_name', fullName.trim())
    formData.set('document_id', rut)
    formData.set('email', email.trim())
    formData.set('amount_usd', amount)
    formData.set('address', address.trim())
    formData.set('comuna', comuna.trim())
    formData.set('transfer_bank_name', transferBankFinal)
    formData.set('transfer_account_number', accountNumber.trim())
    formData.set('id_document', idDocument as File)
    formData.set('balance_national', balanceNational as File)
    formData.set('balance_intl', balanceIntl as File)
    for (const card of cards) {
      formData.append('card_bank[]', resolveCardBank(card))
      formData.append('card_brand[]', card.cardBrand)
      formData.append('card_last4[]', card.cardLast4)
      formData.append('card_photo[]', card.photo as File)
    }

    startTransition(async () => {
      const result = await submitSolicitud(formData)
      if (!result.success) {
        setError(result.error)
        setStep('form')
        return
      }
      router.push('/gracias')
    })
  }

  if (step === 'preview') {
    return (
      <PreviewSolicitud
        data={{
          fullName,
          rut,
          email,
          amount,
          address,
          comuna,
          transferBankFinal,
          accountNumber,
          cards,
          idDocument,
          balanceNational,
          balanceIntl,
        }}
        error={error}
        isPending={isPending}
        onEdit={() => setStep('form')}
        onConfirm={handleConfirm}
      />
    )
  }

  return (
    <form onSubmit={handleContinue} className="space-y-10">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Sección 1 — Datos personales */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-[#043D35]">1. Datos personales</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre completo">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputClass}
              placeholder="Como aparece en tu cédula"
            />
          </Field>
          <Field label="RUT">
            <input
              value={rut}
              onChange={(e) => setRut(formatRutInput(e.target.value))}
              required
              className={inputClass}
              placeholder="12.345.678-9"
              maxLength={12}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              placeholder="tucorreo@ejemplo.com"
            />
          </Field>
          <Field label="Monto en USD a operar">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              required
              inputMode="decimal"
              className={inputClass}
              placeholder="1000"
            />
          </Field>
          <Field label="Dirección">
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className={inputClass}
              placeholder="Calle, número, depto"
            />
          </Field>
          <Field label="Comuna">
            <input
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              required
              className={inputClass}
              placeholder="Ej: Providencia"
            />
          </Field>
        </div>
      </section>

      {/* Sección 2 — Datos para la transferencia */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-[#043D35]">2. Datos para la transferencia</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Estos datos son necesarios para transferir el monto acordado a la cuenta bancaria del{' '}
          <strong>titular de la tarjeta (tú mismo)</strong>. Por ningún motivo la operación puede realizarse a la
          cuenta de un tercero.
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Banco de la cuenta">
            <select
              value={transferBankOption}
              onChange={(e) => setTransferBankOption(e.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Selecciona tu banco
              </option>
              {BANCOS_TRANSFERENCIA.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          {transferBankOption === 'Otro' && (
            <Field label="¿Cuál banco?">
              <input
                value={transferOtroBanco}
                onChange={(e) => setTransferOtroBanco(e.target.value)}
                required
                className={inputClass}
                placeholder="Nombre del banco"
              />
            </Field>
          )}
          <Field label="Número de cuenta corriente">
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              inputMode="numeric"
              className={inputClass}
              placeholder="000123456789"
            />
          </Field>
        </div>
      </section>

      {/* Sección 3 — Tarjeta(s) a operar */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#043D35]">3. Tarjeta(s) a operar</h2>
          <button
            type="button"
            onClick={addCard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#043D35] px-3 py-1.5 text-sm font-medium text-[#043D35] transition-colors hover:bg-[#ECFDF5]"
          >
            <PlusIcon /> Agregar otra tarjeta
          </button>
        </div>
        <div className="space-y-4">
          {cards.map((card, i) => (
            <TarjetaCard
              key={card.id}
              index={i}
              card={card}
              onChange={updateCard}
              onRemove={removeCard}
              removable={cards.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Sección 4 — Documentos */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-[#043D35]">4. Documentos</h2>

        <FileField
          label="Cédula de identidad"
          helpText="Foto de tu cédula por delante. Cubre el N° de documento (serie) —con un papel, editando la foto o algún objeto que tengas a mano— dejando visibles tu RUN, nombre y fecha de nacimiento."
          example={<EjemploCedula />}
          file={idDocument}
          onChange={setIdDocument}
        />
        <FileField
          label="Saldo nacional"
          helpText="Captura de pantalla o foto del saldo disponible en tu cuenta nacional."
          file={balanceNational}
          onChange={setBalanceNational}
        />
        <FileField
          label="Saldo internacional"
          helpText="Captura de pantalla o foto del saldo disponible en tu tarjeta o cuenta internacional."
          file={balanceIntl}
          onChange={setBalanceIntl}
        />
      </section>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#043D35] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#032B25] sm:w-auto"
      >
        Revisar solicitud
      </button>
    </form>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
