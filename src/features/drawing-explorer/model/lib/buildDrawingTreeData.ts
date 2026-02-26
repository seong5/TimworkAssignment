import type { NormalizedProjectData } from '@/entities/project'
import type { DrawingDisciplineGroup } from '@/entities/project'
import {
  getDrawingIdsInOrder,
  getChildDrawingIds,
  getImageEntriesGroupedByDiscipline,
} from '@/entities/project'

export type SpaceItem = {
  id: string
  slug: string
  displayName: string
}

export type DrawingTreeData = {
  rootDrawing: { id: string; name: string } | null
  childDrawings: { id: string; name: string }[]
  disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]>
  allowedDrawingIds: string[]
}

export function buildDrawingTreeData(
  data: NormalizedProjectData | null,
  space: SpaceItem | null,
): DrawingTreeData {
  if (!data) {
    return {
      rootDrawing: null,
      childDrawings: [],
      disciplinesByDrawingId: {},
      allowedDrawingIds: [],
    }
  }

  if (space) {
    const rootId = space.id
    const childIds = getChildDrawingIds(data, rootId)
    const rootDrawing: { id: string; name: string } = {
      id: rootId,
      name: data.drawings[rootId].name,
    }
    const childDrawings = childIds.map((id) => ({
      id,
      name: data.drawings[id].name,
    }))
    const rootNode = data.drawings[rootId]
    const parentId = rootNode?.parent ?? null
    const parentRevisions = parentId ? data.disciplineRevisions[parentId] : null
    const hasParentWithImage =
      parentId != null &&
      parentRevisions != null &&
      Object.keys(parentRevisions).filter((k) => !k.includes('.')).length > 0
    const idsForDisciplines =
      hasParentWithImage && parentId
        ? [parentId, rootId, ...childIds]
        : [rootId, ...childIds]
    const allDrawingIds = idsForDisciplines
    const disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]> = {}
    for (const id of idsForDisciplines) {
      disciplinesByDrawingId[id] = getImageEntriesGroupedByDiscipline(data, id)
    }
    return {
      rootDrawing,
      childDrawings,
      disciplinesByDrawingId,
      allowedDrawingIds: allDrawingIds,
    }
  }

  const ids = getDrawingIdsInOrder(data)
  const rootId = ids[0] ?? null
  const childIds = ids.filter((id) => data.drawings[id].parent === rootId)
  const rootDrawing: { id: string; name: string } | null = rootId
    ? { id: rootId, name: data.drawings[rootId].name }
    : null
  const childDrawings = childIds.map((id) => ({
    id,
    name: data.drawings[id].name,
  }))
  const allDrawingIds = rootId ? [rootId, ...childIds] : childIds
  const disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]> = {}
  for (const id of allDrawingIds) {
    disciplinesByDrawingId[id] = getImageEntriesGroupedByDiscipline(data, id)
  }
  return {
    rootDrawing,
    childDrawings,
    disciplinesByDrawingId,
    allowedDrawingIds: allDrawingIds,
  }
}
