import { getFontEmbedCSS, toPng } from 'html-to-image'
import JSZip from 'jszip'
import { CANVAS, EXPORT } from '../design'

let fontCSSCache: string | null = null

async function capture(node: HTMLElement) {
  await document.fonts.ready
  if (!fontCSSCache) fontCSSCache = await getFontEmbedCSS(node)

  const options = {
    width: CANVAS.width,
    height: CANVAS.height,
    pixelRatio: EXPORT.pixelRatio,
    backgroundColor: CANVAS.background,
    fontEmbedCSS: fontCSSCache,
  }
  // 사파리에서 첫 캡처에 폰트·이미지가 빠지는 문제 우회용 워밍업
  await toPng(node, options)
  return toPng(node, options)
}

function download(url: string, filename: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function quarterFileName(q: number) {
  return `${EXPORT.filePrefix}-q${q + 1}.png`
}

export async function exportOne(node: HTMLElement, q: number) {
  const dataUrl = await capture(node)
  download(dataUrl, quarterFileName(q))
}

export async function exportAll(nodes: HTMLElement[]) {
  const zip = new JSZip()
  for (let q = 0; q < nodes.length; q++) {
    const dataUrl = await capture(nodes[q])
    const blob = await (await fetch(dataUrl)).blob()
    zip.file(quarterFileName(q), blob)
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  download(url, `${EXPORT.filePrefix}.zip`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
