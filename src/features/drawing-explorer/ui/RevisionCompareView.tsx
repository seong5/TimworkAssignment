import type { RevisionComparePanel } from '../model/lib/getRevisionComparePanels'

const DRAWINGS_BASE = '/data/drawings/'

export interface RevisionCompareViewProps {
  leftPanel: RevisionComparePanel
  rightPanel: RevisionComparePanel
}

function ComparePanel({
  imageFilename,
  label,
  date,
  description,
  changes,
  alt,
}: RevisionComparePanel) {
  const src = imageFilename ? DRAWINGS_BASE + imageFilename : null

  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:gap-3">
      <div className="flex shrink-0 flex-row items-center gap-2 border-b border-neutral-100 px-3 py-1.5 sm:px-4 sm:py-2">
        <p className="text-xs font-semibold text-neutral-800 sm:text-sm">{label}</p>
        {date != null && date !== '' && (
          <span className="text-[10px] text-neutral-500 sm:text-xs">{date}</span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 items-start justify-start overflow-auto p-1.5 sm:p-2">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain object-left-top"
              loading="lazy"
            />
          ) : (
            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-neutral-50 text-xs text-neutral-500 sm:h-32 sm:text-sm">
              이미지 없음
            </div>
          )}
        </div>
        <div className="shrink-0 space-y-1.5 border-t border-neutral-100 px-3 py-2 sm:space-y-2 sm:px-4 sm:py-3">
          {description != null && description !== '' && (
            <div>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                설명
              </span>
              <p className="text-xs text-neutral-700 sm:text-sm">{description}</p>
            </div>
          )}
          {Array.isArray(changes) && changes.length > 0 && (
            <div>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                변경 사항
              </span>
              <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-xs text-neutral-700 sm:text-sm">
                {changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RevisionCompareView({ leftPanel, rightPanel }: RevisionCompareViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3 overflow-auto p-2 sm:gap-4 sm:p-4 lg:grid-cols-2">
      <ComparePanel {...leftPanel} />
      <ComparePanel {...rightPanel} />
    </div>
  )
}
