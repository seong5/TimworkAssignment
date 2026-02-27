import type { NormalizedProjectData } from '../types'
import { useProjectDataQuery } from './useProjectDataQuery'

export function useProjectData(): {
  data: NormalizedProjectData | null
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  const { data, isLoading, error, refetch } = useProjectDataQuery()
  return {
    data: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  }
}
