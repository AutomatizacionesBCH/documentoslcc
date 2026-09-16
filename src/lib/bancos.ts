export const BANCOS_CHILE = [
  'Banco de Chile',
  'BancoEstado',
  'Banco Santander Chile',
  'Banco de Crédito e Inversiones (BCI)',
  'Scotiabank Chile',
  'Banco Itaú Chile',
  'Banco Security',
  'Banco Falabella',
  'Banco Ripley',
  'Banco Consorcio',
  'Banco BICE',
  'Banco Internacional',
  'HSBC Bank Chile',
  'Banco BTG Pactual Chile',
  'China Construction Bank Chile',
  'Coopeuch',
  'Tenpo',
  'Otro',
] as const

export type BancoChile = (typeof BANCOS_CHILE)[number]
