import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useTweenedNumber } from "@/hooks/useTweenedNumber"
import {
  ITEMS,
  PEOPLE,
  SEED,
  SUBTOTAL,
  TAX,
  TIP,
  TOTAL,
  computeSplit,
  formatCents,
} from "./split"
import type { Assignments, PersonId, PersonShare } from "./split"
import "./divvy.css"

// Colors come from tokens in index.css. Anything inside a [data-person]
// element can use bg-person / bg-person-soft / text-person-ink / border-person.

const cloneSeed = (): Assignments =>
  Object.fromEntries(Object.entries(SEED).map(([k, v]) => [k, [...v]]))

export function SplitDemo() {
  const [assignments, setAssignments] = useState<Assignments>(cloneSeed)
  const [selectedId, setSelectedId] = useState<PersonId | null>(null)
  // bumping `n` remounts the halo so it replays on every press
  const [halo, setHalo] = useState<{ id: PersonId; n: number } | null>(null)

  const split = useMemo(() => computeSplit(assignments), [assignments])
  // keep the last real amount on the notice while it fades out, not "$0.00"
  const [noticeCents, setNoticeCents] = useState(split.unassigned)
  if (split.unassigned > 0 && split.unassigned !== noticeCents) {
    setNoticeCents(split.unassigned)
  }
  const selected = PEOPLE.find((p) => p.id === selectedId) ?? null
  const maxOwed = Math.max(...split.shares.map((s) => s.owed))

  const pressPerson = (id: PersonId) => {
    setSelectedId((cur) => (cur === id ? null : id))
    setHalo((h) => ({ id, n: (h?.n ?? 0) + 1 }))
  }

  const toggleItem = (itemId: string) => {
    if (!selectedId) return
    setAssignments((prev) => {
      const on = prev[itemId] ?? []
      return {
        ...prev,
        [itemId]: on.includes(selectedId)
          ? on.filter((id) => id !== selectedId)
          : [...on, selectedId],
      }
    })
  }

  const reset = () => {
    setAssignments(cloneSeed())
    setSelectedId(null)
  }

  return (
    <div className="grid items-start gap-5 md:grid-cols-2 md:gap-6">
      {/* ── the receipt ─────────────────────────────────────────── */}
      <div className="rounded-2xl bg-card p-5 text-card-foreground shadow-xl ring-1 ring-border">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold tracking-tight text-card-foreground">
            Pizza Night
          </h3>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-300",
              split.complete
                ? "bg-success text-success-foreground"
                : "bg-warning-accent text-warning-foreground"
            )}
          >
            {split.complete ? "All assigned" : "Incomplete"}
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2" role="group" aria-label="People">
          {PEOPLE.map((p) => {
            const isSelected = p.id === selectedId
            return (
              <button
                key={p.id}
                type="button"
                data-person={p.id}
                aria-pressed={isSelected}
                onClick={() => pressPerson(p.id)}
                className={cn(
                  "relative rounded-lg border-2 border-person px-3.5 py-1 text-sm font-medium",
                  "transition duration-200 ease-out active:scale-95",
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-person",
                  isSelected
                    ? "bg-person text-person-foreground"
                    : "bg-person-soft text-person-ink hover:brightness-95"
                )}
              >
                {halo?.id === p.id && (
                  <span
                    key={halo.n}
                    aria-hidden
                    className="pointer-events-none absolute -inset-0.5 animate-press-halo rounded-xl motion-reduce:animate-none"
                  />
                )}
                {p.name}
              </button>
            )
          })}
        </div>

        <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
          {selected
            ? `Tap items to add or remove ${selected.name}.`
            : "Pick a person, then tap items to assign them."}
        </p>

        <div className="my-3 border-t border-dashed border-muted-foreground/30" />

        {/* data-person here colors the selected person's item borders */}
        <ul className="flex flex-col gap-1" data-person={selectedId ?? undefined}>
          {ITEMS.map((item) => {
            const on = assignments[item.id] ?? []
            const people = PEOPLE.filter((p) => on.includes(p.id))
            const hasSelected = !!selectedId && on.includes(selectedId)
            const empty = people.length === 0
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!selected}
                  aria-pressed={selected ? hasSelected : undefined}
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "block w-full rounded-lg border px-3 py-1.5 text-left text-sm",
                    "transition duration-200 enabled:active:scale-99 disabled:cursor-default",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    // solid while browsing; once someone is picked, only
                    // their items stay solid (in their color)
                    !selected || hasSelected ? "border-solid" : "border-dashed",
                    hasSelected
                      ? "border-person"
                      : empty
                        ? "border-warning-border"
                        : "border-muted-foreground/30",
                    empty ? "bg-warning" : "bg-card",
                    selected && !empty && !hasSelected && "hover:bg-muted"
                  )}
                >
                  <span className="flex items-baseline justify-between gap-3">
                    <span>{item.name}</span>
                    <span className="tabular-nums">{formatCents(item.price)}</span>
                  </span>
                  <span className="mt-0.5 flex min-h-5 flex-wrap gap-1">
                    {empty ? (
                      <span className="animate-in rounded bg-warning-accent px-1.5 py-px text-xs font-medium text-warning-foreground duration-200 fade-in">
                        Unassigned
                      </span>
                    ) : (
                      people.map((p) => (
                        <span
                          key={p.id}
                          data-person={p.id}
                          className="animate-in rounded border border-person bg-person-soft px-1.5 py-px text-xs text-person-ink duration-200 fade-in zoom-in-90"
                        >
                          {p.name}
                        </span>
                      ))
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-3 flex items-end justify-between gap-4 border-t border-dashed border-muted-foreground/30 pt-3">
          <div>
            <p className="text-sm font-semibold">Total</p>
            <p className="text-xs text-muted-foreground">
              Subtotal {formatCents(SUBTOTAL)} · Tax {formatCents(TAX)} · Tip{" "}
              {formatCents(TIP)}
            </p>
          </div>
          <p className="text-xl font-semibold tabular-nums">{formatCents(TOTAL)}</p>
        </div>
      </div>

      {/* ── who owes what ───────────────────────────────────────── */}
      <div className="rounded-2xl bg-summary p-5 text-summary-foreground ring-1 ring-border">
        <h3 className="text-lg font-semibold tracking-tight text-summary-foreground">
          Who owes what
        </h3>

        <ul className="mt-4 flex flex-col gap-4">
          {split.shares.map((share) => (
            <OwedRow key={share.person.id} share={share} max={maxOwed} />
          ))}
        </ul>

        <div className="divvy-expand" data-open={split.unassigned > 0}>
          <div className="min-h-0 overflow-hidden">
            <p className="mt-4 rounded-lg bg-notice px-3 py-2.5 text-xs text-notice-foreground">
              {formatCents(noticeCents)} in unassigned items. Until everything is
              assigned, tax and tip are shared by the people who have items.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-summary-border pt-4">
          <p className="text-xs text-summary-muted-foreground">
            Assigned <AnimatedCents value={split.assignedTotal} /> of {formatCents(TOTAL)}
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-summary-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-summary-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

function OwedRow({ share, max }: { share: PersonShare; max: number }) {
  const { person, itemCount, items, extras, owed } = share
  // width is data, so it stays inline; color comes from the token
  const width = max > 0 ? (owed / max) * 100 : 0

  return (
    <li data-person={person.id}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{person.name}</span>
        <span className="text-base font-semibold">
          <AnimatedCents value={owed} />
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-summary-border">
        <div className="divvy-bar h-full rounded-full bg-person" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-summary-muted-foreground">
        {itemCount === 0
          ? "No items yet"
          : `${itemCount} ${itemCount === 1 ? "item" : "items"} ${formatCents(items)} · tax and tip ${formatCents(extras)}`}
      </p>
    </li>
  )
}

function AnimatedCents({ value }: { value: number }) {
  const shown = useTweenedNumber(value)
  return <span className="tabular-nums">{formatCents(Math.round(shown))}</span>
}
