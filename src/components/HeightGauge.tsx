import { CONTENT, CONTENT_HEIGHT } from '../design'
import { usedHeight } from '../types'

const SEGMENT_COLORS = ['#1c1c1c', '#5b5b5b', '#9a9a9a']

export function HeightGauge({ heights, firstMonth }: { heights: number[]; firstMonth: number }) {
  const used = usedHeight(heights, CONTENT.minGap)
  const total = Math.max(used, CONTENT_HEIGHT)
  const remaining = CONTENT_HEIGHT - used
  const over = remaining < 0
  const pct = (v: number) => `${(v / total) * 100}%`

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold">본문 높이</span>
        <span className={`text-xs tabular-nums ${over ? 'font-semibold text-red-600' : 'text-neutral-500'}`}>
          {over ? `${-remaining}px 넘쳤어요` : `${remaining}px 남음`}
        </span>
      </div>
      <div className="relative flex h-3 overflow-hidden rounded-sm bg-neutral-200">
        {heights.map((h, i) => (
          <div key={i} className="flex h-full" style={{ width: pct(h + (i < 2 ? CONTENT.minGap : 0)) }}>
            <div className="h-full" style={{ width: `${(h / (h + (i < 2 ? CONTENT.minGap : 0))) * 100}%`, background: SEGMENT_COLORS[i] }} />
          </div>
        ))}
        {over && (
          <div
            className="absolute top-0 bottom-0 bg-red-500/70"
            style={{ left: pct(CONTENT_HEIGHT), right: 0 }}
          />
        )}
      </div>
      <div className="mt-1.5 flex gap-3 text-[11px] text-neutral-500">
        {heights.map((h, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-[2px]" style={{ background: SEGMENT_COLORS[i] }} />
            {String(firstMonth + i).padStart(2, '0')}월 {h}px
          </span>
        ))}
      </div>
      {over && (
        <p className="mt-2 text-xs leading-relaxed text-red-600">
          넘친 부분은 저장할 때 잘려요. 글을 덜어내거나 본문 폭을 넓혀 주세요.
        </p>
      )}
    </div>
  )
}
