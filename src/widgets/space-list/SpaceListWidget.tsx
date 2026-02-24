import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin } from 'lucide-react'
import { SearchBar } from '@/shared/ui'
import { useProjectInfo, SPACE_LIST } from '@/entities/project'

export function SpaceListWidget() {
  const { project, loading } = useProjectInfo()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredSpaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return SPACE_LIST
    return SPACE_LIST.filter(
      (space) =>
        space.displayName.toLowerCase().includes(q) || space.slug.toLowerCase().includes(q),
    )
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b text-center border-gray-200 bg-white px-4 py-4">
        <h1 className="text-[40px] font-bold text-gray-900">
          {loading ? '…' : (project?.name ?? '도면 탐색')}
        </h1>
        <p className="mt-1 text-[20px] text-gray-500">
          {loading
            ? '…'
            : project
              ? `'${project.name}' 프로젝트의 전체 도면을 조회할 수 있습니다.`
              : '공간을 선택하면 해당 도면을 조회할 수 있습니다.'}
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <SearchBar
            id="space-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="공간 이름으로 검색 (예: 101동, 주차장)"
            label="공간(도면) 검색"
          />
        </div>

        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {loading ? '…' : project ? `${project.name} 도면 목록` : '공간 목록'}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSpaces.length === 0 ? (
            <li className="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
              검색 결과가 없습니다. 다른 검색어를 입력해 보세요.
            </li>
          ) : (
            filteredSpaces.map((space) => (
              <li key={space.id}>
                <Link
                  to={`/drawing/${space.slug}`}
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
            ))
          )}
        </ul>
      </main>
    </div>
  )
}
