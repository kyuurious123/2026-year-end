import { useRef, useState } from 'react'
import { LIMITS, MONTH_NAMES } from '../design'
import type { MiddleAlign, MonthData, MonthImage } from '../types'
import { imageHeight } from '../types'
import { NumberField } from './NumberField'

interface Props {
  monthNumber: number
  data: MonthData
  isMiddle: boolean
  middleAlign: MiddleAlign
  selected: boolean
  onChange: (patch: Partial<MonthData>) => void
  onImageChange: (patch: Partial<MonthImage>) => void
  onAlignChange: (a: MiddleAlign) => void
  onUpload: (file: File) => Promise<void>
  onRemoveImage: () => void
  onSelectImage: () => void
}

const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-900'

export function MonthEditor({
  monthNumber,
  data,
  isMiddle,
  middleAlign,
  selected,
  onChange,
  onImageChange,
  onAlignChange,
  onUpload,
  onRemoveImage,
  onSelectImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cutCount, setCutCount] = useState(0)

  const pickFile = () => fileRef.current?.click()

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      await onUpload(file)
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지를 올리지 못했어요.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="border-t border-neutral-300 px-5 py-5">
      <h2 className="mb-3 font-mono text-[15px] font-medium">
        {String(monthNumber).padStart(2, '0')} {MONTH_NAMES[monthNumber - 1]}
      </h2>

      <div className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-neutral-500">
            <span>본문</span>
            <span className="tabular-nums">
              {data.body.length} / {LIMITS.bodyMaxChars}
            </span>
          </div>
          <textarea
            value={data.body}
            onChange={(e) => {
              const v = e.target.value
              // maxLength는 붙여 넣기를 말없이 잘라버려서, 직접 자르고 알려줌
              setCutCount(Math.max(0, v.length - LIMITS.bodyMaxChars))
              onChange({ body: v.slice(0, LIMITS.bodyMaxChars) })
            }}
            rows={7}
            placeholder="비워 두면 이 달은 빈칸으로 나가요."
            className={`${inputClass} resize-y leading-relaxed`}
          />
          {cutCount > 0 && (
            <p className="mt-1 text-xs text-red-600">
              {LIMITS.bodyMaxChars}자까지만 들어가서 뒷부분 {cutCount}자가 잘렸어요.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">글 제목</span>
            <input
              value={data.title}
              maxLength={LIMITS.titleMaxChars}
              onChange={(e) => onChange({ title: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-neutral-500">소제목</span>
            <input
              value={data.subtitle}
              maxLength={LIMITS.subtitleMaxChars}
              placeholder="CP명 등"
              onChange={(e) => onChange({ subtitle: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <div>
          <span className="mb-1 block text-xs text-neutral-500">본문 폭</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={LIMITS.bodyWidthMin}
              max={LIMITS.bodyWidthMax}
              step={1}
              value={data.bodyWidth}
              onChange={(e) => onChange({ bodyWidth: Number(e.target.value) })}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-neutral-900"
              aria-label="본문 폭"
            />
            <div className="w-[88px] shrink-0">
              <NumberField
                label="W"
                value={data.bodyWidth}
                min={LIMITS.bodyWidthMin}
                max={LIMITS.bodyWidthMax}
                onChange={(v) => onChange({ bodyWidth: v })}
              />
            </div>
          </div>
        </div>

        {isMiddle && (
          <div>
            <span className="mb-1 block text-xs text-neutral-500">블록 위치</span>
            <div className="grid grid-cols-2 rounded-md border border-neutral-300 bg-white p-0.5 text-sm">
              {(['top', 'bottom'] as MiddleAlign[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onAlignChange(a)}
                  className={`rounded px-2 py-1 ${
                    middleAlign === a ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {a === 'top' ? '위로' : '아래로'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="mb-1 block text-xs text-neutral-500">이미지 (선택)</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!data.image ? (
            <button
              type="button"
              onClick={pickFile}
              disabled={uploading}
              className="w-full rounded-md border border-dashed border-neutral-400 px-3 py-3 text-sm text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
            >
              {uploading ? '흑백으로 바꾸는 중…' : '이미지 올리기'}
            </button>
          ) : (
            <div
              className={`rounded-md border p-2 ${selected ? 'border-[#2f6bff]' : 'border-neutral-300'} bg-white`}
            >
              <div className="mb-2 flex items-center gap-2">
                <button type="button" onClick={onSelectImage} className="shrink-0" title="캔버스에서 선택">
                  <img src={data.image.src} alt="" className="size-12 rounded object-cover" />
                </button>
                <div className="ml-auto flex gap-1.5">
                  <button
                    type="button"
                    onClick={pickFile}
                    disabled={uploading}
                    className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs hover:border-neutral-900 disabled:opacity-50"
                  >
                    {uploading ? '바꾸는 중…' : '교체'}
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-red-600 hover:border-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <NumberField label="X" value={data.image.x} onChange={(v) => onImageChange({ x: v })} />
                <NumberField label="Y" value={data.image.y} onChange={(v) => onImageChange({ y: v })} />
                <NumberField
                  label="W"
                  value={data.image.w}
                  min={LIMITS.imageMinWidth}
                  onChange={(v) => onImageChange({ w: v })}
                />
                <NumberField label="H" value={imageHeight(data.image)} readOnly onChange={() => {}} />
              </div>
            </div>
          )}
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </section>
  )
}