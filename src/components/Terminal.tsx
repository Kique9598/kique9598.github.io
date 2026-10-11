import { useEffect, useMemo, useRef, useState } from "react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, CircleQuestionMark } from "lucide-react"
import { cn } from "@/lib/utils"
import { commands } from "@/config/terminalCommands"
import { useTerminal } from "@/terminal/terminal-context"
import type { LineKind } from "@/terminal/types"

/** One style per output kind. Add a kind in terminal/types.ts, style it here. */
const LINE_STYLES: Record<LineKind, string> = {
  input: "text-foreground",
  text: "text-foreground/90",
  error: "text-destructive",
  success: "text-primary",
  warn: "text-amber-400",
  muted: "text-muted-foreground",
}

const Terminal = () => {
  const { lines, history, execute, print, clear } = useTerminal()
  const [value, setValue] = useState("")
  // null = typing a fresh line; a number = browsing history at that index
  const [cursor, setCursor] = useState<number | null>(null)
  const draft = useRef("")
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // What ↑/↓ walk through: every line run, minus back-to-back repeats.
  const recall = useMemo(
    () =>
      history
        .map((entry) => entry.raw)
        .filter((raw, index, all) => raw !== all[index - 1]),
    [history]
  )

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const focusInput = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const input = inputRef.current
    if (!input) return
    if (
      target === input ||
      target.closest("button, a, [role=button], input, textarea")
    )
      return
    // let visitors drag-select output to copy it
    if (target.closest("[data-terminal-line]")) return
    e.preventDefault()
    input.focus()
  }

  const submit = (line: string) => {
    setValue("")
    setCursor(null)
    draft.current = ""
    void execute(line)
    inputRef.current?.focus()
  }

  const complete = () => {
    // only the command name is completed, so stop once there's a space
    if (!value || /\s/.test(value)) return
    const matches = commands
      .filter((c) => !c.hidden && c.name.startsWith(value.toLowerCase()))
      .map((c) => c.name)
    if (matches.length === 1) setValue(`${matches[0]} `)
    else if (matches.length > 1) print("muted", matches.join("  "))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (recall.length === 0) return
      if (cursor === null) draft.current = value
      const next = cursor === null ? recall.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setValue(recall[next])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cursor === null) return
      if (cursor >= recall.length - 1) {
        setCursor(null)
        setValue(draft.current) // back to whatever was being typed
      } else {
        setCursor(cursor + 1)
        setValue(recall[cursor + 1])
      }
    } else if (e.key === "Tab" && value) {
      e.preventDefault()
      complete()
    } else if (e.key.toLowerCase() === "l" && e.ctrlKey) {
      e.preventDefault()
      clear()
    } else if (e.key.toLowerCase() === "c" && e.ctrlKey && value) {
      // only hijack Ctrl+C when nothing is selected, so copy still works
      const input = e.currentTarget
      if (input.selectionStart !== input.selectionEnd) return
      e.preventDefault()
      print("input", `${value}^C`)
      setValue("")
      setCursor(null)
    }
  }

  return (
    <Card className="dark pt-0 font-mono" onMouseDown={focusInput}>
      <CardHeader className="flex items-center justify-between bg-muted py-1 text-muted-foreground">
        <CardDescription>enrique@portfolio:~</CardDescription>
        <CardAction>
          <Button
            size="icon"
            aria-label="Show available commands"
            variant="ghost"
            onClick={() => submit("help")}
          >
            <CircleQuestionMark />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="cursor-text">
        <div
          ref={scrollRef}
          className="max-h-80 overflow-y-auto text-sm leading-6"
        >
          <div role="log" aria-live="polite" aria-label="Terminal output">
            {lines.map((line) => (
              <div
                key={line.id}
                data-terminal-line
                className={cn(
                  "flex min-h-6 cursor-auto gap-2 wrap-anywhere whitespace-pre-wrap",
                  LINE_STYLES[line.kind]
                )}
              >
                {line.kind === "input" && (
                  <ChevronRight
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                )}
                <span>{line.text}</span>
              </div>
            ))}
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              submit(value)
            }}
          >
            <ChevronRight
              aria-hidden
              className="size-4 shrink-0 text-primary"
            />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setCursor(null)
              }}
              onKeyDown={onKeyDown}
              aria-label="Terminal command"
              placeholder={
                history.length === 0 ? "type 'help' and hit enter" : ""
              }
              className="h-6 min-w-0 flex-1 bg-transparent text-base text-foreground caret-primary outline-none placeholder:text-muted-foreground/60 md:text-sm"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
            />
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export default Terminal
