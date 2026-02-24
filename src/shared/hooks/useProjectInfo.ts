import { useState, useEffect } from 'react'
import type { ProjectInfo } from '@/entities/project'
import { fetchProject } from '@/shared/api/projectData'

export function useProjectInfo(): {
  project: ProjectInfo | null
  loading: boolean
  error: Error | null
} {
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchProject()
      .then((data) => setProject(data.project))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { project, loading, error }
}
