import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { LIMITS } from '../design'
import type { MonthImage } from '../types'
import { imageHeight } from '../types'

type Corner = 'nw' | 'ne' | 'sw' | 'se'

interface Props {
  image: MonthImage
  interactive: boolean
  scale: number
  selected: boolean
  onSelect: () => void
  onChange: (patch: Partial<MonthImage>) => void
}

const ACCENT = '#2f6bff'

export function ImageFrame({ image, interactive, scale, selected, onSelect, onChange }: Props) {
  const h = imageHeight(image)
  const dragRef = useRef<{ x0: number; y0: number; w0: number; startX: number; startY: number } | null>(null)

  const begin = (e: ReactPointerEvent, mode: 'move' | Corner) => {
    if (!interactive) return
    e.stopPropagation()
    e.preventDefault()
    onSelect()
    dragRef.current = { x0: image.x, y0: image.y, w0: image.w, startX: e.clientX, startY: e.clientY }
    const aspect = image.naturalWidth / image.naturalHeight

    const move = (ev: PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = (ev.clientX - d.startX) / scale
      const dy = (ev.clientY - d.startY) / scale

      if (mode === 'move') {
        onChange({ x: Math.round(d.x0 + dx), y: Math.round(d.y0 + dy) })
        return
      }

      // 모서리 리사이즈: 비율 고정, 반대쪽 모서리 기준
      const sx = mode === 'ne' || mode === 'se' ? 1 : -1
      const sy = mode === 'sw' || mode === 'se' ? 1 : -1
      const fromX = sx * dx
      const fromY = sy * dy * aspect
      const dw = Math.abs(fromX) > Math.abs(fromY) ? fromX : fromY
      const w = Math.max(LIMITS.imageMinWidth, d.w0 + dw)
      const h0 = d.w0 / aspect
      const nh = w / aspect
      onChange({
        w: Math.round(w),
        x: Math.round(sx < 0 ? d.x0 + (d.w0 - w) : d.x0),
        y: Math.round(sy < 0 ? d.y0 + (h0 - nh) : d.y0),
      })
    }
    const up = () => {
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // 화면에서 일정한 크기로 보이도록 배율 보정
  const line = 1.5 / scale
  const handle = 12 / scale

  return (
    <div
      onPointerDown={(e) => begin(e, 'move')}
      style={{
        position: 'absolute',
        left: image.x,
        top: image.y,
        width: image.w,
        height: h,
        zIndex: 1,
        cursor: interactive ? 'move' : undefined,
        touchAction: 'none',
      }}
    >
      <img
        src={image.src}
        alt=""
        draggable={false}
        style={{ display: 'block', width: '100%', height: '100%', userSelect: 'none' }}
      />

      {interactive && selected && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              outline: `${line}px solid ${ACCENT}`,
              pointerEvents: 'none',
            }}
          />
          {(['nw', 'ne', 'sw', 'se'] as Corner[]).map((c) => (
            <div
              key={c}
              onPointerDown={(e) => begin(e, c)}
              style={{
                position: 'absolute',
                width: handle,
                height: handle,
                background: '#fff',
                border: `${line}px solid ${ACCENT}`,
                boxSizing: 'border-box',
                left: c === 'nw' || c === 'sw' ? -handle / 2 : undefined,
                right: c === 'ne' || c === 'se' ? -handle / 2 : undefined,
                top: c === 'nw' || c === 'ne' ? -handle / 2 : undefined,
                bottom: c === 'sw' || c === 'se' ? -handle / 2 : undefined,
                cursor: c === 'nw' || c === 'se' ? 'nwse-resize' : 'nesw-resize',
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}
