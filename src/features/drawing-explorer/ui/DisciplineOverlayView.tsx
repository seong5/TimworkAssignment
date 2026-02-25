import type { NormalizedProjectData } from '@/entities/project'
import { getImageForRevision } from '@/entities/project'

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
      <div className="flex min-h-32 flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-500 sm:min-h-48 sm:rounded-xl sm:p-8 sm:text-sm">
        공종을 선택해 겹쳐보세요.
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-auto p-1.5 sm:p-3 md:p-4">
      <div className="relative mx-auto aspect-[4/3] w-full min-w-0 max-w-4xl shrink-0">
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
              className="absolute inset-0 flex items-start justify-start"
              style={{ pointerEvents: 'none' }}
            >
              {src ? (
                <img
                  src={src}
                  alt={`${drawingName} - ${layer.disciplineLabel}`}
                  className="max-h-full max-w-full object-contain object-left-top"
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
}
