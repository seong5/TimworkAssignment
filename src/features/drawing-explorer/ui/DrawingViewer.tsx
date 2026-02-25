interface DrawingViewerProps {
  imageFilename: string | null
  alt?: string
  emptyPlaceholder?: React.ReactNode
}

const DRAWINGS_BASE = '/data/drawings/'

export function DrawingViewer({
  imageFilename,
  alt = '도면',
  emptyPlaceholder,
}: DrawingViewerProps) {
  if (!imageFilename) {
    if (emptyPlaceholder)
      return (
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">{emptyPlaceholder}</div>
      )
    return null
  }

  const src = DRAWINGS_BASE + imageFilename

  return (
    <div className="flex min-h-0 flex-1 items-start justify-start overflow-auto p-2">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain object-left-top"
        loading="lazy"
      />
    </div>
  )
}
