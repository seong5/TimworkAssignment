import { useRef, useState, type RefObject } from 'react'
import { ChevronDown, ChevronRight, ImageIcon, Layers } from 'lucide-react'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import type {
  DrawingImageEntry,
  DrawingDisciplineGroup,
} from '@/shared/lib/normalizedDrawings'

export type { DrawingImageEntry, DrawingDisciplineGroup }

function RevisionList({
  drawingId,
  entries,
  onSelectImage,
}: {
  drawingId: string
  entries: DrawingImageEntry[]
  onSelectImage?: (drawingId: string, disciplineKey: string, revisionVersion: string | null) => void
}) {
  return (
    <div className="ml-6 mt-0.5 overflow-hidden rounded-md border border-gray-200 bg-gray-50/80 py-1 shadow-sm">
      <ul className="flex flex-col gap-0.5 py-1">
        {entries.map((entry, idx) => (
          <li key={`${entry.disciplineKey}-${entry.revisionVersion ?? 'base'}-${idx}`}>
            <button
              type="button"
              onClick={() => onSelectImage?.(drawingId, entry.disciplineKey, entry.revisionVersion)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-200"
            >
              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span className="min-w-0 flex-1 truncate">
                {entry.label}
                {entry.date && <span className="ml-1.5 text-neutral-500">· {entry.date}</span>}
              </span>
              {entry.isLatest && (
                <span
                  className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
                  title="최신 리비전"
                >
                  최신
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export interface SpaceTreeProps {
  rootDrawing: { id: string; name: string } | null
  childDrawings: { id: string; name: string }[]
  /** 도면 id → 공종별 그룹 배열 (도면 → 공종 → 리비전 3단계) */
  disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]>
  selectedDrawingId: string | null
  onSelectDrawing: (id: string) => void
  onSelectImage?: (drawingId: string, disciplineKey: string, revisionVersion: string | null) => void
  ignoreClickOutsideRef?: RefObject<HTMLElement | null>
}

/** drawingId + disciplineKey 조합으로 확장 상태 식별 */
function disciplineNodeKey(drawingId: string, disciplineKey: string) {
  return `${drawingId}:${disciplineKey}`
}

export function SpaceTree({
  rootDrawing,
  childDrawings,
  disciplinesByDrawingId,
  selectedDrawingId,
  onSelectDrawing,
  onSelectImage,
  ignoreClickOutsideRef,
}: SpaceTreeProps) {
  const [expandedDrawingId, setExpandedDrawingId] = useState<string | null>(null)
  const [expandedDisciplineKey, setExpandedDisciplineKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(
    containerRef,
    () => {
      setExpandedDrawingId(null)
      setExpandedDisciplineKey(null)
    },
    { ignoreRef: ignoreClickOutsideRef },
  )

  const handleDrawingClick = (id: string) => {
    onSelectDrawing(id)
    setExpandedDrawingId((prev) => (prev === id ? null : id))
    setExpandedDisciplineKey(null)
  }

  const handleDisciplineClick = (drawingId: string, disciplineKey: string) => {
    const key = disciplineNodeKey(drawingId, disciplineKey)
    setExpandedDisciplineKey((prev) => (prev === key ? null : key))
  }

  const renderDisciplineLevel = (drawingId: string) => {
    const groups = disciplinesByDrawingId[drawingId] ?? []
    return (
      <div className="ml-4 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
        {groups.map((group) => {
          const nodeKey = disciplineNodeKey(drawingId, group.disciplineKey)
          const isExpanded = expandedDisciplineKey === nodeKey
          return (
            <div key={group.disciplineKey} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleDisciplineClick(drawingId, group.disciplineKey)}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-gray-100"
              >
                <span className="shrink-0 text-gray-500" aria-hidden>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </span>
                <Layers className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span className="min-w-0 flex-1 truncate text-neutral-700">{group.label}</span>
              </button>
              {isExpanded && group.entries.length > 0 && (
                <RevisionList
                  drawingId={drawingId}
                  entries={group.entries}
                  onSelectImage={onSelectImage}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-0.5 p-2">
      <nav className="flex flex-col gap-0.5" aria-label="공간(건물) 트리">
        {rootDrawing && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleDrawingClick(rootDrawing.id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selectedDrawingId === rootDrawing.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="shrink-0 text-gray-500" aria-hidden>
                {expandedDrawingId === rootDrawing.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
              <span className="truncate font-medium">{rootDrawing.name}</span>
            </button>
            {expandedDrawingId === rootDrawing.id &&
              (disciplinesByDrawingId[rootDrawing.id]?.length ?? 0) > 0 &&
              renderDisciplineLevel(rootDrawing.id)}
          </div>
        )}
        <div className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
          {childDrawings.map(({ id, name }) => {
            const isSelected = selectedDrawingId === id
            const isExpanded = expandedDrawingId === id
            const hasDisciplines = (disciplinesByDrawingId[id]?.length ?? 0) > 0
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleDrawingClick(id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="shrink-0 text-gray-500" aria-hidden>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                </button>
                {isExpanded && hasDisciplines && renderDisciplineLevel(id)}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
