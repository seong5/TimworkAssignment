import type { ImageTransform } from '../types'

/**
 * ImageTransform으로 점을 변환: p' = scale * R(rotation) * p + (x, y)
 */
export function transformPoint(
  [px, py]: [number, number],
  t: ImageTransform,
): [number, number] {
  const cos = Math.cos(t.rotation)
  const sin = Math.sin(t.rotation)
  const x = t.scale * (px * cos - py * sin) + t.x
  const y = t.scale * (px * sin + py * cos) + t.y
  return [x, y]
}

/**
 * polygon의 모든 정점에 transform 적용
 */
export function transformPolygon(
  vertices: number[][],
  t: ImageTransform,
): number[][] {
  return vertices.map((v) => transformPoint([v[0], v[1]], t))
}

/**
 * polygon vertices의 바운딩 박스 [minX, minY, maxX, maxY]
 */
export function getBoundingBox(vertices: number[][]): [number, number, number, number] {
  if (vertices.length === 0) return [0, 0, 0, 0]
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of vertices) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return [minX, minY, maxX, maxY]
}
