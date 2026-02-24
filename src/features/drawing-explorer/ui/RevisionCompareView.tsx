import type { NormalizedProjectData } from '@/entities/project'
import type { NormalizedRevision } from '@/entities/project'
import { getImageForRevision, getRevisionsForDiscipline } from '@/shared/lib/normalizedDrawings'

const DRAWINGS_BASE = '/data/drawings/'

export interface RevisionCompareViewProps {
  data: NormalizedProjectData
  drawingId: string
  disciplineKey: string
  leftVersion: string | null
  rightVersion: string | null
  drawingName?: string
}

function ComparePanel({
  imageFilename,
  label,
  date,
  description,
  changes,
  alt,
}: {
  imageFilename: string | null
  label: string
  date?: string | null
  description?: string
  changes?: string[]
  alt: string
}) {
  const src = imageFilename ? DRAWINGS_BASE + imageFilename : null

  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="shrink-0 border-b border-neutral-100 px-4 py-2">
        <p className="text-sm font-semibold text-neutral-800">{label}</p>
        {date != null && date !== '' && <p className="text-xs text-neutral-500">{date}</p>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 items-start justify-start overflow-auto p-2">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full object-contain object-left-top"
              loading="lazy"
            />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-lg bg-neutral-50 text-sm text-neutral-500">
              이미지 없음
            </div>
          )}
        </div>
        <div className="shrink-0 space-y-2 border-t border-neutral-100 px-4 py-3">
          {description != null && description !== '' && (
            <div>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                설명
              </span>
              <p className="text-sm text-neutral-700">{description}</p>
            </div>
          )}
          {Array.isArray(changes) && changes.length > 0 && (
            <div>
              <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                변경 사항
              </span>
              <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-sm text-neutral-700">
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

export function RevisionCompareView({
  data,
  drawingId,
  disciplineKey,
  leftVersion,
  rightVersion,
  drawingName = '도면',
}: RevisionCompareViewProps) {
  const revisions = getRevisionsForDiscipline(data, drawingId, disciplineKey)
  const leftRev: NormalizedRevision | null =
    leftVersion === null ? null : (revisions.find((r) => r.version === leftVersion) ?? null)
  const rightRev: NormalizedRevision | null =
    rightVersion === null ? null : (revisions.find((r) => r.version === rightVersion) ?? null)

  const leftImage = getImageForRevision(data, drawingId, disciplineKey, leftVersion)
  const rightImage = getImageForRevision(data, drawingId, disciplineKey, rightVersion)

  const leftLabel = leftVersion == null ? '기본' : leftVersion
  const rightLabel = rightVersion == null ? '기본' : rightVersion

  return (
    <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-2">
      <ComparePanel
        imageFilename={leftImage}
        label={leftLabel}
        date={leftRev?.date}
        description={leftRev?.description}
        changes={leftRev?.changes}
        alt={`${drawingName} - ${leftLabel}`}
      />
      <ComparePanel
        imageFilename={rightImage}
        label={rightLabel}
        date={rightRev?.date}
        description={rightRev?.description}
        changes={rightRev?.changes}
        alt={`${drawingName} - ${rightLabel}`}
      />
    </div>
  )
}
