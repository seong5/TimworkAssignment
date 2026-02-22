import { Link } from 'react-router-dom'
import { Building2, MapPin } from 'lucide-react'
import { useProjectInfo } from '@/shared/hooks/useProjectInfo'
import { SPACE_LIST } from '@/shared/lib/drawings'

export function MainPage() {
  const { project, loading } = useProjectInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {loading ? '…' : project?.name ?? '도면 탐색'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? '…' : project ? `${project.name}의 도면을 조회할 수 있습니다.` : '공간을 선택하면 해당 도면을 조회할 수 있습니다.'}
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {loading ? '…' : project ? `${project.name} 공간 목록` : '공간 목록'}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPACE_LIST.map((space) => (
            <li key={space.id}>
              <Link
                to={`/space/${space.slug}`}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200">
                  <Building2 className="h-6 w-6" />
                </span>
                <span className="text-lg font-semibold text-gray-900">{space.displayName}</span>
                <span className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  도면 보기
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
