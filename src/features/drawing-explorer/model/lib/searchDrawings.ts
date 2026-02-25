import type { NormalizedProjectData } from '@/entities/project'
import {
  getImageEntriesGroupedByDiscipline,
  getOverlayableDisciplines,
  getRevisionsForDiscipline,
  getLatestRevision,
} from '@/entities/project'

export type DrawingSearchResult =
  | { type: 'drawing'; drawingId: string; name: string; matchLabels: string[] }
  | {
      type: 'entry'
      drawingId: string
      disciplineKey: string
      revisionVersion: string | null
      drawingName: string
      entryLabel: string
    }

export type SearchSelectPayload =
  | { type: 'drawing'; drawingId: string; matchLabels: string[] }
  | {
      type: 'entry'
      drawingId: string
      disciplineKey: string
      revisionVersion: string | null
    }

export type DrawingSelection = {
  drawingId: string
  disciplineKey: string | null
  revisionVersion: string | null
}

/**
 * 도면·공종 검색 결과 반환
 */
export function filterSearchResults(
  data: NormalizedProjectData | null,
  allowedDrawingIds: string[],
  searchQuery: string,
): DrawingSearchResult[] {
  const q = searchQuery.trim().toLowerCase()
  if (!q || !data) return []

  const drawingResults: DrawingSearchResult[] = []
  const entryResults: DrawingSearchResult[] = []

  for (const id of allowedDrawingIds) {
    const name = data.drawings[id]?.name ?? id
    const matchLabels: string[] = []

    if (name.toLowerCase().includes(q)) {
      drawingResults.push({ type: 'drawing', drawingId: id, name, matchLabels })
      continue
    }

    const byDiscipline = data.disciplineRevisions[id]
    if (byDiscipline) {
      const matchingDisciplineKeys: string[] = []
      for (const [key, entry] of Object.entries(byDiscipline)) {
        const label = (entry?.displayName ?? key).toLowerCase()
        if (label.includes(q)) {
          matchingDisciplineKeys.push(key)
        }
      }
      if (matchingDisciplineKeys.length > 0) {
        const groups = getImageEntriesGroupedByDiscipline(data, id)
        for (const group of groups) {
          if (!matchingDisciplineKeys.includes(group.disciplineKey)) continue
          for (const entry of group.entries) {
            entryResults.push({
              type: 'entry',
              drawingId: id,
              disciplineKey: group.disciplineKey,
              revisionVersion: entry.revisionVersion,
              drawingName: name,
              entryLabel: entry.label,
            })
          }
        }
      }
    }
  }

  if (entryResults.length > 0) return entryResults
  return drawingResults
}

export function resolveSearchSelection(
  data: NormalizedProjectData | null,
  payload: SearchSelectPayload,
): DrawingSelection | null {
  if (!data) return null

  if (payload.type === 'entry') {
    return {
      drawingId: payload.drawingId,
      disciplineKey: payload.disciplineKey,
      revisionVersion: payload.revisionVersion,
    }
  }

  const drawingId = payload.drawingId
  const byDiscipline = data.disciplineRevisions[drawingId]
  let disciplineKey: string | null = null

  if (payload.matchLabels.length > 0 && byDiscipline) {
    const firstMatch = payload.matchLabels[0]
    const found = Object.entries(byDiscipline).find(
      ([key, entry]) => (entry?.displayName ?? key) === firstMatch,
    )
    if (found) disciplineKey = found[0]
  }
  if (!disciplineKey && byDiscipline) {
    const overlayable = getOverlayableDisciplines(data, drawingId)
    disciplineKey = overlayable[0]?.key ?? Object.keys(byDiscipline)[0] ?? null
  }

  const revisionVersion = disciplineKey
    ? (getLatestRevision(getRevisionsForDiscipline(data, drawingId, disciplineKey))?.version ??
      null)
    : null

  return {
    drawingId,
    disciplineKey,
    revisionVersion,
  }
}
