import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useProjectData } from '@/entities/project'
import { getRevisionsForDiscipline, getLatestRevision, SPACE_LIST } from '@/entities/project'
import { RevisionCompareView } from '@/features/drawing-explorer'

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

  const defaultRight = useMemo(() => {
    const latest = getLatestRevision(currentRevisions)
    return latest?.version ?? currentRevisions[0]?.version ?? null
  }, [currentRevisions])

  const [compareLeft, setCompareLeft] = useState<string | null>(
    initialLeft === undefined ? null : initialLeft || null,
  )
  const [compareRight, setCompareRight] = useState<string | null>(() => {
    if (initialRight !== undefined) return initialRight || null
    return null
  })

  useEffect(() => {
    if (initialRight === undefined && compareRight === null && defaultRight) {
      setCompareRight(defaultRight)
    }
  }, [defaultRight, initialRight, compareRight])

  const handleBackToDrawing = () => {
    navigate(`/drawing/${slug}`)
  }

  if (!slug || !space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">잘못된 공간 경로입니다.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          목록으로
        </button>
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
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          목록으로
        </button>
      </div>
    )
  }

  if (!drawingId || !disciplineKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">
          비교할 도면과 공종을 선택해 주세요.
        </p>
        <button
          type="button"
          onClick={handleBackToDrawing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          도면 보기로 이동
        </button>
      </div>
    )
  }

  if (!data.drawings[drawingId]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 py-8">
        <p className="text-center text-sm text-gray-600 sm:text-base">존재하지 않는 도면입니다.</p>
        <button
          type="button"
          onClick={handleBackToDrawing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          도면 보기로 이동
        </button>
      </div>
    )
  }

  const drawingName = data.drawings[drawingId].name

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 text-[10px] text-gray-500 hover:text-gray-700 sm:text-[15px]"
            aria-label="뒤로가기"
          >
            ← 뒤로가기
          </button>
          <span className="hidden shrink-0 text-gray-300 sm:inline">|</span>
          <h1 className="min-w-0 truncate text-[10px] font-bold text-gray-900 sm:text-[15px]">
            리비전 비교 · {drawingName}
          </h1>
        </div>
      </header>

      <div className="shrink-0 flex flex-wrap items-center gap-2 border-b border-neutral-200 bg-neutral-50/80 px-2 py-2 sm:px-4">
        <span className="text-xs font-semibold text-neutral-500">기준(왼쪽)</span>
        <select
          value={compareLeft ?? ''}
          onChange={(e) => setCompareLeft(e.target.value || null)}
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px]"
          aria-label="비교 기준 리비전"
        >
          <option value="">기본</option>
          {currentRevisions.map((r) => (
            <option key={r.version} value={r.version}>
              {r.version} ({r.date})
            </option>
          ))}
        </select>
        <span className="text-xs font-semibold text-neutral-500">비교(오른쪽)</span>
        <select
          value={compareRight ?? ''}
          onChange={(e) => setCompareRight(e.target.value || null)}
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[10px]"
          aria-label="비교 대상 리비전"
        >
          <option value="">기본</option>
          {currentRevisions.map((r) => (
            <option key={r.version} value={r.version}>
              {r.version} ({r.date})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleBackToDrawing}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[10px] font-medium text-neutral-700 hover:bg-neutral-50"
        >
          단일 보기로
        </button>
      </div>

      <main className="flex min-h-0 flex-1 overflow-auto">
        <RevisionCompareView
          data={data}
          drawingId={drawingId}
          disciplineKey={disciplineKey}
          leftVersion={compareLeft}
          rightVersion={compareRight}
          drawingName={drawingName}
        />
      </main>
    </div>
  )
}
