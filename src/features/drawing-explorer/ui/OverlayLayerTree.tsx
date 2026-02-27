import { useState } from 'react'
import { ChevronDown, ChevronRight, ImageIcon, Layers, RotateCcw } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { DrawingImageEntry, DrawingDisciplineGroup } from '@/entities/project'
import type { OverlayLayer } from './DisciplineOverlayView'

function OverlayRevisionList({
  entries,
  layer,
  onSelectRevision,
  onOpacityChange,
}: {
  entries: DrawingImageEntry[]
  layer: OverlayLayer | undefined
  onSelectRevision: (disciplineKey: string, revisionVersion: string | null) => void
  onOpacityChange: (disciplineKey: string, opacity: number) => void
}) {
  const disciplineKey = entries[0]?.disciplineKey
  return (
    <div className="ml-4 mt-0.5 overflow-hidden rounded-md border border-gray-200 bg-gray-50/80 py-1 shadow-sm sm:ml-6">
      <ul className="flex flex-col gap-0.5 py-1">
        {entries.map((entry, idx) => {
          const isSelected =
            layer?.disciplineKey === disciplineKey &&
            (layer?.revisionVersion ?? null) === entry.revisionVersion
          return (
            <li key={`${entry.disciplineKey}-${entry.revisionVersion ?? 'base'}-${idx}`}>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => onSelectRevision(entry.disciplineKey, entry.revisionVersion)}
                className={`flex items-center justify-start gap-1.5 px-2 py-1.5 text-left text-xs hover:bg-gray-200 sm:gap-2 sm:px-3 sm:text-sm ${
                  isSelected ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold' : ''
                }`}
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
              </Button>
            </li>
          )
        })}
      </ul>
      {layer && (
        <div className="border-t border-gray-200 px-2 py-1.5 sm:px-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 sm:text-xs">투명도</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={layer.opacity}
              onChange={(e) =>
                onOpacityChange(layer.disciplineKey, parseFloat(e.target.value))
              }
              className="h-1.5 flex-1"
            />
            <span className="w-8 text-right text-[10px] text-neutral-500 sm:text-xs">
              {Math.round(layer.opacity * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export interface OverlayLayerTreeProps {
  drawingName: string
  groups: DrawingDisciplineGroup[]
  layers: OverlayLayer[]
  onUpdateLayer: (disciplineKey: string, patch: Partial<OverlayLayer>) => void
  onReset?: () => void
}

export function OverlayLayerTree({
  drawingName,
  groups,
  layers,
  onUpdateLayer,
  onReset,
}: OverlayLayerTreeProps) {
  const [expandedDisciplineKeys, setExpandedDisciplineKeys] = useState<Set<string>>(new Set())

  const handleDisciplineClick = (disciplineKey: string) => {
    setExpandedDisciplineKeys((prev) => {
      const next = new Set(prev)
      if (next.has(disciplineKey)) next.delete(disciplineKey)
      else next.add(disciplineKey)
      return next
    })
  }

  const getLayer = (disciplineKey: string) =>
    layers.find((l) => l.disciplineKey === disciplineKey)

  return (
    <div className="flex flex-col gap-0.5 p-1.5 sm:p-2">
      <div className="flex items-center justify-between gap-2 px-2 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {drawingName}
        </h2>
        {onReset && (
          <Button
            variant="ghost"
            icon={<RotateCcw className="h-3 w-3" />}
            onClick={onReset}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 sm:text-xs"
            title="겹쳐보기 선택 초기화"
          >
            초기화
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="공종 레이어 트리">
        <div className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:ml-2 sm:pl-2">
          {groups.map((group) => {
            const isExpanded = expandedDisciplineKeys.has(group.disciplineKey)
            const layer = getLayer(group.disciplineKey)
            const isVisible = layer?.visible ?? false

            return (
              <div key={group.disciplineKey} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    onClick={() => handleDisciplineClick(group.disciplineKey)}
                    className="flex flex-1 items-center justify-start gap-1.5 rounded-md px-2 py-1.5 text-left text-xs hover:bg-gray-100 sm:gap-2 sm:px-2.5 sm:text-sm"
                  >
                    <span className="shrink-0 text-gray-500" aria-hidden>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      ) : (
                        <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      )}
                    </span>
                    <Layers className="h-3 w-3 shrink-0 text-[#3907C7] sm:h-3.5 sm:w-3.5" />
                    <span className="min-w-0 flex-1 truncate text-neutral-700">
                      {group.label}
                    </span>
                  </Button>
                  <label className="flex shrink-0 items-center pr-2" title="겹쳐보기에 표시">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => {
                        const checked = e.target.checked
                        onUpdateLayer(group.disciplineKey, { visible: checked })
                        setExpandedDisciplineKeys((prev) => {
                          const next = new Set(prev)
                          if (checked) next.add(group.disciplineKey)
                          else next.delete(group.disciplineKey)
                          return next
                        })
                      }}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                  </label>
                </div>
                {isExpanded && group.entries.length > 0 && (
                  <OverlayRevisionList
                    entries={group.entries}
                    layer={layer}
                    onSelectRevision={(disciplineKey, revisionVersion) =>
                      onUpdateLayer(disciplineKey, { revisionVersion })
                    }
                    onOpacityChange={(disciplineKey, opacity) =>
                      onUpdateLayer(disciplineKey, { opacity })
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
