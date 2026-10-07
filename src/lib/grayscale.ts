import { CANVAS, IMAGE_PROCESSING } from '../design'

export interface ProcessedImage {
  src: string
  naturalWidth: number
  naturalHeight: number
}

/**
 * 업로드한 이미지를 리사이즈 + 흑백 변환해서 data URL로 돌려줍니다.
 * CSS filter가 아니라 픽셀 자체를 바꾸기 때문에 PNG 저장 시에도 확실히 흑백으로 나옵니다.
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('이 형식의 이미지는 열 수 없어요. JPG나 PNG로 올려 주세요.')
  }

  const scale = Math.min(1, IMAGE_PROCESSING.maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지를 처리하지 못했어요. 다시 시도해 주세요.')

  // 투명 PNG는 캔버스 배경색 위에 얹어서 검게 변하지 않게
  ctx.fillStyle = CANVAS.background
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const imageData = ctx.getImageData(0, 0, width, height)
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = y
  }
  ctx.putImageData(imageData, 0, 0)

  return {
    src: canvas.toDataURL('image/jpeg', IMAGE_PROCESSING.jpegQuality),
    naturalWidth: width,
    naturalHeight: height,
  }
}
