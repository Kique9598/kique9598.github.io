import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { BooleanPageVar } from "@/config/terminalPage"
import { usePageVar, useSignal } from "@/terminal/terminal-context"
import "@/terminal/terminal.css"

type RevealProps = {
  /** The boolean page variable that controls whether this is shown. */
  when: BooleanPageVar
  /** Signal that makes it flash. Defaults to the same name as `when`. */
  flashOn?: string
  className?: string
  children: ReactNode
}

/**
 * Hidden until a terminal command sets the page variable to true, then
 * fades in. If a command fires the matching signal while it's already
 * visible (ctx.page.signal("hero")), it scrolls into view and flashes.
 */
export function Reveal({
  when,
  flashOn = when,
  className,
  children,
}: RevealProps) {
  const visible = usePageVar(when)
  const pulse = useSignal(flashOn)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || pulse === 0) return
    // remove → reflow → add restarts the CSS animation on every signal
    el.classList.remove("terminal-flash")
    void el.offsetWidth
    el.classList.add("terminal-flash")
    el.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [pulse])

  if (!visible) return null

  return (
    <div
      ref={ref}
      className={cn(
        "animate-in rounded-xl duration-500 fade-in slide-in-from-bottom-2",
        className
      )}
    >
      {children}
    </div>
  )
}
