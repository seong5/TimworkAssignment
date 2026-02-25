import type { NormalizedProjectData } from '@/entities/project'
import { getImageForRevision, getRevisionsForDiscipline } from '@/entities/project'

export type RevisionComparePanel = {
  imageFilename: string | null
  label: string
  date: string | null
  description: string | null
  changes: string[]
  alt: string
}

export interface GetRevisionComparePanelsParams {
  data: NormalizedProjectData
  drawingId: string
  disciplineKey: string
  leftVersion: string | null
  rightVersion: string | null
  drawingName?: string
}

export interface RevisionComparePanels {
  leftPanel: RevisionComparePanel
  rightPanel: RevisionComparePanel
}

export function getRevisionComparePanels({
  data,
  drawingId,
  disciplineKey,
  leftVersion,
  rightVersion,
  drawingName = '도면',
}: GetRevisionComparePanelsParams): RevisionComparePanels {
  const revisions = getRevisionsForDiscipline(data, drawingId, disciplineKey)
  const leftRev =
    leftVersion === null ? null : (revisions.find((r) => r.version === leftVersion) ?? null)
  const rightRev =
    rightVersion === null ? null : (revisions.find((r) => r.version === rightVersion) ?? null)

  const leftLabel = leftVersion == null ? '기본' : leftVersion
  const rightLabel = rightVersion == null ? '기본' : rightVersion

  return {
    leftPanel: {
      imageFilename: getImageForRevision(data, drawingId, disciplineKey, leftVersion),
      label: leftLabel,
      date: leftRev?.date ?? null,
      description: leftRev?.description ?? null,
      changes: Array.isArray(leftRev?.changes) ? leftRev.changes : [],
      alt: `${drawingName} - ${leftLabel}`,
    },
    rightPanel: {
      imageFilename: getImageForRevision(data, drawingId, disciplineKey, rightVersion),
      label: rightLabel,
      date: rightRev?.date ?? null,
      description: rightRev?.description ?? null,
      changes: Array.isArray(rightRev?.changes) ? rightRev.changes : [],
      alt: `${drawingName} - ${rightLabel}`,
    },
  }
}
