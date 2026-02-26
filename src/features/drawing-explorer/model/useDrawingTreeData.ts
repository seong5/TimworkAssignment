import { useMemo } from 'react'
import type { NormalizedProjectData } from '@/entities/project'
import { buildDrawingTreeData } from './lib/buildDrawingTreeData'
import type { SpaceItem } from './lib/buildDrawingTreeData'

export function useDrawingTreeData(
  data: NormalizedProjectData | null | undefined,
  space: SpaceItem | null,
) {
  return useMemo(
    () => buildDrawingTreeData(data ?? null, space),
    [data, space],
  )
}
