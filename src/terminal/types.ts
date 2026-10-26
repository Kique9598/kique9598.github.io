export type DataStream = "stdout" | "stderr" | "command"

export type TerminalLine = {
  stream: DataStream
  line: string
}

export type Context = {
  print: (line: string, stream?: DataStream) => void
  clear: () => void
  history: string[]
  banner: () => void
}

export type Program = {
  description?: string
  run: (args: string[], ctx: Context) => void
}
