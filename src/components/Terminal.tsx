import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, CircleQuestionMark } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Field } from "./ui/field"
import { cn } from "cn"

type TerminalForm = { command: string }

const Terminal = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, reset } = useForm<TerminalForm>({
    defaultValues: { command: "" },
  })

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
    input.focus()
    const end = input.value.length
    input.setSelectionRange(end, end)
  }

  const onSubmit = ({ command }: TerminalForm) => {
    const trimmed = command.trim()
    if (!trimmed) return
    // ── this is the seam for your future terminal brain ──
    console.log("run:", trimmed)
    reset() // clear the line, terminal-style
    inputRef.current?.focus() // keep the cursor in the terminal
  }

  return (
    <Card className="dark pt-0" onMouseDown={focusInput}>
      <CardHeader className="flex items-center justify-between bg-muted py-1 text-muted-foreground">
        <CardDescription>enrique@portfolio:~</CardDescription>
        <CardAction>
          <Button size="icon" aria-label="Submit" variant="ghost">
            <CircleQuestionMark />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="cursor-text">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Field>
            <InputGroup
              className={cn(
                "border-transparent bg-transparent shadow-none dark:bg-transparent",
                "has-[[data-slot=input-group-control]:focus-visible]:border-transparent",
                "has-[[data-slot=input-group-control]:focus-visible]:ring-0"
              )}
            >
              <InputGroupInput
                ref={setInputRef}
                id="inline-start-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                {...commandField}
              />
              <InputGroupAddon align="inline-start">
                <ChevronRight className="text-primary" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </form>
      </CardContent>
    </Card>
  )
}

export default Terminal
