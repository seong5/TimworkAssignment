import { create } from 'zustand'
import type { NormalizedProjectData, ProjectInfo } from '../types'
import { fetchProject, fetchProjectData } from '../api/projectData'

interface ProjectState {
  project: ProjectInfo | null
  data: NormalizedProjectData | null
  loading: boolean
  error: Error | null
  loadProject: () => Promise<void>
  loadProjectData: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  data: null,
  loading: false,
  error: null,

  async loadProject() {
    const { project, loading } = get()
    if (project && !loading) return
    try {
      set({ loading: true, error: null })
      const payload = await fetchProject()
      set((prev) => ({
        ...prev,
        project: payload.project,
        loading: false,
      }))
    } catch (err) {
      set({ error: err as Error, loading: false })
    }
  },

  async loadProjectData() {
    const { data, loading } = get()
    if (data && !loading) return
    try {
      set({ loading: true, error: null })
      const fullData = await fetchProjectData()
      set({
        project: fullData.project,
        data: fullData,
        loading: false,
        error: null,
      })
    } catch (err) {
      set({ error: err as Error, loading: false })
    }
  },
}))
