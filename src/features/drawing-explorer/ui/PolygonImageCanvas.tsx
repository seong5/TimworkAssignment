import { useEffect, useMemo, useRef, useState } from 'react'
import type { ImageTransform } from '@/entities/project'
import { getBoundingBox, transformPolygon } from '@/entities/project'

export interface PolygonImageCanvasProps {
  imageSrc: string
  verticesInRefSpace: number[][]
  imageTransform: ImageTransform
  polygonVerticesRaw?: number[][]
  polygonBaseImageSrc?: string
  opacity?: number
  alt?: string
  className?: string
}

/**
 * polygon vertices를 현재 이미지 크기에 맞춰 스케일링합니다.
 * polygon이 기준 이미지 픽셀 좌표로 정의된 경우, 현재 이미지 크기 비율로 변환합니다.
 */
function scaleVerticesToImage(
  vertices: number[][],
  baseW: number,
  baseH: number,
  currentW: number,
  currentH: number,
): number[][] {
  if (baseW <= 0 || baseH <= 0) return vertices
  const sx = currentW / baseW
  const sy = currentH / baseH
  return vertices.map(([x, y]) => [x * sx, y * sy])
}

/**
 * Canvas 2D로 polygon 영역만 클리핑해 이미지를 렌더링합니다.
 * polygonBaseImageSrc가 제공되면 기준 이미지와 현재 이미지 크기 비율로 vertices를 스케일링합니다.
 */
export function PolygonImageCanvas({
  imageSrc,
  verticesInRefSpace,
  imageTransform,
  polygonVerticesRaw,
  polygonBaseImageSrc,
  opacity = 1,
  alt = '',
  className = '',
}: PolygonImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null)
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 0, height: 0 }
      if (width > 0 && height > 0) setContainerSize({ w: Math.floor(width), h: Math.floor(height) })
    })
    ro.observe(el)
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) setContainerSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) })
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = imageSrc
    return () => {
      image.onload = null
      image.src = ''
    }
  }, [imageSrc])

  useEffect(() => {
    if (!polygonBaseImageSrc) {
      setBaseImg(null)
      return
    }
    const image = new Image()
    image.onload = () => setBaseImg(image)
    image.src = polygonBaseImageSrc
    return () => {
      image.onload = null
      image.src = ''
      setBaseImg(null)
    }
  }, [polygonBaseImageSrc])

  const effectiveVertices = useMemo(() => {
    if (
      polygonVerticesRaw &&
      polygonVerticesRaw.length >= 3 &&
      polygonBaseImageSrc &&
      img &&
      baseImg &&
      (img.naturalWidth !== baseImg.naturalWidth || img.naturalHeight !== baseImg.naturalHeight)
    ) {
      const scaled = scaleVerticesToImage(
        polygonVerticesRaw,
        baseImg.naturalWidth,
        baseImg.naturalHeight,
        img.naturalWidth,
        img.naturalHeight,
      )
      return transformPolygon(scaled, imageTransform)
    }
    return verticesInRefSpace
  }, [
    polygonVerticesRaw,
    polygonBaseImageSrc,
    img,
    baseImg,
    verticesInRefSpace,
    imageTransform,
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !img || !containerSize || effectiveVertices.length < 3) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const [minX, minY, maxX, maxY] = getBoundingBox(effectiveVertices)
    const refW = maxX - minX || 1
    const refH = maxY - minY || 1
    const pad = Math.min(containerSize.w, containerSize.h) * 0.005
    const scaleX = (containerSize.w - pad * 2) / refW
    const scaleY = (containerSize.h - pad * 2) / refH
    const scale = Math.min(scaleX, scaleY, 10)

    canvas.width = containerSize.w
    canvas.height = containerSize.h
    ctx.clearRect(0, 0, containerSize.w, containerSize.h)
    ctx.globalAlpha = opacity

    ctx.save()
    ctx.translate(pad, pad)
    ctx.scale(scale, scale)
    ctx.translate(-minX, -minY)

    ctx.beginPath()
    ctx.moveTo(effectiveVertices[0][0], effectiveVertices[0][1])
    for (let i = 1; i < effectiveVertices.length; i++) {
      ctx.lineTo(effectiveVertices[i][0], effectiveVertices[i][1])
    }
    ctx.closePath()
    ctx.clip()

    const t = imageTransform
    ctx.translate(t.x, t.y)
    ctx.rotate(t.rotation)
    ctx.scale(t.scale, t.scale)
    ctx.drawImage(img, 0, 0)

    ctx.restore()
    ctx.globalAlpha = 1
  }, [img, containerSize, effectiveVertices, imageTransform, opacity])

  return (
    <div ref={containerRef} className={`min-h-[70vh] min-w-full ${className}`}>
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className="block w-full h-full object-contain object-left-top"
      />
    </div>
  )
}
