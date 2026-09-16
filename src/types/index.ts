export const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express'] as const
export type CardBrand = (typeof CARD_BRANDS)[number]
