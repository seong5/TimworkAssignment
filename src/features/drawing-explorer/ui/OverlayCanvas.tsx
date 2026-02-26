import { useEffect, useMemo, useRef, useState } from 'react'
import { getBoundingBox } from '@/entities/project'

export interface OverlayLayerData {
  imageSrc: string
  verticesInRefSpace: number[][]
  imageTransform: { x: number; y: number; scale: number; rotation: number }
  opacity: number
}

export interface OverlayCanvasProps {
  layers: OverlayLayerData[]
  alt?: string
  className?: string
}

/** 여러 레이어를 한 좌표계에 맞춰 polygon 클리핑으로 겹쳐 그립니다 */
export function OverlayCanvas({ layers, alt = '', className = '' }: OverlayCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null)

  const validLayers = useMemo(
    () =>
      layers.filter(
        (l) => l.imageSrc && l.verticesInRefSpace.length >= 3 && l.imageTransform,
      ),
    [layers],
  )
  const imageSrcsKey = useMemo(
    () => validLayers.map((l) => l.imageSrc).join('|'),
    [validLayers],
  )

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
    const map = new Map<string, HTMLImageElement>()
    let pending = validLayers.length
    if (pending === 0) {
      setLoadedImages(map)
      return
    }
    const onDone = () => {
      pending--
      if (pending <= 0) setLoadedImages(new Map(map))
    }
    for (const layer of validLayers) {
      const img = new Image()
      img.onload = () => {
        map.set(layer.imageSrc, img)
        onDone()
      }
      img.onerror = onDone
      img.src = layer.imageSrc
    }
    return () => {
      for (const img of map.values()) {
        img.src = ''
      }
    }
  }, [imageSrcsKey])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !containerSize || validLayers.length === 0) return

    const allVertices: number[][] = []
    for (const l of validLayers) {
      allVertices.push(...l.verticesInRefSpace)
    }
    const [minX, minY, maxX, maxY] = getBoundingBox(allVertices)
    const refW = maxX - minX || 1
    const refH = maxY - minY || 1
    const pad = Math.min(containerSize.w, containerSize.h) * 0.02
    const scaleX = (containerSize.w - pad * 2) / refW
    const scaleY = (containerSize.h - pad * 2) / refH
    const scale = Math.min(scaleX, scaleY, 10)

    canvas.width = containerSize.w
    canvas.height = containerSize.h
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, containerSize.w, containerSize.h)

    for (const layer of validLayers) {
      const img = loadedImages.get(layer.imageSrc)
      if (!img) continue

      ctx.save()
      ctx.globalAlpha = layer.opacity

      ctx.translate(pad, pad)
      ctx.scale(scale, scale)
      ctx.translate(-minX, -minY)

      ctx.beginPath()
      ctx.moveTo(layer.verticesInRefSpace[0][0], layer.verticesInRefSpace[0][1])
      for (let i = 1; i < layer.verticesInRefSpace.length; i++) {
        ctx.lineTo(layer.verticesInRefSpace[i][0], layer.verticesInRefSpace[i][1])
      }
      ctx.closePath()
      ctx.clip()

      const t = layer.imageTransform
      ctx.translate(t.x, t.y)
      ctx.rotate(t.rotation)
      ctx.scale(t.scale, t.scale)
      ctx.drawImage(img, 0, 0)

      ctx.restore()
    }
  }, [validLayers, containerSize, loadedImages])

  if (validLayers.length === 0) return null

  return (
    <div ref={containerRef} className={className} style={{ minHeight: 120 }}>
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className="block max-h-full max-w-full object-contain object-left-top"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
