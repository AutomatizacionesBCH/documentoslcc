const BANCOS_BASE = [
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
] as const

/** Banco de la cuenta a la que se transfiere el monto de la operación. */
export const BANCOS_TRANSFERENCIA = [...BANCOS_BASE, 'Otro'] as const

/** Banco o billetera que emite la tarjeta que se va a operar. */
export const EMISORES_TARJETA = [...BANCOS_BASE, 'Mercado Pago', 'MACH', 'Tenpo', 'Otro'] as const
