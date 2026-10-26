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
    </>
  )
}
