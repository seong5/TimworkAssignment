import { useRef, useState } from 'react'
import { ChevronDown, ChevronRight, ImageIcon } from 'lucide-react'
import { useClickOutside } from '@/shared/hooks/useClickOutside'
import type { DrawingImageEntry } from '@/shared/lib/normalizedDrawings'

export type { DrawingImageEntry }

function ImageDropdown({
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
  entriesByDrawingId: Record<string, DrawingImageEntry[]>
  selectedDrawingId: string | null
  onSelectDrawing: (id: string) => void
  onSelectImage?: (drawingId: string, disciplineKey: string, revisionVersion: string | null) => void
}

export function SpaceTree({
  rootDrawing,
  childDrawings,
  entriesByDrawingId,
  selectedDrawingId,
  onSelectDrawing,
  onSelectImage,
}: SpaceTreeProps) {
  const [expandedDrawingId, setExpandedDrawingId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, () => setExpandedDrawingId(null))

  const handleRowClick = (id: string) => {
    onSelectDrawing(id)
    setExpandedDrawingId((prev) => (prev === id ? null : id))
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-0.5 p-2">
      <nav className="flex flex-col gap-0.5" aria-label="공간(건물) 트리">
        {rootDrawing && (
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={() => handleRowClick(rootDrawing.id)}
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
              (entriesByDrawingId[rootDrawing.id]?.length ?? 0) > 0 && (
                <ImageDropdown
                  drawingId={rootDrawing.id}
                  entries={entriesByDrawingId[rootDrawing.id]}
                  onSelectImage={onSelectImage}
                />
              )}
          </div>
        )}
        <div className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
          {childDrawings.map(({ id, name }) => {
            const isSelected = selectedDrawingId === id
            const isExpanded = expandedDrawingId === id
            const entries = entriesByDrawingId[id] ?? []
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleRowClick(id)}
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
                {isExpanded && entries.length > 0 && (
                  <ImageDropdown drawingId={id} entries={entries} onSelectImage={onSelectImage} />
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
