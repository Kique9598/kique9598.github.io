export type DataStream = "stdout" | "stderr" | "command"

export type TerminalLine = {
  stream: DataStream
  line: string
}

/** What a program uses to write to the terminal. Defaults to stdout. */
export type Print = (line: string, stream?: DataStream) => void

/**
 * A program is like a tiny executable: it gets its argv (args[0] is its own
 * name) and a way to print, does its thing, and returns.
 */
export type Program = (args: string[], print: Print) => void
