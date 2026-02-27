import { Link } from 'react-router-dom'
import { FileText, ArrowRightCircle, GitCompare } from 'lucide-react'
import { useProjectData } from '@/entities/project'
import { getRecentDrawingUpdates } from '@/entities/project'

export function RecentDrawingsWidget() {
  const { data, loading, error, refetch } = useProjectData()

  const recentUpdates = data ? getRecentDrawingUpdates(data, 6) : []

  if (loading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          최근 변경 도면
        </h2>
        <div className="flex justify-center py-6">
          <p className="text-sm text-gray-500">로딩 중…</p>
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          최근 변경 도면
        </h2>
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-center text-sm text-red-600">
            데이터를 불러올 수 없습니다. {error?.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-[#E69100] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#cc7a00]"
          >
            다시 시도
          </button>
        </div>
      </section>
    )
  }

  if (recentUpdates.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          최근 변경 도면
        </h2>
        <p className="py-4 text-center text-sm text-gray-500">
          최근 변경된 도면이 없습니다.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        최근 변경 도면
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recentUpdates.map((item) => {
          const compareParams = new URLSearchParams({
            drawing: item.drawingId,
            discipline: item.disciplineKey,
            right: item.revisionVersion,
          })
          if (item.previousRevisionVersion) {
            compareParams.set('left', item.previousRevisionVersion)
          }

          return (
            <article
              key={`${item.drawingId}-${item.disciplineKey}-${item.revisionVersion}`}
              className="group flex flex-col rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:border-[#E69100]/30 hover:bg-[#E69100]/5"
            >
              <div className="mb-1.5 flex items-start gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#E69100]/20 text-[#E69100]">
                  <FileText className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-[#E69100] sm:text-xs">
                    {item.spaceDisplayName}
                  </p>
                  <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                    {item.drawingName} · {item.disciplineLabel}
                  </p>
                </div>
              </div>

              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-xs">
                  {item.revisionVersion}
                </span>
                <span className="text-[10px] text-gray-500 sm:text-xs">{item.date}</span>
              </div>

              {item.changes.length > 0 && (
                <ul className="mb-2 line-clamp-1 list-inside list-disc space-y-0 text-[10px] text-gray-600 sm:text-xs">
                  {item.changes.slice(0, 1).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap gap-1.5">
                <Link
                  to={`/drawing/${item.slug}?drawing=${encodeURIComponent(item.drawingId)}&discipline=${encodeURIComponent(item.disciplineKey)}&revision=${encodeURIComponent(item.revisionVersion)}`}
                  className="inline-flex items-center gap-0.5 rounded bg-[#E69100] px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#cc7a00] sm:text-xs"
                >
                  도면 보기
                  <ArrowRightCircle className="h-3 w-3" />
                </Link>
                <Link
                  to={`/drawing/${item.slug}/compare?${compareParams.toString()}`}
                  className="inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-2 py-1 text-[10px] font-medium text-gray-700 transition-colors hover:border-[#3907C7]/30 hover:bg-[#3907C7]/10 hover:text-[#3907C7] sm:text-xs"
                >
                  <GitCompare className="h-3 w-3" />
                  비교
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
