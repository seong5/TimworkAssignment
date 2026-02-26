import { useState, useEffect } from 'react'
import type { NormalizedRevision } from '@/entities/project'
import { getDefaultCompareRight } from './lib/getDefaultCompareVersions'

export interface UseCompareVersionsParams {
  revisions: NormalizedRevision[]
  initialLeft?: string
  initialRight?: string
}

export interface UseCompareVersionsResult {
  compareLeft: string | null
  setCompareLeft: (value: string | null) => void
  compareRight: string | null
  setCompareRight: (value: string | null) => void
}

export function useCompareVersions({
  revisions,
  initialLeft,
  initialRight,
}: UseCompareVersionsParams): UseCompareVersionsResult {
  const defaultRight = getDefaultCompareRight(revisions)

  const [compareLeft, setCompareLeft] = useState<string | null>(
    initialLeft === undefined ? null : initialLeft || null,
  )
  const [compareRight, setCompareRight] = useState<string | null>(() => {
    if (initialRight !== undefined) return initialRight || null
    return null
  })

  useEffect(() => {
    if (initialRight === undefined && compareRight === null && defaultRight) {
      setCompareRight(defaultRight)
    }
  }, [defaultRight, initialRight, compareRight])

  return {
    compareLeft,
    setCompareLeft,
    compareRight,
    setCompareRight,
  }
}
