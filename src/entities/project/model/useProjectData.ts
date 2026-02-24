import { useEffect } from 'react'
import type { NormalizedProjectData } from '../types'
import { useProjectStore } from './projectStore'

export function useProjectData(): {
  data: NormalizedProjectData | null
  loading: boolean
  error: Error | null
} {
  const data = useProjectStore((s) => s.data)
  const loading = useProjectStore((s) => s.loading)
  const error = useProjectStore((s) => s.error)
  const loadProjectData = useProjectStore((s) => s.loadProjectData)

  useEffect(() => {
    void loadProjectData()
  }, [loadProjectData])

  return { data, loading, error }
}
