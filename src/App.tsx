import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { CANVAS, CONTENT, CONTENT_HEIGHT, DEFAULTS, HEADER, MIN_DESKTOP_WIDTH } from './design'
import { createInitialQuarters } from './data/initial'
import { processImage } from './lib/grayscale'
import { exportAll, exportOne } from './lib/export'
import type { MiddleAlign, MonthData, MonthImage, MonthIndex, Quarter, QuarterData } from './types'
import { MONTH_INDEXES, QUARTERS, usedHeight } from './types'
import { YearEndCanvas } from './components/YearEndCanvas'
import { MonthEditor } from './components/MonthEditor'
import { HeightGauge } from './components/HeightGauge'

const CONTENT_WIDTH = CANVAS.width - CANVAS.paddingX * 2
const STAGE_PADDING = 48
// 아래쪽은 배율 토글이 캔버스를 가리지 않게 여유를 더 둠
const STAGE_PADDING_BOTTOM = 84

export default function App() {
  const [quarters, setQuarters] = useState<QuarterData[]>(createInitialQuarters)
  const [active, setActive] = useState<Quarter>(0)
  const [selected, setSelected] = useState<MonthIndex | null>(null)
  const [measures, setMeasures] = useState<number[][]>(() => QUARTERS.map(() => [0, 0, 0]))
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState<'one' | 'all' | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const isNarrow = useIsNarrow()

  const exportRefs = useRef<(HTMLDivElement | null)[]>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('fit')
  const scale = useStageScale(stageRef, viewMode)

  const overflowByQuarter = useMemo(
    () => measures.map((h) => usedHeight(h, CONTENT.minGap) > CONTENT_HEIGHT),
    [measures],
  )

  // ---------- 상태 변경 ----------
  const updateQuarter = useCallback((q: Quarter, fn: (d: QuarterData) => QuarterData) => {
    setDirty(true)
    setQuarters((prev) => prev.map((d, i) => (i === q ? fn(d) : d)))
  }, [])

  const updateMonth = useCallback(
    (q: Quarter, m: MonthIndex, patch: Partial<MonthData>) =>
      updateQuarter(q, (d) => {
        const months = [...d.months] as QuarterData['months']
        months[m] = { ...months[m], ...patch }
        return { ...d, months }
      }),
    [updateQuarter],
  )

  const updateImage = useCallback(
    (q: Quarter, m: MonthIndex, patch: Partial<MonthImage>) =>
      updateQuarter(q, (d) => {
        const img = d.months[m].image
        if (!img) return d
        const months = [...d.months] as QuarterData['months']
        months[m] = { ...months[m], image: { ...img, ...patch } }
        return { ...d, months }
      }),
    [updateQuarter],
  )

  const handleUpload = async (q: Quarter, m: MonthIndex, file: File) => {
    const processed = await processImage(file)
    updateQuarter(q, (d) => {
      const prev = d.months[m].image
      const w = prev?.w ?? DEFAULTS.imageWidth
      // 글이 왼쪽인 달은 이미지를 오른쪽에, 글이 오른쪽인 달은 왼쪽에
      const x = prev?.x ?? (m === 1 ? 0 : CONTENT_WIDTH - w)
      const y = prev?.y ?? 0
      const months = [...d.months] as QuarterData['months']
      months[m] = { ...months[m], image: { ...processed, x, y, w } }
      return { ...d, months }
    })
    setSelected(m)
  }

  const measureHandlers = useMemo(
    () =>
      QUARTERS.map((q) => (heights: number[]) =>
        setMeasures((prev) => prev.map((h, i) => (i === q ? heights : h))),
      ),
    [],
  )

  // ---------- 키보드로 이미지 미세 이동 ----------
  useEffect(() => {
    if (selected === null) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('input, textarea')) return
      if (e.key === 'Escape') return setSelected(null)
      const step = e.shiftKey ? 10 : 1
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }
      const d = delta[e.key]
      if (!d || !quarters[active].months[selected].image) return
      e.preventDefault()
      updateQuarter(active, (q) => {
        const img = q.months[selected].image
        if (!img) return q
        const months = [...q.months] as QuarterData['months']
        months[selected] = { ...months[selected], image: { ...img, x: img.x + d[0], y: img.y + d[1] } }
        return { ...q, months }
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, active, quarters, updateQuarter])

  // ---------- 나갈 때 경고 ----------
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // ---------- 저장 ----------
  const runExport = async (mode: 'one' | 'all') => {
    const targets = mode === 'one' ? [active] : QUARTERS
    const overflowing = targets.filter((q) => overflowByQuarter[q])
    if (overflowing.length > 0) {
      const names = overflowing.map((q) => `${q + 1}분기`).join(', ')
      if (!window.confirm(`${names}는 내용이 넘쳐서 아랫부분이 잘려요. 그대로 저장할까요?`)) return
    }
    setBusy(mode)
    setExportError(null)
    setSelected(null)
    try {
      if (mode === 'one') {
        const node = exportRefs.current[active]
        if (node) await exportOne(node, active)
      } else {
        const nodes = exportRefs.current.filter((n): n is HTMLDivElement => !!n)
        await exportAll(nodes)
      }
    } catch (e) {
      console.error(e)
      setExportError('저장하지 못했어요. 이미지를 다시 올리거나 새로고침 없이 한 번 더 시도해 주세요.')
    } finally {
      setBusy(null)
    }
  }

  const data = quarters[active]
  const firstMonth = active * 3 + 1

  return (
    <>
      {/* 좁은 화면에선 편집 화면을 숨김(display:none). 상태는 유지되고, 넓은 레이아웃 때문에 모바일이 화면을 축소하는 것도 막아줌 */}
      <div className={`h-full ${isNarrow ? "hidden" : "flex"}`}>
        {/* 왼쪽: 분기 */}
        <aside className="flex w-[184px] shrink-0 flex-col border-r border-neutral-300 bg-[#f4f4f2]">
          <div className="px-5 pt-6 pb-8 font-mono text-[15px] font-medium leading-tight">
            {HEADER.title}
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {QUARTERS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setActive(q)
                  setSelected(null)
                }}
                className={`flex items-center justify-between rounded-md px-3 py-2.5 text-left ${
                  active === q ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-200'
                }`}
              >
                <span>
                  <span className="block font-mono text-[15px] font-medium">{q + 1}Q</span>
                  <span className={`block text-[11px] ${active === q ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {q * 3 + 1}월 – {q * 3 + 3}월
                  </span>
                </span>
                {overflowByQuarter[q] && (
                  <span className="size-2 rounded-full bg-red-500" title="내용이 넘쳤어요" />
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2 px-3 pb-5">
            <button
              type="button"
              onClick={() => runExport('one')}
              disabled={busy !== null}
              className="w-full rounded-md bg-neutral-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {busy === 'one' ? '저장하는 중…' : `${active + 1}분기 저장`}
            </button>
            <button
              type="button"
              onClick={() => runExport('all')}
              disabled={busy !== null}
              className="w-full rounded-md border border-neutral-900 px-3 py-2.5 text-sm font-semibold hover:bg-neutral-200 disabled:opacity-50"
            >
              {busy === 'all' ? '4장 만드는 중…' : '4장 한 번에 저장'}
            </button>
            {exportError && <p className="text-xs leading-relaxed text-red-600">{exportError}</p>}
            <p className="pt-2 text-[11px] leading-relaxed text-neutral-500">
              작성한 내용은 저장되지 않아요. 창을 닫기 전에 이미지를 꼭 저장해 주세요.
            </p>
            <p className="pt-2 text-xs text-neutral-500">Design by Kyuuri</p>
          </div>
        </aside>

        {/* 가운데: 캔버스 */}
        <main className="relative min-w-0 flex-1">
          <div ref={stageRef} className="absolute inset-0 overflow-auto">
            {/* w-max + mx-auto: 100%일 때 가로로 넘쳐도 왼쪽 끝까지 스크롤되도록 */}
            <div
              className="mx-auto w-max"
              style={{ padding: `${STAGE_PADDING}px ${STAGE_PADDING}px ${STAGE_PADDING_BOTTOM}px` }}
            >
              <div
                className="shadow-[0_1px_2px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.08)]"
                style={{ width: CANVAS.width * scale, height: CANVAS.height * scale }}
              >
                <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                  <YearEndCanvas
                    quarter={active}
                    data={data}
                    interactive
                    scale={scale}
                    selected={selected}
                    overflow={overflowByQuarter[active]}
                    onSelectImage={setSelected}
                    onImageChange={(m, patch) => updateImage(active, m, patch)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 보기 배율 토글 */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-neutral-300 bg-white/95 p-1 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.10)] backdrop-blur">
            {(['fit', 'actual'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3 py-1.5 ${
                  viewMode === mode ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {mode === 'fit' ? '전체 보기' : '원본 크기'}
              </button>
            ))}
            <span className="w-12 text-center font-mono text-xs tabular-nums text-neutral-500">
              {Math.round(scale * 100)}%
            </span>
          </div>
        </main>

        {/* 오른쪽: 편집 */}
        <aside className="w-[380px] shrink-0 overflow-y-auto border-l border-neutral-300 bg-[#f4f4f2]">
          <div className="sticky top-0 z-10 border-b border-neutral-300 bg-[#f4f4f2] px-5 py-4">
            <HeightGauge heights={measures[active]} firstMonth={firstMonth} />
          </div>
          {MONTH_INDEXES.map((m) => (
            <MonthEditor
              key={`${active}-${m}`}
              monthNumber={firstMonth + m}
              data={data.months[m]}
              isMiddle={m === 1}
              middleAlign={data.middleAlign}
              selected={selected === m}
              onChange={(patch) => updateMonth(active, m, patch)}
              onImageChange={(patch) => updateImage(active, m, patch)}
              onAlignChange={(a: MiddleAlign) => updateQuarter(active, (d) => ({ ...d, middleAlign: a }))}
              onUpload={(file) => handleUpload(active, m, file)}
              onRemoveImage={() => {
                updateMonth(active, m, { image: null })
                setSelected(null)
              }}
              onSelectImage={() => setSelected(m)}
            />
          ))}
        </aside>
      </div>

      {/* 저장용 원본 크기 캔버스 4장 (화면 밖) — 높이 측정도 여기서 */}
      <div aria-hidden style={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none' }}>
        {QUARTERS.map((q) => (
          <YearEndCanvas
            key={q}
            ref={(el) => {
              exportRefs.current[q] = el
            }}
            quarter={q}
            data={quarters[q]}
            onMeasure={measureHandlers[q]}
          />
        ))}
      </div>

      {isNarrow && <NarrowNotice />}
    </>
  )
}

function NarrowNotice() {
  return (
    <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-hidden bg-[#f7f7f6] px-8 text-center">
      <div>
        <p className="mb-6 font-mono text-[28px] font-medium">{HEADER.title}</p>
        <p className="text-[15px] leading-relaxed text-neutral-700">
          이 사이트는 PC 화면에 맞춰 만들어졌어요.
          <br />
          PC에서 접속해 주세요.
        </p>
      </div>
    </div>
  )
}

function useIsNarrow() {
  const query = `(max-width: ${MIN_DESKTOP_WIDTH - 1}px)`
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return narrow
}

type ViewMode = 'fit' | 'actual'

/**
 * fit: 캔버스 전체가 화면 높이(와 폭) 안에 들어오게
 * actual: 100% (1300×2600 그대로)
 */
function useStageScale(ref: RefObject<HTMLDivElement | null>, mode: ViewMode) {
  const [scale, setScale] = useState(0.3)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      if (mode === 'actual') return setScale(1 / window.devicePixelRatio)
      const w = el.clientWidth - STAGE_PADDING * 2
      const h = el.clientHeight - STAGE_PADDING - STAGE_PADDING_BOTTOM
      setScale(Math.max(0.1, Math.min(1, w / CANVAS.width, h / CANVAS.height)))
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [ref, mode])
  return scale
}
