import type { ProjectInfo } from '../types'
import { useProjectQuery } from './useProjectQuery'

export function useProjectInfo(): {
  project: ProjectInfo | null
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  const { data, isLoading, error, refetch } = useProjectQuery()
  return {
    project: data?.project ?? null,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  }
}
