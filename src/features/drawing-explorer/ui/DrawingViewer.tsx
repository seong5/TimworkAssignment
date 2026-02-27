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
        className="h-full w-full min-h-0 min-w-0"
      />
    ) : (
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain object-center"
        loading="lazy"
      />
    )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 p-2 sm:p-2">
      <p className="shrink-0 text-[10px] text-[#E69100] sm:text-xs">
        이 구역에서 확대/축소가 가능합니다 (휠로 확대 · 드래그로 이동)
      </p>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border-2 border-[#E69100]/60 bg-gray-50">
        <TransformWrapper key={imageFilename} initialScale={1} minScale={0.5} maxScale={4}>
          <TransformComponent
            wrapperClass="w-full h-full min-h-0 overflow-hidden"
            wrapperStyle={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}
            contentStyle={{
              width: '100%',
              height: '100%',
              minHeight: 0,
              minWidth: 0,
            }}
          >
            <div className="h-full w-full min-h-0 min-w-0">{content}</div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
