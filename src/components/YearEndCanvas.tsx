import { useLayoutEffect, useRef } from 'react'
import type { Ref } from 'react'
import { BODY, CANVAS, CONTENT, CONTENT_HEIGHT, HEADER, MONTH_LABEL, MONTH_NAMES } from '../design'
import type { MonthData, MonthImage, MonthIndex, Quarter, QuarterData } from '../types'
import { MONTH_INDEXES } from '../types'
import { ImageFrame } from './ImageFrame'

const pad = (n: number) => String(n).padStart(2, '0')

interface Props {
  quarter: Quarter
  data: QuarterData
  ref?: Ref<HTMLDivElement>
  /** 편집용 캔버스면 true (바운딩 박스, 넘침 표시) */
  interactive?: boolean
  /** 화면 표시 배율 (드래그 거리 환산용) */
  scale?: number
  selected?: MonthIndex | null
  overflow?: boolean
  onSelectImage?: (m: MonthIndex | null) => void
  onImageChange?: (m: MonthIndex, patch: Partial<MonthImage>) => void
  onMeasure?: (heights: number[]) => void
}

export function YearEndCanvas({
  quarter,
  data,
  ref,
  interactive = false,
  scale = 1,
  selected = null,
  overflow = false,
  onSelectImage,
  onImageChange,
  onMeasure,
}: Props) {
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const lastHeights = useRef<string>('')

  // 블록 높이 측정 → 높이 게이지
  useLayoutEffect(() => {
    if (!onMeasure) return
    const report = () => {
      const heights = blockRefs.current.map((el) => (el ? el.offsetHeight : 0))
      const key = heights.join(',')
      if (key !== lastHeights.current) {
        lastHeights.current = key
        onMeasure(heights)
      }
    }
    const ro = new ResizeObserver(report)
    blockRefs.current.forEach((el) => el && ro.observe(el))
    report()
    return () => ro.disconnect()
  }, [onMeasure])

  const firstMonth = quarter * 3 + 1
  const block = (m: MonthIndex) => (
    <MonthBlock
      key={m}
      ref={(el) => {
        blockRefs.current[m] = el
      }}
      monthNumber={firstMonth + m}
      data={data.months[m]}
      side={m === 1 ? 'right' : 'left'}
      interactive={interactive}
      scale={scale}
      selected={selected === m}
      onSelect={() => onSelectImage?.(m)}
      onImageChange={(patch) => onImageChange?.(m, patch)}
    />
  )
  const gap = <div style={{ height: CONTENT.minGap, flexShrink: 0 }} />
  const spring = <div style={{ flex: '1 1 0', minHeight: 0 }} />

  return (
    <div
      ref={ref}
      onPointerDown={interactive ? () => onSelectImage?.(null) : undefined}
      style={{
        position: 'relative',
        width: CANVAS.width,
        height: CANVAS.height,
        background: CANVAS.background,
        color: CANVAS.color,
        overflow: 'hidden',
        fontFamily: "'Pretendard', sans-serif",
      }}
    >
      {/* 01 - 03 */}
      <div
        style={{
          position: 'absolute',
          top: HEADER.rangeTop,
          right: CANVAS.paddingX,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
          fontSize: HEADER.rangeFontSize,
          lineHeight: 1,
          whiteSpace: 'pre',
        }}
      >
        {`${pad(firstMonth)}  -  ${pad(firstMonth + 2)}`}
      </div>

      {/* 2026 Year End */}
      <div
        style={{
          position: 'absolute',
          top: HEADER.titleTop,
          left: CANVAS.paddingX,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
          fontSize: HEADER.titleFontSize,
          letterSpacing: HEADER.titleLetterSpacing,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {HEADER.title}
      </div>

      <Rule y={HEADER.topRuleY} />

      {/* 본문 영역 */}
      <div
        style={{
          position: 'absolute',
          top: CONTENT.top,
          left: CANVAS.paddingX,
          right: CANVAS.paddingX,
          height: CONTENT_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          clipPath: interactive ? undefined : 'inset(-10000px -10000px 0 -10000px)',
        }}
      >
        {block(MONTH_INDEXES[0])}
        {data.middleAlign === 'top' ? gap : spring}
        {block(MONTH_INDEXES[1])}
        {data.middleAlign === 'top' ? spring : gap}
        {block(MONTH_INDEXES[2])}
      </div>

      <Rule y={CONTENT.bottomRuleY} />

      {/* 크레딧 */}
      <div
        style={{
          position: 'absolute',
          top: CONTENT.bottomRuleY + 20,
          right: CANVAS.paddingX,
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: 1,
          color: '#b4b4b4',
        }}
      >
        2026-year-end.vercel.app
      </div>

      {interactive && overflow && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: CONTENT.bottom,
            bottom: 0,
            background: 'rgba(229, 72, 77, 0.10)',
            borderTop: `${Math.max(2, 2 / scale)}px dashed #e5484d`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

function Rule({ y }: { y: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: CANVAS.paddingX,
        right: CANVAS.paddingX,
        height: 1,
        background: CANVAS.color,
      }}
    />
  )
}

interface BlockProps {
  ref?: Ref<HTMLDivElement>
  monthNumber: number
  data: MonthData
  side: 'left' | 'right'
  interactive: boolean
  scale: number
  selected: boolean
  onSelect: () => void
  onImageChange: (patch: Partial<MonthImage>) => void
}

function MonthBlock({ ref, monthNumber, data, side, interactive, scale, selected, onSelect, onImageChange }: BlockProps) {
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
        gap: MONTH_LABEL.gap,
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
          fontSize: MONTH_LABEL.fontSize,
          lineHeight: `${BODY.lineHeight}px`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {pad(monthNumber)} {MONTH_NAMES[monthNumber - 1]}
      </div>
      <Body data={data} />

      {data.image && (
        <ImageFrame
          image={data.image}
          interactive={interactive}
          scale={scale}
          selected={selected}
          onSelect={onSelect}
          onChange={onImageChange}
        />
      )}
    </div>
  )
}

function Body({ data }: { data: MonthData }) {
  const paragraphs = data.body
  .replace(/\r\n?/g, '\n')
  .replace(/\s+$/, '')
  .split('\n')
  .map((p) => p.replace(/^[\s\u3000]+/, ''))
  const meta = [data.title.trim(), data.subtitle.trim()].filter(Boolean).join(' / ')
  const hasBody = data.body.trim().length > 0

  const metaNode = meta ? <Meta text={meta} /> : null

  return (
    <div
      style={{
        width: data.bodyWidth,
        flexShrink: 1,
        minWidth: 0,
        fontSize: BODY.fontSize,
        lineHeight: `${BODY.lineHeight}px`,
        letterSpacing: BODY.letterSpacing,
        textAlign: 'justify',
        wordBreak: 'normal',
        overflowWrap: 'anywhere',
      }}
    >
      {hasBody
        ? paragraphs.map((p, i) => (
            <p key={i} style={{ margin: 0, textIndent: BODY.indent, minHeight: `${BODY.lineHeight}px` }}>
              {p}
              {i === paragraphs.length - 1 && metaNode && <> {metaNode}</>}
            </p>
          ))
        : metaNode && <p style={{ margin: 0 }}>{metaNode}</p>}
    </div>
  )
}

/** ■ 제목 / 소제목. ■가 혼자 줄 끝에 남지 않도록 첫 글자와 붙여 둡니다. */
function Meta({ text }: { text: string }) {
  const chars = Array.from(text)
  const first = chars[0]
  const rest = chars.slice(1).join('')
  return (
    <>
      <span style={{ whiteSpace: 'nowrap' }}>
        <span
          style={{
            display: 'inline-block',
            width: BODY.markerSize,
            height: BODY.markerSize,
            borderRadius: BODY.markerRadius,
            background: CANVAS.color,
            marginRight: BODY.markerGap,
            verticalAlign: '-0.12em',
          }}
        />
        {first}
      </span>
      {rest}
    </>
  )
}
