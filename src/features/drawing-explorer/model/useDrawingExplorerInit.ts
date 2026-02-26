import { useEffect } from 'react'
import type { NormalizedProjectData } from '@/entities/project'
import { getRootChildIds, getDefaultDrawingIdForSlug } from '@/entities/project'
import { useDrawingExplorerStore } from './drawingExplorerStore'

export interface UseDrawingExplorerInitParams {
  slug: string | undefined
  initialDrawingId?: string
  initialDisciplineKey?: string
  initialRevisionVersion?: string
  data: NormalizedProjectData | null | undefined
  allowedDrawingIds: string[]
  spaceId: string | null
}

export function useDrawingExplorerInit({
  slug,
  initialDrawingId,
  initialDisciplineKey,
  initialRevisionVersion,
  data,
  allowedDrawingIds,
  spaceId,
}: UseDrawingExplorerInitParams) {
  const { selection, setSelection, resetSelection, setDrawingId } = useDrawingExplorerStore()

  // URL 파라미터 → selection 동기화
  useEffect(() => {
    if (initialDrawingId && initialDisciplineKey) {
      setSelection({
        drawingId: initialDrawingId,
        disciplineKey: initialDisciplineKey,
        revisionVersion: initialRevisionVersion ?? null,
      })
    } else {
      resetSelection()
    }
  }, [
    slug,
    initialDrawingId,
    initialDisciplineKey,
    initialRevisionVersion,
    setSelection,
    resetSelection,
  ])

  // URL 파라미터 없을 때 기본 도면 설정
  useEffect(() => {
    if (initialDrawingId && initialDisciplineKey) return
    if (!data || selection.drawingId !== null) return
    const defaultBySlug = slug ? getDefaultDrawingIdForSlug(slug) : null
    const rootChildIds = getRootChildIds(data)
    const defaultDrawingId = defaultBySlug ?? rootChildIds[0] ?? Object.keys(data.drawings)[0]
    if (defaultDrawingId) {
      setDrawingId(defaultDrawingId)
    }
  }, [data, slug, selection.drawingId, initialDrawingId, initialDisciplineKey, setDrawingId])

  // selection이 허용된 도면 목록에 없으면 space 기본으로 조정
  useEffect(() => {
    if (!data || !spaceId || allowedDrawingIds.length === 0) return
    if (selection.drawingId !== null && !allowedDrawingIds.includes(selection.drawingId)) {
      setDrawingId(spaceId)
    }
  }, [allowedDrawingIds, data, selection.drawingId, setDrawingId, spaceId])
}
