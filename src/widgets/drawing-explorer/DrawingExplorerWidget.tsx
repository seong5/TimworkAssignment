import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useProjectData } from '@/entities/project'
import { SpaceTree, Breadcrumb, DrawingViewer } from '@/features/drawing-explorer'
import {
  getImageForSelection,
  getDisciplineLabel,
  getLatestRevision,
  getRevisionChanges,
  getRevisionDescription,
  getRevisionDate,
  getRevisionsForDiscipline,
  getBreadcrumbIds,
  getOverlayableDisciplines,
  SPACE_LIST,
} from '@/entities/project'
import {
  useDrawingExplorerStore,
  useDrawingExplorerInit,
  useDrawingTreeData,
  useDrawingSearch,
  buildBreadcrumbPath,
} from '@/features/drawing-explorer/model'

export interface DrawingExplorerWidgetProps {
  slug: string | undefined
  initialDrawingId?: string
  initialDisciplineKey?: string
  initialRevisionVersion?: string
}

export function DrawingExplorerWidget({
  slug,
  initialDrawingId,
  initialDisciplineKey,
  initialRevisionVersion,
}: DrawingExplorerWidgetProps) {
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null

  const { data, loading, error } = useProjectData()
  const { selection, setSelection, setDrawingId } = useDrawingExplorerStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const clearSearchAndClose = useCallback(() => {
    setSearchQuery('')
    setIsSearchOpen(false)
  }, [])

  const { rootDrawing, childDrawings, disciplinesByDrawingId, allowedDrawingIds } =
    useDrawingTreeData(data, space ?? null)

  useDrawingExplorerInit({
    slug,
    initialDrawingId,
    initialDisciplineKey,
    initialRevisionVersion,
    data,
    allowedDrawingIds,
    spaceId: space?.id ?? null,
  })

  const { filteredSearchResults, handleSelectFromSearch } = useDrawingSearch(
    data,
    allowedDrawingIds,
    searchQuery,
    clearSearchAndClose,
  )

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentRevisions = useMemo(() => {
    if (!data || !selection.drawingId || !selection.disciplineKey) return []
    return getRevisionsForDiscipline(data, selection.drawingId, selection.disciplineKey)
  }, [data, selection.drawingId, selection.disciplineKey])

  const canCompare =
    !!selection.drawingId && !!selection.disciplineKey && currentRevisions.length >= 1

  const overlayableCount = useMemo(() => {
    if (!data || !selection.drawingId) return 0
    return getOverlayableDisciplines(data, selection.drawingId).length
  }, [data, selection.drawingId])

  const canOverlay = !!selection.drawingId && overlayableCount >= 2

  const handleEnterOverlay = useCallback(() => {
    if (!slug || !selection.drawingId) return
    navigate(`/drawing/${slug}/overlay?drawing=${encodeURIComponent(selection.drawingId)}`)
  }, [navigate, slug, selection.drawingId])

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
  const breadcrumbData = useMemo(
    () =>
      buildBreadcrumbPath({
        pathIds: breadcrumbPathIds,
        drawingNames,
        drawingId: selection.drawingId,
        disciplineLabel:
          data && selection.drawingId
            ? getDisciplineLabel(data, selection.drawingId, selection.disciplineKey)
            : null,
        revisionVersion: selection.revisionVersion,
        revisionDate:
          data && selection.drawingId
            ? getRevisionDate(
                data,
                selection.drawingId,
                selection.disciplineKey,
                selection.revisionVersion,
              )
            : null,
      }),
    [
      breadcrumbPathIds,
      drawingNames,
      selection.drawingId,
      selection.disciplineKey,
      selection.revisionVersion,
      data,
    ],
  )

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

  const showSearchDropdown = isSearchOpen && searchQuery.trim().length > 0

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="shrink-0 text-[10px] text-gray-500 hover:text-gray-700 sm:text-[15px]"
            aria-label="도면 목록으로"
          >
            ← 도면 목록
          </button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-[30px]">
            {selection.drawingId ? data.drawings[selection.drawingId].name : data.project.name}
          </h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {selection.drawingId ? (
            <>
              <div className="shrink-0 space-y-2 p-2 sm:p-2">
                <div ref={searchContainerRef} className="relative max-w-xs sm:max-w-sm">
                  <label htmlFor="drawing-search" className="sr-only">
                    도면 검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:h-5 sm:w-5" />
                    <input
                      id="drawing-search"
                      type="search"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsSearchOpen(true)
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      placeholder="공종으로 검색 ex) 소방, 건축"
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:py-2 sm:text-base"
                      aria-label="도면 검색"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearchAndClose}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                        aria-label="검색어 지우기"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {showSearchDropdown && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {filteredSearchResults.length === 0 ? (
                        <p className="px-3 py-4 text-center text-sm text-gray-500">
                          검색 결과가 없습니다.
                        </p>
                      ) : (
                        <ul className="py-1">
                          {filteredSearchResults.map((item, idx) =>
                            item.type === 'entry' ? (
                              <li
                                key={`${item.drawingId}-${item.disciplineKey}-${item.revisionVersion ?? 'base'}-${idx}`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectFromSearch({
                                      type: 'entry',
                                      drawingId: item.drawingId,
                                      disciplineKey: item.disciplineKey,
                                      revisionVersion: item.revisionVersion,
                                    })
                                  }
                                  className="flex w-full items-center px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-900"
                                >
                                  <span className="min-w-0 truncate">{item.entryLabel}</span>
                                </button>
                              </li>
                            ) : (
                              <li key={item.drawingId}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectFromSearch({
                                      type: 'drawing',
                                      drawingId: item.drawingId,
                                      matchLabels: item.matchLabels,
                                    })
                                  }
                                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-900"
                                >
                                  <span className="min-w-0 truncate">{item.name}</span>
                                  {item.matchLabels.length > 0 && (
                                    <span className="text-xs text-neutral-500">
                                      {item.matchLabels.join(', ')}
                                    </span>
                                  )}
                                </button>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <Breadcrumb
                  path={breadcrumbData.path}
                  drawingName={breadcrumbData.drawingName}
                  disciplineShort={breadcrumbData.disciplineShort}
                  onSelectDrawing={handleSelectDrawing}
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
                  revisionDescription={getRevisionDescription(
                    data,
                    selection.drawingId,
                    selection.disciplineKey,
                    selection.revisionVersion,
                  )}
                  trailing={
                    isCurrentLatestRevision || canCompare || canOverlay ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {isCurrentLatestRevision && (
                          <span
                            className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 sm:px-2.5 sm:py-1"
                            title="현재 보고 있는 도면은 이 공종의 최신 리비전입니다"
                          >
                            ★ 최신 도면
                          </span>
                        )}
                        {canOverlay && (
                          <button
                            type="button"
                            onClick={handleEnterOverlay}
                            className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-100 sm:text-[15px]"
                          >
                            공종 겹쳐보기
                          </button>
                        )}
                        {canCompare && (
                          <button
                            type="button"
                            onClick={handleEnterCompare}
                            className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[10px] font-medium text-white hover:bg-indigo-700 sm:text-[15px]"
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
                emptyPlaceholder={
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-gray-500 sm:text-base">
                      상단 검색창에서 공종(건축, 소방 등)으로 검색하거나,
                    </p>
                    <p className="text-sm text-gray-500 sm:text-base">
                      <span className="lg:hidden">하단 트리에서</span>
                      <span className="hidden lg:inline">우측 트리에서</span>{' '}
                      공간과 공종을 선택해 도면을 확인하세요.
                    </p>
                  </div>
                }
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center sm:p-6">
              <p className="text-sm text-gray-500 sm:text-base">
                상단 검색창에서 공종(건축, 소방 등)으로 검색하거나,
              </p>
              <p className="text-sm text-gray-500 sm:text-base">
                <span className="lg:hidden">하단 트리에서</span>
                <span className="hidden lg:inline">우측 트리에서</span>{' '}
                공간(도면)과 공종을 선택해 보세요.
              </p>
            </div>
          )}

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
                selectedDisciplineKey={selection.disciplineKey}
                selectedRevisionVersion={selection.revisionVersion}
                onSelectDrawing={handleSelectDrawing}
                onSelectImage={handleSelectImage}
              />
            </div>
          </section>
        </main>

        <aside className="hidden w-64 shrink-0 overflow-y-auto border-l border-gray-200 bg-white lg:block lg:w-72">
          <div className="flex flex-col gap-0.5 p-1.5 sm:p-2">
            <h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {space.displayName}
            </h2>
            <SpaceTree
              rootDrawing={rootDrawing}
              childDrawings={childDrawings}
              disciplinesByDrawingId={disciplinesByDrawingId}
              selectedDrawingId={selection.drawingId}
              selectedDisciplineKey={selection.disciplineKey}
              selectedRevisionVersion={selection.revisionVersion}
              onSelectDrawing={handleSelectDrawing}
              onSelectImage={handleSelectImage}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
