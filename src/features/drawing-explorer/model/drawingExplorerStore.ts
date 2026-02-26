import { create } from 'zustand'

type DrawingSelection = {
  drawingId: string | null
  disciplineKey: string | null
  revisionVersion: string | null
}

interface DrawingExplorerState {
  selection: DrawingSelection
  setSelection: (selection: DrawingSelection) => void
  resetSelection: () => void
  setDrawingId: (drawingId: string | null) => void
}

export const useDrawingExplorerStore = create<DrawingExplorerState>((set) => ({
  selection: { drawingId: null, disciplineKey: null, revisionVersion: null },

  setSelection: (selection) => set({ selection }),

  resetSelection: () =>
    set({
      selection: { drawingId: null, disciplineKey: null, revisionVersion: null },
    }),

  setDrawingId: (drawingId) =>
    set({
      selection: { drawingId, disciplineKey: null, revisionVersion: null },
    }),
}))

