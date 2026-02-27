import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import {
  getOverlayableDisciplines,
  getImageEntriesGroupedByDiscipline,
} from '@/entities/project'
import type { NormalizedProjectData } from '@/entities/project'
import { Button } from '@/shared/ui'
import {
  DisciplineOverlayView,
  OverlayLayerTree,
  DrawingPageHeader,
  DrawingPageGuard,
  type OverlayLayer,
} from '@/features/drawing-explorer'
import {
  createInitialOverlayLayers,
  useBackToDrawing,
} from '@/features/drawing-explorer/model'

export interface DisciplineOverlayWidgetProps {
  slug: string | undefined
  drawingId: string | undefined
}

interface DisciplineOverlayContentProps {
  slug: string
  drawingId: string | undefined
  data: NormalizedProjectData
}

function DisciplineOverlayContent({
  slug,
  drawingId,
  data,
}: DisciplineOverlayContentProps) {
  const navigate = useNavigate()
  const handleBackToDrawing = useBackToDrawing(slug)

  const overlayableDisciplines = useMemo(() => {
    if (!data || !drawingId) return []
    return getOverlayableDisciplines(data, drawingId)
  }, [data, drawingId])

  const groups = useMemo(() => {
    if (!data || !drawingId) return []
    const all = getImageEntriesGroupedByDiscipline(data, drawingId)
    const keys = new Set(overlayableDisciplines.map((d) => d.key))
    return all.filter((g) => keys.has(g.disciplineKey))
  }, [data, drawingId, overlayableDisciplines])

  const [layers, setLayers] = useState<OverlayLayer[]>([])

  useEffect(() => {
    if (!overlayableDisciplines.length || !drawingId) return
    setLayers(createInitialOverlayLayers(data ?? null, drawingId, overlayableDisciplines))
  }, [overlayableDisciplines, drawingId, data])

  const updateLayer = (disciplineKey: string, patch: Partial<OverlayLayer>) => {
    setLayers((prev) =>
      prev.map((l) => (l.disciplineKey === disciplineKey ? { ...l, ...patch } : l)),
    )
  }

  const handleReset = () => {
    if (!overlayableDisciplines.length || !data || !drawingId) return
    setLayers(createInitialOverlayLayers(data, drawingId, overlayableDisciplines))
  }

  if (!drawingId || !data.drawings[drawingId]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">도면을 선택해 주세요.</p>
        <Button variant="primary" size="sm" onClick={handleBackToDrawing}>
          도면 보기로 이동
        </Button>
      </div>
    )
  }

  const drawingName = data.drawings[drawingId].name

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <DrawingPageHeader
        backLabel="뒤로가기"
        onBack={() => navigate(-1)}
        title={`공종 겹쳐보기 · ${drawingName}`}
        titleSize="md"
        actions={[
          {
            label: '단일로 보기',
            onClick: handleBackToDrawing,
            variant: 'neutral',
          },
        ]}
      />

      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DisciplineOverlayView
            data={data}
            drawingId={drawingId}
            drawingName={drawingName}
            layers={layers}
          />
        </div>
        <aside className="flex max-h-40 min-h-0 shrink-0 flex-col overflow-y-auto border-t border-gray-200 bg-white sm:max-h-44 md:max-h-48 lg:max-h-none lg:w-64 lg:border-l lg:border-t-0 lg:w-72">
          <OverlayLayerTree
            drawingName={drawingName}
            groups={groups}
            layers={layers}
            onUpdateLayer={updateLayer}
            onReset={handleReset}
          />
        </aside>
      </main>
    </div>
  )
}

export function DisciplineOverlayWidget({ slug, drawingId }: DisciplineOverlayWidgetProps) {
  return (
    <DrawingPageGuard slug={slug}>
      {({ slug: resolvedSlug, data }) => (
        <DisciplineOverlayContent
          slug={resolvedSlug}
          drawingId={drawingId}
          data={data}
        />
      )}
    </DrawingPageGuard>
  )
}
