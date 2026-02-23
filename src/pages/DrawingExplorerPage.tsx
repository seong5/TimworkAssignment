import { useParams, useNavigate } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import { useMetadata } from '@/shared/hooks/useMetadata'
import {
  SpaceTree,
  ContextBar,
  Breadcrumb,
  DrawingViewer,
  type SelectionState,
} from '@/features/drawing-explorer'
import {
  getImageFilenameForSelection,
  getDisciplineLabel,
  getRevisionChanges,
  getRevisionDate,
  getRootChildIds,
} from '@/shared/lib/drawings'
import { SPACE_LIST } from '@/shared/lib/drawings'

export function DrawingExplorerPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null

  const { data: metadata, loading, error } = useMetadata(space?.id ?? null)
  const [selection, setSelection] = useState<SelectionState>({
    drawingId: null,
    disciplineKey: null,
    revisionVersion: null,
  })

  useEffect(() => {
    setSelection({ drawingId: null, disciplineKey: null, revisionVersion: null })
  }, [slug])

  useEffect(() => {
    if (!metadata || selection.drawingId !== null) return
    const rootChildIds = getRootChildIds(metadata)
    const defaultDrawingId = rootChildIds[0] ?? Object.keys(metadata.drawings)[0]
    if (defaultDrawingId) {
      setSelection((prev) => ({ ...prev, drawingId: defaultDrawingId }))
    }
  }, [metadata, selection.drawingId])

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

  if (error || !metadata) {
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
              ? metadata.drawings[selection.drawingId].name
              : metadata.project.name}
          </h1>
        </div>
        <div className="mt-2">
          <ContextBar
            metadata={metadata}
            selection={selection}
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
              metadata={metadata}
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
                  metadata={metadata}
                  drawingId={selection.drawingId}
                  onSelectDrawing={handleSelectDrawing}
                  disciplineLabel={getDisciplineLabel(
                    metadata,
                    selection.drawingId,
                    selection.disciplineKey,
                  )}
                  revisionVersion={selection.revisionVersion}
                  revisionDate={getRevisionDate(
                    metadata,
                    selection.drawingId,
                    selection.disciplineKey,
                    selection.revisionVersion,
                  )}
                  revisionChanges={getRevisionChanges(
                    metadata,
                    selection.drawingId,
                    selection.disciplineKey,
                    selection.revisionVersion,
                  )}
                />
              </div>
              <DrawingViewer
                imageFilename={getImageFilenameForSelection(metadata, selection)}
                alt={metadata.drawings[selection.drawingId].name}
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
