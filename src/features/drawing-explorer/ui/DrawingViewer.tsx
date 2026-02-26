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

  if (polygonData && polygonData.verticesInRefSpace.length >= 3) {
    return (
      <div className="flex items-start justify-start overflow-auto p-2">
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
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-start justify-start overflow-auto p-2">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain object-left-top"
        loading="lazy"
      />
    </div>
  )
}
