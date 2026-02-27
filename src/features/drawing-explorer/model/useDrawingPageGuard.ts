import { useMemo } from 'react'
import { useProjectData } from '@/entities/project'
import { getSpaceBySlug } from '@/entities/project'
import type { NormalizedProjectData } from '@/entities/project'

export type DrawingPageGuardStatus = 'invalid' | 'loading' | 'error' | 'ready'

export interface UseDrawingPageGuardResult {
  status: DrawingPageGuardStatus
  space: ReturnType<typeof getSpaceBySlug>
  data: NormalizedProjectData | null
  error: Error | null
  refetch: () => void
}

export function useDrawingPageGuard(slug: string | undefined): UseDrawingPageGuardResult {
  const space = useMemo(() => getSpaceBySlug(slug), [slug])
  const { data, loading, error, refetch } = useProjectData()

  const status: DrawingPageGuardStatus = useMemo(() => {
    if (!slug || !space) return 'invalid'
    if (loading) return 'loading'
    if (error || !data) return 'error'
    return 'ready'
  }, [slug, space, loading, error, data])

  return {
    status,
    space,
    data: data ?? null,
    error: error ?? null,
    refetch,
  }
}
