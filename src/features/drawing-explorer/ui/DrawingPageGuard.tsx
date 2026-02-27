import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui'
import type { NormalizedProjectData, SpaceItem } from '@/entities/project'
import { useDrawingPageGuard } from '../model/useDrawingPageGuard'

export interface DrawingPageGuardProps {
  slug: string | undefined
  children: (props: {
    slug: string
    space: SpaceItem
    data: NormalizedProjectData
  }) => React.ReactNode
}

export function DrawingPageGuard({ slug, children }: DrawingPageGuardProps) {
  const navigate = useNavigate()
  const { status, space, data, error, refetch } = useDrawingPageGuard(slug)

  if (status === 'invalid') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">잘못된 공간 경로입니다.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-500 sm:text-base">도면 데이터를 불러오는 중…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-red-600 sm:text-base">
          데이터를 불러올 수 없습니다. {error?.message}
        </p>
        <Button variant="primary" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (!space || !data) return null

  return <>{children({ slug: space.slug, space, data })}</>
}
