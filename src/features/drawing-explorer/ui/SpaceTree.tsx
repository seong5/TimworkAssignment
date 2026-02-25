import { useState } from 'react'
import { ChevronDown, ChevronRight, ImageIcon, Layers } from 'lucide-react'
import type { DrawingImageEntry, DrawingDisciplineGroup } from '@/entities/project'

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
    <div className="ml-4 mt-0.5 overflow-hidden rounded-md border border-gray-200 bg-gray-50/80 py-1 shadow-sm sm:ml-6">
      <ul className="flex flex-col gap-0.5 py-1">
        {entries.map((entry, idx) => (
          <li key={`${entry.disciplineKey}-${entry.revisionVersion ?? 'base'}-${idx}`}>
            <button
              type="button"
              onClick={() => onSelectImage?.(drawingId, entry.disciplineKey, entry.revisionVersion)}
              className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs transition-colors hover:bg-gray-200 sm:gap-2 sm:px-3 sm:text-sm"
            >
              <ImageIcon className="h-3 w-3 shrink-0 text-gray-400 sm:h-3.5 sm:w-3.5" />
              <span className="min-w-0 flex-1 truncate">
                {entry.label}
                {entry.date && (
                  <span className="ml-1 text-neutral-500 sm:ml-1.5">· {entry.date}</span>
                )}
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
  disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]>
  selectedDrawingId: string | null
  onSelectDrawing: (id: string) => void
  onSelectImage?: (drawingId: string, disciplineKey: string, revisionVersion: string | null) => void
}

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
}: SpaceTreeProps) {
  const [expandedDrawingId, setExpandedDrawingId] = useState<string | null>(null)
  /** 여러 공종을 동시에 펼쳐 둘 수 있음 */
  const [expandedDisciplineKeys, setExpandedDisciplineKeys] = useState<Set<string>>(new Set())

  const handleDrawingClick = (id: string) => {
    onSelectDrawing(id)
    setExpandedDrawingId((prev) => (prev === id ? null : id))
    setExpandedDisciplineKeys(new Set())
  }

  const handleDisciplineClick = (drawingId: string, disciplineKey: string) => {
    const key = disciplineNodeKey(drawingId, disciplineKey)
    setExpandedDisciplineKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const renderDisciplineLevel = (drawingId: string) => {
    const groups = disciplinesByDrawingId[drawingId] ?? []
    return (
      <div className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:ml-2">
        {groups.map((group) => {
          const nodeKey = disciplineNodeKey(drawingId, group.disciplineKey)
          const isExpanded = expandedDisciplineKeys.has(nodeKey)
          return (
            <div key={group.disciplineKey} className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleDisciplineClick(drawingId, group.disciplineKey)}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-gray-100 sm:gap-2 sm:px-2.5 sm:text-sm"
              >
                <span className="shrink-0 text-gray-500" aria-hidden>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </span>
                <Layers className="h-3 w-3 shrink-0 text-indigo-500 sm:h-3.5 sm:w-3.5" />
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
    <div className="flex flex-col gap-0.5 p-1.5 sm:p-2">
      <nav className="flex flex-col gap-0.5" aria-label="공간(건물) 트리">
        {rootDrawing && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleDrawingClick(rootDrawing.id)}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
                selectedDrawingId === rootDrawing.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="shrink-0 text-gray-500" aria-hidden>
                {expandedDrawingId === rootDrawing.id ? (
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </span>
              <span className="min-w-0 truncate font-medium">{rootDrawing.name}</span>
            </button>
            {expandedDrawingId === rootDrawing.id &&
              (disciplinesByDrawingId[rootDrawing.id]?.length ?? 0) > 0 &&
              renderDisciplineLevel(rootDrawing.id)}
          </div>
        )}
        <div className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:pl-2">
          {childDrawings.map(({ id, name }) => {
            const isSelected = selectedDrawingId === id
            const isExpanded = expandedDrawingId === id
            const hasDisciplines = (disciplinesByDrawingId[id]?.length ?? 0) > 0
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleDrawingClick(id)}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors sm:gap-2 sm:px-3 sm:py-2 sm:text-sm ${
                    isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="shrink-0 text-gray-500" aria-hidden>
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
