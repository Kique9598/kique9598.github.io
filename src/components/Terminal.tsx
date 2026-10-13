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

type TerminalForm = { command: string }

const Terminal = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset } = useForm<TerminalForm>({
    defaultValues: { command: "" },
  })

  // const Prompt = <ChevronRight className="mt-1 size-4 shrink-0 text-primary" />
  const Prompt = <span className="shrink-0 font-bold text-primary">~$ </span>

  const ENRIQUE_ART = [
    " ___          _               ",
    "| __|_ _  _ _(_)__ _ _  _ ___ ",
    "| _|| ' \\| '_| / _` | || / -_)",
    "|___|_||_|_| |_\\__, |\\_,_\\___|",
    "                  |_|         ",
  ].join("\n")

  type DataStream = "stdout" | "stderr" | "command"

  type TerminalLine = {
    stream: DataStream
    line: string
  }

  const [history, setHistory] = useState<TerminalLine[]>([
    { stream: "stdout", line: ENRIQUE_ART },
    { stream: "stdout", line: "Welcome to my portfolio terminal :)" },
  ])

  const scrollToInput = (behavior: ScrollBehavior = "smooth") => {
    inputRef.current?.scrollIntoView({ block: "nearest", behavior })
  }

  useEffect(() => {
    scrollToInput()
  }, [history])

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
    scrollToInput()
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  const print = (str: string, stream: DataStream = "stdout") => {
    setHistory((prev) => [...prev, { stream, line: str }])
  }

  const run = (pathname: string, args: string[]) => {
    print(args.join(" "))
  }

  const onSubmit = ({ command }: TerminalForm) => {
    const trimmed = command.trim()

    if (!trimmed) {
      print("", "command")
      reset()
      return
    }

    const args = trimmed.split(/\s+/)

    print(trimmed, "command")
    run(args[0], args)
    reset()
  }

  return (
    <Card
      className="dark flex h-96 flex-1 animate-in gap-0 pt-0 duration-500 fill-mode-both slide-in-from-right-5 fade-in"
      onMouseDown={focusInput}
    >
      <CardHeader className="flex items-center justify-between bg-muted py-1 text-muted-foreground">
        <CardDescription>enrique/portfolio</CardDescription>
        <CardAction>
          <Button size="icon" aria-label="Help" variant="ghost">
            <CircleQuestionMark />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 cursor-text scrollbar-none overflow-y-auto py-3 font-mono text-sm">
        {history.map((entry, i) => (
          <div key={i} className="flex whitespace-pre">
            {entry.stream === "command" && Prompt}
            <span
              className={
                entry.stream === "stderr" ? "text-destructive" : undefined
              }
            >
              {entry.line}
            </span>
          </div>
        ))}

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          {Prompt}
          <input
            ref={setInputRef}
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
