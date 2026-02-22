import { useState, useEffect } from 'react'
import type { Project } from '@/shared/types/metadata'

const COMMON_URL = '/data/metadata-common.json'

export function useProjectInfo(): {
  project: Project | null
  loading: boolean
  error: Error | null
} {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(COMMON_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data) => setProject(data.project))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { project, loading, error }
}
