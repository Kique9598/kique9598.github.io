import { createContext, useContext } from "react"
import type { PageVars } from "@/config/terminalPage"
import type { HistoryEntry, LineKind, OutputLine } from "./types"

export type TerminalContextValue = {
  lines: readonly OutputLine[]
  history: readonly HistoryEntry[]
  vars: PageVars
  signals: Readonly<Record<string, number>>
  /** Run a line exactly as if the visitor had typed it. */
  execute: (line: string) => Promise<void>
  print: (kind: LineKind, text: string) => void
  clear: () => void
}

export const TerminalContext = createContext<TerminalContextValue | undefined>(
  undefined
)

export function useTerminal() {
  const context = useContext(TerminalContext)
  if (!context) {
    throw new Error("useTerminal must be used within a TerminalProvider")
  }
  return context
}

/** Subscribe a component to one page variable. */
export function usePageVar<K extends keyof PageVars>(key: K): PageVars[K] {
  return useTerminal().vars[key]
}

/**
 * A counter that goes up every time a command calls ctx.page.signal(key).
 * Put it in a useEffect dependency list to react to the signal.
 */
export function useSignal(key: string): number {
  return useTerminal().signals[key] ?? 0
}
