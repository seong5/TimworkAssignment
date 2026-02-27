export type {
  ProjectInfo,
  DisciplineDef,
  ImageTransform,
  PositionOnParent,
  DrawingNode,
  NormalizedRevision,
  DisciplineRevisionEntry,
  DisciplineRevisionsMap,
  NormalizedProjectData,
  DisciplineOption,
} from './types'

export { getBoundingBox, transformPolygon } from './lib/polygonUtils'
export {
  DRAWING_PART_LABELS,
  getDrawingPartLabel,
  getDrawingIdsInOrder,
  getRootChildIds,
  getChildDrawingIds,
  getBreadcrumbIds,
  getDisciplineOptionsForDrawing,
  getRevisionsForDiscipline,
  getLatestRevision,
  getImageEntriesForDrawing,
  getImageEntriesGroupedByDiscipline,
  getImageForRevision,
  getImageForSelection,
  getDisciplineLabel,
  getRevisionChanges,
  getRevisionDescription,
  getRevisionDate,
  SPACE_LIST,
  getSpaceBySlug,
  getDefaultDrawingIdForSlug,
  getRecentDrawingUpdates,
  getImageTransformForRevision,
  getPolygonForRevision,
  getOverlayableDisciplines,
} from './lib/normalizedDrawings'
export type {
  DrawingImageEntry,
  DrawingDisciplineGroup,
  PolygonForRevisionResult,
  RecentDrawingUpdate,
  SpaceItem,
} from './lib/normalizedDrawings'

export { useProjectData } from './model/useProjectData'
export { useProjectInfo } from './model/useProjectInfo'
