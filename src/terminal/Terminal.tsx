import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CircleQuestionMark } from "lucide-react"
import { BANNER } from "./banner"
import { programs } from "./programs"
import type { Context, DataStream, TerminalLine } from "./types"
import { cn } from "cn"

type TerminalForm = { command: string }

// const Prompt = <ChevronRight className="mt-1 size-4 shrink-0 text-primary" />
const Prompt = <span className="shrink-0 font-bold text-primary">~$ </span>

const Terminal = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, reset, setValue } = useForm<TerminalForm>({
    defaultValues: { command: "" },
  })

  const [cursor, setCursor] = useState<number | null>(null)
  const [output, setOutput] = useState<TerminalLine[]>(BANNER)
  const [history, setHistory] = useState<string[]>([])

  // Scroll only the terminal's own output box to the bottom (where the input
  // is). scrollIntoView would also scroll the page to bring the terminal into view.
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const el = outputRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  }

  useEffect(() => {
    scrollToBottom()
  }, [output])

  // pull RHF's ref out so we can call it alongside our own
  const { ref: registerRef, ...commandField } = register("command")

  const setInputRef = (el: HTMLInputElement | null) => {
    inputRef.current = el // your focus ref
    registerRef(el) // RHF's ref
  }

  const focusInput = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const input = inputRef.current
    if (!input) return
    if (
      target === input ||
      target.closest("button, a, [role=button], input, textarea")
    )
      return
    e.preventDefault()
    scrollToBottom()
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  const ctx: Context = {
    history,
    print: (str: string, stream: DataStream = "stdout") => {
      setOutput((prev) => [...prev, { stream, line: str }])
    },
    clear: () => setOutput([]),
    banner: () => setOutput(BANNER),
  }

  const run = (pathname: string, args: string[]) => {
    // hasOwn so names like "toString" don't match built-in object methods
    const program = Object.hasOwn(programs, pathname)
      ? programs[pathname]
      : undefined
    if (!program) {
      ctx.print(`command not found: ${pathname}`, "stderr")
      return
    }
    program.run(args, ctx)
  }

  const execute = (line: string) => {
    const trimmed = line.trim()

    if (!trimmed) {
      ctx.print("", "command")
      reset()
      return
    }

    if (history.at(history.length - 1) !== trimmed)
      setHistory((prev) => [...prev, trimmed])

    const args = trimmed.split(/\s+/)

    ctx.print(trimmed, "command")
    run(args[0], args)
    reset()
  }

  const onSubmit = ({ command }: TerminalForm) => execute(command)
  const handleHelpBtn = () => execute("help")

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length === 0) return
      const next =
        cursor === null ? history.length - 1 : Math.max(0, cursor - 1)
      setCursor(next)
      setValue("command", history[next])
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cursor === null) return
      if (cursor >= history.length - 1) {
        setCursor(null)
        setValue("command", "")
      } else {
        setCursor(cursor + 1)
        setValue("command", history[cursor + 1])
      }
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const value = e.currentTarget.value
      if (!value || value.includes(" ")) return

      const matching = Object.keys(programs).filter((name) =>
        name.startsWith(value)
      )
      if (matching.length === 1) {
        setValue("command", `${matching[0]} `)
      }
    }
  }

  return (
    <Card
      className="dark flex h-96 flex-1 animate-in gap-0 pt-0 duration-500 fill-mode-both slide-in-from-right-5 fade-in"
      onMouseDown={focusInput}
    >
      <CardHeader className="flex items-center justify-between bg-muted py-1 text-muted-foreground">
        <CardDescription>enrique@portfolio</CardDescription>
        <CardAction>
          <Button
            size="icon"
            aria-label="Help"
            variant="ghost"
            onClick={handleHelpBtn}
          >
            <CircleQuestionMark />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent
        ref={outputRef}
        className="flex-1 cursor-text scrollbar-none overflow-y-auto py-3 font-mono text-sm"
      >
        {output.map((entry, i) => (
          <div key={i} className="flex whitespace-pre-wrap">
            {entry.stream === "command" && Prompt}
            <span
              className={cn(
                "wrap-anywhere",
                entry.stream === "stderr" && "text-destructive"
              )}
            >
              {entry.line}
            </span>
          </div>
        ))}

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          {Prompt}
          <input
            ref={setInputRef}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="flex-1 bg-transparent p-0 caret-primary outline-none"
            {...commandField}
          />
        </form>
      </CardContent>
    </Card>
  )
}

export default Terminal
