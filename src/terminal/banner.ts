import type { TerminalLine } from "./types"

export const ENRIQUE_ART = [
  " ___          _               ",
  "| __|_ _  _ _(_)__ _ _  _ ___ ",
  "| _|| ' \\| '_| / _` | || / -_)",
  "|___|_||_|_| |_\\__, |\\_,_\\___|",
  "                  |_|         ",
].join("\n")

/** What the terminal shows before anything has been typed. */
export const BANNER: TerminalLine[] = [
  { stream: "stdout", line: ENRIQUE_ART },
  { stream: "stdout", line: "Welcome to my portfolio terminal :)" },
]
