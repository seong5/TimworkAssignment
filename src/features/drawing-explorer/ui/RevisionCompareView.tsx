import { useRef, useCallback } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import type { ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch'
import type { RevisionComparePanel } from '../model/lib/getRevisionComparePanels'

const DRAWINGS_BASE = '/data/drawings/'

export interface RevisionCompareViewProps {
  leftPanel: RevisionComparePanel
  rightPanel: RevisionComparePanel
}

function ComparePanelContent({
  imageFilename,
  label,
  date,
  alt,
  transformRef,
  onTransformed,
  otherRef,
  syncingRef,
}: Omit<RevisionComparePanel, 'description' | 'changes'> & {
  transformRef: React.RefObject<ReactZoomPanPinchContentRef | null>
  onTransformed: (positionX: number, positionY: number, scale: number) => void
  otherRef: React.RefObject<ReactZoomPanPinchContentRef | null>
  syncingRef: React.MutableRefObject<boolean>
}) {
  const src = imageFilename ? DRAWINGS_BASE + imageFilename : null

  const handleTransformed = useCallback(
    (_ref: ReactZoomPanPinchContentRef, state: { scale: number; positionX: number; positionY: number }) => {
      if (syncingRef.current) {
        syncingRef.current = false
        return
      }
      onTransformed(state.positionX, state.positionY, state.scale)
      syncingRef.current = true
      otherRef.current?.setTransform(
        state.positionX,
        state.positionY,
        state.scale,
        0,
      )
    },
    [onTransformed, otherRef, syncingRef],
  )

  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm sm:gap-3">
      <div className="flex shrink-0 flex-row items-center gap-2 border-b border-neutral-100 px-3 py-1.5 sm:px-4 sm:py-2">
        <p className="text-xs font-semibold text-neutral-800 sm:text-sm">{label}</p>
        {date != null && date !== '' && (
          <span className="text-[10px] text-neutral-500 sm:text-xs">{date}</span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden gap-1">
        <p className="shrink-0 px-1 text-[10px] text-[#E69100] sm:text-xs">
          이 구역에서 확대/축소가 가능합니다 (휠로 확대 · 드래그로 이동)
        </p>
        <div className="relative flex min-h-0 flex-1 p-1.5 sm:p-2">
          {src ? (
            <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border-2 border-[#E69100]/60 bg-gray-50">
              <TransformWrapper
                ref={transformRef}
                key={imageFilename ?? 'empty'}
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                onTransformed={handleTransformed}
              >
                <TransformComponent
                  wrapperClass="w-full h-full min-h-0 overflow-hidden"
                  wrapperStyle={{ width: '100%', height: '100%', minHeight: 0, overflow: 'hidden' }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="max-h-full max-w-full object-contain object-center"
                    loading="lazy"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          ) : (
            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-neutral-50 text-xs text-neutral-500 sm:h-32 sm:text-sm">
              이미지 없음
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RevisionCompareView({ leftPanel, rightPanel }: RevisionCompareViewProps) {
  const leftRef = useRef<ReactZoomPanPinchContentRef | null>(null)
  const rightRef = useRef<ReactZoomPanPinchContentRef | null>(null)
  const syncingRef = useRef(false)

  const noop = useCallback(() => {}, [])

  return (
    <div className="grid grid-cols-1 gap-3 overflow-auto p-2 sm:gap-4 sm:p-4 lg:grid-cols-2">
      <ComparePanelContent
        {...leftPanel}
        transformRef={leftRef}
        onTransformed={noop}
        otherRef={rightRef}
        syncingRef={syncingRef}
      />
      <ComparePanelContent
        {...rightPanel}
        transformRef={rightRef}
        onTransformed={noop}
        otherRef={leftRef}
        syncingRef={syncingRef}
      />
    </div>
  )
}
