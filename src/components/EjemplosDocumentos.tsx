export function EjemploCedula() {
  return (
    <div className="w-36 shrink-0">
      <svg viewBox="0 0 200 130" className="w-full rounded-md border border-[#CBD5E1] bg-white">
        <rect x="1" y="1" width="198" height="128" rx="10" fill="#FFFFFF" stroke="#CBD5E1" />
        <rect x="14" y="16" width="46" height="58" rx="4" fill="#F1F5F9" />
        <text x="37" y="49" textAnchor="middle" fontSize="9" fill="#94A3B8">
          Foto
        </text>
        <rect x="70" y="20" width="110" height="7" rx="2" fill="#CBD5E1" />
        <rect x="70" y="34" width="90" height="7" rx="2" fill="#CBD5E1" />
        <rect x="70" y="48" width="70" height="7" rx="2" fill="#CBD5E1" />
        <rect x="14" y="86" width="172" height="18" rx="3" fill="#043D35" />
        <text x="100" y="98" textAnchor="middle" fontSize="8.5" fill="#FFFFFF" fontWeight="600">
          TAPA AQUÍ (N° documento)
        </text>
        <rect x="14" y="110" width="90" height="7" rx="2" fill="#94A3B8" />
      </svg>
      <p className="mt-1.5 text-center text-xs text-slate-500">Tapa solo el N° de documento</p>
    </div>
  )
}

export function EjemploTarjeta() {
  return (
    <div className="w-36 shrink-0">
      <svg viewBox="0 0 200 130" className="w-full rounded-md border border-[#CBD5E1] bg-white">
        <rect x="1" y="1" width="198" height="128" rx="12" fill="#0F172A" />
        <rect x="16" y="18" width="30" height="22" rx="3" fill="#CBD5E1" />
        <rect x="16" y="64" width="130" height="16" rx="3" fill="#043D35" />
        <text x="81" y="75.5" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontWeight="600">
          TAPA ESTOS DÍGITOS
        </text>
        <text x="16" y="102" fontSize="13" fill="#F1F5F9" letterSpacing="2">
          •••• 1234
        </text>
        <text x="16" y="118" fontSize="9" fill="#CBD5E1">
          NOMBRE APELLIDO
        </text>
      </svg>
      <p className="mt-1.5 text-center text-xs text-slate-500">Deja visibles solo los últimos 4 dígitos y tu nombre</p>
    </div>
  )
}
