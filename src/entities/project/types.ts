export interface ProjectInfo {
  name: string
  unit: string
}

export interface DisciplineDef {
  name: string
  displayName?: string
}

export interface ImageTransform {
  relativeTo?: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface PositionOnParent {
  vertices: number[][]
  imageTransform: ImageTransform
}

export interface DrawingNode {
  id: string
  name: string
  parent: string | null
  position: PositionOnParent | null
  order: number
}

export interface NormalizedRevision {
  version: string
  image: string
  date: string
  description: string
  changes: string[]
  imageTransform?: ImageTransform
  polygon?: { vertices: number[][] }
  polygonTransform?: ImageTransform
}

export interface DisciplineRevisionEntry {
  relativeTo?: string
  image?: string
  imageTransform?: ImageTransform
  polygon?: { vertices: number[][]; polygonTransform?: ImageTransform }
  revisions: NormalizedRevision[]
  displayName?: string
}

export type DisciplineRevisionsMap = Record<string, Record<string, DisciplineRevisionEntry>>

export interface NormalizedProjectData {
  project: ProjectInfo
  disciplines: DisciplineDef[]
  drawings: Record<string, DrawingNode>
  disciplineRevisions: DisciplineRevisionsMap
}
