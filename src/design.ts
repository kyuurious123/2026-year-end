/**
 * 캔버스 디자인 수치 모음.
 * 폰트 크기, 간격, 위치는 전부 여기서 조정하면 됩니다. (단위: px, 캔버스 실제 크기 기준)
 */

export const CANVAS = {
  width: 1300,
  height: 2600,
  background: '#F6F6F6',
  color: '#141212',
  paddingX: 40,
} as const

export const HEADER = {
  year: '2026',
  title: '2026 Year End',

  // "2026 Year End"
  titleTop: 72,
  titleFontSize: 88,
  titleLetterSpacing: 0,

  // 우측 상단 "01 - 03"
  rangeTop: 42,
  rangeFontSize: 20,

  // 상단 구분선
  topRuleY: 190,
} as const

export const CONTENT = {
  // 본문 영역(세 블록이 들어가는 영역)
  top: 230,
  bottom: 2500,
  // 블록 사이 최소 간격
  minGap: 100,
  // 하단 구분선
  bottomRuleY: 2540,
} as const

export const CONTENT_HEIGHT = CONTENT.bottom - CONTENT.top

export const MONTH_LABEL = {
  fontSize: 26,
  // 라벨과 본문 사이 간격
  gap: 40,
} as const

export const BODY = {
  fontSize: 26,
  lineHeight: 44,
  indent: 40,
  letterSpacing: -0.4,
  markerSize: 19,
  markerRadius: 4,
  markerGap: 8,
} as const

export const LIMITS = {
  bodyMaxChars: 1000,
  titleMaxChars: 40,
  subtitleMaxChars: 40,
  bodyWidthMin: 240,
  bodyWidthMax: 1000,
  imageMinWidth: 40,
} as const

export const DEFAULTS = {
  // 좌측 블록(1·3번째 달) / 우측 블록(2번째 달) 기본 본문 폭
  bodyWidthLeft: 470,
  bodyWidthRight: 590,
  // 이미지 업로드 직후 기본 폭
  imageWidth: 320,
} as const

export const IMAGE_PROCESSING = {
  // 업로드 이미지 긴 변 최대 길이
  maxSide: 2000,
  jpegQuality: 0.92,
} as const

export const EXPORT = {
  // 저장 배율. 2 = 2600×5200
  pixelRatio: 2,
  filePrefix: '2026-year-end',
} as const

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

// 모바일 안내를 띄울 화면 폭
export const MIN_DESKTOP_WIDTH = 1024
