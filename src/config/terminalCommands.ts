import { links } from "@/data/links"
import { navLinks } from "@/config/routes"
import { REVEALABLE } from "@/config/terminalPage"
import { defineCommand, findCommand, usage } from "@/terminal/parse"
import type { Command } from "@/terminal/types"

/**
 * ── HOW TO ADD A COMMAND ──────────────────────────────────────────────────
 * Add a defineCommand({...}) to the `commands` array at the bottom.
 *
 *   defineCommand({
 *     name: "greet",
 *     description: "Say hello",                       // shown in `help`
 *     aliases: ["hi"],                                // optional
 *     hidden: true,                                   // optional: easter egg
 *     passthrough: true,                              // optional: don't parse flags
 *     args: [                                         // positional arguments
 *       { name: "who", required: true },
 *       { name: "mood", choices: ["happy", "grumpy"], default: "happy" },
 *     ],
 *     flags: {                                        // --loud / -l, --times=3
 *       loud: { type: "boolean", alias: "l" },
 *       times: { type: "string", default: "1" },
 *     },
 *     run: ({ args, print, error, success, warn, muted, history, page, theme, navigate }) => {
 *       args.named.who        // "world"      (by name)
 *       args.flags.loud       // true | false
 *       args.rest             // everything after the command, as typed
 *       print("normal line"); success("green-ish"); warn("amber"); muted("dim")
 *       error("red — and marks this run as failed in the history")
 *       history.hasRun("whoami")          // has it been run before?
 *       page.set("hero", true)            // change a page variable
 *       page.signal("hero")               // poke a component without changing state
 *       theme.set("dark")
 *     },
 *   })
 *
 * Missing/invalid arguments and unknown flags are rejected for you (with a
 * usage line) before run() is ever called. run() may be async.
 * Page variables live in config/terminalPage.ts.
 */

/** Printed when the terminal first loads. */
export const WELCOME = ["welcome to kique.dev — type 'help' to look around."]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const help = defineCommand({
  name: "help",
  description: "List commands, or explain one",
  aliases: ["?", "man"],
  args: [{ name: "command", description: "a command to explain" }],
  run: ({ args, print, muted, error, commands }) => {
    const wanted = args.named.command

    if (!wanted) {
      const visible = commands.filter((c) => !c.hidden)
      const width = Math.max(...visible.map((c) => c.name.length))
      for (const c of visible) {
        print(`${c.name.padEnd(width + 2)}${c.description}`)
      }
      muted("help <command> for details · ↑/↓ history · tab completes")
      return
    }

    const command = findCommand(commands, wanted)
    if (!command || command.hidden) {
      error(`no help for '${wanted}'`)
      return
    }
    print(command.description)
    print(`usage: ${usage(command)}`)
    if (command.aliases?.length) muted(`aliases: ${command.aliases.join(", ")}`)
    for (const arg of command.args ?? []) {
      if (arg.description) muted(`  ${arg.name}: ${arg.description}`)
    }
    for (const [name, flag] of Object.entries(command.flags ?? {})) {
      const short = flag.alias ? `, -${flag.alias}` : ""
      muted(
        `  --${name}${short}${flag.description ? `: ${flag.description}` : ""}`
      )
    }
  },
})

const clear = defineCommand({
  name: "clear",
  description: "Clear the terminal",
  aliases: ["cls"],
  run: ({ clear }) => clear(),
})

const echo = defineCommand({
  name: "echo",
  description: "Print something back",
  args: [{ name: "text", variadic: true }],
  flags: {
    loud: { type: "boolean", alias: "l", description: "SHOUT IT" },
  },
  run: ({ args, print }) => {
    const text = args.named.text ?? ""
    print(args.flags.loud ? text.toUpperCase() : text)
  },
})

const whoami = defineCommand({
  name: "whoami",
  description: "Who built this?",
  run: ({ print, muted }) => {
    print("Enrique Alverde — the person who built this terminal.")
    muted(
      `try: ${links.map((l) => `open ${l.name.toLowerCase()}`).join(" · ")}`
    )
  },
})

const open = defineCommand({
  name: "open",
  description: "Open one of my links in a new tab",
  args: [
    {
      name: "link",
      required: true,
      choices: links.map((l) => l.name.toLowerCase()),
    },
  ],
  run: ({ args, success }) => {
    const link = links.find((l) => l.name.toLowerCase() === args.named.link)
    if (!link) return
    window.open(link.to, "_blank", "noopener,noreferrer")
    success(`opening ${link.name}...`)
  },
})

