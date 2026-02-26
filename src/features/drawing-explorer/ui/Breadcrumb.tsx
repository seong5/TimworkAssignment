import { ChevronRight, Home, MapPin, Map, Layers, GitCommit } from 'lucide-react'
import type { CrumbItem } from '../model/lib/buildBreadcrumbPath'

export interface BreadcrumbProps {
  path: CrumbItem[]
  drawingName: string | null
  disciplineShort: string | null
  onSelectDrawing: (id: string) => void
  revisionVersion?: string | null
  revisionDate?: string | null
  revisionChanges?: string[]
  revisionDescription?: string | null
  trailing?: React.ReactNode
}

export function Breadcrumb({
  path,
  drawingName,
  disciplineShort,
  onSelectDrawing,
  revisionVersion = null,
  revisionDate = null,
  revisionChanges = [],
  revisionDescription = null,
  trailing,
}: BreadcrumbProps) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1 lg:gap-1.5 landscape:gap-1.5 landscape:sm:gap-2">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-1.5 lg:gap-2 landscape:gap-2">
        <nav aria-label="현재 위치" className="flex min-w-0 items-center">
          {path.length === 0 ? (
            <div className="flex items-center gap-1.5 rounded-md border border-dashed border-neutral-300 bg-neutral-100/50 px-2.5 py-2 sm:px-3 sm:py-2.5 lg:rounded-lg lg:px-6 lg:py-4 landscape:gap-2 landscape:px-3 landscape:py-2.5 landscape:sm:px-4 landscape:sm:py-3">
              <MapPin className="h-3 w-3 shrink-0 animate-bounce text-neutral-400 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
              <span className="text-[10px] font-medium text-neutral-500 sm:text-[11px] lg:text-sm landscape:text-xs landscape:sm:text-sm">
                조회할 공간을 선택하세요
              </span>
            </div>
          ) : (
            <ol className="flex flex-wrap items-center gap-0.5 sm:gap-0.5 lg:gap-1.5 landscape:gap-1 landscape:sm:gap-1.5">
              {path.map((item, i) => {
                const isLast = i === path.length - 1
                const isFirst = i === 0
                const isSpace = item.type === 'space'
                const isDiscipline = item.type === 'discipline'
                const isRevision = item.type === 'revision'

                return (
                  <li
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-0.5 sm:gap-0.5 lg:gap-1.5 landscape:gap-1 landscape:sm:gap-1.5"
                  >
                    {!isFirst && (
                      <ChevronRight
                        className="h-3 w-3 shrink-0 text-neutral-300 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4"
                        aria-hidden
                      />
                    )}

                    {isLast ? (
                      <div className="flex items-center gap-0.5 rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 shadow-sm sm:px-1.5 sm:py-0.5 sm:text-[11px] lg:gap-1.5 lg:rounded-lg lg:px-2.5 lg:py-1.5 lg:text-sm landscape:gap-1 landscape:rounded-lg landscape:px-2 landscape:py-1 landscape:text-xs landscape:sm:gap-1.5 landscape:sm:px-2.5 landscape:sm:py-1.5 landscape:sm:text-sm">
                        {isSpace && (
                          <Map className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        {isDiscipline && (
                          <Layers className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        {isRevision && (
                          <GitCommit className="h-3 w-3 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        <span className="truncate max-w-[100px] sm:max-w-[140px] lg:max-w-none landscape:max-w-[140px] landscape:sm:max-w-[200px] landscape:lg:max-w-none">
                          {item.name}
                        </span>
                      </div>
                    ) : isSpace ? (
                      <button
                        type="button"
                        onClick={() => onSelectDrawing(item.id)}
                        className="group flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 transition-all hover:bg-neutral-200/50 hover:text-neutral-900 sm:px-1.5 sm:py-0.5 sm:text-[11px] lg:gap-1.5 lg:rounded-lg lg:px-2.5 lg:py-1.5 lg:text-sm landscape:gap-1 landscape:rounded-lg landscape:px-2 landscape:py-1 landscape:text-xs landscape:sm:gap-1.5 landscape:sm:px-2.5 landscape:sm:py-1.5 landscape:sm:text-sm"
                      >
                        {isFirst && (
                          <Home className="h-3 w-3 shrink-0 text-neutral-400 transition-colors group-hover:text-neutral-600 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        <span className="truncate max-w-[80px] sm:max-w-[100px] lg:max-w-none landscape:max-w-[120px] landscape:sm:max-w-[160px] landscape:lg:max-w-none">
                          {item.name}
                        </span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 sm:gap-0.5 sm:px-1.5 sm:py-0.5 sm:text-[11px] lg:gap-1.5 lg:rounded-lg lg:px-2.5 lg:py-1.5 lg:text-sm landscape:gap-1 landscape:rounded-lg landscape:px-2 landscape:py-1 landscape:text-xs landscape:sm:gap-1.5 landscape:sm:px-2.5 landscape:sm:py-1.5 landscape:sm:text-sm">
                        {isDiscipline && (
                          <Layers className="h-3 w-3 shrink-0 text-neutral-400 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        {isRevision && (
                          <GitCommit className="h-3 w-3 shrink-0 text-neutral-400 sm:h-3 sm:w-3 lg:h-4 lg:w-4 landscape:h-3.5 landscape:w-3.5 landscape:sm:h-4 landscape:sm:w-4" />
                        )}
                        <span className="truncate max-w-[100px] sm:max-w-[120px] lg:max-w-none landscape:max-w-[140px] landscape:sm:max-w-[180px] landscape:lg:max-w-none">
                          {item.name}
                        </span>
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
        <div className="overflow-x-auto">
          <div className="flex min-w-max flex-row gap-4 rounded-lg border border-neutral-200 bg-white/80 px-2 py-1 shadow-sm sm:gap-6 lg:gap-8 landscape:gap-4 landscape:px-3 landscape:py-3 landscape:sm:gap-6 landscape:sm:px-2 landscape:sm:py-2">
            <div className="min-w-0 shrink-0">
              <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:mb-0.5 sm:text-[10px] lg:mb-1 lg:text-[15px] landscape:mb-1 landscape:text-[10px] landscape:sm:text-xs landscape:lg:text-[15px]">
                현재 도면
              </span>
              <p className="text-[10px] font-medium leading-snug text-neutral-800 sm:text-[15px] landscape:text-[10px] landscape:sm:text-[15px]">
                {disciplineShort ? (
                  <>
                    <span>"{drawingName}"</span>
                    <span className="text-[10px] text-indigo-600 sm:text-[15px] landscape:text-[10px] landscape:sm:text-[15px]">
                      {' '}
                      · {disciplineShort}
                      {revisionVersion ? (
                        <span>
                          {' '}
                          {revisionDate ? `${revisionVersion} (${revisionDate})` : revisionVersion}
                        </span>
                      ) : (
                        <span> (기본)</span>
                      )}
                    </span>
                  </>
                ) : (
                  <span>"{drawingName}"</span>
                )}
              </p>
            </div>
            {(revisionChanges.length > 0 ||
              (revisionDescription != null && revisionDescription !== '')) && (
              <>
                {revisionChanges.length > 0 && (
                  <div className="min-w-0 shrink-0 border-l border-neutral-200 pl-4 sm:pl-6 landscape:pl-4 landscape:sm:pl-6">
                    <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:text-[10px] lg:mb-1 lg:text-[15px] landscape:mb-1 landscape:text-[10px] landscape:sm:text-xs landscape:lg:text-[15px]">
                      변경사항
                    </span>
                    <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-[10px] text-neutral-700 sm:text-[11px] lg:text-sm xl:text-[15px] landscape:text-xs landscape:sm:text-sm landscape:lg:text-sm landscape:xl:text-[15px]">
                      {revisionChanges.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {revisionDescription != null && revisionDescription !== '' && (
                  <div className="min-w-0 shrink-0 border-l border-neutral-200 pl-4 sm:pl-6 landscape:pl-4 landscape:sm:pl-6">
                    <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400 sm:text-[10px] lg:mb-1 lg:text-[15px] landscape:mb-1 landscape:text-[10px] landscape:sm:text-xs landscape:lg:text-[15px]">
                      내용
                    </span>
                    <p className="mt-0.5 text-[10px] text-neutral-700 sm:text-[11px] lg:text-sm xl:text-[15px] landscape:text-xs landscape:sm:text-sm landscape:lg:text-sm landscape:xl:text-[15px]">
                      {revisionDescription}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
