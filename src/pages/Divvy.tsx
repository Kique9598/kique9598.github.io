import { Button } from "@/components/ui/button"
import { Section, SectionAside, SectionMain } from "@/components/ui/section"
import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { ArrowDown } from "lucide-react"
import divvyMockup from "@/assets/images/front_facing_divvy_mockup.png"
import { cn } from "cn"

export default function Home() {
  useTitle(routes.divvy.title)

  const image = {
    src: divvyMockup,
    alt: "DIVVY receipt screen with items split between friends",
  }

  return (
    <>
      <Section variant="hero">
        <SectionMain className="gap-4">
          <h1>Divvy</h1>
          <p className="mt-3 text-2xl text-muted-foreground">
            Split the bill on one screen.
          </p>
          <p>
            A receipt-splitting app for group dinners, trips and tabs. Add who
            was there, add what you ordered, then tap names onto items.
            Everyone's share, tax and tip included, updates as you go.
          </p>
          <Button className="w-fit" size={"lg"}>
            Try the live demo <ArrowDown aria-hidden="true" />
          </Button>
        </SectionMain>
        <SectionAside>
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className={cn(
              "drop-shadow-xl transition-transform duration-500 ease-out",
              "motion-safe:hover:scale-105 motion-safe:hover:-rotate-2",
              "w-56 md:w-72"
            )}
          />
        </SectionAside>
      </Section>
      <Section>
        <SectionMain>
          <div className="item-center flex flex-row gap-16">
            <div className="flex flex-1 flex-col gap-4">
              <h2>Why One Screen</h2>
              <p>
                Most bill-splitting apps walk you through three screens: enter
                the items, assign the people, then check the totals. Catch a
                mistake at the end and you're paging back and forth to fix it.
              </p>
              <p>
                Divvy keeps the whole split on one receipt. Items, people and
                running totals stay in view, so every tap shows its effect right
                away.
              </p>
              <p>
                I had the idea years before I could code. The original version
                split the check inside the restaurant's own point-of-sale
                system, right where the bill is created. Divvy is the first step
                toward that.
              </p>
            </div>
            <div className="flex-1 gap-6 rounded-4xl border border-border bg-card p-9">
              card
            </div>
          </div>
        </SectionMain>
      </Section>
    </>
  )
}
