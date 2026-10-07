export type Quarter = 0 | 1 | 2 | 3
export type MonthIndex = 0 | 1 | 2
export type MiddleAlign = 'top' | 'bottom'

export interface MonthImage {
  src: string
  naturalWidth: number
  naturalHeight: number
  /** 해당 달 블록 왼쪽 위 기준 좌표 */
  x: number
  y: number
  w: number
}

export interface MonthData {
  body: string
  title: string
  subtitle: string
  bodyWidth: number
  image: MonthImage | null
}

export interface QuarterData {
  months: [MonthData, MonthData, MonthData]
  middleAlign: MiddleAlign
}

export const QUARTERS: Quarter[] = [0, 1, 2, 3]
export const MONTH_INDEXES: MonthIndex[] = [0, 1, 2]

export function imageHeight(img: MonthImage) {
  return (img.w * img.naturalHeight) / img.naturalWidth
}

/** 블록 높이 3개 + 최소 간격 2개 */
export function usedHeight(heights: number[], minGap: number) {
  return heights.reduce((a, b) => a + b, 0) + minGap * 2
}
