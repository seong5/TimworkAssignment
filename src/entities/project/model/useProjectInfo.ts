import { useEffect } from 'react'
import type { ProjectInfo } from '../types'
import { useProjectStore } from './projectStore'

export function useProjectInfo(): {
  project: ProjectInfo | null
  loading: boolean
  error: Error | null
} {
  const project = useProjectStore((s) => s.project)
  const loading = useProjectStore((s) => s.loading)
  const error = useProjectStore((s) => s.error)
  const loadProject = useProjectStore((s) => s.loadProject)

  useEffect(() => {
    void loadProject()
  }, [loadProject])

  return { project, loading, error }
}
