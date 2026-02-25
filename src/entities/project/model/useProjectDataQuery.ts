import { useQuery } from '@tanstack/react-query'
import { fetchProjectData } from '../api/projectData'

export const PROJECT_DATA_QUERY_KEY = ['projectData'] as const

export function useProjectDataQuery() {
  return useQuery({
    queryKey: PROJECT_DATA_QUERY_KEY,
    queryFn: fetchProjectData,
    staleTime: 5 * 60 * 1000,
  })
}
