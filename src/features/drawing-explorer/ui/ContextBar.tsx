import { Map, Layers, GitCommit, ChevronRight, ChevronDown } from 'lucide-react'
import type { Metadata } from '@/shared/types/metadata'
import type { DisciplineOption, Revision } from '@/shared/types/metadata'
import { getDisciplineOptions } from '@/shared/lib/drawings'

export interface SelectionState {
  drawingId: string | null
  disciplineKey: string | null
  revisionVersion: string | null
}

interface ContextBarProps {
  metadata: Metadata
  selection: SelectionState
  onDisciplineChange: (key: string | null) => void
  onRevisionChange: (version: string | null) => void
}

function getRevisionsForDiscipline(
  drawingId: string,
  disciplineKey: string | null,
  metadata: Metadata,
): Revision[] {
  if (!disciplineKey) return []
  const drawing = metadata.drawings[drawingId]
  if (!drawing?.disciplines) return []
  const parts = disciplineKey.split('.')
  let node: unknown = drawing.disciplines[parts[0]]
  for (let i = 1; i < parts.length && node; i++) {
    node = (node as Record<string, unknown>)[parts[i]]
  }
  return (node as { revisions?: Revision[] })?.revisions ?? []
}

export function ContextBar({
  metadata,
  selection,
  onDisciplineChange,
  onRevisionChange,
}: ContextBarProps) {
  const { drawingId, disciplineKey, revisionVersion } = selection
  const drawing = drawingId ? metadata.drawings[drawingId] : null
  const disciplineOptions: DisciplineOption[] = drawing ? getDisciplineOptions(drawing) : []
  const selectedDisciplineOption = disciplineOptions.find(
    (o) => o.key === disciplineKey || (o.keyPrefix && disciplineKey?.startsWith(o.keyPrefix + '.')),
  )
  const showRegionSelect =
    selectedDisciplineOption?.hasRegions &&
    selectedDisciplineOption.regionKeys &&
    selectedDisciplineOption.regionKeys.length > 0
  const effectiveDisciplineKey =
    showRegionSelect && disciplineKey === selectedDisciplineOption?.key ? null : disciplineKey
  const regionKeys = selectedDisciplineOption?.regionKeys ?? []
  const keyPrefix = selectedDisciplineOption?.keyPrefix ?? ''
  const currentRegionKey =
    keyPrefix && disciplineKey?.startsWith(keyPrefix + '.')
      ? disciplineKey.slice((keyPrefix + '.').length)
      : ''
  const revisions =
    drawingId && effectiveDisciplineKey
      ? getRevisionsForDiscipline(drawingId, effectiveDisciplineKey, metadata)
      : []

  return (
    <div
      className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-xl"
      role="region"
      aria-label="현재 도면 컨텍스트"
    >
      <div className="flex flex-wrap items-center gap-2.5 overflow-x-auto">
        <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2.5 transition-colors">
          <div className="flex items-center justify-center rounded-md bg-white p-1 shadow-sm">
            <Map className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-neutral-400">
              Space
            </span>
            <span className="text-sm font-semibold leading-none text-neutral-800">
              {drawing ? drawing.name : '—'}
            </span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />

        <div className="group relative flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-neutral-200 hover:bg-neutral-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Layers className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-indigo-500" />
          <div className="relative flex flex-col">
            <span className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-neutral-400">
              Discipline
            </span>
            {drawing && disciplineOptions.length > 0 ? (
              <select
                value={selectedDisciplineOption?.key ?? disciplineKey ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onDisciplineChange(v || null)
                  onRevisionChange(null)
                }}
                className="w-full min-w-[8rem] cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium text-neutral-700 outline-none"
                aria-label="공종 선택"
              >
                <option value="">공종을 선택하세요</option>
                {disciplineOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-neutral-500">—</span>
            )}
            {drawing && disciplineOptions.length > 0 && (
              <ChevronDown className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 text-neutral-400" />
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />

        {showRegionSelect && (
          <>
            <div className="group relative flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-neutral-200 hover:bg-neutral-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <div className="relative flex flex-col">
                <span className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-neutral-400">
                  영역 (A/B)
                </span>
                <select
                  value={currentRegionKey}
                  onChange={(e) => {
                    const v = e.target.value
                    onDisciplineChange(v ? `${keyPrefix}.${v}` : disciplineKey)
                    onRevisionChange(null)
                  }}
                  className="w-full min-w-[6rem] cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium text-neutral-700 outline-none"
                  aria-label="영역 선택"
                >
                  <option value="">A 또는 B 선택</option>
                  {regionKeys.map((rk) => (
                    <option key={rk} value={rk}>
                      {rk}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 text-neutral-400" />
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden />
          </>
        )}

        <div className="group relative flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 transition-all hover:border-neutral-200 hover:bg-neutral-50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
          <GitCommit className="h-4 w-4 text-neutral-400 transition-colors group-hover:text-emerald-500" />
          <div className="relative flex flex-col">
            <span className="mb-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-neutral-400">
              Revision
            </span>
            {effectiveDisciplineKey && revisions.length > 0 ? (
              <select
                value={revisionVersion ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onRevisionChange(v || null)
                }}
                className="w-full min-w-[10rem] cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium text-neutral-700 outline-none"
                aria-label="리비전 선택"
              >
                <option value="">리비전 선택</option>
                {revisions.map((r) => (
                  <option key={r.version} value={r.version}>
                    {r.version} ({r.date}) {r.description ? `- ${r.description}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-neutral-500">
                {showRegionSelect && !currentRegionKey
                  ? '영역(A/B)을 선택하면 리비전이 표시됩니다'
                  : effectiveDisciplineKey
                    ? '리비전을 선택하세요'
                    : '—'}
              </span>
            )}
            {effectiveDisciplineKey && revisions.length > 0 && (
              <ChevronDown className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 text-neutral-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
