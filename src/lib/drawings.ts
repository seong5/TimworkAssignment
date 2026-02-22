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
    // 공종만 선택된 경우(예: 구조) 상위 노드의 image 사용. 구조는 regions 안에만 revisions가 있어 상위에는 없음.
    const node = getDisciplineNode(drawing, disciplineKey)
    if (node?.image) return node.image
    return null
  }
  return drawing.image
}

/** disciplineKey 경로의 노드 반환 (예: "구조" → 구조 노드, "구조.regions.A" → A 노드) */
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
