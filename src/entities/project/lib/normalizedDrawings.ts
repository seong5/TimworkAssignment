import type {
  NormalizedProjectData,
  DrawingNode,
  DisciplineRevisionEntry,
  NormalizedRevision,
  DisciplineOption,
  ImageTransform,
} from '../types'
import { transformPolygon } from './polygonUtils'

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

/** 도면별 이미지 항목을 공종(discipline) 단위로 묶은 구조 */
export interface DrawingDisciplineGroup {
  disciplineKey: string
  label: string
  entries: DrawingImageEntry[]
  /** 구조.A, 구조.B 등 부모 하위 항목 (라벨은 A, B로 단축) */
  subGroups?: DrawingDisciplineGroup[]
}

export function getImageEntriesGroupedByDiscipline(
  data: NormalizedProjectData,
  drawingId: string,
): DrawingDisciplineGroup[] {
  const entries = getImageEntriesForDrawing(data, drawingId)
  const byKey = new Map<string, DrawingImageEntry[]>()
  for (const e of entries) {
    const list = byKey.get(e.disciplineKey) ?? []
    list.push(e)
    byKey.set(e.disciplineKey, list)
  }

  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return []

  const allKeys = Object.keys(byDrawing)
  const regionKeys = allKeys.filter((k) => k.includes('.'))
  const parentToChildren = new Map<string, string[]>()
  for (const rk of regionKeys) {
    const dot = rk.indexOf('.')
    if (dot <= 0) continue
    const parent = rk.slice(0, dot)
    if (!parentToChildren.has(parent)) parentToChildren.set(parent, [])
    parentToChildren.get(parent)!.push(rk)
  }

  const result: DrawingDisciplineGroup[] = []

  for (const key of allKeys) {
    if (key.includes('.')) continue
    const list = byKey.get(key) ?? []
    const dispEntry = getEntry(data, drawingId, key)
    const label = dispEntry?.displayName ?? key

    const childKeys = parentToChildren.get(key)
    let subGroups: DrawingDisciplineGroup[] | undefined
    if (childKeys && childKeys.length > 0) {
      subGroups = childKeys
        .sort((a, b) => a.localeCompare(b))
        .map((ck) => {
          const childList = byKey.get(ck) ?? []
          const childDisp = getEntry(data, drawingId, ck)
          const fullLabel = childDisp?.displayName ?? ck
          const shortLabel = fullLabel.includes(' > ') ? fullLabel.split(' > ').pop() ?? fullLabel : ck.split('.').pop() ?? ck
          return { disciplineKey: ck, label: shortLabel, entries: childList }
        })
        .filter((sg) => sg.entries.length > 0)
      if (subGroups.length === 0) subGroups = undefined
    }

    result.push({ disciplineKey: key, label, entries: list, subGroups })
  }

  return result.sort((a, b) => a.label.localeCompare(b.label))
}

