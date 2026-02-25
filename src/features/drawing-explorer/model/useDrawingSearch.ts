import { useCallback, useMemo } from 'react'
import type { NormalizedProjectData } from '@/entities/project'
import { useDrawingExplorerStore } from './drawingExplorerStore'
import {
  filterSearchResults,
  resolveSearchSelection,
  type SearchSelectPayload,
} from './lib/searchDrawings'

export function useDrawingSearch(
  data: NormalizedProjectData | null | undefined,
  allowedDrawingIds: string[],
  searchQuery: string,
  onSelectComplete?: () => void,
) {
  const setSelection = useDrawingExplorerStore((s) => s.setSelection)

  const filteredSearchResults = useMemo(
    () => filterSearchResults(data ?? null, allowedDrawingIds, searchQuery),
    [data, allowedDrawingIds, searchQuery],
  )

  const handleSelectFromSearch = useCallback(
    (payload: SearchSelectPayload) => {
      const selection = resolveSearchSelection(data ?? null, payload)
      if (selection) {
        setSelection(selection)
        onSelectComplete?.()
      }
    },
    [data, setSelection, onSelectComplete],
  )

  return { filteredSearchResults, handleSelectFromSearch }
}
