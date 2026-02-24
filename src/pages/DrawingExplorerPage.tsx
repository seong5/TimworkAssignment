import { useParams } from 'react-router-dom'
import { DrawingExplorerWidget } from '@/widgets/drawing-explorer'

export function DrawingExplorerPage() {
  const { slug } = useParams<{ slug: string }>()
  return <DrawingExplorerWidget slug={slug ?? undefined} />
}
