export const inputClass =
  'w-full rounded-lg border border-[#CBD5E1] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none transition-colors focus:border-[#043D35] focus:ring-2 focus:ring-[#ECFDF5] placeholder:text-slate-400'

export function Field({
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
