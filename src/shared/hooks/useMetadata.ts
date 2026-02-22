import { useState, useEffect } from 'react'
import type { Metadata } from '@/shared/types/metadata'
import { SPACE_LIST } from '@/shared/lib/drawings'

const COMMON_URL = '/data/metadata-common.json'

function getMetadataUrlForSpace(spaceId: string): string | null {
  const space = SPACE_LIST.find((s) => s.id === spaceId)
  return space ? `/data/${space.metadataFile}` : null
}

export function useMetadata(spaceId: string | null): {
  data: Metadata | null
  loading: boolean
  error: Error | null
} {
  const [data, setData] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(!!spaceId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!spaceId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    const spaceUrl = getMetadataUrlForSpace(spaceId)
    if (!spaceUrl) {
      setError(new Error(`Unknown space: ${spaceId}`))
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    Promise.all([
      fetch(COMMON_URL).then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}: ${COMMON_URL}`)),
      ),
      fetch(spaceUrl).then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}: ${spaceUrl}`)),
      ),
    ])
      .then(([common, spaceData]) => {
        setData({
          project: common.project,
          disciplines: common.disciplines,
          drawings: {
            ...common.drawings,
            ...spaceData.drawings,
          },
        })
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [spaceId])

  return { data, loading, error }
}
