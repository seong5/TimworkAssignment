import type { NormalizedProjectData } from '@/entities/project'
import { getRevisionsForDiscipline, getLatestRevision } from '@/entities/project'
import type { OverlayLayer } from '../../ui/DisciplineOverlayView'

export type OverlayableDiscipline = { key: string; label: string }

export function createInitialOverlayLayers(
  data: NormalizedProjectData | null,
  drawingId: string,
  overlayableDisciplines: OverlayableDiscipline[],
): OverlayLayer[] {
  if (!data || overlayableDisciplines.length === 0) return []

  return overlayableDisciplines.map((d) => {
    const revs = getRevisionsForDiscipline(data, drawingId, d.key)
    const latest = getLatestRevision(revs)
    const isArch = d.key === '건축'
    return {
      disciplineKey: d.key,
      disciplineLabel: d.label,
      revisionVersion: latest?.version ?? null,
      opacity: isArch ? 0.8 : 0.6,
      visible: isArch,
    }
  })
}
