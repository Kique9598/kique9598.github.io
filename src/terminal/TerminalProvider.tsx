import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/components/theme-provider"
import { commands, WELCOME } from "@/config/terminalCommands"
import { initialPageVars, type PageVars } from "@/config/terminalPage"
import { findCommand, parseArgs, tokenize, usage } from "./parse"
import { TerminalContext } from "./terminal-context"
import type {
  CommandContext,
  HistoryApi,
  HistoryEntry,
  HistoryStatus,
  LineKind,
  OutputLine,
  ParsedArgs,
  ThemeName,
} from "./types"

const MAX_LINES = 500
const MAX_HISTORY = 200

const welcomeLines: OutputLine[] = WELCOME.map((text, index) => ({
  id: -1 - index, // negative ids can never collide with printed lines
  kind: "muted",
  text,
}))

function buildHistoryApi(entries: readonly HistoryEntry[]): HistoryApi {
  return {
    entries,
    hasRun: (name, options) =>
      entries.some(
        (entry) =>
          entry.name === name &&
          (options?.includeFailed || entry.status === "ok") &&
          (options?.where?.(entry) ?? true)
      ),
    count: (name) =>
      entries.filter((e) => e.name === name && e.status === "ok").length,
    last: () => entries.at(-1),
  }
}

/**
 * Owns everything the terminal knows: its output, the command history and
 * the page variables commands can change. It lives in <Layout>, so all of
 * it survives navigating between pages and any component can subscribe.
 */
export function TerminalProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<OutputLine[]>(welcomeLines)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [vars, setVars] = useState<PageVars>(initialPageVars)
  const [signals, setSignals] = useState<Record<string, number>>({})

  // Refs mirror the state so a command always reads the latest values,
  // even ones it changed itself a line earlier.
  const historyRef = useRef<HistoryEntry[]>([])
  const varsRef = useRef<PageVars>(initialPageVars)
  const nextId = useRef(0)

  const { theme, setTheme } = useTheme()
  const themeRef = useRef<ThemeName>(theme)
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  const navigate = useNavigate()

  const print = useCallback((kind: LineKind, text: string) => {
    const added = text
      .split("\n")
      .map((line) => ({ id: nextId.current++, kind, text: line }))
    setLines((current) => [...current, ...added].slice(-MAX_LINES))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const execute = useCallback(
    async (line: string) => {
      const raw = line.trim()
      if (!raw) return

      print("input", raw)

      const record = (
        name: string,
        status: HistoryStatus,
        args?: ParsedArgs
      ) => {
        const entry: HistoryEntry = { raw, name, args, status, at: Date.now() }
        historyRef.current = [...historyRef.current, entry].slice(-MAX_HISTORY)
        setHistory(historyRef.current)
      }

      const tokenized = tokenize(raw)
      if (!tokenized.ok) {
        print("error", tokenized.error)
        record(raw.split(/\s+/)[0].toLowerCase(), "error")
        return
      }

      const [first, ...argTokens] = tokenized.tokens
      const command = findCommand(commands, first.value)
      if (!command) {
        print("error", `command not found: ${first.value}`)
        print("muted", "type 'help' to see what's available")
        record(first.value.toLowerCase(), "unknown")
        return
      }

      const parsed = parseArgs(command, argTokens, tokenized.rest, raw)
      if (!parsed.ok) {
        for (const message of parsed.errors) print("error", message)
        print("muted", `usage: ${usage(command)}`)
        record(command.name, "error")
        return
      }

      let failed = false
      const ctx: CommandContext = {
        args: parsed.args,
        print: (text) => print("text", text),
        error: (text) => {
          failed = true
          print("error", text)
        },
        success: (text) => print("success", text),
        warn: (text) => print("warn", text),
        muted: (text) => print("muted", text),
        clear,
        history: buildHistoryApi(historyRef.current),
        page: {
          get: (key) => varsRef.current[key],
          set: (key, value) => {
            varsRef.current = { ...varsRef.current, [key]: value }
            setVars(varsRef.current)
          },
          signal: (key) =>
            setSignals((current) => ({
              ...current,
              [key]: (current[key] ?? 0) + 1,
            })),
        },
        theme: {
          get: () => themeRef.current,
          resolved: () =>
            document.documentElement.classList.contains("dark")
              ? "dark"
              : "light",
          set: (next) => {
            themeRef.current = next
            setTheme(next)
          },
        },
        navigate: (path) => {
          void navigate(path)
        },
        commands,
      }

      try {
        await command.run(ctx)
      } catch (cause) {
        failed = true
        print(
          "error",
          `${command.name} crashed: ${cause instanceof Error ? cause.message : String(cause)}`
        )
      }

      record(command.name, failed ? "error" : "ok", parsed.args)
    },
    [print, clear, setTheme, navigate]
  )

  const value = useMemo(
    () => ({ lines, history, vars, signals, execute, print, clear }),
    [lines, history, vars, signals, execute, print, clear]
  )

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  )
}
