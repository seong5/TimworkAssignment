export interface Project {
  name: string
  unit: string
}

export interface DisciplineDef {
  name: string
  displayName?: string
}

export interface Revision {
  version: string
  image: string
  date: string
  description: string
  changes: string[]
  imageTransform?: ImageTransform
  polygon?: { vertices: number[][] }
  polygonTransform?: ImageTransform
}

export interface ImageTransform {
  relativeTo?: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface DisciplineNode {
  displayName?: string
  image?: string
  imageTransform?: ImageTransform
  polygon?: { vertices: number[][] }
  polygonTransform?: ImageTransform
  revisions?: Revision[]
  [subKey: string]: unknown
}

export interface Drawing {
  id: string
  name: string
  image: string
  parent: string | null
  position: PositionOnParent | null
  order: number
  disciplines?: Record<string, DisciplineNode>
}

export interface PositionOnParent {
  vertices: number[][]
  imageTransform: ImageTransform
}

export interface Metadata {
  project: Project
  disciplines: DisciplineDef[]
  drawings: Record<string, Drawing>
}

export interface DisciplineOption {
  key: string
  label: string
  revisions: Revision[]
  hasRegions?: boolean
  regionKeys?: string[]
  keyPrefix?: string
}
