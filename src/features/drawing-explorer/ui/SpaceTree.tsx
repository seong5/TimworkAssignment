import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, ImageIcon, Layers } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { DrawingImageEntry, DrawingDisciplineGroup } from '@/entities/project'

export type { DrawingImageEntry, DrawingDisciplineGroup }

function RevisionList({
  drawingId,
  disciplineKey,
  entries,
  selectedDisciplineKey,
  selectedRevisionVersion,
  onSelectImage,
}: {
  drawingId: string
  disciplineKey: string
  entries: DrawingImageEntry[]
  selectedDisciplineKey?: string | null
  selectedRevisionVersion?: string | null
  onSelectImage?: (drawingId: string, disciplineKey: string, revisionVersion: string | null) => void
}) {
  return (
    <div className="ml-4 mt-0.5 min-w-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50/80 py-1 shadow-sm sm:ml-6">
      <ul className="flex min-w-0 flex-col gap-0.5 py-1">
        {entries.map((entry, idx) => {
          const isSelected =
            selectedDisciplineKey === disciplineKey &&
            (selectedRevisionVersion ?? null) === (entry.revisionVersion ?? null)
          return (
          <li key={`${entry.disciplineKey}-${entry.revisionVersion ?? 'base'}-${idx}`}>
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => onSelectImage?.(drawingId, entry.disciplineKey, entry.revisionVersion)}
              className={`!min-h-0 !px-2 !py-1 flex items-center justify-start gap-1.5 text-left text-xs focus:ring-0 sm:gap-2 sm:!px-3 sm:text-sm ${
                isSelected ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold' : 'hover:bg-gray-200'
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
        )})}
      </ul>
    </div>
  )
}

export interface SpaceTreeProps {
  rootDrawing: { id: string; name: string } | null
  childDrawings: { id: string; name: string }[]
  disciplinesByDrawingId: Record<string, DrawingDisciplineGroup[]>
  selectedDrawingId: string | null
  selectedDisciplineKey?: string | null
  selectedRevisionVersion?: string | null
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
  selectedDisciplineKey = null,
  selectedRevisionVersion = null,
  onSelectDrawing,
  onSelectImage,
}: SpaceTreeProps) {
  const [expandedDrawingId, setExpandedDrawingId] = useState<string | null>(null)
  /** 여러 공종을 동시에 펼쳐 둘 수 있음 */
  const [expandedDisciplineKeys, setExpandedDisciplineKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (selectedDrawingId) {
      setExpandedDrawingId(selectedDrawingId)
      if (selectedDisciplineKey) {
        setExpandedDisciplineKeys((prev) => {
          const next = new Set(prev).add(
            disciplineNodeKey(selectedDrawingId, selectedDisciplineKey),
          )
          const dot = selectedDisciplineKey.indexOf('.')
          if (dot > 0) {
            next.add(
              disciplineNodeKey(selectedDrawingId, selectedDisciplineKey.slice(0, dot)),
            )
          }
          return next
        })
      }
    }
  }, [selectedDrawingId, selectedDisciplineKey])

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
      <div className="ml-1 min-w-0 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:ml-2 sm:pl-2">
        {groups.map((group) => {
          const nodeKey = disciplineNodeKey(drawingId, group.disciplineKey)
          const isExpanded = expandedDisciplineKeys.has(nodeKey)
          const isDisciplineSelected =
            selectedDrawingId === drawingId && selectedDisciplineKey === group.disciplineKey
          const hasSubGroups = group.subGroups && group.subGroups.length > 0
          const hasEntries = group.entries.length > 0

          return (
            <div key={group.disciplineKey} className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDisciplineClick(drawingId, group.disciplineKey)}
                className={`!min-h-0 !px-2 !py-1 flex min-w-0 items-center justify-start gap-1.5 rounded-md text-left text-xs focus:ring-0 sm:gap-2 sm:!px-2.5 sm:text-sm ${
                  isDisciplineSelected ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold' : 'hover:bg-gray-100'
                }`}
              >
                <span className="shrink-0 text-gray-500" aria-hidden>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </span>
                <Layers className="h-3 w-3 shrink-0 text-[#3907C7] sm:h-3.5 sm:w-3.5" />
                <span className="min-w-0 flex-1 truncate text-neutral-700">{group.label}</span>
              </Button>
              {isExpanded && (
                <>
                  {hasEntries && (
                    <RevisionList
                      drawingId={drawingId}
                      disciplineKey={group.disciplineKey}
                      entries={group.entries}
                      selectedDisciplineKey={selectedDisciplineKey}
                      selectedRevisionVersion={selectedRevisionVersion}
                      onSelectImage={onSelectImage}
                    />
                  )}
                  {hasSubGroups &&
                    group.subGroups!.map((sub) => {
                      const subNodeKey = disciplineNodeKey(drawingId, sub.disciplineKey)
                      const isSubExpanded = expandedDisciplineKeys.has(subNodeKey)
                      const isSubSelected =
                        selectedDrawingId === drawingId && selectedDisciplineKey === sub.disciplineKey
                      return (
                        <div key={sub.disciplineKey} className="ml-1 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:ml-2 sm:pl-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisciplineClick(drawingId, sub.disciplineKey)}
                            className={`!min-h-0 !px-2 !py-1 flex min-w-0 items-center justify-start gap-1.5 rounded-md text-left text-xs focus:ring-0 sm:gap-2 sm:!px-2.5 sm:text-sm ${
                              isSubSelected ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold' : 'hover:bg-gray-100'
                            }`}
                          >
                            <span className="shrink-0 text-gray-500" aria-hidden>
                              {isSubExpanded ? (
                                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              ) : (
                                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-neutral-700">{sub.label}</span>
                          </Button>
                          {isSubExpanded && sub.entries.length > 0 && (
                            <RevisionList
                              drawingId={drawingId}
                              disciplineKey={sub.disciplineKey}
                              entries={sub.entries}
                              selectedDisciplineKey={selectedDisciplineKey}
                              selectedRevisionVersion={selectedRevisionVersion}
                              onSelectImage={onSelectImage}
                            />
                          )}
                        </div>
                      )
                    })}
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-0.5 p-1.5 sm:p-2">
      <nav className="flex min-w-0 flex-col gap-0.5" aria-label="공간(건물) 트리">
        {rootDrawing && (
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDrawingClick(rootDrawing.id)}
              className={`!min-h-0 !px-2 !py-1 flex min-w-0 items-center justify-start gap-1.5 rounded-md text-left text-xs focus:ring-0 sm:gap-2 sm:!px-3 sm:!py-1.5 sm:text-sm ${
                selectedDrawingId === rootDrawing.id
                  ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold'
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
            </Button>
            {expandedDrawingId === rootDrawing.id &&
              (disciplinesByDrawingId[rootDrawing.id]?.length ?? 0) > 0 &&
              renderDisciplineLevel(rootDrawing.id)}
          </div>
        )}
        <div className="ml-1 min-w-0 flex flex-col gap-0.5 border-l border-gray-200 pl-1.5 sm:pl-2">
          {childDrawings.map(({ id, name }) => {
            const isSelected = selectedDrawingId === id
            const isExpanded = expandedDrawingId === id
            const hasDisciplines = (disciplinesByDrawingId[id]?.length ?? 0) > 0
            return (
              <div key={id} className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDrawingClick(id)}
                  className={`!min-h-0 !px-2 !py-1 flex min-w-0 items-center justify-start gap-1.5 rounded-md text-left text-xs focus:ring-0 sm:gap-2 sm:!px-3 sm:!py-1.5 sm:text-sm ${
                    isSelected ? 'bg-[#3907C7]/15 text-[#3907C7] font-semibold' : 'hover:bg-gray-100'
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
                </Button>
                {isExpanded && hasDisciplines && renderDisciplineLevel(id)}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
