import { links } from "@/data/links"
import type { Program } from "./types"

/**
 * Every command the terminal knows. The key is what the user types first;
 * the value is the program that runs. Add a command by adding an entry.
 */
export const programs: Record<string, Program> = {
  help: {
    description: "List available commands",
    run: (_args, ctx) => {
      ctx.print("Available commands:")
      for (const [name, program] of Object.entries(programs)) {
        if (program.description)
          ctx.print(`${name.padEnd(8)}- ${program.description}`)
      }
    },
  },
  open: {
    description: "Open one of my links",
    run: (args, ctx) => {
      const available = links.map((link) => link.name.toLowerCase()).join(", ")

      if (args.length !== 2) {
        ctx.print("usage: open <link>", "stderr")
        ctx.print(`available: ${available}`)
        return
      }

      const link = links.find(
        (l) => l.name.toLowerCase() === args[1].toLowerCase()
      )
      if (!link) {
        ctx.print(`open: no link named '${args[1]}'`, "stderr")
        ctx.print(`available: ${available}`)
        return
      }
      if (!link.to) {
        ctx.print(`open: ${link.name} isn't available yet`, "stderr")
        return
      }

      window.open(link.to, "_blank", "noopener,noreferrer")
      ctx.print(`opening ${link.name}...`)
    },
  },
  clear: {
    description: "Clear the terminal",
    run: (_args, ctx) => {
      ctx.clear()
    },
  },

  echo: {
    run: (args, ctx) => {
      ctx.print(args.slice(1).join(" "))
    },
  },
  banner: {
    run: (_args, ctx) => {
      ctx.banner()
    },
  },
}
