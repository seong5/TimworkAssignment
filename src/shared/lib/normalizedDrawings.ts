import type {
  NormalizedProjectData,
  DrawingNode,
  DisciplineRevisionEntry,
  NormalizedRevision,
} from '@/entities/project'
import type { DisciplineOption } from '@/shared/types/metadata'

export const DRAWING_PART_LABELS: Record<string, string> = {
  '01': '101동',
  '09': '주민공동시설',
  '13': '주차장',
}

export function getDrawingPartLabel(drawingId: string): string | null {
  return DRAWING_PART_LABELS[drawingId] ?? null
}

export function getDrawingIdsInOrder(data: NormalizedProjectData): string[] {
  return Object.keys(data.drawings).sort((a, b) => data.drawings[a].order - data.drawings[b].order)
}

export function getRootChildIds(data: NormalizedProjectData): string[] {
  return getDrawingIdsInOrder(data).filter((id) => data.drawings[id].parent === '00')
}

export function getBreadcrumbIds(data: NormalizedProjectData, drawingId: string): string[] {
  const path: string[] = []
  let id: string | null = drawingId
  while (id) {
    path.unshift(id)
    const drawing: DrawingNode | undefined = data.drawings[id]
    id = drawing?.parent ?? null
  }
  return path
}

function getEntry(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string,
): DisciplineRevisionEntry | null {
  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return null
  return byDrawing[disciplineKey] ?? null
}

export function getDisciplineOptionsForDrawing(
  data: NormalizedProjectData,
  drawingId: string,
): DisciplineOption[] {
  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return []
  const keys = Object.keys(byDrawing)
  const options: DisciplineOption[] = []

  const prefixKeys = new Set<string>()
  keys.forEach((k) => {
    const dot = k.indexOf('.')
    if (dot > 0) prefixKeys.add(k.slice(0, dot))
  })

  keys.forEach((key) => {
    const entry = byDrawing[key]
    if (!entry) return
    const isPrefix = prefixKeys.has(key)
    const isRegionKey = key.includes('.')

    if (isRegionKey) return

    if (isPrefix) {
      const regionKeys = keys
        .filter((k) => k.startsWith(key + '.'))
        .map((k) => k.slice(key.length + 1))
      options.push({
        key,
        label: entry.displayName ?? key,
        revisions: entry.revisions as DisciplineOption['revisions'],
        hasRegions: regionKeys.length > 0,
        regionKeys: regionKeys.length > 0 ? regionKeys : undefined,
        keyPrefix: key,
      })
    } else {
      options.push({
        key,
        label: entry.displayName ?? key,
        revisions: entry.revisions as DisciplineOption['revisions'],
      })
    }
  })

  return options
}

export function getRevisionsForDiscipline(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string,
): NormalizedRevision[] {
  const entry = getEntry(data, drawingId, disciplineKey)
  return entry?.revisions ?? []
}

export function getLatestRevision(revisions: NormalizedRevision[]): NormalizedRevision | undefined {
  return [...revisions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]
}

export interface DrawingImageEntry {
  image: string
  disciplineKey: string
  revisionVersion: string | null
  label: string
  date?: string
  isLatest?: boolean
}

export function getImageEntriesForDrawing(
  data: NormalizedProjectData,
  drawingId: string,
): DrawingImageEntry[] {
  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return []

  const entries: DrawingImageEntry[] = []
  for (const [disciplineKey, entry] of Object.entries(byDrawing)) {
    if (entry.revisions.length > 0) {
      const latest = getLatestRevision(entry.revisions)
      for (const r of entry.revisions) {
        entries.push({
          image: r.image,
          disciplineKey,
          revisionVersion: r.version,
          label: `${entry.displayName ?? disciplineKey} ${r.version}`,
          date: r.date,
          isLatest: latest?.version === r.version,
        })
      }
    } else if (entry.image) {
      entries.push({
        image: entry.image,
        disciplineKey,
        revisionVersion: null,
        label: `${entry.displayName ?? disciplineKey} (기본)`,
      })
    }
  }
  return entries
}

export function getImageForSelection(
  data: NormalizedProjectData,
  selection: {
    drawingId: string | null
    disciplineKey: string | null
    revisionVersion: string | null
  },
): string | null {
  const { drawingId, disciplineKey, revisionVersion } = selection
  if (!drawingId) return null

  const entry = disciplineKey ? getEntry(data, drawingId, disciplineKey) : null
  if (!entry) return null

  if (revisionVersion) {
    const rev = entry.revisions.find((r) => r.version === revisionVersion)
    return rev?.image ?? null
  }
  const latest = getLatestRevision(entry.revisions)
  if (latest?.image) return latest.image
  return entry.image ?? null
}

export function getDisciplineLabel(
  data: NormalizedProjectData,
  drawingId: string | null,
  disciplineKey: string | null,
): string | null {
  if (!drawingId || !disciplineKey) return null
  const entry = getEntry(data, drawingId, disciplineKey)
  return entry?.displayName ?? disciplineKey
}

export function getRevisionChanges(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string | null,
  revisionVersion: string | null,
): string[] {
  if (!drawingId || !disciplineKey || !revisionVersion) return []
  const revisions = getRevisionsForDiscipline(data, drawingId, disciplineKey)
  const rev = revisions.find((r) => r.version === revisionVersion)
  return Array.isArray(rev?.changes) ? rev.changes : []
}

export function getRevisionDate(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string | null,
  revisionVersion: string | null,
): string | null {
  if (!drawingId || !disciplineKey || !revisionVersion) return null
  const revisions = getRevisionsForDiscipline(data, drawingId, disciplineKey)
  const rev = revisions.find((r) => r.version === revisionVersion)
  return rev?.date ?? null
}

export const SPACE_LIST: {
  id: string
  slug: string
  displayName: string
}[] = [
  { id: '01', slug: '101building', displayName: '101동' },
  { id: '09', slug: 'publicfacility', displayName: '주민공동시설' },
  { id: '13', slug: 'parkinglot', displayName: '주차장' },
]

export function getDefaultDrawingIdForSlug(slug: string): string | null {
  const space = SPACE_LIST.find((s) => s.slug === slug)
  return space?.id ?? null
}
