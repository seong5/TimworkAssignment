import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import type { NormalizedProjectData } from '@/entities/project'
import { getImageForRevision, getPolygonForRevision } from '@/entities/project'
import type { OverlayLayerData } from './OverlayCanvas'
import { OverlayCanvas } from './OverlayCanvas'

const DRAWINGS_BASE = '/data/drawings/'

export interface OverlayLayer {
  disciplineKey: string
  disciplineLabel: string
  revisionVersion: string | null
  opacity: number
  visible: boolean
}

export interface DisciplineOverlayViewProps {
  data: NormalizedProjectData
  drawingId: string
  drawingName: string
  layers: OverlayLayer[]
}

export function DisciplineOverlayView({
  data,
  drawingId,
  drawingName,
  layers,
}: DisciplineOverlayViewProps) {
  const visibleLayers = layers.filter((l) => l.visible)

  if (visibleLayers.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-500 sm:rounded-xl sm:p-8 sm:text-sm">
        공종을 선택해 겹쳐보세요.
      </div>
    )
  }

  const overlayLayerData: OverlayLayerData[] = []
  let allHavePolygon = true

  for (const layer of visibleLayers) {
    const imageFilename = getImageForRevision(
      data,
      drawingId,
      layer.disciplineKey,
      layer.revisionVersion,
    )
    const polygonData = getPolygonForRevision(
      data,
      drawingId,
      layer.disciplineKey,
      layer.revisionVersion,
    )
    if (!imageFilename) continue
    if (!polygonData || polygonData.verticesInRefSpace.length < 3) {
      allHavePolygon = false
      break
    }
    overlayLayerData.push({
      imageSrc: DRAWINGS_BASE + imageFilename,
      verticesInRefSpace: polygonData.verticesInRefSpace,
      imageTransform: polygonData.imageTransform,
      opacity: layer.opacity,
    })
  }

  const overlayContent =
    allHavePolygon && overlayLayerData.length > 0 ? (
      <div className="h-full min-h-0 w-full min-w-0">
        <OverlayCanvas
          layers={overlayLayerData}
          alt={drawingName}
          className="h-full min-h-0 w-full min-w-0"
        />
      </div>
    ) : (
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative h-full w-full">
          {visibleLayers.map((layer) => {
            const imageFilename = getImageForRevision(
              data,
              drawingId,
              layer.disciplineKey,
              layer.revisionVersion,
            )
            const src = imageFilename ? DRAWINGS_BASE + imageFilename : null

            return (
              <div
                key={`${layer.disciplineKey}-${layer.revisionVersion ?? 'base'}`}
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: 'none' }}
              >
                {src ? (
                  <img
                    src={src}
                    alt={`${drawingName} - ${layer.disciplineLabel}`}
                    className="max-h-full max-w-full object-contain object-center"
                    style={{ opacity: layer.opacity }}
                    loading="lazy"
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    )

  const overlayKey = [
    drawingId,
    ...visibleLayers
      .map((l) => `${l.disciplineKey}-${l.revisionVersion ?? 'base'}`)
      .sort(),
  ].join('|')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1 p-1.5 sm:p-3 md:p-4">
      <p className="shrink-0 text-[10px] text-gray-500 sm:text-xs">
        이 구역에서 확대/축소가 가능합니다 (휠로 확대 · 드래그로 이동)
      </p>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50">
        <TransformWrapper key={overlayKey} initialScale={1} minScale={0.5} maxScale={4}>
          <TransformComponent
            wrapperClass="w-full h-full min-h-0 overflow-hidden"
            wrapperStyle={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}
            contentStyle={{
              width: '100%',
              height: '100%',
            }}
          >
            {overlayContent}
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
