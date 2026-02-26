import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MapPin } from 'lucide-react'
import { SearchBar } from '@/shared/ui'
import { useProjectInfo, SPACE_LIST } from '@/entities/project'
import { RecentDrawingsWidget } from '@/widgets/recent-drawings'
import TaLogo from '@/shared/assets/images/Ta-logo.png'

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
      <header className="border-b border-gray-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
        <Link to="/" className="inline-block" aria-label="TA 홈">
          <img
            src={TaLogo}
            alt="TA"
            className="mx-auto h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
          />
        </Link>
        <p className="mt-2 text-sm text-gray-500 sm:text-base md:text-lg lg:text-[20px]">
          {loading
            ? '…'
            : project
              ? `'${project.name}' 프로젝트의 전체 도면을 조회할 수 있습니다.`
              : '공간을 선택하면 해당 도면을 조회할 수 있습니다.'}
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <RecentDrawingsWidget />
        </div>
        <div className="mb-4 sm:mb-6">
          <SearchBar
            id="space-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="공간 이름으로 검색 (예: 101동, 주차장)"
            label="공간(도면) 검색"
          />
        </div>

        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:mb-6 sm:text-sm">
          {loading ? '…' : project ? `${project.name} 도면 목록` : '공간 목록'}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {filteredSpaces.length === 0 ? (
            <li className="col-span-full rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 sm:p-8 sm:text-base">
              검색 결과가 없습니다. 다른 검색어를 입력해 보세요.
            </li>
          ) : (
            filteredSpaces.map((space) => (
              <li key={space.id}>
                <Link
                  to={`/drawing/${space.slug}`}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md sm:p-6"
                >
                  <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200 sm:mb-3 sm:h-12 sm:w-12">
                    <Building2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className="text-base font-semibold text-gray-900 sm:text-lg">{space.displayName}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-gray-500 sm:text-sm">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
