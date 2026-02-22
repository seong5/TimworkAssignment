import type { Drawing, DisciplineNode, Revision, Metadata } from '../types/metadata'
import type { DisciplineOption } from '../types/metadata'

export const DRAWING_PART_LABELS: Record<string, string> = {
  '01': '101동',
  '09': '주민공동시설',
  '13': '주차장',
}

export function getDrawingPartLabel(drawingId: string): string | null {
  return DRAWING_PART_LABELS[drawingId] ?? null
}

export function getDrawingIdsInOrder(metadata: Metadata): string[] {
  return Object.keys(metadata.drawings).sort(
    (a, b) => metadata.drawings[a].order - metadata.drawings[b].order,
  )
}

export function getRootChildIds(metadata: Metadata): string[] {
  return getDrawingIdsInOrder(metadata).filter((id) => metadata.drawings[id].parent === '00')
}

export function getBreadcrumbIds(metadata: Metadata, drawingId: string): string[] {
  const path: string[] = []
  let id: string | null = drawingId
  while (id) {
    path.unshift(id)
    const drawing: Drawing | undefined = metadata.drawings[id]
    id = drawing?.parent ?? null
  }
  return path
}

export function getDisciplineOptions(drawing: Drawing): DisciplineOption[] {
  const options: DisciplineOption[] = []
  const disciplines = drawing.disciplines ?? {}

  function collect(key: string, node: DisciplineNode, labelPrefix: string) {
    if (node.revisions && node.revisions.length > 0) {
      options.push({
        key,
        label: labelPrefix + (node.displayName ?? key),
        revisions: node.revisions,
      })
      return
    }

    const skipKeys = new Set([
      'displayName',
      'image',
      'imageTransform',
      'polygon',
      'polygonTransform',
    ])
    for (const subKey of Object.keys(node)) {
      if (skipKeys.has(subKey)) continue
      const sub = node[subKey as keyof DisciplineNode]
      if (!sub || typeof sub !== 'object') continue
      const subNode = sub as Record<string, unknown>
      if ('revisions' in subNode && Array.isArray(subNode.revisions)) {
        const subLabel = labelPrefix ? `${labelPrefix} > ${subKey}` : `${key} > ${subKey}`
        options.push({
          key: `${key}.${subKey}`,
          label: subLabel,
          revisions: subNode.revisions as Revision[],
        })
        continue
      }

      if (subKey === 'regions' && typeof subNode === 'object') {
        const regionKeys: string[] = []
        for (const innerKey of Object.keys(subNode)) {
          if (skipKeys.has(innerKey)) continue
          const inner = (subNode as Record<string, unknown>)[innerKey]
          if (!inner || typeof inner !== 'object' || !('revisions' in inner)) continue
          const innerNode = inner as { revisions?: Revision[] }
          if (Array.isArray(innerNode.revisions)) regionKeys.push(innerKey)
        }
        if (regionKeys.length > 0) {
          options.push({
            key,
            label: labelPrefix + (node.displayName ?? key),
            revisions: [],
            hasRegions: true,
            regionKeys,
            keyPrefix: `${key}.regions`,
          })
          return
        }
      }
      for (const innerKey of Object.keys(subNode)) {
        if (skipKeys.has(innerKey)) continue
        const inner = subNode[innerKey]
        if (!inner || typeof inner !== 'object' || !('revisions' in inner)) continue
        const innerNode = inner as { revisions?: Revision[] }
        if (!Array.isArray(innerNode.revisions)) continue
        const innerLabel = labelPrefix ? `${labelPrefix} > ${innerKey}` : `${key} > ${innerKey}`
        options.push({
          key: `${key}.${subKey}.${innerKey}`,
          label: innerLabel,
          revisions: innerNode.revisions,
        })
      }
    }
  }

  for (const key of Object.keys(disciplines)) {
    collect(key, disciplines[key], '')
  }
  return options
}

export function getLatestRevision(revisions: Revision[]): Revision | undefined {
  return [...revisions].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0]
}

export interface DrawingImageEntry {
  image: string
  disciplineKey: string
  revisionVersion: string | null
  label: string
  /** 리비전 날짜 (YYYY-MM-DD). 기본 이미지 등은 없을 수 있음 */
  date?: string
}

