'use client'

import { useRef, useState } from 'react'

type FileFieldProps = {
  name: string
  label: string
  helpText: string
  example?: React.ReactNode
}

const MAX_MB = 10

export default function FileField({ name, label, helpText, example }: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB}MB`)
      setFileName(null)
      setPreview(null)
      return
    }
    setError(null)
    setFileName(file.name)
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="block text-sm font-semibold text-[#0F172A]">
            {label} <span className="text-red-600">*</span>
          </span>
          <p className="mt-1 max-w-md text-sm text-slate-500">{helpText}</p>
        </div>
        {example}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const dropped = e.dataTransfer.files
          if (inputRef.current) inputRef.current.files = dropped
          handleFiles(dropped)
        }}
        className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-[#CBD5E1] px-4 py-6 transition-colors hover:border-[#043D35] hover:bg-[#ECFDF5]/40"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-16 w-16 rounded-lg border border-[#CBD5E1] object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#F1F5F9] text-slate-400">
            <UploadIcon />
          </div>
        )}
        <div className="text-sm">
          {fileName ? (
            <span className="font-medium text-[#043D35]">{fileName}</span>
          ) : (
            <>
              <span className="font-medium text-[#043D35]">Haz clic para subir</span>{' '}
              <span className="text-slate-500">o arrastra el archivo aquí (JPG, PNG o PDF, máx {MAX_MB}MB)</span>
            </>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3m0 0l4 4m-4-4L8 7" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}
