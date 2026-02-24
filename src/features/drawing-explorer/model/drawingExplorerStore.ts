import { create } from 'zustand'

type DrawingSelection = {
  drawingId: string | null
  disciplineKey: string | null
  revisionVersion: string | null
}

interface DrawingExplorerState {
  selection: DrawingSelection
  compareMode: boolean
  compareLeft: string | null
  compareRight: string | null
  setSelection: (selection: DrawingSelection) => void
  resetSelection: () => void
  setDrawingId: (drawingId: string | null) => void
  setCompareMode: (mode: boolean) => void
  setCompareLeft: (version: string | null) => void
  setCompareRight: (version: string | null) => void
}

export const useDrawingExplorerStore = create<DrawingExplorerState>((set) => ({
  selection: { drawingId: null, disciplineKey: null, revisionVersion: null },
  compareMode: false,
  compareLeft: null,
  compareRight: null,

  setSelection: (selection) => set({ selection }),

  resetSelection: () =>
    set({
      selection: { drawingId: null, disciplineKey: null, revisionVersion: null },
      compareMode: false,
      compareLeft: null,
      compareRight: null,
    }),

  setDrawingId: (drawingId) =>
    set(() => ({
      selection: { drawingId, disciplineKey: null, revisionVersion: null },
      compareMode: false,
      compareLeft: null,
      compareRight: null,
    })),

  setCompareMode: (mode) => set({ compareMode: mode }),
  setCompareLeft: (version) => set({ compareLeft: version }),
  setCompareRight: (version) => set({ compareRight: version }),
}))

