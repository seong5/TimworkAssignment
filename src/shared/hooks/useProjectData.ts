import { useState, useEffect } from 'react'
import type { NormalizedProjectData } from '@/entities/project'
import { fetchProjectData } from '@/shared/api/projectData'

export function useProjectData(): {
  data: NormalizedProjectData | null
  loading: boolean
  error: Error | null
} {
  const [data, setData] = useState<NormalizedProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProjectData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