const goto = defineCommand({
  name: "goto",
  description: "Jump to another page",
  aliases: ["cd"],
  args: [{ name: "page", required: true }],
  run: ({ args, error, muted, success, navigate }) => {
    // navLinks is read here rather than in `choices` on purpose: routes.tsx
    // imports the pages, which import this file, so it isn't ready at load time.
    const page = navLinks.find(
      (l) => l.name.toLowerCase() === args.named.page?.toLowerCase()
    )
    if (!page) {
      error(`no such page: ${args.named.page}`)
      muted(`pages: ${navLinks.map((l) => l.name.toLowerCase()).join(", ")}`)
      return
    }
    success(`→ ${page.to}`)
    navigate(page.to)
  },
})

const theme = defineCommand({
  name: "theme",
  description: "Switch the site between light and dark",
  args: [
    {
      name: "mode",
      choices: ["dark", "light", "system", "toggle"],
      default: "toggle",
    },
  ],
  run: ({ args, theme, success, warn }) => {
    const mode = args.named.mode
    const next =
      mode === "dark" || mode === "light" || mode === "system"
        ? mode
        : theme.resolved() === "dark"
          ? "light"
          : "dark"

    if (next === theme.get()) {
      warn(`already ${next}`)
      return
    }
    theme.set(next)
    success(`theme: ${next}`)
  },
})

const reveal = defineCommand({
  name: "reveal",
  description: "Reveal a hidden part of the page",
  aliases: ["show"],
  args: [{ name: "component", required: true, choices: REVEALABLE }],
  run: ({ args, page, success, warn }) => {
    const target = args.named.component as (typeof REVEALABLE)[number]
    if (page.get(target)) {
      page.signal(target) // already there → make it flash instead
      warn(`${target} is already on the page — look for the flash`)
      return
    }
    page.set(target, true)
    success(`${target} revealed`)
  },
})

const hide = defineCommand({
  name: "hide",
  description: "Hide it again",
  args: [{ name: "component", required: true, choices: REVEALABLE }],
  run: ({ args, page, success, warn }) => {
    const target = args.named.component as (typeof REVEALABLE)[number]
    if (!page.get(target)) {
      warn(`${target} is already hidden`)
      return
    }
    page.set(target, false)
    success(`${target} hidden`)
  },
})

const history = defineCommand({
  name: "history",
  description: "Show what you've run",
  run: ({ history, print, muted }) => {
    if (history.entries.length === 0) {
      muted("nothing yet")
      return
    }
    history.entries.forEach((entry, index) => {
      print(`${String(index + 1).padStart(3)}  ${entry.raw}`)
    })
  },
})

/* ── easter eggs (hidden: not in `help`, not tab-completed) ──────────────── */

const sudo = defineCommand({
  name: "sudo",
  description: "Nope",
  hidden: true,
  passthrough: true, // don't treat -rf as flags
  args: [{ name: "anything", variadic: true }],
  run: ({ error, muted, history }) => {
    // history.count only counts clean runs, and this one always errors,
    // so count attempts by hand
    const attempts = history.entries.filter((e) => e.name === "sudo").length
    error("permission denied: you are not in the sudoers file.")
    if (attempts >= 2)
      muted("...persistent. have you introduced yourself? (whoami)")
  },
})

/** Only works once the visitor has run `whoami` AND tried `sudo`. */
const secret = defineCommand({
  name: "secret",
  description: "???",
  hidden: true,
  run: async ({ history, page, error, muted, success }) => {
    const knowsMe = history.hasRun("whoami")
    const triedSudo = history.hasRun("sudo", { includeFailed: true })

    if (!knowsMe || !triedSudo) {
      error("access denied")
      muted(`requirements met: ${Number(knowsMe) + Number(triedSudo)}/2`)
      return
    }
    if (page.get("secret")) {
      page.signal("secret")
      return
    }
    muted("verifying...")
    await sleep(600)
    page.set("secret", true)
    success("access granted. check the page.")
  },
})

export const commands: readonly Command[] = [
  help,
  whoami,
  open,
  goto,
  theme,
  reveal,
  hide,
  echo,
  history,
  clear,
  sudo,
  secret,
]
