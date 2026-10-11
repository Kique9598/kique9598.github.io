/**
 * Page-level variables that terminal commands can read and change.
 *
 * To add one: add a line here. That's it — it is now available as
 *   ctx.page.get("myVar") / ctx.page.set("myVar", value)   inside commands
 *   usePageVar("myVar")                                     inside components
 * and <Reveal when="myVar"> works for any boolean.
 */
export const initialPageVars = {
  hero: false,
  socials: false,
  secret: false,
}

export type PageVars = typeof initialPageVars

/** What the `reveal` / `hide` commands accept. Must be boolean page vars. */
export const REVEALABLE = [
  "hero",
  "socials",
] as const satisfies readonly BooleanPageVar[]

export type BooleanPageVar = {
  [K in keyof PageVars]: PageVars[K] extends boolean ? K : never
}[keyof PageVars]
