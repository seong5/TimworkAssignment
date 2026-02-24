import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useProjectData } from '@/shared/hooks/useProjectData'
import {
  SpaceTree,
  ContextBar,
  Breadcrumb,
  DrawingViewer,
  type SelectionState,
  type DrawingImageEntry,
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
  getDisciplineOptionsForDrawing,
  getImageEntriesForDrawing,
} from '@/shared/lib/normalizedDrawings'
import { SPACE_LIST } from '@/shared/lib/normalizedDrawings'

export function DrawingExplorerPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null

  const { data, loading, error } = useProjectData()
  const [selection, setSelection] = useState<SelectionState>({
    drawingId: null,
    disciplineKey: null,
    revisionVersion: null,
  })

  useEffect(() => {
    setSelection({ drawingId: null, disciplineKey: null, revisionVersion: null })
  }, [slug])

  useEffect(() => {
    if (!data || selection.drawingId !== null) return
    const defaultBySlug = slug ? getDefaultDrawingIdForSlug(slug) : null
    const rootChildIds = getRootChildIds(data)
    const defaultDrawingId =
      defaultBySlug ?? rootChildIds[0] ?? Object.keys(data.drawings)[0]
    if (defaultDrawingId) {
      setSelection((prev) => ({ ...prev, drawingId: defaultDrawingId }))
    }
  }, [data, slug, selection.drawingId])

  useEffect(() => {
    if (
      !data ||
      !selection.drawingId ||
      !selection.disciplineKey ||
      selection.revisionVersion !== null
    )
      return
    const revisions = getRevisionsForDiscipline(
      data,
      selection.drawingId,
      selection.disciplineKey,
    )
    const latest = getLatestRevision(revisions)
    if (latest) {
      setSelection((prev) => ({ ...prev, revisionVersion: latest.version }))
    }
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

  const isCurrentLatestRevision = useMemo(() => {
    if (!data || !selection.drawingId || !selection.disciplineKey || !selection.revisionVersion)
      return false
    const revisions = getRevisionsForDiscipline(
      data,
      selection.drawingId,
      selection.disciplineKey,
    )
    const latest = getLatestRevision(revisions)
    return latest?.version === selection.revisionVersion
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

  const handleSelectDrawing = useCallback((drawingId: string) => {
    setSelection((prev) => ({
      ...prev,
      drawingId,
      disciplineKey: null,
      revisionVersion: null,
    }))
  }, [])

  const handleDisciplineChange = useCallback((key: string | null) => {
    setSelection((prev) => ({ ...prev, disciplineKey: key, revisionVersion: null }))
  }, [])

  const handleRevisionChange = useCallback((version: string | null) => {
    setSelection((prev) => ({ ...prev, revisionVersion: version }))
  }, [])

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
      data
        ? Object.fromEntries(
            Object.entries(data.drawings).map(([id, d]) => [id, d.name]),
          )
        : {},
    [data],
  )

  // —— SpaceTree: rootDrawing, childDrawings, entriesByDrawingId
  const { rootDrawing, childDrawings, entriesByDrawingId } = useMemo(() => {
    if (!data) {
      return {
        rootDrawing: null as { id: string; name: string } | null,
        childDrawings: [] as { id: string; name: string }[],
        entriesByDrawingId: {} as Record<string, DrawingImageEntry[]>,
      }
    }
    const ids = getDrawingIdsInOrder(data)
    const rootId = ids[0] ?? null
    const childIds = ids.filter((id) => data.drawings[id].parent === rootId)
    const rootDrawing: { id: string; name: string } | null =
      rootId ? { id: rootId, name: data.drawings[rootId].name } : null
    const childDrawings = childIds.map((id) => ({
      id,
      name: data.drawings[id].name,
    }))
    const allDrawingIds = rootId ? [rootId, ...childIds] : childIds
    const entriesByDrawingId: Record<string, DrawingImageEntry[]> = {}
    for (const id of allDrawingIds) {
      entriesByDrawingId[id] = getImageEntriesForDrawing(data, id)
    }
    return { rootDrawing, childDrawings, entriesByDrawingId }
  }, [data])

  // —— ContextBar: 공종/리비전 옵션 및 파생 상태 전부 페이지에서 계산
  const contextBarProps = useMemo((): Omit<
    import('@/features/drawing-explorer').ContextBarProps,
    'onDisciplineChange' | 'onRevisionChange'
  > => {
    if (!data || !selection.drawingId) {
      return {
        drawingName: null,
        disciplineOptions: [],
        selectedDisciplineSelectValue: '',
        disciplineKey: selection.disciplineKey,
        revisions: [],
        revisionVersion: selection.revisionVersion,
        latestRevision: null,
        showRegionSelect: false,
        regionKeys: [],
        keyPrefix: '',
        currentRegionKey: '',
        revisionEmptyMessage: '—',
      }
    }
    const drawingName = data.drawings[selection.drawingId].name
    const disciplineOptions = getDisciplineOptionsForDrawing(data, selection.drawingId)
    const selectedDisciplineOption = disciplineOptions.find(
      (o) =>
        o.key === selection.disciplineKey ||
        (o.keyPrefix && selection.disciplineKey?.startsWith(o.keyPrefix + '.')),
    )
    const showRegionSelect =
      !!(
        selectedDisciplineOption?.hasRegions &&
        selectedDisciplineOption.regionKeys?.length
      )
    const effectiveDisciplineKey =
      showRegionSelect && selection.disciplineKey === selectedDisciplineOption?.key
        ? null
        : selection.disciplineKey
    const regionKeys = selectedDisciplineOption?.regionKeys ?? []
    const keyPrefix = selectedDisciplineOption?.keyPrefix ?? ''
    const currentRegionKey =
      keyPrefix && selection.disciplineKey?.startsWith(keyPrefix + '.')
        ? selection.disciplineKey.slice((keyPrefix + '.').length)
        : ''
    const revisions = effectiveDisciplineKey
      ? getRevisionsForDiscipline(data, selection.drawingId, effectiveDisciplineKey)
      : []
    const latestRevision = getLatestRevision(revisions) ?? null
    const selectedDisciplineSelectValue =
      selectedDisciplineOption?.key ?? selection.disciplineKey ?? ''
    let revisionEmptyMessage = '—'
    if (showRegionSelect && !currentRegionKey)
      revisionEmptyMessage = '영역(A/B)을 선택하면 리비전이 표시됩니다'
    else if (effectiveDisciplineKey) revisionEmptyMessage = '리비전을 선택하세요'

    return {
      drawingName,
      disciplineOptions,
      selectedDisciplineSelectValue,
      disciplineKey: selection.disciplineKey,
      revisions,
      revisionVersion: selection.revisionVersion,
      latestRevision,
      showRegionSelect,
      regionKeys,
      keyPrefix,
      currentRegionKey,
      revisionEmptyMessage,
    }
  }, [data, selection.drawingId, selection.disciplineKey, selection.revisionVersion])

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
            {selection.drawingId
              ? data.drawings[selection.drawingId].name
              : data.project.name}
          </h1>
        </div>
        <div className="mt-2">
          <ContextBar
            {...contextBarProps}
            onDisciplineChange={handleDisciplineChange}
            onRevisionChange={handleRevisionChange}
          />
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
              entriesByDrawingId={entriesByDrawingId}
              selectedDrawingId={selection.drawingId}
              onSelectDrawing={handleSelectDrawing}
              onSelectImage={handleSelectImage}
            />
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {selection.drawingId ? (
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
                />
                {isCurrentLatestRevision && (
                  <div className="mt-2 flex items-center justify-start">
                    <span
                      className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                      title="현재 보고 있는 도면은 이 공종의 최신 리비전입니다"
                    >
                      ★ 최신 도면
                    </span>
                  </div>
                )}
              </div>
              <DrawingViewer
                imageFilename={getImageForSelection(data, selection)}
                alt={data.drawings[selection.drawingId].name}
              />
            </>
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
