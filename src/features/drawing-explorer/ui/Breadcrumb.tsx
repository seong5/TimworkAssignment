import { ChevronRight, Home, MapPin, Map, Layers, GitCommit } from 'lucide-react'
import type { NormalizedProjectData } from '@/entities/project'
import { getBreadcrumbIds } from '@/shared/lib/normalizedDrawings'

type CrumbType = 'space' | 'discipline' | 'revision'

interface CrumbItem {
  id: string
  name: string
  type: CrumbType
}

interface BreadcrumbProps {
  data: NormalizedProjectData
  drawingId: string | null
  onSelectDrawing: (id: string) => void
  disciplineLabel?: string | null
  revisionVersion?: string | null
  revisionDate?: string | null
  revisionChanges?: string[]
}

export function Breadcrumb({
  data,
  drawingId,
  onSelectDrawing,
  disciplineLabel = null,
  revisionVersion = null,
  revisionDate = null,
  revisionChanges = [],
}: BreadcrumbProps) {
  const pathIds = drawingId ? getBreadcrumbIds(data, drawingId) : []
  const spaceCrumbs: CrumbItem[] = pathIds.map((id) => ({
    id,
    name: data.drawings[id]?.name ?? id,
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

  const drawingName = drawingId ? data.drawings[drawingId]?.name : null
  const disciplineShort = disciplineLabel ? disciplineLabel.split(' > ')[0] : null

  return (
    <div className="flex flex-col gap-1.5">
      <nav aria-label="현재 위치" className="flex items-center">
        {path.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-100/50 px-6 py-4">
            <MapPin className="h-4 w-4 animate-bounce text-neutral-400" />
            <span className="text-sm font-medium text-neutral-500">조회할 공간을 선택하세요</span>
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
                <li key={`${item.type}-${item.id}`} className="flex items-center gap-1 sm:gap-1.5">
                  {!isFirst && (
                    <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
                  )}

                  {isLast ? (
                    <div className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm font-bold text-indigo-600 shadow-sm">
                      {isSpace && <Map className="h-4 w-4" />}
                      {isDiscipline && <Layers className="h-4 w-4" />}
                      {isRevision && <GitCommit className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </div>
                  ) : isSpace ? (
                    <button
                      type="button"
                      onClick={() => onSelectDrawing(item.id)}
                      className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-all hover:bg-neutral-200/50 hover:text-neutral-900"
                    >
                      {isFirst && (
                        <Home className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-neutral-600" />
                      )}
                      <span>{item.name}</span>
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-600">
                      {isDiscipline && <Layers className="h-4 w-4 text-neutral-400" />}
                      {isRevision && <GitCommit className="h-4 w-4 text-neutral-400" />}
                      <span>{item.name}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </nav>
      {drawingName && (
        <div className="p-2">
          <p className="text-[30px] font-medium text-neutral-600">
            현재 보고있는 도면은
            {disciplineShort ? (
              <>
                {' '}
                <strong>"{drawingName}"</strong>의 <strong>{disciplineShort}</strong>
                <strong>
                  {revisionVersion
                    ? ` ${revisionDate ? `${revisionVersion} (${revisionDate})` : revisionVersion}`
                    : ''}
                </strong>
                <span className="font-medium"> 입니다.</span>
              </>
            ) : (
              <>
                {' '}
                <strong>"{drawingName}"</strong>
                <span className="font-medium"> 입니다.</span>
              </>
            )}
          </p>
          {revisionChanges.length > 0 && (
            <p className="mt-1 text-neutral-600 text-[30px] font-medium">
              <span>변경 사항 : </span>
              <strong> {revisionChanges.join(', ')} </strong>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
