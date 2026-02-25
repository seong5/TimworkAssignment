import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo } from 'react'
import { useProjectData } from '@/entities/project'
import { SpaceTree, Breadcrumb, DrawingViewer } from '@/features/drawing-explorer'
import {
  getImageForSelection,
  getDisciplineLabel,
  getLatestRevision,
  getRevisionChanges,
  getRevisionDate,
  getRevisionsForDiscipline,
  getRootChildIds,
  getDefaultDrawingIdForSlug,
  getBreadcrumbIds,
  getDrawingIdsInOrder,
  getChildDrawingIds,
  getImageEntriesGroupedByDiscipline,
  SPACE_LIST,
  type DrawingDisciplineGroup,
} from '@/entities/project'
import { useDrawingExplorerStore } from '@/features/drawing-explorer/model/drawingExplorerStore'

export interface DrawingExplorerWidgetProps {
  slug: string | undefined
}

export function DrawingExplorerWidget({ slug }: DrawingExplorerWidgetProps) {
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null

  const { data, loading, error } = useProjectData()
  const {
    selection,
    setSelection,
    resetSelection,
    setDrawingId,
  } = useDrawingExplorerStore()

  useEffect(() => {
    resetSelection()
  }, [resetSelection, slug])

  useEffect(() => {
    if (!data || selection.drawingId !== null) return
    const defaultBySlug = slug ? getDefaultDrawingIdForSlug(slug) : null
    const rootChildIds = getRootChildIds(data)
    const defaultDrawingId = defaultBySlug ?? rootChildIds[0] ?? Object.keys(data.drawings)[0]
    if (defaultDrawingId) {
      setDrawingId(defaultDrawingId)
    }
  }, [data, slug, selection.drawingId, setDrawingId])

  const isCurrentLatestRevision = useMemo(() => {
    if (!data || !selection.drawingId || !selection.disciplineKey) return false
    const revisions = getRevisionsForDiscipline(data, selection.drawingId, selection.disciplineKey)
    if (revisions.length === 0) return selection.revisionVersion === null
    const latest = getLatestRevision(revisions)
    return latest?.version === selection.revisionVersion
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

  const handleSelectDrawing = useCallback(
    (drawingId: string) => setDrawingId(drawingId),
    [setDrawingId],
  )

  const currentRevisions = useMemo(() => {
    if (!data || !selection.drawingId || !selection.disciplineKey) return []
    return getRevisionsForDiscipline(
      data,
      selection.drawingId,
      selection.disciplineKey,
    )
  }, [data, selection.drawingId, selection.disciplineKey])

  const canCompare =
    !!selection.drawingId &&
    !!selection.disciplineKey &&
    currentRevisions.length >= 1

  const handleEnterCompare = useCallback(() => {
    if (!slug || !selection.drawingId || !selection.disciplineKey) return
    const revs = currentRevisions
    const latest = getLatestRevision(revs)
    const right = latest?.version ?? revs[0]?.version ?? ''
    const params = new URLSearchParams({
      drawing: selection.drawingId,
      discipline: selection.disciplineKey,
    })
    if (right) params.set('right', right)
    navigate(`/drawing/${slug}/compare?${params.toString()}`)
  }, [currentRevisions, navigate, selection.drawingId, selection.disciplineKey, slug])

  const handleSelectImage = useCallback(
    (drawingId: string, disciplineKey: string, revisionVersion: string | null) => {
      setSelection({ drawingId, disciplineKey, revisionVersion })
    },
    [setSelection],
  )

  const breadcrumbPathIds = useMemo(
    () => (data && selection.drawingId ? getBreadcrumbIds(data, selection.drawingId) : []),
    [data, selection.drawingId],
  )
  const drawingNames = useMemo(
    () =>
      data ? Object.fromEntries(Object.entries(data.drawings).map(([id, d]) => [id, d.name])) : {},
    [data],
  )

  const { rootDrawing, childDrawings, disciplinesByDrawingId, allowedDrawingIds } = useMemo(() => {
    if (!data) {
      return {
        rootDrawing: null as { id: string; name: string } | null,
        childDrawings: [] as { id: string; name: string }[],
        disciplinesByDrawingId: {} as Record<string, DrawingDisciplineGroup[]>,
        allowedDrawingIds: [] as string[],
      }
    }
    if (space) {
      const rootId = space.id
      const childIds = getChildDrawingIds(data, rootId)
      const rootDrawing: { id: string; name: string } = {
        id: rootId,
        name: data.drawings[rootId].name,
      }
      const childDrawings = childIds.map((id) => ({
        id,
        name: data.drawings[id].name,
      }))
      const allDrawingIds = [rootId, ...childIds]
      const disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]> = {}
      for (const id of allDrawingIds) {
        disciplinesByDrawingId[id] = getImageEntriesGroupedByDiscipline(data, id)
      }
      return {
        rootDrawing,
        childDrawings,
        disciplinesByDrawingId,
        allowedDrawingIds: allDrawingIds,
      }
    }
    const ids = getDrawingIdsInOrder(data)
    const rootId = ids[0] ?? null
    const childIds = ids.filter((id) => data.drawings[id].parent === rootId)
    const rootDrawing: { id: string; name: string } | null = rootId
      ? { id: rootId, name: data.drawings[rootId].name }
      : null
    const childDrawings = childIds.map((id) => ({
      id,
      name: data.drawings[id].name,
    }))
    const allDrawingIds = rootId ? [rootId, ...childIds] : childIds
    const disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]> = {}
    for (const id of allDrawingIds) {
      disciplinesByDrawingId[id] = getImageEntriesGroupedByDiscipline(data, id)
    }
    return {
      rootDrawing,
      childDrawings,
      disciplinesByDrawingId,
      allowedDrawingIds: allDrawingIds,
    }
  }, [data, space])

  useEffect(() => {
    if (!data || !space || allowedDrawingIds.length === 0) return
    if (selection.drawingId !== null && !allowedDrawingIds.includes(selection.drawingId)) {
      setDrawingId(space.id)
    }
  }, [allowedDrawingIds, data, selection.drawingId, setDrawingId, space])

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
        <p className="text-center text-sm text-red-600 sm:text-base">데이터를 불러올 수 없습니다. {error?.message}</p>
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

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="shrink-0 text-base text-gray-500 hover:text-gray-700 sm:text-[20px]"
            aria-label="도면 목록으로"
          >
            ← 도면 목록
          </button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className="min-w-0 truncate text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-[30px]">
            {selection.drawingId ? data.drawings[selection.drawingId].name : data.project.name}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* PC 이상: 좌측 사이드바 트리 */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-white lg:block xl:w-80">
          <div className="py-2">
            <h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              공간(건물)
            </h2>
            <SpaceTree
              rootDrawing={rootDrawing}
              childDrawings={childDrawings}
              disciplinesByDrawingId={disciplinesByDrawingId}
              selectedDrawingId={selection.drawingId}
              onSelectDrawing={handleSelectDrawing}
              onSelectImage={handleSelectImage}
            />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selection.drawingId ? (
            <>
              <div className="shrink-0 p-2 sm:p-2">
                <Breadcrumb
                  pathIds={breadcrumbPathIds}
                  drawingNames={drawingNames}
                  drawingId={selection.drawingId}
                  onSelectDrawing={handleSelectDrawing}
                  disciplineLabel={getDisciplineLabel(
                    data,
                    selection.drawingId,
                    selection.disciplineKey,
                  )}
                  revisionVersion={selection.revisionVersion}
                  revisionDate={getRevisionDate(
                    data,
                    selection.drawingId,
                    selection.disciplineKey,
                    selection.revisionVersion,
                  )}
                  revisionChanges={getRevisionChanges(
                    data,
                    selection.drawingId,
                    selection.disciplineKey,
                    selection.revisionVersion,
                  )}
                  trailing={
                    (isCurrentLatestRevision || canCompare) ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {isCurrentLatestRevision && (
                          <span
                            className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 sm:px-2.5 sm:py-1"
                            title="현재 보고 있는 도면은 이 공종의 최신 리비전입니다"
                          >
                            ★ 최신 도면
                          </span>
                        )}
                        {canCompare && (
                          <button
                            type="button"
                            onClick={handleEnterCompare}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 sm:px-3 sm:text-sm"
                          >
                            리비전 비교
                          </button>
                        )}
                      </div>
                    ) : undefined
                  }
                />
              </div>
              <DrawingViewer
                imageFilename={getImageForSelection(data, selection)}
                alt={data.drawings[selection.drawingId].name}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <p className="text-center text-sm text-gray-500 sm:text-base">
                <span className="lg:hidden">하단 트리에서 </span>
                공간(도면)을 선택하세요. 상단 브레드크럼과 컨텍스트 바에서 현재 위치와
                공종·리비전을 확인·선택할 수 있습니다.
              </p>
            </div>
          )}

          {/* 모바일/태블릿: 하단 트리 영역 */}
          <section className="border-t border-gray-200 bg-white/90 px-2 py-2 shadow-inner sm:px-3 sm:py-3 lg:hidden">
            <h2 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              공간(건물)
            </h2>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              <SpaceTree
                rootDrawing={rootDrawing}
                childDrawings={childDrawings}
                disciplinesByDrawingId={disciplinesByDrawingId}
                selectedDrawingId={selection.drawingId}
                onSelectDrawing={handleSelectDrawing}
                onSelectImage={handleSelectImage}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