function getFirstDisciplineKey(data: NormalizedProjectData, drawingId: string): string | null {
  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return null
  const keys = Object.keys(byDrawing).filter((k) => !k.includes('.'))
  return keys[0] ?? null
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

  const effectiveKey = disciplineKey ?? getFirstDisciplineKey(data, drawingId)
  const entry = effectiveKey ? getEntry(data, drawingId, effectiveKey) : null
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

export function getRevisionDescription(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string | null,
  revisionVersion: string | null,
): string | null {
  if (!drawingId || !disciplineKey || !revisionVersion) return null
  const revisions = getRevisionsForDiscipline(data, drawingId, disciplineKey)
  const rev = revisions.find((r) => r.version === revisionVersion)
  return rev?.description ?? null
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

export function getImageTransformForRevision(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string,
  version: string | null,
): ImageTransform | null {
  const entry = getEntry(data, drawingId, disciplineKey)
  if (!entry) return null
  if (version) {
    const rev = entry.revisions.find((r) => r.version === version)
    const t = rev?.imageTransform ?? entry.imageTransform
    if (!t) return null
    return t
  }
  const t = entry.imageTransform ?? getLatestRevision(entry.revisions)?.imageTransform
  if (!t) return null
  return t
}

export interface PolygonForRevisionResult {
  verticesInRefSpace: number[][]
  imageTransform: ImageTransform
  /** polygon이 정의된 기준 이미지 (픽셀 좌표). relativeTo와 다를 때 스케일링에 사용 */
  polygonVerticesRaw?: number[][]
  polygonBaseImage?: string
}

/** 특정 리비전의 polygon을 기준 좌표계(reference space)에서 반환. 없으면 null */
export function getPolygonForRevision(
  data: NormalizedProjectData,
  drawingId: string,
  disciplineKey: string,
  version: string | null,
): PolygonForRevisionResult | null {
  const entry = getEntry(data, drawingId, disciplineKey)
  if (!entry) return null

  const imageTransform = getImageTransformForRevision(data, drawingId, disciplineKey, version)
  if (!imageTransform) return null

  const rev = version ? entry.revisions.find((r) => r.version === version) : null
  const latestRev = getLatestRevision(entry.revisions)
  const polygon = rev?.polygon ?? entry.polygon ?? latestRev?.polygon
  if (!polygon?.vertices?.length) return null

  const polyTransform =
    rev?.polygonTransform ??
    rev?.imageTransform ??
    polygon.polygonTransform ??
    entry.imageTransform ??
    latestRev?.polygonTransform ??
    latestRev?.imageTransform
  if (!polyTransform) return null

  const verticesInRefSpace = transformPolygon(polygon.vertices, polyTransform)
  const polygonBaseImage = rev?.relativeTo ?? entry.relativeTo
  const currentImage = version
    ? entry.revisions.find((r) => r.version === version)?.image ?? entry.image
    : entry.image

  const result: PolygonForRevisionResult = { verticesInRefSpace, imageTransform }
  if (polygonBaseImage && currentImage && polygonBaseImage !== currentImage) {
    result.polygonVerticesRaw = polygon.vertices
    result.polygonBaseImage = polygonBaseImage
  }
  return result
}

/** 겹쳐보기 가능한 공종 목록 (지역 키 제외, relativeTo 기준 정렬) */
export function getOverlayableDisciplines(
  data: NormalizedProjectData,
  drawingId: string,
): { key: string; label: string; hasImage: boolean }[] {
  const byDrawing = data.disciplineRevisions[drawingId]
  if (!byDrawing) return []

  const result: { key: string; label: string; hasImage: boolean }[] = []
  const prefixKeys = new Set<string>()
  for (const k of Object.keys(byDrawing)) {
    const dot = k.indexOf('.')
    if (dot > 0) prefixKeys.add(k.slice(0, dot))
  }

  for (const [key, entry] of Object.entries(byDrawing)) {
    if (key.includes('.')) continue
    const hasImage = !!(entry.image || (entry.revisions.length > 0 && getLatestRevision(entry.revisions)))
    if (!hasImage) continue
    result.push({
      key,
      label: entry.displayName ?? key,
      hasImage,
    })
  }
  return result.sort((a, b) => a.label.localeCompare(b.label))
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

export type SpaceItem = (typeof SPACE_LIST)[number]

export function getSpaceBySlug(slug: string | undefined): SpaceItem | null {
  if (!slug) return null
  return SPACE_LIST.find((s) => s.slug === slug) ?? null
}

export function getDefaultDrawingIdForSlug(slug: string): string | null {
  const space = getSpaceBySlug(slug)
  return space?.id ?? null
}

export interface RecentDrawingUpdate {
  drawingId: string
  drawingName: string
  disciplineKey: string
  disciplineLabel: string
  revisionVersion: string
  previousRevisionVersion: string | null
  date: string
  slug: string
  spaceDisplayName: string
  changes: string[]
}

function getSlugForDrawingId(data: NormalizedProjectData, drawingId: string): string {
  let id: string | null = drawingId
  while (id) {
    const space = SPACE_LIST.find((s) => s.id === id)
    if (space) return space.slug
    const drawing: DrawingNode | undefined = data.drawings[id]
    id = drawing?.parent ?? null
  }
  return SPACE_LIST[0]?.slug ?? '101building'
}

/**
 * 모든 도면이 이미 존재한다고 가정하고,
 * 현재 날짜와 가장 가까운 리비전 날짜를 가진 도면 하나를 '업데이트된 도면'으로 반환
 */
export function getRecentDrawingUpdates(
  data: NormalizedProjectData,
  _limit = 12,
): RecentDrawingUpdate[] {
  const items: (RecentDrawingUpdate & { dateTs: number })[] = []
  const today = new Date()
  const todayStart = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())

  for (const [drawingId, byDiscipline] of Object.entries(data.disciplineRevisions)) {
    const drawing = data.drawings[drawingId]
    const drawingName = drawing?.name ?? drawingId

    const slug = getSlugForDrawingId(data, drawingId)
    const space = SPACE_LIST.find((s) => s.id === drawingId) ?? SPACE_LIST.find((s) => s.slug === slug)
    const spaceDisplayName = space?.displayName ?? drawingName

    for (const [disciplineKey, entry] of Object.entries(byDiscipline)) {
      if (entry.revisions.length === 0) continue

      const latest = getLatestRevision(entry.revisions)
      if (!latest) continue

      const dateStr = latest.date?.trim() ?? ''
      const dateTs = dateStr ? Date.parse(dateStr.slice(0, 10)) : 0
      if (Number.isNaN(dateTs)) continue

      const revsByDate = [...entry.revisions].sort((a, b) => {
        const ta = (a.date?.trim() ?? '').slice(0, 10) ? Date.parse((a.date ?? '').slice(0, 10)) : 0
        const tb = (b.date?.trim() ?? '').slice(0, 10) ? Date.parse((b.date ?? '').slice(0, 10)) : 0
        return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta)
      })
      const latestIdx = revsByDate.findIndex((r) => r.version === latest.version)
      const prevRev = latestIdx >= 0 && latestIdx + 1 < revsByDate.length ? revsByDate[latestIdx + 1] : null
      const previousRevisionVersion = prevRev?.version ?? null

      items.push({
        drawingId,
        drawingName,
        disciplineKey,
        disciplineLabel: entry.displayName ?? disciplineKey,
        revisionVersion: latest.version,
        previousRevisionVersion,
        date: dateStr,
        dateTs,
        slug,
        spaceDisplayName,
        changes: Array.isArray(latest.changes) ? latest.changes : [],
      })
    }
  }

  if (items.length === 0) return []

  const closest = items.reduce((acc, cur) => {
    const accDiff = Math.abs(acc.dateTs - todayStart)
    const curDiff = Math.abs(cur.dateTs - todayStart)
    return curDiff < accDiff ? cur : acc
  })

  return [closest].map(({ dateTs, ...rest }) => rest)
}
