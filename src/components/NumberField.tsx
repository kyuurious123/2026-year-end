import { useEffect, useState } from 'react'

interface Props {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  readOnly?: boolean
}

/** 입력 중엔 자유롭게 치고, 숫자가 유효하면 바로 반영. 포커스가 빠질 때 범위로 보정. */
export function NumberField({ label, value, onChange, min = -Infinity, max = Infinity, readOnly }: Props) {
  const [text, setText] = useState(String(Math.round(value)))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setText(String(Math.round(value)))
  }, [value, focused])

  const commit = (raw: string) => {
    const n = Number(raw)
    if (raw.trim() === '' || Number.isNaN(n)) return
    onChange(Math.min(max, Math.max(min, Math.round(n))))
  }

  return (
    <label className="flex min-w-0 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1.5 focus-within:border-neutral-900">
      <span className="font-mono text-[11px] text-neutral-500">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        readOnly={readOnly}
        value={text}
        onFocus={() => setFocused(true)}
        onChange={(e) => {
          setText(e.target.value)
          const n = Number(e.target.value)
          if (e.target.value.trim() !== '' && !Number.isNaN(n) && n >= min && n <= max) onChange(Math.round(n))
        }}
        onBlur={(e) => {
          setFocused(false)
          commit(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        className="w-full min-w-0 bg-transparent text-right text-sm tabular-nums outline-none read-only:text-neutral-400"
      />
    </label>
  )
}
