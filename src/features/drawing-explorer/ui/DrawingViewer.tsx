import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import type { PolygonForRevisionResult } from '@/entities/project'
import { PolygonImageCanvas } from './PolygonImageCanvas'

export interface DrawingViewerProps {
  imageFilename: string | null
  polygonData?: PolygonForRevisionResult | null
  alt?: string
  emptyPlaceholder?: React.ReactNode
}

const DRAWINGS_BASE = '/data/drawings/'

export function DrawingViewer({
  imageFilename,
  polygonData,
  alt = '도면',
  emptyPlaceholder,
}: DrawingViewerProps) {
  if (!imageFilename) {
    if (emptyPlaceholder)
      return (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">{emptyPlaceholder}</div>
      )
    return null
  }

  const src = DRAWINGS_BASE + imageFilename

  const content =
    polygonData && polygonData.verticesInRefSpace.length >= 3 ? (
      <PolygonImageCanvas
        imageSrc={src}
        verticesInRefSpace={polygonData.verticesInRefSpace}
        imageTransform={polygonData.imageTransform}
        polygonVerticesRaw={polygonData.polygonVerticesRaw}
        polygonBaseImageSrc={
          polygonData.polygonBaseImage ? DRAWINGS_BASE + polygonData.polygonBaseImage : undefined
        }
        alt={alt}
        className="max-h-full max-w-full"
      />
    ) : (
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain object-left-top"
        loading="lazy"
      />
    )

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-2">
      <TransformWrapper initialScale={1} minScale={0.5} maxScale={4}>
        <TransformComponent
          wrapperClass="w-full h-full min-h-0 overflow-hidden"
          wrapperStyle={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          {content}
        </TransformComponent>
      </TransformWrapper>
    </div>
  )
}
