import type { PageVars } from "@/config/terminalPage"

/* ── output ─────────────────────────────────────────────────────────────── */

/**
 * Every line in the terminal has a kind, and each kind has its own style
 * (see LINE_STYLES in components/Terminal.tsx). To add a new kind, add it
 * here, give it a style there, and add a printer in TerminalProvider.
 */
export type LineKind = "input" | "text" | "error" | "success" | "warn" | "muted"

export type OutputLine = {
  id: number
  kind: LineKind
  text: string
}

/* ── arguments ──────────────────────────────────────────────────────────── */

/** A positional argument: `theme dark` → args.named.mode === "dark" */
export type ArgSpec = {
  name: string
  description?: string
  required?: boolean
  /** If set, anything else is rejected with an error before run() is called. */
  choices?: readonly string[]
  default?: string
  /** Swallows all remaining words. Only valid on the last argument. */
  variadic?: boolean
}

/** A flag: `echo --loud hi` or `echo -l hi` or `--color=red` / `--color red` */
export type FlagSpec = {
  type: "boolean" | "string"
  /** Single-letter short form, e.g. "l" for -l */
  alias?: string
  description?: string
  choices?: readonly string[]
  default?: string | boolean
}

export type ParsedArgs = {
  /** Positional arguments by the name given in the command's `args` spec. */
  named: Record<string, string | undefined>
  /** All positional arguments in order. */
  positionals: string[]
  /** Flags by name. Boolean flags are always present (false when omitted). */
  flags: Record<string, string | boolean | undefined>
  /** Everything after the command name, exactly as typed. */
  rest: string
  /** The full line, exactly as typed. */
  raw: string
}

/* ── history ────────────────────────────────────────────────────────────── */

export type HistoryStatus = "ok" | "error" | "unknown"

export type HistoryEntry = {
  /** The full line as typed. */
  raw: string
  /** Canonical command name (aliases resolved). For unknown commands, the first word. */
  name: string
  /** Parsed arguments, when the command exists and its arguments were valid. */
  args?: ParsedArgs
  /** ok = ran cleanly · error = bad args / printed an error / threw · unknown = no such command */
  status: HistoryStatus
  at: number
}

export type HistoryApi = {
  /** Everything run before the current command, oldest first. */
  entries: readonly HistoryEntry[]
  /**
   * Has `name` been run before? Only successful runs count unless
   * `{ includeFailed: true }`. Pass `where` to inspect the arguments,
   * e.g. hasRun("theme", { where: (e) => e.args?.named.mode === "dark" })
   */
  hasRun: (
    name: string,
    options?: {
      includeFailed?: boolean
      where?: (entry: HistoryEntry) => boolean
    }
  ) => boolean
  /** How many times `name` has run successfully. */
  count: (name: string) => number
  /** The most recent entry (of any status), if there is one. */
  last: () => HistoryEntry | undefined
}

/* ── page state ─────────────────────────────────────────────────────────── */

export type PageApi = {
  /** Read a page variable. Always current, even right after a set(). */
  get: <K extends keyof PageVars>(key: K) => PageVars[K]
  /** Write a page variable. Anything using usePageVar(key) re-renders. */
  set: <K extends keyof PageVars>(key: K, value: PageVars[K]) => void
  /**
   * Fire a one-off signal. It doesn't change any variable; components
   * listening with useSignal(key) (or <Reveal>) react to it, e.g. by flashing.
   */
  signal: (key: string) => void
}

export type ThemeName = "dark" | "light" | "system"

/* ── commands ───────────────────────────────────────────────────────────── */

export type CommandContext = {
  args: ParsedArgs
  /** Print a normal line. Multi-line strings are split into separate lines. */
  print: (text: string) => void
  /** Print an error line. Also marks this run as failed in the history. */
  error: (text: string) => void
  success: (text: string) => void
  warn: (text: string) => void
  muted: (text: string) => void
  /** Wipe the terminal output (history is kept). */
  clear: () => void
  history: HistoryApi
  page: PageApi
  theme: {
    /** The stored setting: "dark" | "light" | "system" */
    get: () => ThemeName
    /** What is actually on screen right now. */
    resolved: () => "dark" | "light"
    set: (theme: ThemeName) => void
  }
  /** Client-side navigation to another route. */
  navigate: (path: string) => void
  /** Every registered command (for `help` and friends). */
  commands: readonly Command[]
}

export type Command = {
  name: string
  description: string
  aliases?: readonly string[]
  args?: readonly ArgSpec[]
  flags?: Record<string, FlagSpec>
  /**
   * Skip flag parsing: every word is a plain argument, so `sudo rm -rf /`
   * doesn't complain about unknown flags -r and -f.
   */
  passthrough?: boolean
  /** Hidden commands still run, but don't show up in `help` or tab-completion. */
  hidden?: boolean
  run: (ctx: CommandContext) => void | Promise<void>
}
