import type { Metadata } from '../types/metadata'
import { getDrawingIdsInOrder, getDrawingPartLabel } from '../lib/drawings'

interface SpaceTreeProps {
  metadata: Metadata
  selectedDrawingId: string | null
  onSelectDrawing: (id: string) => void
}

export function SpaceTree({ metadata, selectedDrawingId, onSelectDrawing }: SpaceTreeProps) {
  const ids = getDrawingIdsInOrder(metadata)
  const rootId = ids[0]
  const root = rootId ? metadata.drawings[rootId] : null
  const childIds = ids.filter((id) => metadata.drawings[id].parent === rootId)

  return (
    <nav className="flex flex-col gap-0.5 p-2" aria-label="공간(건물) 트리">
      {root && (
        <button
          type="button"
          onClick={() => onSelectDrawing(root.id)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
            selectedDrawingId === root.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
          }`}
        >
          <span className="shrink-0 text-gray-500" aria-hidden>
            📄{' '}
          </span>
          <span className="truncate font-medium">{root.name}</span>
        </button>
      )}
      <div className="ml-3 flex flex-col gap-0.5 border-l border-gray-200 pl-2">
        {childIds.map((id) => {
          const drawing = metadata.drawings[id]
          const isSelected = selectedDrawingId === id
          const partLabel = getDrawingPartLabel(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectDrawing(id)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
              }`}
            >
              <span className="shrink-0 text-gray-500" aria-hidden></span>
              <span className="min-w-0 flex-1 truncate">{drawing.name}</span>
              {partLabel && (
                <span
                  className="shrink-0 rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600"
                  title={`데이터: metadata-${partLabel}.json`}
                >
                  {partLabel}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
