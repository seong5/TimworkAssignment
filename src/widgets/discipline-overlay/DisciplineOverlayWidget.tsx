import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useProjectData } from '@/entities/project'
import {
  getOverlayableDisciplines,
  getRevisionsForDiscipline,
  getLatestRevision,
  SPACE_LIST,
} from '@/entities/project'
import { DisciplineOverlayView, type OverlayLayer } from '@/features/drawing-explorer'

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

  const [layers, setLayers] = useState<OverlayLayer[]>([])

  useEffect(() => {
    if (!overlayableDisciplines.length) return
    const initial: OverlayLayer[] = overlayableDisciplines.map((d) => {
      const revs = data ? getRevisionsForDiscipline(data, drawingId!, d.key) : []
      const latest = getLatestRevision(revs)
      const isArchOrMEP =
        d.key === '건축' || d.key === '배관설비' || d.key === '공조설비' || d.key === '설비'
      return {
        disciplineKey: d.key,
        disciplineLabel: d.label,
        revisionVersion: latest?.version ?? null,
        opacity: isArchOrMEP ? 0.8 : 0.6,
        visible: isArchOrMEP,
      }
    })
    setLayers(initial)
  }, [overlayableDisciplines, drawingId, data])

  const updateLayer = (index: number, patch: Partial<OverlayLayer>) => {
    setLayers((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    )
  }

  const handleBackToDrawing = () => {
    navigate(`/drawing/${slug}`)
  }

  if (!slug || !space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">잘못된 공간 경로입니다.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          목록으로
        </button>
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
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          목록으로
        </button>
      </div>
    )
  }

  if (!drawingId || !data.drawings[drawingId]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">
          도면을 선택해 주세요.
        </p>
        <button
          type="button"
          onClick={handleBackToDrawing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          도면 보기로 이동
        </button>
      </div>
    )
  }

  const drawingName = data.drawings[drawingId].name
  const currentRevisions = Object.fromEntries(
    layers.map((l) => [
      l.disciplineKey,
      getRevisionsForDiscipline(data, drawingId, l.disciplineKey),
    ]),
  )

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 text-sm text-gray-500 hover:text-gray-700 sm:text-base"
            aria-label="뒤로가기"
          >
            ← 뒤로가기
          </button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className="min-w-0 truncate text-lg font-bold text-gray-900 sm:text-xl">
            공종 겹쳐보기 · {drawingName}
          </h1>
        </div>
      </header>

      <div className="shrink-0 flex flex-wrap items-start gap-4 border-b border-neutral-200 bg-neutral-50/80 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-4">
          {layers.map((layer, index) => {
            const revs = currentRevisions[layer.disciplineKey] ?? []
            return (
              <div
                key={layer.disciplineKey}
                className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={layer.visible}
                    onChange={(e) => updateLayer(index, { visible: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className="text-sm font-semibold text-neutral-700">
                    {layer.disciplineLabel}
                  </span>
                </label>
                {revs.length > 0 && (
                  <select
                    value={layer.revisionVersion ?? ''}
                    onChange={(e) =>
                      updateLayer(index, {
                        revisionVersion: e.target.value || null,
                      })
                    }
                    className="rounded border border-neutral-200 px-2 py-0.5 text-xs"
                  >
                    <option value="">기본</option>
                    {revs.map((r) => (
                      <option key={r.version} value={r.version}>
                        {r.version}
                      </option>
                    ))}
                  </select>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-500">투명도</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity}
                    onChange={(e) =>
                      updateLayer(index, { opacity: parseFloat(e.target.value) })
                    }
                    className="h-1.5 w-16"
                  />
                  <span className="text-[10px] text-neutral-500">
                    {Math.round(layer.opacity * 100)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={handleBackToDrawing}
          className="self-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          단일 보기로
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DisciplineOverlayView
          data={data}
          drawingId={drawingId}
          drawingName={drawingName}
          layers={layers}
        />
      </main>
    </div>
  )
}
