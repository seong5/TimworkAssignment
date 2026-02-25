import { useQuery } from '@tanstack/react-query'
import { fetchProject } from '../api/projectData'

export const PROJECT_QUERY_KEY = ['project'] as const

export function useProjectQuery() {
  return useQuery({
    queryKey: PROJECT_QUERY_KEY,
    queryFn: fetchProject,
    staleTime: 60 * 60 * 1000,
  })
}
