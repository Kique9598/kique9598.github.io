// Seed data + split math for the Divvy "Try it" demo.
// All money is integer cents so rounding never drifts.

export type PersonId = "sarah" | "alex" | "josh"

export type Person = {
  id: PersonId
  name: string
}
// Each person's colors are brand tokens (--divvy-<id>, -soft, -ink) in
// index.css, picked up through [data-person="<id>"] in divvy.css.

export type Item = { id: string; name: string; price: number }

/** item id → people on that item (order doesn't matter, display follows PEOPLE) */
export type Assignments = Record<string, PersonId[]>

export const PEOPLE: Person[] = [
  { id: "sarah", name: "Sarah" },
  { id: "alex", name: "Alex" },
  { id: "josh", name: "Josh" },
]

export const ITEMS: Item[] = [
  { id: "margherita", name: "Margherita Pizza", price: 1800 },
  { id: "knots", name: "Garlic Knots", price: 800 },
  { id: "caesar", name: "Caesar Salad", price: 1200 },
  { id: "pepperoni", name: "Pepperoni Slice", price: 600 },
  { id: "lemonade", name: "Lemonade", price: 400 },
  { id: "tiramisu", name: "Tiramisu", price: 900 },
]

export const SEED: Assignments = {
  margherita: ["sarah", "alex", "josh"],
  knots: ["sarah", "josh"],
  caesar: ["sarah"],
  pepperoni: ["josh"],
  lemonade: ["alex"],
  tiramisu: [],
}

// Fixed for the demo — not editable in this UI.
const TAX_RATE = 0.08
const TIP_RATE = 0.2

export const SUBTOTAL = ITEMS.reduce((sum, i) => sum + i.price, 0)
export const TAX = Math.round(SUBTOTAL * TAX_RATE)
export const TIP = Math.round(SUBTOTAL * TIP_RATE)
export const TOTAL = SUBTOTAL + TAX + TIP

/**
 * Split `total` cents by `weights` using largest remainder, so the parts
 * always add back up to exactly `total`. Ties go to the earlier index.
 */
export function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum === 0) return weights.map(() => 0)
  const exact = weights.map((w) => (total * w) / sum)
  const parts = exact.map(Math.floor)
  let left = total - parts.reduce((a, b) => a + b, 0)
  const order = exact
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (const { i } of order) {
    if (left <= 0) break
    parts[i]++
    left--
  }
  return parts
}

export type PersonShare = {
  person: Person
  itemCount: number
  items: number
  extras: number
  owed: number
}

export type Split = {
  shares: PersonShare[]
  assignedTotal: number
  unassigned: number
  complete: boolean
}

// Shares are kept exact as integers in units of 1/SCALE cent, where SCALE
// divides evenly by any group size (1..PEOPLE.length). That way a $4 item
// split three ways is exactly 133.33… cents each, not 134/133/133.
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
const SCALE = PEOPLE.reduce((l, _, i) => (l * (i + 1)) / gcd(l, i + 1), 1)

export function computeSplit(assignments: Assignments): Split {
  const exact = new Map<PersonId, number>(PEOPLE.map((p) => [p.id, 0]))
  const itemCount = new Map<PersonId, number>(PEOPLE.map((p) => [p.id, 0]))
  let assigned = 0

  for (const item of ITEMS) {
    const on = PEOPLE.filter((p) => assignments[item.id]?.includes(p.id))
    if (on.length === 0) continue
    assigned += item.price
    for (const p of on) {
      exact.set(p.id, exact.get(p.id)! + (item.price * SCALE) / on.length)
      itemCount.set(p.id, itemCount.get(p.id)! + 1)
    }
  }

  // Round once, at the end, from the exact shares. Rounding per item first
  // and then splitting tax + tip by those rounded numbers would let a
  // leftover cent compound (one person paying several cents more).
  // While items are unassigned, tax + tip is shared by people with items.
  const weights = PEOPLE.map((p) => exact.get(p.id)!)
  const items = allocate(assigned, weights)
  const owed = allocate(assigned > 0 ? assigned + TAX + TIP : 0, weights)

  const shares = PEOPLE.map((person, i) => ({
    person,
    itemCount: itemCount.get(person.id)!,
    items: items[i],
    extras: owed[i] - items[i],
    owed: owed[i],
  }))

  const unassigned = SUBTOTAL - assigned
  return {
    shares,
    assignedTotal: shares.reduce((sum, s) => sum + s.owed, 0),
    unassigned,
    complete: unassigned === 0,
  }
}

export const formatCents = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
