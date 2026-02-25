import type { NormalizedProjectData } from '../types'
import { useProjectDataQuery } from './useProjectDataQuery'

export function useProjectData(): {
  data: NormalizedProjectData | null
  loading: boolean
  error: Error | null
} {
  const { data, isLoading, error } = useProjectDataQuery()
  return {
    data: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
  }
}
