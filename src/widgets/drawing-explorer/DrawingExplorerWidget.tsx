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
  getRootChildIds,
  getDefaultDrawingIdForSlug,
  getBreadcrumbIds,
  getDrawingIdsInOrder,
  getChildDrawingIds,
  getImageEntriesGroupedByDiscipline,
  getOverlayableDisciplines,
  SPACE_LIST,
  type DrawingDisciplineGroup,
} from '@/entities/project'
import { useDrawingExplorerStore } from '@/features/drawing-explorer/model/drawingExplorerStore'

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
  const { selection, setSelection, resetSelection, setDrawingId } = useDrawingExplorerStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialDrawingId && initialDisciplineKey) {
      setSelection({
        drawingId: initialDrawingId,
        disciplineKey: initialDisciplineKey,
        revisionVersion: initialRevisionVersion ?? null,
      })
    } else {
      resetSelection()
    }
  }, [
    slug,
    initialDrawingId,
    initialDisciplineKey,
    initialRevisionVersion,
    setSelection,
    resetSelection,
  ])

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectFromSearch = useCallback(
    (
      payload:
        | { type: 'drawing'; drawingId: string; matchLabels: string[] }
        | {
            type: 'entry'
            drawingId: string
            disciplineKey: string
            revisionVersion: string | null
          },
    ) => {
      if (!data) return
      let drawingId: string
      let disciplineKey: string | null
      let revisionVersion: string | null
      if (payload.type === 'entry') {
        drawingId = payload.drawingId
        disciplineKey = payload.disciplineKey
        revisionVersion = payload.revisionVersion
      } else {
        drawingId = payload.drawingId
        const byDiscipline = data.disciplineRevisions[drawingId]
        disciplineKey = null
        if (payload.matchLabels.length > 0 && byDiscipline) {
          const firstMatch = payload.matchLabels[0]
          const found = Object.entries(byDiscipline).find(
            ([key, entry]) => (entry?.displayName ?? key) === firstMatch,
          )
          if (found) disciplineKey = found[0]
        }
        if (!disciplineKey && byDiscipline) {
          const overlayable = getOverlayableDisciplines(data, drawingId)
          disciplineKey = overlayable[0]?.key ?? Object.keys(byDiscipline)[0] ?? null
        }
        revisionVersion = disciplineKey
          ? (getLatestRevision(getRevisionsForDiscipline(data, drawingId, disciplineKey))
              ?.version ?? null)
          : null
      }
      setSelection({
        drawingId,
        disciplineKey,
        revisionVersion,
      })
      setSearchQuery('')
      setIsSearchOpen(false)
    },
    [data, setSelection],
  )

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

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || !data) return []
    type DrawingResult = { type: 'drawing'; drawingId: string; name: string; matchLabels: string[] }
    type EntryResult = {
      type: 'entry'
      drawingId: string
      disciplineKey: string
      revisionVersion: string | null
      drawingName: string
      entryLabel: string
    }
    const drawingResults: DrawingResult[] = []
    const entryResults: EntryResult[] = []
    for (const id of allowedDrawingIds) {
      const name = data.drawings[id]?.name ?? id
      const matchLabels: string[] = []
      if (name.toLowerCase().includes(q)) {
        drawingResults.push({ type: 'drawing', drawingId: id, name, matchLabels })
        continue
      }
      const byDiscipline = data.disciplineRevisions[id]
      if (byDiscipline) {
        const matchingDisciplineKeys: string[] = []
        for (const [key, entry] of Object.entries(byDiscipline)) {
          const label = (entry?.displayName ?? key).toLowerCase()
          if (label.includes(q)) {
            matchingDisciplineKeys.push(key)
          }
        }
        if (matchingDisciplineKeys.length > 0) {
          const groups = getImageEntriesGroupedByDiscipline(data, id)
          for (const group of groups) {
            if (!matchingDisciplineKeys.includes(group.disciplineKey)) continue
            for (const entry of group.entries) {
              entryResults.push({
                type: 'entry',
                drawingId: id,
                disciplineKey: group.disciplineKey,
                revisionVersion: entry.revisionVersion,
                drawingName: name,
                entryLabel: entry.label,
              })
            }
          }
        }
      }
    }
    if (entryResults.length > 0) return entryResults
    return drawingResults
  }, [allowedDrawingIds, data, searchQuery])

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
                        onClick={() => {
                          setSearchQuery('')
                          setIsSearchOpen(false)
                        }}
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
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
              <p className="text-center text-sm text-gray-500 sm:text-base">
                <span className="lg:hidden">하단 트리에서 </span>
                공간(도면)을 선택하세요. 상단 브레드크럼과 컨텍스트 바에서 현재 위치와 공종·리비전을
                확인·선택할 수 있습니다.
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
                onSelectDrawing={handleSelectDrawing}
                onSelectImage={handleSelectImage}
              />
            </div>
          </section>
        </main>

        <aside className="hidden w-50 shrink-0 overflow-y-auto border-l border-gray-200 bg-white lg:block sm:w-60">
          <div className="py-2">
            <h2 className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {space.displayName}
            </h2>
            <SpaceTree
              rootDrawing={rootDrawing}
              childDrawings={childDrawings}
              disciplinesByDrawingId={disciplinesByDrawingId}
              selectedDrawingId={selection.drawingId}
              selectedDisciplineKey={selection.disciplineKey}
              onSelectDrawing={handleSelectDrawing}
              onSelectImage={handleSelectImage}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
