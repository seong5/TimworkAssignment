import { useNavigate } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/shared/ui'
import {
  SpaceTree,
  Breadcrumb,
  DrawingViewer,
  DrawingPageHeader,
  DrawingPageGuard,
} from '@/features/drawing-explorer'
import {
  getImageForSelection,
  getPolygonForRevision,
  getDisciplineLabel,
  getLatestRevision,
  getRevisionChanges,
  getRevisionDescription,
  getRevisionDate,
  getRevisionsForDiscipline,
  getBreadcrumbIds,
  getOverlayableDisciplines,
} from '@/entities/project'
import type { NormalizedProjectData, SpaceItem } from '@/entities/project'
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

interface DrawingExplorerContentProps {
  slug: string
  space: SpaceItem
  data: NormalizedProjectData
  initialDrawingId?: string
  initialDisciplineKey?: string
  initialRevisionVersion?: string
}

function DrawingExplorerContent({
  slug,
  space,
  data,
  initialDrawingId,
  initialDisciplineKey,
  initialRevisionVersion,
}: DrawingExplorerContentProps) {
  const navigate = useNavigate()
  const { selection, setSelection, setDrawingId } = useDrawingExplorerStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const clearSearchAndClose = useCallback(() => {
    setSearchQuery('')
    setIsSearchOpen(false)
  }, [])

  const { rootDrawing, childDrawings, disciplinesByDrawingId, allowedDrawingIds } =
    useDrawingTreeData(data, space)

  useDrawingExplorerInit({
    slug,
    initialDrawingId,
    initialDisciplineKey,
    initialRevisionVersion,
    data,
    allowedDrawingIds,
    spaceId: space.id,
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

  const showSearchDropdown = isSearchOpen && searchQuery.trim().length > 0

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <DrawingPageHeader
        backLabel="도면 목록"
        onBack={() => navigate('/')}
        title={selection.drawingId ? data.drawings[selection.drawingId].name : data.project.name}
        titleSize="lg"
        actions={[
          {
            label: '공종 겹쳐보기',
            onClick: handleEnterOverlay,
            disabled: !canOverlay,
            variant: 'secondary',
          },
          {
            label: '리비전 비교',
            onClick: handleEnterCompare,
            disabled: !canCompare,
            variant: 'primary',
          },
        ]}
      />

      <div className="flex flex-1 overflow-hidden pt-2 sm:pt-3">
        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {selection.drawingId ? (
            <>
              <div className="flex shrink-0 flex-col gap-2 p-2 sm:gap-2 sm:p-2">
                <div ref={searchContainerRef} className="relative max-w-xs shrink-0 sm:max-w-sm">
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
                      className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-navy-brand focus:outline-none focus:ring-1 focus:ring-navy-brand sm:py-2 sm:text-base"
                      aria-label="도면 검색"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        type="button"
                        onClick={clearSearchAndClose}
                        className="absolute right-2 top-1/2 -translate-y-1/2 min-w-0 px-1.5 py-0.5 text-gray-400 hover:text-gray-600"
                        aria-label="검색어 지우기"
                      >
                        ×
                      </Button>
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
                                <Button
                                  variant="ghost"
                                  fullWidth
                                  onClick={() =>
                                    handleSelectFromSearch({
                                      type: 'entry',
                                      drawingId: item.drawingId,
                                      disciplineKey: item.disciplineKey,
                                      revisionVersion: item.revisionVersion,
                                    })
                                  }
                                  className="justify-start px-3 py-2 text-left text-sm text-gray-700 hover:bg-navy-brand/10 hover:text-navy-brand"
                                >
                                  <span className="min-w-0 truncate">{item.entryLabel}</span>
                                </Button>
                              </li>
                            ) : (
                              <li key={item.drawingId}>
                                <Button
                                  variant="ghost"
                                  fullWidth
                                  onClick={() =>
                                    handleSelectFromSearch({
                                      type: 'drawing',
                                      drawingId: item.drawingId,
                                      matchLabels: item.matchLabels,
                                    })
                                  }
                                  className="flex-col items-start gap-0.5 px-3 py-2 text-left text-sm text-gray-700 hover:bg-navy-brand/10 hover:text-navy-brand"
                                >
                                  <span className="min-w-0 truncate">{item.name}</span>
                                  {item.matchLabels.length > 0 && (
                                    <span className="text-xs text-neutral-500">
                                      {item.matchLabels.join(', ')}
                                    </span>
                                  )}
                                </Button>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
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
                    isLatestRevision={isCurrentLatestRevision}
                  />
                </div>
              </div>
              <DrawingViewer
                imageFilename={getImageForSelection(data, selection)}
                polygonData={
                  selection.disciplineKey
                    ? getPolygonForRevision(
                        data,
                        selection.drawingId,
                        selection.disciplineKey,
                        selection.revisionVersion,
                      )
                    : null
                }
                alt={data.drawings[selection.drawingId].name}
                emptyPlaceholder={
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="text-sm text-gray-500 sm:text-base">
                      상단 검색창에서 공종(건축, 소방 등)으로 검색하거나,
                    </p>
                    <p className="text-sm text-gray-500 sm:text-base">
                      <span className="lg:hidden">하단 트리에서</span>
                      <span className="hidden lg:inline">우측 트리에서</span> 공간과 공종을 선택해
                      도면을 확인하세요.
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
                <span className="hidden lg:inline">우측 트리에서</span> 공간(도면)과 공종을 선택해
                보세요.
              </p>
            </div>
          )}

          <section className="border-t border-gray-200 bg-white/90 px-2 py-2 shadow-inner sm:px-3 sm:py-3 lg:hidden">
            <h2 className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              공간(건물)
            </h2>
            <div className="max-h-40 min-h-0 overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white sm:max-h-44 md:max-h-48">
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

        <aside className="hidden min-h-0 w-64 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white lg:flex lg:w-72">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-0.5 overflow-y-auto p-1.5 sm:p-2">
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

export function DrawingExplorerWidget({
  slug,
  initialDrawingId,
  initialDisciplineKey,
  initialRevisionVersion,
}: DrawingExplorerWidgetProps) {
  return (
    <DrawingPageGuard slug={slug}>
      {({ slug: resolvedSlug, space, data }) => (
        <DrawingExplorerContent
          slug={resolvedSlug}
          space={space}
          data={data}
          initialDrawingId={initialDrawingId}
          initialDisciplineKey={initialDisciplineKey}
          initialRevisionVersion={initialRevisionVersion}
        />
      )}
    </DrawingPageGuard>
  )
}
