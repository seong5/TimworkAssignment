import { Link } from 'react-router-dom'
import { FileText, ArrowRightCircle, GitCompare, Layers } from 'lucide-react'
import { useProjectData } from '@/entities/project'
import { getRecentDrawingUpdates, getOverlayableDisciplines } from '@/entities/project'

export function RecentDrawingsWidget() {
  const { data, loading, error } = useProjectData()

  const recentUpdates = data ? getRecentDrawingUpdates(data, 12) : []

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          최근 변경 도면
        </h2>
        <div className="flex justify-center py-8">
          <p className="text-sm text-gray-500">로딩 중…</p>
        </div>
      </section>
    )
  }

  if (error || !data) {
    return null
  }

  if (recentUpdates.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          최근 변경 도면
        </h2>
        <p className="py-6 text-center text-sm text-gray-500">
          최근 변경된 도면이 없습니다.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
        최근 변경 도면
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recentUpdates.map((item) => {
          const compareParams = new URLSearchParams({
            drawing: item.drawingId,
            discipline: item.disciplineKey,
            right: item.revisionVersion,
          })
          if (item.previousRevisionVersion) {
            compareParams.set('left', item.previousRevisionVersion)
          }
          const canOverlay =
            data && getOverlayableDisciplines(data, item.drawingId).length >= 2

          return (
            <article
              key={`${item.drawingId}-${item.disciplineKey}-${item.revisionVersion}`}
              className="group flex flex-col rounded-lg border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30"
            >
              <div className="mb-2 flex items-start gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-indigo-600">
                    {item.spaceDisplayName}
                  </p>
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {item.drawingName} · {item.disciplineLabel}
                  </p>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {item.revisionVersion}
                </span>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>

              {item.changes.length > 0 && (
                <ul className="mb-3 line-clamp-2 list-inside list-disc space-y-0.5 text-xs text-gray-600">
                  {item.changes.slice(0, 2).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                <Link
                  to={`/drawing/${item.slug}?drawing=${encodeURIComponent(item.drawingId)}&discipline=${encodeURIComponent(item.disciplineKey)}&revision=${encodeURIComponent(item.revisionVersion)}`}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  도면 보기
                  <ArrowRightCircle className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to={`/drawing/${item.slug}/compare?${compareParams.toString()}`}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  비교
                </Link>
                {canOverlay && (
                  <Link
                    to={`/drawing/${item.slug}/overlay?drawing=${encodeURIComponent(item.drawingId)}`}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                    title="설비·건축 등 공종 겹쳐보기"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    겹쳐보기
                  </Link>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
