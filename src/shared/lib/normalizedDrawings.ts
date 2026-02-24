import type {
  NormalizedProjectData,
  DrawingNode,
  DisciplineRevisionEntry,
  NormalizedRevision,
  DisciplineOption,
} from '@/entities/project'

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

/** 특정 부모의 자식 도면 id 목록 (order 순) */
export function getChildDrawingIds(data: NormalizedProjectData, parentId: string): string[] {
  return getDrawingIdsInOrder(data).filter((id) => data.drawings[id].parent === parentId)
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
  if (revisions.length === 0) return undefined
  const parsed = (r: NormalizedRevision): number => {
    const s = r.date?.trim() ?? ''
    if (!s) return 0
    const iso = s.slice(0, 10)
    const t = Date.parse(iso)
    return Number.isNaN(t) ? 0 : t
  }
  return [...revisions].sort((a, b) => {
    const ta = parsed(a)
    const tb = parsed(b)
    if (tb !== ta) return tb - ta
    return (b.version || '').localeCompare(a.version || '')
  })[0]
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
    const labelPrefix = entry.displayName ?? disciplineKey
    if (entry.revisions.length > 0) {
      const latest = getLatestRevision(entry.revisions)
      if (entry.image) {
        entries.push({
          image: entry.image,
          disciplineKey,
          revisionVersion: null,
          label: `${labelPrefix} (기본)`,
          isLatest: false,
        })
      }
      for (const r of entry.revisions) {
        entries.push({
          image: r.image,
          disciplineKey,
          revisionVersion: r.version,
          label: `${labelPrefix} ${r.version}`,
          date: r.date,
          isLatest: latest?.version === r.version,
        })
      }
    } else if (entry.image) {
      entries.push({
        image: entry.image,
        disciplineKey,
        revisionVersion: null,
        label: `${labelPrefix} (기본)`,
        isLatest: true,
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
  // revisionVersion null = "(기본)" 선택. 기본 이미지가 있으면 우선, 없으면 최신 리비전
  if (entry.image) return entry.image
  const latest = getLatestRevision(entry.revisions)
  return latest?.image ?? null
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

export function getImageForRevision(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string | null,
  version: string | null,
): string | null {
  if (!drawingId || !disciplineKey) return null
  const entry = getEntry(data, drawingId, disciplineKey)
  if (!entry) return null
  if (version) {
    const rev = entry.revisions.find((r) => r.version === version)
    return rev?.image ?? null
  }
  if (entry.image) return entry.image
  const latest = getLatestRevision(entry.revisions)
  return latest?.image ?? null
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
