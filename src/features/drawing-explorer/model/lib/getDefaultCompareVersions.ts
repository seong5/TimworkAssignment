import type { NormalizedRevision } from '@/entities/project'
import { getLatestRevision } from '@/entities/project'

export function getDefaultCompareRight(revisions: NormalizedRevision[]): string | null {
  const latest = getLatestRevision(revisions)
  return latest?.version ?? revisions[0]?.version ?? null
}
