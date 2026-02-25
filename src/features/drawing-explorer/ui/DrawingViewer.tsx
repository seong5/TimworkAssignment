interface DrawingViewerProps {
  imageFilename: string | null
  alt?: string
}

const DRAWINGS_BASE = '/data/drawings/'

export function DrawingViewer({ imageFilename, alt = '도면' }: DrawingViewerProps) {
  if (!imageFilename) return null

  const src = DRAWINGS_BASE + imageFilename

  return (
    <div className="flex items-start justify-start overflow-auto p-2">
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain object-left-top"
        loading="lazy"
      />
    </div>
  )
}
