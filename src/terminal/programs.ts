import type { Program } from "./types"

/**
 * Every command the terminal knows. The key is what the user types first;
 * the value is the program that runs. Add a command by adding an entry.
 */
export const programs: Record<string, Program> = {
  echo: (args, print) => {
    print(args.slice(1).join(" "))
  },
}
