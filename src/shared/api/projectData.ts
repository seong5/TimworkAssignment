import type { NormalizedProjectData } from '@/entities/project'

const DATA_BASE = '/data'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/** project.json */
export async function fetchProject(): Promise<{
  project: NormalizedProjectData['project']
  disciplines: NormalizedProjectData['disciplines']
}> {
  return fetchJson('project.json')
}

/** drawings.json */
export async function fetchDrawings(): Promise<{
  drawings: NormalizedProjectData['drawings']
}> {
  return fetchJson('drawings.json')
}

/** discipline_revisions.json */
export async function fetchDisciplineRevisions(): Promise<NormalizedProjectData['disciplineRevisions']> {
  return fetchJson('discipline_revisions.json')
}

/** 세 파일 fetch 후 병합하여 NormalizedProjectData 반환 */
export async function fetchProjectData(): Promise<NormalizedProjectData> {
  const [projectPayload, drawingsPayload, disciplineRevisions] = await Promise.all([
    fetchProject(),
    fetchDrawings(),
    fetchDisciplineRevisions(),
  ])
  return {
    project: projectPayload.project,
    disciplines: projectPayload.disciplines,
    drawings: drawingsPayload.drawings,
    disciplineRevisions,
  }
}
