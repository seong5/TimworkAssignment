import { useState, useCallback } from 'react'
import './App.css'
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
  getDisciplineOptions,
  getRevisionChanges,
  getRevisionDate,
} from '@/shared/lib/drawings'

function App() {
  const { data: metadata, loading, error } = useMetadata()
  const [selection, setSelection] = useState<SelectionState>({
    drawingId: null,
    disciplineKey: null,
    revisionVersion: null,
  })

  const handleSelectDrawing = useCallback((id: string) => {
    setSelection((prev) => ({
      ...prev,
      drawingId: id,
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
      setSelection({
        drawingId,
        disciplineKey,
        revisionVersion,
      })
    },
    [],
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">도면 데이터를 불러오는 중…</p>
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">데이터를 불러올 수 없습니다. {error?.message}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">{metadata.project.name}</h1>
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
                  disciplineLabel={
                    selection.disciplineKey
                      ? (() => {
                          const opts = getDisciplineOptions(metadata.drawings[selection.drawingId])
                          const o = opts.find(
                            (opt) =>
                              opt.key === selection.disciplineKey ||
                              (opt.keyPrefix &&
                                selection.disciplineKey?.startsWith(opt.keyPrefix + '.')),
                          )
                          if (!o) return null
                          if (
                            o.keyPrefix &&
                            selection.disciplineKey?.startsWith(o.keyPrefix + '.')
                          ) {
                            const regionKey = selection.disciplineKey.slice(
                              (o.keyPrefix + '.').length,
                            )
                            return `${o.label} > ${regionKey}`
                          }
                          return o.label
                        })()
                      : null
                  }
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

export default App
