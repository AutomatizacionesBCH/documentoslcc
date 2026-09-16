'use server'

import { supabaseAdmin } from './supabaseAdmin'
import { formatRutForStorage, validateRut } from './rut'
import { CARD_BRANDS } from '@/types'

export type SubmitResult = { success: true } | { success: false; error: string }

const BUCKET = 'documentos-solicitudes'
const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']

function isFile(value: FormDataEntryValue | null | undefined): value is File {
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
    const email = String(formData.get('email') || '').trim()
    const address = String(formData.get('address') || '').trim()
    const comuna = String(formData.get('comuna') || '').trim()
    const amountRaw = String(formData.get('amount_usd') || '').trim()
    const transfer_bank_name = String(formData.get('transfer_bank_name') || '').trim()
    const transfer_account_number = String(formData.get('transfer_account_number') || '').trim()

    if (!full_name) return { success: false, error: 'Falta el nombre completo' }

    const document_id = formatRutForStorage(rutRaw)
    if (!validateRut(document_id)) return { success: false, error: 'El RUT ingresado no es válido' }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'El email ingresado no es válido' }
    }
    if (!address) return { success: false, error: 'Falta la dirección' }
    if (!comuna) return { success: false, error: 'Falta la comuna' }

    const amount_usd = Number(amountRaw)
    if (!amount_usd || amount_usd <= 0) return { success: false, error: 'El monto en USD no es válido' }

    if (!transfer_bank_name) return { success: false, error: 'Falta el banco para la transferencia' }
    if (!transfer_account_number) return { success: false, error: 'Falta el número de cuenta para la transferencia' }

    const cardBanks = formData.getAll('card_bank[]').map((v) => String(v).trim())
    const cardBrands = formData.getAll('card_brand[]').map((v) => String(v).trim())
    const cardLast4s = formData.getAll('card_last4[]').map((v) => String(v).trim())
    const cardPhotos = formData.getAll('card_photo[]')

    if (cardBanks.length === 0) return { success: false, error: 'Agrega al menos una tarjeta a operar' }

    const cardsData: { bank_name: string; card_brand: string; card_last4: string }[] = []
    const cardFiles: File[] = []

    for (let i = 0; i < cardBanks.length; i++) {
      const bank = cardBanks[i]
      const brand = cardBrands[i]
      const last4 = cardLast4s[i]
      const photo = cardPhotos[i]

      if (!bank) return { success: false, error: `Falta el banco o emisor de la tarjeta ${i + 1}` }
      if (!CARD_BRANDS.includes(brand as (typeof CARD_BRANDS)[number])) {
        return { success: false, error: `Selecciona el tipo de la tarjeta ${i + 1}` }
      }
      if (!/^\d{4}$/.test(last4)) {
        return { success: false, error: `Los últimos 4 dígitos de la tarjeta ${i + 1} deben ser numéricos` }
      }
      if (!isFile(photo) || photo.size === 0) {
        return { success: false, error: `Falta la foto de la tarjeta ${i + 1}` }
      }

      cardsData.push({ bank_name: bank, card_brand: brand, card_last4: last4 })
      cardFiles.push(photo)
    }

    const idDocument = formData.get('id_document')
    const balanceNational = formData.get('balance_national')
    const balanceIntl = formData.get('balance_intl')

    if (!isFile(idDocument) || idDocument.size === 0) {
      return { success: false, error: 'Falta la foto de la cédula de identidad' }
    }
    if (!isFile(balanceNational) || balanceNational.size === 0) {
      return { success: false, error: 'Falta la foto del saldo nacional' }
    }
    if (!isFile(balanceIntl) || balanceIntl.size === 0) {
      return { success: false, error: 'Falta la foto del saldo internacional' }
    }

    const folder = `${document_id}-${Date.now()}`

    const [id_document_path, balance_national_path, balance_intl_path] = await Promise.all([
      uploadFile(idDocument, folder, 'cedula', 'la cédula de identidad'),
      uploadFile(balanceNational, folder, 'saldo-nacional', 'el saldo nacional'),
      uploadFile(balanceIntl, folder, 'saldo-internacional', 'el saldo internacional'),
    ])

    const cardPhotoPaths = await Promise.all(
      cardFiles.map((file, i) => uploadFile(file, folder, `tarjeta-${i + 1}`, `la foto de la tarjeta ${i + 1}`))
    )

    const cards = cardsData.map((card, i) => ({ ...card, photo_path: cardPhotoPaths[i] }))

    const { error } = await supabaseAdmin.from('operation_requests').insert({
      full_name,
      document_id,
      email,
      address,
      comuna,
      amount_usd,
      transfer_bank_name,
      transfer_account_number,
      cards,
      id_document_path,
      balance_national_path,
      balance_intl_path,
    })

    if (error) return { success: false, error: error.message }

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Ocurrió un error inesperado' }
  }
}
