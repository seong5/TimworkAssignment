import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useBackToDrawing(slug: string | undefined) {
  const navigate = useNavigate()
  return useCallback(() => {
    if (slug) navigate(`/drawing/${slug}`)
  }, [navigate, slug])
}
