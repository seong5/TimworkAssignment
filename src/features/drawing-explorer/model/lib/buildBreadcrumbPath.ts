export type CrumbType = 'space' | 'discipline' | 'revision'

export type CrumbItem = {
  id: string
  name: string
  type: CrumbType
}

export interface BuildBreadcrumbPathParams {
  pathIds: string[]
  drawingNames: Record<string, string>
  drawingId: string | null
  disciplineLabel?: string | null
  revisionVersion?: string | null
  revisionDate?: string | null
}

export interface BreadcrumbPathResult {
  path: CrumbItem[]
  drawingName: string | null
  disciplineShort: string | null
}

export function buildBreadcrumbPath({
  pathIds,
  drawingNames,
  drawingId,
  disciplineLabel = null,
  revisionVersion = null,
  revisionDate = null,
}: BuildBreadcrumbPathParams): BreadcrumbPathResult {
  const spaceCrumbs: CrumbItem[] = pathIds.map((id) => ({
    id,
    name: drawingNames[id] ?? id,
    type: 'space',
  }))

  const path: CrumbItem[] = [...spaceCrumbs]
  if (disciplineLabel) {
    path.push({ id: 'discipline', name: disciplineLabel, type: 'discipline' })
  }
  if (revisionVersion) {
    path.push({
      id: 'revision',
      name: revisionDate ? `${revisionVersion} (${revisionDate})` : revisionVersion,
      type: 'revision',
    })
  }

  const drawingName = drawingId ? (drawingNames[drawingId] ?? null) : null
  const disciplineShort = disciplineLabel ? disciplineLabel.split(' > ')[0] : null

  return { path, drawingName, disciplineShort }
}
