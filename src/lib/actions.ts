'use server'

import { supabaseAdmin } from './supabaseAdmin'
import { formatRutForStorage, validateRut } from './rut'
import { CARD_BRANDS } from '@/types'

export type SubmitResult = { success: true } | { success: false; error: string }

const BUCKET = 'documentos-solicitudes'
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']

const FILE_FIELDS = [
  { field: 'id_document', slug: 'cedula', label: 'la cédula de identidad' },
  { field: 'card_photo', slug: 'tarjeta', label: 'la foto de la tarjeta' },
  { field: 'balance_national', slug: 'saldo-nacional', label: 'el saldo nacional' },
  { field: 'balance_intl', slug: 'saldo-internacional', label: 'el saldo internacional' },
] as const

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof value === 'object' && value !== null && typeof (value as File).arrayBuffer === 'function'
}

async function uploadFile(file: File, folder: string, slug: string, label: string): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`El archivo de ${label} supera los 10MB`)
  }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`El archivo de ${label} debe ser una imagen (JPG, PNG, HEIC) o PDF`)
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${folder}/${slug}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (error) throw new Error(`No se pudo subir ${label}: ${error.message}`)
  return path
}

export async function submitSolicitud(formData: FormData): Promise<SubmitResult> {
  try {
    const full_name = String(formData.get('full_name') || '').trim()
    const rutRaw = String(formData.get('document_id') || '').trim()
    const bank_name = String(formData.get('bank_name') || '').trim()
    const account_number = String(formData.get('account_number') || '').trim()
    const card_brand = String(formData.get('card_brand') || '').trim()
    const card_last4 = String(formData.get('card_last4') || '').trim()
    const email = String(formData.get('email') || '').trim()
    const address = String(formData.get('address') || '').trim()
    const comuna = String(formData.get('comuna') || '').trim()
    const amountRaw = String(formData.get('amount_usd') || '').trim()

    if (!full_name) return { success: false, error: 'Falta el nombre completo' }

    const document_id = formatRutForStorage(rutRaw)
    if (!validateRut(document_id)) return { success: false, error: 'El RUT ingresado no es válido' }

    if (!bank_name) return { success: false, error: 'Falta el banco de la tarjeta' }
    if (!account_number) return { success: false, error: 'Falta el número de cuenta corriente' }

    if (!CARD_BRANDS.includes(card_brand as (typeof CARD_BRANDS)[number])) {
      return { success: false, error: 'Selecciona el tipo de tarjeta' }
    }
    if (!/^\d{4}$/.test(card_last4)) {
      return { success: false, error: 'Los últimos 4 dígitos de la tarjeta deben ser numéricos' }
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'El email ingresado no es válido' }
    }
    if (!address) return { success: false, error: 'Falta la dirección' }
    if (!comuna) return { success: false, error: 'Falta la comuna' }

    const amount_usd = Number(amountRaw)
    if (!amount_usd || amount_usd <= 0) return { success: false, error: 'El monto en USD no es válido' }

    const files: Record<string, File> = {}
    for (const { field, label } of FILE_FIELDS) {
      const value = formData.get(field)
      if (!isFile(value) || value.size === 0) {
        return { success: false, error: `Falta subir ${label}` }
      }
      files[field] = value
    }

    const folder = `${document_id}-${Date.now()}`
    const paths: Record<string, string> = {}
    for (const { field, slug, label } of FILE_FIELDS) {
      paths[field] = await uploadFile(files[field], folder, slug, label)
    }

    const { error } = await supabaseAdmin.from('operation_requests').insert({
      full_name,
      document_id,
      bank_name,
      account_number,
      card_brand,
      card_last4,
      email,
      address,
      comuna,
      amount_usd,
      id_document_path: paths.id_document,
      card_photo_path: paths.card_photo,
      balance_national_path: paths.balance_national,
      balance_intl_path: paths.balance_intl,
    })

    if (error) return { success: false, error: error.message }

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Ocurrió un error inesperado' }
  }
}
