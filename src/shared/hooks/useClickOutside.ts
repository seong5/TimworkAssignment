import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
  options: { enabled?: boolean; event?: 'mousedown' | 'click' } = {},
): void {
  const { enabled = true, event = 'mousedown' } = options
  const callbackRef = useRef(onOutsideClick)
  callbackRef.current = onOutsideClick

  useEffect(() => {
    if (!enabled) return

    function handleEvent(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callbackRef.current()
      }
    }

    document.addEventListener(event, handleEvent)
    return () => document.removeEventListener(event, handleEvent)
  }, [ref, enabled, event])
}
