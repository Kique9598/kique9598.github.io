import { useEffect, useRef, useState } from "react"

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Eases a number toward `target` whenever it changes. Interrupting a
 * tween mid-flight starts the next one from wherever it currently is.
 */
export function useTweenedNumber(target: number, duration = 450) {
  const [value, setValue] = useState(target)
  const current = useRef(target)

  useEffect(() => {
    const from = current.current
    if (from === target) return
    // reduced motion: jump straight there on the next frame
    const ms = prefersReducedMotion() ? 0 : duration

    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = ms === 0 ? 1 : Math.min((now - start) / ms, 1)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      current.current = from + (target - from) * eased
      setValue(current.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
