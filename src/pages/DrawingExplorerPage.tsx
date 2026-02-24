import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useProjectData } from '@/shared/hooks/useProjectData'
import {
  SpaceTree,
  Breadcrumb,
  DrawingViewer,
  RevisionCompareView,
} from '@/features/drawing-explorer'
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
} from '@/shared/lib/normalizedDrawings'
import type { DrawingDisciplineGroup } from '@/shared/lib/normalizedDrawings'
import { SPACE_LIST } from '@/shared/lib/normalizedDrawings'

export function DrawingExplorerPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null

  const { data, loading, error } = useProjectData()
  const [selection, setSelection] = useState<{
    drawingId: string | null
    disciplineKey: string | null
    revisionVersion: string | null
  }>({
    drawingId: null,
    disciplineKey: null,
    revisionVersion: null,
  })
  const [compareMode, setCompareMode] = useState(false)
  const [compareLeft, setCompareLeft] = useState<string | null>(null)
  const [compareRight, setCompareRight] = useState<string | null>(null)

  useEffect(() => {
    setSelection({ drawingId: null, disciplineKey: null, revisionVersion: null })
  }, [slug])

  useEffect(() => {
    if (!data || selection.drawingId !== null) return
    const defaultBySlug = slug ? getDefaultDrawingIdForSlug(slug) : null
    const rootChildIds = getRootChildIds(data)
    const defaultDrawingId = defaultBySlug ?? rootChildIds[0] ?? Object.keys(data.drawings)[0]
    if (defaultDrawingId) {
      setSelection((prev) => ({ ...prev, drawingId: defaultDrawingId }))
    }
  }, [data, slug, selection.drawingId])

  // 공종 변경 시 해당 공종의 최신 리비전으로 설정 (정책: 항상 최신으로 초기화)
  useEffect(() => {
    if (
      !data ||
      !selection.drawingId ||
      !selection.disciplineKey ||
      selection.revisionVersion !== null
    )
      return
    const revisions = getRevisionsForDiscipline(data, selection.drawingId, selection.disciplineKey)
    const latest = getLatestRevision(revisions)
    if (latest) {
      setSelection((prev) => ({ ...prev, revisionVersion: latest.version }))
    }
    // 리비전이 0개인 공종(기본 이미지만 있음)은 revisionVersion null 유지 = 최신으로 간주
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

  /** 현재 선택이 "최신"인가. 리비전 0개 공종에서 기본 이미지(revisionVersion null)도 최신으로 간주한다. */
  const isCurrentLatestRevision = useMemo(() => {
    if (!data || !selection.drawingId || !selection.disciplineKey) return false
    const revisions = getRevisionsForDiscipline(data, selection.drawingId, selection.disciplineKey)
    if (revisions.length === 0) return selection.revisionVersion === null
    const latest = getLatestRevision(revisions)
    return latest?.version === selection.revisionVersion
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

  const handleSelectDrawing = useCallback((drawingId: string) => {
    setCompareMode(false)
    setSelection((prev) => ({
      ...prev,
      drawingId,
      disciplineKey: null,
      revisionVersion: null,
    }))
  }, [])

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
    setCompareMode(true)
    const revs = currentRevisions
    const latest = getLatestRevision(revs)
    setCompareLeft(null)
    setCompareRight(latest?.version ?? revs[0]?.version ?? null)
  }, [currentRevisions])

  const handleSelectImage = useCallback(
    (drawingId: string, disciplineKey: string, revisionVersion: string | null) => {
      setSelection({ drawingId, disciplineKey, revisionVersion })
    },
    [],
  )

  // —— Breadcrumb: pathIds + drawingNames (drawings만 사용)
  const breadcrumbPathIds = useMemo(
    () => (data && selection.drawingId ? getBreadcrumbIds(data, selection.drawingId) : []),
    [data, selection.drawingId],
  )
  const drawingNames = useMemo(
    () =>
      data ? Object.fromEntries(Object.entries(data.drawings).map(([id, d]) => [id, d.name])) : {},
    [data],
  )

  // —— SpaceTree: slug가 있으면 해당 구역(101동 등)만, 없으면 전체. 공종(discipline) 단위로 세분화
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

  // slug(구역) 진입 시 선택이 해당 구역 도면이 아니면 구역 루트로 맞춤
  useEffect(() => {
    if (!data || !space || allowedDrawingIds.length === 0) return
    if (selection.drawingId !== null && !allowedDrawingIds.includes(selection.drawingId)) {
      setSelection((prev) => ({
        ...prev,
        drawingId: space.id,
        disciplineKey: null,
        revisionVersion: null,
      }))
    }
  }, [data, space, allowedDrawingIds, selection.drawingId])

  if (!slug || !space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">잘못된 공간 경로입니다.</p>
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">도면 데이터를 불러오는 중…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-red-600">데이터를 불러올 수 없습니다. {error?.message}</p>
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
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[20px] text-gray-500 hover:text-gray-700"
          >
            ← 도면 목록
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-[30px] font-bold text-gray-900">
            {selection.drawingId ? data.drawings[selection.drawingId].name : data.project.name}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
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

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {selection.drawingId ? (
            compareMode && selection.disciplineKey ? (
              <>
                <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50/80 px-4 py-2">
                  <span className="text-xs font-semibold text-neutral-500">기준(왼쪽)</span>
                  <select
                    value={compareLeft ?? ''}
                    onChange={(e) => setCompareLeft(e.target.value || null)}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                    aria-label="비교 기준 리비전"
                  >
                    <option value="">기본</option>
                    {currentRevisions.map((r) => (
                      <option key={r.version} value={r.version}>
                        {r.version} ({r.date})
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-semibold text-neutral-500">비교(오른쪽)</span>
                  <select
                    value={compareRight ?? ''}
                    onChange={(e) => setCompareRight(e.target.value || null)}
                    className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                    aria-label="비교 대상 리비전"
                  >
                    <option value="">기본</option>
                    {currentRevisions.map((r) => (
                      <option key={r.version} value={r.version}>
                        {r.version} ({r.date})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setCompareMode(false)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    단일 보기로
                  </button>
                </div>
                <RevisionCompareView
                  data={data}
                  drawingId={selection.drawingId}
                  disciplineKey={selection.disciplineKey}
                  leftVersion={compareLeft}
                  rightVersion={compareRight}
                  drawingName={data.drawings[selection.drawingId].name}
                />
              </>
            ) : (
              <>
                <div className="shrink-0 p-2">
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
                        <div className="flex items-center gap-2">
                          {isCurrentLatestRevision && (
                            <span
                              className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                              title="현재 보고 있는 도면은 이 공종의 최신 리비전입니다"
                            >
                              ★ 최신 도면
                            </span>
                          )}
                          {canCompare &&
                            (!compareMode ? (
                              <button
                                type="button"
                                onClick={handleEnterCompare}
                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                              >
                                리비전 비교
                              </button>
                            ) : (
                              <>
                                <span className="text-xs font-semibold text-neutral-500">
                                  기준(왼쪽)
                                </span>
                                <select
                                  value={compareLeft ?? ''}
                                  onChange={(e) =>
                                    setCompareLeft(e.target.value || null)
                                  }
                                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                                  aria-label="비교 기준 리비전"
                                >
                                  <option value="">기본</option>
                                  {currentRevisions.map((r) => (
                                    <option key={r.version} value={r.version}>
                                      {r.version} ({r.date})
                                    </option>
                                  ))}
                                </select>
                                <span className="text-xs font-semibold text-neutral-500">
                                  비교(오른쪽)
                                </span>
                                <select
                                  value={compareRight ?? ''}
                                  onChange={(e) =>
                                    setCompareRight(e.target.value || null)
                                  }
                                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm"
                                  aria-label="비교 대상 리비전"
                                >
                                  <option value="">기본</option>
                                  {currentRevisions.map((r) => (
                                    <option key={r.version} value={r.version}>
                                      {r.version} ({r.date})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setCompareMode(false)}
                                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                                >
                                  단일 보기로
                                </button>
                              </>
                            ))}
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
            )
          ) : (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-gray-500">
                화면 좌측에서 공간(도면)을 선택하세요. 상단 브레드크럼과 컨텍스트 바에서 현재 위치와
                공종·리비전을 확인·선택할 수 있습니다.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
