import { useParams, useSearchParams } from 'react-router-dom'
import { RevisionCompareWidget } from '@/widgets/revision-compare'

export function RevisionComparePage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const drawingId = searchParams.get('drawing')
  const disciplineKey = searchParams.get('discipline')
  const left = searchParams.get('left') ?? undefined
  const right = searchParams.get('right') ?? undefined

  return (
    <RevisionCompareWidget
      slug={slug ?? undefined}
      drawingId={drawingId ?? undefined}
      disciplineKey={disciplineKey ?? undefined}
      initialLeft={left}
      initialRight={right}
    />
  )
}
