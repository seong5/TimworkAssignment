import { useState, useEffect } from 'react'
import type { Metadata } from '@/shared/types/metadata'

export function useMetadata(): {
  data: Metadata | null
  loading: boolean
  error: Error | null
} {
  const [data, setData] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const urls = [
      '/data/metadata-common.json',
      '/data/metadata-101building.json',
      '/data/metadata-parkinglot.json',
      '/data/metadata-publicfacility.json',
    ]
    Promise.all(urls.map((url) => fetch(url).then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}: ${url}`))))))
      .then(([common, d101, parking, facility]) => {
        setData({
          project: common.project,
          disciplines: common.disciplines,
          drawings: {
            ...common.drawings,
            ...d101.drawings,
            ...parking.drawings,
            ...facility.drawings,
          },
        })
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
