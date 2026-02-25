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
      <div className="flex min-h-48 flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-500">
        공종을 선택해 겹쳐보세요.
      </div>
    )
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-auto p-2 sm:p-4">
      <div className="relative aspect-[4/3] w-full min-w-[280px] max-w-4xl">
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
