import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { Button } from '@/shared/ui'
import { useProjectData } from '@/entities/project'
import { getRevisionsForDiscipline, SPACE_LIST } from '@/entities/project'
import { RevisionCompareView, DrawingPageHeader } from '@/features/drawing-explorer'
import {
  useCompareVersions,
  getRevisionComparePanels,
} from '@/features/drawing-explorer/model'

export interface RevisionCompareWidgetProps {
  slug: string | undefined
  drawingId: string | undefined
  disciplineKey: string | undefined
  initialLeft?: string
  initialRight?: string
}

export function RevisionCompareWidget({
  slug,
  drawingId,
  disciplineKey,
  initialLeft,
  initialRight,
}: RevisionCompareWidgetProps) {
  const navigate = useNavigate()
  const space = slug ? SPACE_LIST.find((s) => s.slug === slug) : null
  const { data, loading, error } = useProjectData()

  const currentRevisions = useMemo(() => {
    if (!data || !drawingId || !disciplineKey) return []
    return getRevisionsForDiscipline(data, drawingId, disciplineKey)
  }, [data, drawingId, disciplineKey])

  const { compareLeft, setCompareLeft, compareRight, setCompareRight } = useCompareVersions({
    revisions: currentRevisions,
    initialLeft,
    initialRight,
  })

  const { leftPanel, rightPanel } = useMemo(() => {
    if (!data || !drawingId || !disciplineKey) {
      const empty = {
        imageFilename: null as string | null,
        label: '기본',
        date: null as string | null,
        description: null as string | null,
        changes: [] as string[],
        alt: '',
      }
      return { leftPanel: empty, rightPanel: empty }
    }
    return getRevisionComparePanels({
      data,
      drawingId,
      disciplineKey,
      leftVersion: compareLeft,
      rightVersion: compareRight,
      drawingName: data.drawings[drawingId]?.name ?? '도면',
    })
  }, [data, drawingId, disciplineKey, compareLeft, compareRight])

  const handleBackToDrawing = () => {
    navigate(`/drawing/${slug}`)
  }

  if (!slug || !space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">잘못된 공간 경로입니다.</p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-500 sm:text-base">도면 데이터를 불러오는 중…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-red-600 sm:text-base">
          데이터를 불러올 수 없습니다. {error?.message}
        </p>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          목록으로
        </Button>
      </div>
    )
  }

  if (!drawingId || !disciplineKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">
          비교할 도면과 공종을 선택해 주세요.
        </p>
        <Button variant="primary" size="sm" onClick={handleBackToDrawing}>
          도면 보기로 이동
        </Button>
      </div>
    )
  }

  if (!data.drawings[drawingId]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">존재하지 않는 도면입니다.</p>
        <Button variant="primary" size="sm" onClick={handleBackToDrawing}>
          도면 보기로 이동
        </Button>
      </div>
    )
  }

  const drawingName = data.drawings[drawingId].name

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <DrawingPageHeader
        backLabel="뒤로가기"
        onBack={() => navigate(-1)}
        title={`리비전 비교 · ${drawingName}`}
        titleSize="sm"
      />

      <div className="shrink-0 space-y-2 border-b border-neutral-200 bg-neutral-50/80 px-2 py-1.5 sm:space-y-2 sm:px-4 sm:py-2">
        <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
          <span className="shrink-0 text-[10px] font-semibold text-neutral-500 sm:text-xs">기준</span>
          <select
            value={compareLeft ?? ''}
            onChange={(e) => setCompareLeft(e.target.value || null)}
            className="min-w-0 shrink basis-16 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] sm:basis-auto sm:rounded-md sm:px-2 sm:py-1 sm:text-[10px]"
            aria-label="비교 기준 리비전"
          >
            <option value="">기본</option>
            {currentRevisions.map((r) => (
              <option key={r.version} value={r.version}>
                {r.version} ({r.date})
              </option>
            ))}
          </select>
          <span className="shrink-0 text-[10px] font-semibold text-neutral-500 sm:text-xs">비교</span>
          <select
            value={compareRight ?? ''}
            onChange={(e) => setCompareRight(e.target.value || null)}
            className="min-w-0 shrink basis-16 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] sm:basis-auto sm:rounded-md sm:px-2 sm:py-1 sm:text-[10px]"
            aria-label="비교 대상 리비전"
          >
            <option value="">기본</option>
            {currentRevisions.map((r) => (
              <option key={r.version} value={r.version}>
                {r.version} ({r.date})
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDrawing}
            className="shrink-0 text-[9px] sm:text-[10px]"
          >
            단일 도면으로 보기
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-row gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5 sm:px-3 sm:py-2 lg:flex-col lg:gap-0">
            <div className="min-w-0 flex-1 shrink-0">
              <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                기준 · 설명
              </span>
              <p className="min-h-[1.5em] text-[10px] text-neutral-700 sm:text-xs">
                {leftPanel.description ?? '—'}
              </p>
            </div>
            {leftPanel.changes.length > 0 && (
              <div className="min-w-0 flex-1 shrink-0 border-l border-neutral-200 pl-2 lg:border-l-0 lg:border-t lg:border-neutral-200 lg:pt-1 lg:pl-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  변경 사항
                </span>
                <ul className="list-inside list-disc space-y-0.5 text-[10px] text-neutral-700 sm:text-xs">
                  {leftPanel.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-2 rounded-md border border-neutral-200 bg-white px-2 py-1.5 sm:px-3 sm:py-2 lg:flex-col lg:gap-0">
            <div className="min-w-0 flex-1 shrink-0">
              <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                비교 · 설명
              </span>
              <p className="min-h-[1.5em] text-[10px] text-neutral-700 sm:text-xs">
                {rightPanel.description ?? '—'}
              </p>
            </div>
            {rightPanel.changes.length > 0 && (
              <div className="min-w-0 flex-1 shrink-0 border-l border-neutral-200 pl-2 lg:border-l-0 lg:border-t lg:border-neutral-200 lg:pt-1 lg:pl-0">
                <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  변경 사항
                </span>
                <ul className="list-inside list-disc space-y-0.5 text-[10px] text-neutral-700 sm:text-xs">
                  {rightPanel.changes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex flex-1 overflow-auto">
        <RevisionCompareView leftPanel={leftPanel} rightPanel={rightPanel} />
      </main>
    </div>
  )
}
