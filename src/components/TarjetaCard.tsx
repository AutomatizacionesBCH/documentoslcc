'use client'

import FileField from './FileField'
import { EjemploTarjeta } from './EjemplosDocumentos'
import { Field, inputClass } from './FormField'
import { EMISORES_TARJETA } from '@/lib/bancos'
import { CARD_BRANDS } from '@/types'

export type CardFormData = {
  id: string
  bankOption: string
  otroBanco: string
  cardBrand: string
  cardLast4: string
  photo: File | null
}

export function newCard(): CardFormData {
  return {
    id: crypto.randomUUID(),
    bankOption: '',
    otroBanco: '',
    cardBrand: '',
    cardLast4: '',
    photo: null,
  }
}

export function resolveCardBank(card: CardFormData): string {
  return card.bankOption === 'Otro' ? card.otroBanco.trim() : card.bankOption
}

type Props = {
  index: number
  card: CardFormData
  onChange: (id: string, patch: Partial<CardFormData>) => void
  onRemove: (id: string) => void
  removable: boolean
}

export default function TarjetaCard({ index, card, onChange, onRemove, removable }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0F172A]">Tarjeta {index + 1}</h3>
        {removable && (
          <button
            type="button"
            onClick={() => onRemove(card.id)}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Quitar
          </button>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Banco o emisor de la tarjeta">
          <select
            value={card.bankOption}
            onChange={(e) => onChange(card.id, { bankOption: e.target.value })}
            required
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {EMISORES_TARJETA.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        {card.bankOption === 'Otro' && (
          <Field label="¿Cuál banco o billetera?">
            <input
              value={card.otroBanco}
              onChange={(e) => onChange(card.id, { otroBanco: e.target.value })}
              required
              className={inputClass}
              placeholder="Nombre del banco o billetera"
            />
          </Field>
        )}
        <Field label="Tipo de tarjeta">
          <select
            value={card.cardBrand}
            onChange={(e) => onChange(card.id, { cardBrand: e.target.value })}
            required
            className={inputClass}
          >
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
        <Field label="Últimos 4 dígitos">
          <input
            value={card.cardLast4}
            onChange={(e) => onChange(card.id, { cardLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            required
            inputMode="numeric"
            maxLength={4}
            className={inputClass}
            placeholder="1234"
          />
        </Field>
      </div>

      <FileField
        label="Foto delantera de la tarjeta"
        helpText="Tapa los primeros 12 números de la tarjeta —con un papel, editando la foto o algún objeto que tengas a mano— dejando visibles solo los últimos 4 dígitos y el nombre del titular."
        example={<EjemploTarjeta />}
        file={card.photo}
        onChange={(f) => onChange(card.id, { photo: f })}
      />
    </div>
  )
}
