import { useEffect, useRef, type RefObject } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  onOutsideClick: () => void,
  options: {
    enabled?: boolean
    event?: 'mousedown' | 'click'
    ignoreRef?: RefObject<HTMLElement | null>
  } = {},
): void {
  const { enabled = true, event = 'mousedown', ignoreRef } = options
  const callbackRef = useRef(onOutsideClick)
  callbackRef.current = onOutsideClick

  useEffect(() => {
    if (!enabled) return

    function handleEvent(e: MouseEvent) {
      const target = e.target as Node
      if (ignoreRef?.current?.contains(target)) return
      if (ref.current && !ref.current.contains(target)) {
        callbackRef.current()
      }
    }

    document.addEventListener(event, handleEvent)
    return () => document.removeEventListener(event, handleEvent)
  }, [ref, enabled, event, ignoreRef])
}
