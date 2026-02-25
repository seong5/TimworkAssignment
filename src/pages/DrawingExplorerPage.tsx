import { useParams, useSearchParams } from 'react-router-dom'
import { DrawingExplorerWidget } from '@/widgets/drawing-explorer'

export function DrawingExplorerPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const drawingId = searchParams.get('drawing') ?? undefined
  const disciplineKey = searchParams.get('discipline') ?? undefined
  const revisionVersion = searchParams.get('revision') ?? undefined

  return (
    <DrawingExplorerWidget
      slug={slug ?? undefined}
      initialDrawingId={drawingId}
      initialDisciplineKey={disciplineKey}
      initialRevisionVersion={revisionVersion}
    />
  )
}
