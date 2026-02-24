import { Map, Layers, GitCommit, ChevronRight, ChevronDown } from 'lucide-react'
import type { DisciplineOption, NormalizedRevision } from '@/entities/project'

export interface SelectionState {
  drawingId: string | null
  disciplineKey: string | null
  revisionVersion: string | null
}

export interface ContextBarProps {
  drawingName: string | null
  disciplineOptions: DisciplineOption[]
  selectedDisciplineSelectValue: string
  disciplineKey: string | null
  revisions: NormalizedRevision[]
  revisionVersion: string | null
  latestRevision: NormalizedRevision | null
  showRegionSelect: boolean
  regionKeys: string[]
  keyPrefix: string
  currentRegionKey: string
  revisionEmptyMessage: string
  onDisciplineChange: (key: string | null) => void
  onRevisionChange: (version: string | null) => void
}

export function ContextBar({
  drawingName,
  disciplineOptions,
  selectedDisciplineSelectValue,
  disciplineKey,
  revisions,
  revisionVersion,
  latestRevision,
  showRegionSelect,
  regionKeys,
  keyPrefix,
  currentRegionKey,
  revisionEmptyMessage,
  onDisciplineChange,
  onRevisionChange,
}: ContextBarProps) {
  const effectiveDisciplineKey =
    showRegionSelect && disciplineKey === selectedDisciplineSelectValue ? null : disciplineKey

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
              {drawingName ?? '—'}
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
            {drawingName && disciplineOptions.length > 0 ? (
              <select
                value={selectedDisciplineSelectValue}
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
            {drawingName && disciplineOptions.length > 0 && (
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
                    {latestRevision?.version === r.version ? ' ★ 최신' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium text-neutral-500">{revisionEmptyMessage}</span>
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
