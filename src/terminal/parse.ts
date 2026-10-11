import type { Command, ParsedArgs } from "./types"

/** Identity helper so command objects get type-checked and autocompleted. */
export const defineCommand = (command: Command): Command => command

export function findCommand(
  commands: readonly Command[],
  name: string
): Command | undefined {
  const wanted = name.toLowerCase()
  return commands.find(
    (c) => c.name === wanted || c.aliases?.includes(wanted) === true
  )
}

/** `theme <dark|light|system|toggle>` — generated from the command's spec. */
export function usage(command: Command): string {
  const parts = [command.name]
  for (const arg of command.args ?? []) {
    const label = arg.choices ? arg.choices.join("|") : arg.name
    const dots = arg.variadic ? "..." : ""
    parts.push(arg.required ? `<${label}${dots}>` : `[${label}${dots}]`)
  }
  for (const [name, flag] of Object.entries(command.flags ?? {})) {
    const value =
      flag.type === "string"
        ? `=${flag.choices ? flag.choices.join("|") : "value"}`
        : ""
    parts.push(`[--${name}${value}]`)
  }
  return parts.join(" ")
}

type Token = { value: string; quoted: boolean }

type Tokenized =
  { ok: true; tokens: Token[]; rest: string } | { ok: false; error: string }

/**
 * Splits a line into words. Supports "double quotes", 'single quotes'
 * and backslash escapes, so `echo "hello world"` is one argument.
 */
export function tokenize(line: string): Tokenized {
  const tokens: Token[] = []
  let current = ""
  let inToken = false
  let wasQuoted = false
  let quote: '"' | "'" | null = null
  let firstWordEnd = -1

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (quote) {
      if (ch === quote) quote = null
      else if (ch === "\\" && quote === '"' && i + 1 < line.length)
        current += line[++i]
      else current += ch
      continue
    }

    if (ch === '"' || ch === "'") {
      quote = ch
      inToken = true
      wasQuoted = true
    } else if (ch === "\\" && i + 1 < line.length) {
      current += line[++i]
      inToken = true
    } else if (/\s/.test(ch)) {
      if (inToken) {
        tokens.push({ value: current, quoted: wasQuoted })
        if (tokens.length === 1) firstWordEnd = i
        current = ""
        inToken = false
        wasQuoted = false
      }
    } else {
      current += ch
      inToken = true
    }
  }

  if (quote) return { ok: false, error: `unterminated ${quote} quote` }
  if (inToken) tokens.push({ value: current, quoted: wasQuoted })

  return {
    ok: true,
    tokens,
    rest: firstWordEnd === -1 ? "" : line.slice(firstWordEnd).trim(),
  }
}

type Parsed = { ok: true; args: ParsedArgs } | { ok: false; errors: string[] }

/**
 * Turns the words after the command name into { named, positionals, flags },
 * validating them against the command's spec. If anything is wrong, run()
 * is never called and the errors are printed along with the usage line.
 */
export function parseArgs(
  command: Command,
  tokens: readonly Token[],
  rest: string,
  raw: string
): Parsed {
  const errors: string[] = []
  const flagSpecs = command.flags ?? {}
  const argSpecs = command.args ?? []
  const positionals: string[] = []
  const flags: ParsedArgs["flags"] = {}

  const flagByAlias = (alias: string) =>
    Object.keys(flagSpecs).find((name) => flagSpecs[name].alias === alias)

  let onlyPositionals = command.passthrough === true

  for (let i = 0; i < tokens.length; i++) {
    const { value: token, quoted } = tokens[i]

    // quoted words, bare "-", negative numbers and everything after "--" are plain arguments
    if (onlyPositionals || quoted || !/^-{1,2}[a-zA-Z]/.test(token)) {
      if (token === "--" && !quoted && !onlyPositionals)
        onlyPositionals = true // "--" itself is dropped
      else positionals.push(token)
      continue
    }

    const long = token.startsWith("--")
    const body = token.slice(long ? 2 : 1)
    const eq = body.indexOf("=")
    const key = eq === -1 ? body : body.slice(0, eq)
    const inline = eq === -1 ? undefined : body.slice(eq + 1)

    // -abc → -a -b -c (boolean short flags only)
    const names = long || key.length === 1 ? [key] : key.split("")

    for (const given of names) {
      const name = long ? given : flagByAlias(given)
      const spec = name ? flagSpecs[name] : undefined
      if (!name || !spec) {
        errors.push(`unknown flag: ${long ? "--" : "-"}${given}`)
        continue
      }

      if (spec.type === "boolean") {
        if (inline !== undefined && !["true", "false"].includes(inline))
          errors.push(`--${name} doesn't take a value`)
        else flags[name] = inline !== "false"
        continue
      }

      // string flag: --name=value or --name value
      let value = inline
      if (value === undefined && names.length === 1 && i + 1 < tokens.length) {
        value = tokens[++i].value
      }
      if (value === undefined) {
        errors.push(`--${name} needs a value`)
      } else if (spec.choices && !spec.choices.includes(value)) {
        errors.push(
          `invalid value for --${name}: "${value}" (expected ${spec.choices.join(", ")})`
        )
      } else {
        flags[name] = value
      }
    }
  }

  for (const [name, spec] of Object.entries(flagSpecs)) {
    if (flags[name] === undefined) {
      flags[name] =
        spec.default ?? (spec.type === "boolean" ? false : undefined)
    }
  }

  const named: ParsedArgs["named"] = {}
  argSpecs.forEach((spec, index) => {
    const value = spec.variadic
      ? positionals.slice(index).join(" ") || undefined
      : positionals[index]

    if (value === undefined) {
      if (spec.required) errors.push(`missing argument: ${spec.name}`)
      named[spec.name] = spec.default
      return
    }
    if (spec.choices && !spec.choices.includes(value)) {
      errors.push(
        `invalid ${spec.name}: "${value}" (expected ${spec.choices.join(", ")})`
      )
    }
    named[spec.name] = value
  })

  const takesAnyNumber = argSpecs.at(-1)?.variadic === true
  if (!takesAnyNumber && positionals.length > argSpecs.length) {
    errors.push(
      argSpecs.length === 0
        ? `${command.name} doesn't take any arguments`
        : `too many arguments (expected at most ${argSpecs.length})`
    )
  }

  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, args: { named, positionals, flags, rest, raw } }
}