export function getImageEntriesForDrawing(
  metadata: Metadata,
  drawingId: string,
): DrawingImageEntry[] {
  const drawing = metadata.drawings[drawingId]
  if (!drawing) return []
  if (!drawing.disciplines || Object.keys(drawing.disciplines).length === 0) {
    if (drawing.image) {
      return [{ image: drawing.image, disciplineKey: '', revisionVersion: null, label: '기본' }]
    }
    return []
  }
  const opts = getDisciplineOptions(drawing)
  const entries: DrawingImageEntry[] = []
  for (const opt of opts) {
    if (opt.hasRegions && opt.regionKeys?.length && opt.keyPrefix) {
      for (const rk of opt.regionKeys) {
        const key = `${opt.keyPrefix}.${rk}`
        const revs = getRevisionsForDiscipline(drawingId, key, metadata)
        for (const r of revs) {
          entries.push({
            image: r.image,
            disciplineKey: key,
            revisionVersion: r.version,
            label: `${opt.label} ${rk} ${r.version}`,
            date: r.date,
          })
        }
      }
      const node = getDisciplineNode(drawing, opt.key)
      if (node?.image) {
        entries.push({
          image: node.image,
          disciplineKey: opt.key,
          revisionVersion: null,
          label: `${opt.label} (기본)`,
        })
      }
      continue
    }
    {
      if (opt.revisions?.length) {
        for (const r of opt.revisions) {
          entries.push({
            image: r.image,
            disciplineKey: opt.key,
            revisionVersion: r.version,
            label: `${opt.label} ${r.version}`,
            date: r.date,
          })
        }
      } else {
        const node = getDisciplineNode(drawing, opt.key)
        if (node?.image) {
          entries.push({
            image: node.image,
            disciplineKey: opt.key,
            revisionVersion: null,
            label: `${opt.label} (기본)`,
          })
        }
      }
    }
  }
  return entries
}

export function getImageFilenameForSelection(
  metadata: Metadata,
  selection: {
    drawingId: string | null
    disciplineKey: string | null
    revisionVersion: string | null
  },
): string | null {
  const { drawingId, disciplineKey, revisionVersion } = selection
  if (!drawingId) return null
  const drawing = metadata.drawings[drawingId]
  if (!drawing) return null

  if (disciplineKey && revisionVersion) {
    const revisions = getRevisionsForDiscipline(drawingId, disciplineKey, metadata)
    const rev = revisions.find((r) => r.version === revisionVersion)
    return rev?.image ?? null
  }
  if (disciplineKey) {
    const revisions = getRevisionsForDiscipline(drawingId, disciplineKey, metadata)
    const latest = getLatestRevision(revisions)
    if (latest?.image) return latest.image
    const node = getDisciplineNode(drawing, disciplineKey)
    if (node?.image) return node.image
    return null
  }
  return drawing.image
}

function getDisciplineNode(
  drawing: Drawing,
  disciplineKey: string,
): (DisciplineNode & { image?: string }) | null {
  if (!drawing.disciplines) return null
  const parts = disciplineKey.split('.')
  let node: unknown = drawing.disciplines[parts[0]]
  for (let i = 1; i < parts.length && node; i++) {
    node = (node as Record<string, unknown>)[parts[i]]
  }
  return (node as DisciplineNode & { image?: string }) ?? null
}

function getRevisionsForDiscipline(
  drawingId: string,
  disciplineKey: string,
  metadata: Metadata,
): Revision[] {
  const drawing = metadata.drawings[drawingId]
  if (!drawing?.disciplines) return []
  const parts = disciplineKey.split('.')
  let node: unknown = drawing.disciplines[parts[0]]
  for (let i = 1; i < parts.length && node; i++) {
    node = (node as Record<string, unknown>)[parts[i]]
  }
  return (node as { revisions?: Revision[] })?.revisions ?? []
}

export function getRevisionChanges(
  metadata: Metadata,
  drawingId: string,
  disciplineKey: string | null,
  revisionVersion: string | null,
): string[] {
  if (!drawingId || !disciplineKey || !revisionVersion) return []
  const revisions = getRevisionsForDiscipline(drawingId, disciplineKey, metadata)
  const rev = revisions.find((r) => r.version === revisionVersion)
  return Array.isArray(rev?.changes) ? rev.changes : []
}

export function getRevisionDate(
  metadata: Metadata,
  drawingId: string,
  disciplineKey: string | null,
  revisionVersion: string | null,
): string | null {
  if (!drawingId || !disciplineKey || !revisionVersion) return null
  const revisions = getRevisionsForDiscipline(drawingId, disciplineKey, metadata)
  const rev = revisions.find((r) => r.version === revisionVersion)
  return rev?.date ?? null
}
