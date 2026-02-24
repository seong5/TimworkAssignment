import { ChevronRight, Home, MapPin, Map, Layers, GitCommit } from 'lucide-react'

type CrumbType = 'space' | 'discipline' | 'revision'

interface CrumbItem {
  id: string
  name: string
  type: CrumbType
}

export interface BreadcrumbProps {
  pathIds: string[]
  drawingNames: Record<string, string>
  drawingId: string | null
  onSelectDrawing: (id: string) => void
  disciplineLabel?: string | null
  revisionVersion?: string | null
  revisionDate?: string | null
  revisionChanges?: string[]
  trailing?: React.ReactNode
}

export function Breadcrumb({
  pathIds,
  drawingNames,
  drawingId,
  onSelectDrawing,
  disciplineLabel = null,
  revisionVersion = null,
  revisionDate = null,
  revisionChanges = [],
  trailing,
}: BreadcrumbProps) {
  const spaceCrumbs: CrumbItem[] = pathIds.map((id) => ({
    id,
    name: drawingNames[id] ?? id,
    type: 'space' as const,
  }))

  const path: CrumbItem[] = [...spaceCrumbs]
  if (disciplineLabel) path.push({ id: 'discipline', name: disciplineLabel, type: 'discipline' })
  if (revisionVersion)
    path.push({
      id: 'revision',
      name: revisionDate ? `${revisionVersion} (${revisionDate})` : revisionVersion,
      type: 'revision',
    })

  const drawingName = drawingId ? (drawingNames[drawingId] ?? null) : null
  const disciplineShort = disciplineLabel ? disciplineLabel.split(' > ')[0] : null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <nav aria-label="현재 위치" className="flex min-w-0 items-center">
          {path.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-100/50 px-4 py-3 sm:px-6 sm:py-4">
              <MapPin className="h-3.5 w-3.5 shrink-0 animate-bounce text-neutral-400 sm:h-4 sm:w-4" />
              <span className="text-xs font-medium text-neutral-500 sm:text-sm">조회할 공간을 선택하세요</span>
            </div>
          ) : (
            <ol className="flex flex-wrap items-center gap-1 sm:gap-1.5">
              {path.map((item, i) => {
                const isLast = i === path.length - 1
                const isFirst = i === 0
                const isSpace = item.type === 'space'
                const isDiscipline = item.type === 'discipline'
                const isRevision = item.type === 'revision'

                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-1 sm:gap-1.5"
                  >
                    {!isFirst && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
                    )}

                    {isLast ? (
                      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-bold text-indigo-600 shadow-sm sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-sm">
                        {isSpace && <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        {isDiscipline && <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        {isRevision && <GitCommit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                        <span className="truncate">{item.name}</span>
                      </div>
                    ) : isSpace ? (
                      <button
                        type="button"
                        onClick={() => onSelectDrawing(item.id)}
                        className="group flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-200/50 hover:text-neutral-900 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-sm"
                      >
                        {isFirst && (
                          <Home className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 sm:h-4 sm:w-4" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-600 sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:text-sm">
                        {isDiscipline && <Layers className="h-3.5 w-3.5 shrink-0 text-neutral-400 sm:h-4 sm:w-4" />}
                        {isRevision && <GitCommit className="h-3.5 w-3.5 shrink-0 text-neutral-400 sm:h-4 sm:w-4" />}
                        <span className="truncate">{item.name}</span>
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </nav>
        {trailing != null ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      {drawingName && (
        <div className="rounded-xl border border-neutral-200 bg-white/80 px-3 py-3 shadow-sm sm:px-4 sm:py-4">
          <div className="mb-2 sm:mb-3">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400 sm:text-[15px]">
              현재 보고 있는 도면
            </span>
            <p className="text-base font-medium leading-snug text-neutral-800 sm:text-lg md:text-[20px]">
              {disciplineShort ? (
                <>
                  <span>"{drawingName}"</span>
                  <span className="text-indigo-600">
                    {' '}
                    · {disciplineShort}
                    {revisionVersion && (
                      <span>
                        {' '}
                        {revisionDate ? `${revisionVersion} (${revisionDate})` : revisionVersion}
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <span>"{drawingName}"</span>
              )}
            </p>
          </div>
          {revisionChanges.length > 0 && (
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400 sm:text-[15px]">
                변경 사항
              </span>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-neutral-700 sm:text-base md:text-[20px]">
                {revisionChanges.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
