import { useParams, useSearchParams } from 'react-router-dom'
import { useProjectData } from '@/entities/project'
import { getDefaultDrawingIdForSlug } from '@/entities/project'
import { DisciplineOverlayWidget } from '@/widgets/discipline-overlay'

export function DisciplineOverlayPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { data } = useProjectData()
  const paramDrawingId = searchParams.get('drawing') ?? undefined
  const defaultDrawingId =
    slug && data ? getDefaultDrawingIdForSlug(slug) ?? undefined : undefined
  const drawingId = paramDrawingId ?? defaultDrawingId ?? undefined

  return (
    <DisciplineOverlayWidget slug={slug ?? undefined} drawingId={drawingId} />
  )
}
