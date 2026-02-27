import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useProjectData } from '@/entities/project'
import {
  getOverlayableDisciplines,
  getImageEntriesGroupedByDiscipline,
  SPACE_LIST,
} from '@/entities/project'
import { Button } from '@/shared/ui'
import {
  DisciplineOverlayView,
  OverlayLayerTree,
  DrawingPageHeader,
  type OverlayLayer,
} from '@/features/drawing-explorer'
import { createInitialOverlayLayers } from '@/features/drawing-explorer/model'

export interface DisciplineOverlayWidgetProps {
  slug: string | undefined
  drawingId: string | undefined
}

export function DisciplineOverlayWidget({ slug, drawingId }: DisciplineOverlayWidgetProps) {
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null
  const { data, loading, error } = useProjectData()

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

  const handleBackToDrawing = () => {
    navigate(`/drawing/${slug}`)
  }

  if (!slug || !space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">잘못된 공간 경로입니다.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-500 sm:text-base">도면 데이터를 불러오는 중…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-red-600 sm:text-base">
          데이터를 불러올 수 없습니다. {error?.message}
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
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

      <main className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DisciplineOverlayView
            data={data}
            drawingId={drawingId}
            drawingName={drawingName}
            layers={layers}
          />
        </div>
        <aside className="flex max-h-56 shrink-0 flex-col overflow-y-auto border-t border-gray-200 bg-white md:max-h-none md:w-64 md:border-l md:border-t-0 lg:w-72">
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
