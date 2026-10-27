import { buttonVariants } from "@/components/ui/button"
import {
  Section,
  SectionAside,
  SectionHeader,
  SectionMain,
} from "@/components/ui/section"
import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { ArrowDown } from "lucide-react"
import divvyMockup from "@/assets/images/front_facing_divvy_mockup.png"
import { cn } from "cn"
import { SplitDemo } from "@/components/divvy/SplitDemo"

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
          <SectionHeader
            title="Divvy"
            subtitle="Split the bill on one screen."
          />
          <p className="type-lead">
            A receipt-splitting app for group dinners, trips and tabs. Add who
            was there, add what you ordered, then tap names onto items.
            Everyone's share, tax and tip included, updates as you go.
          </p>
          <a
            href="#demo"
            className={cn(buttonVariants({ size: "lg" }), "w-fit")}
          >
            Try the live demo <ArrowDown aria-hidden="true" />
          </a>
        </SectionMain>
        <SectionAside>
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className={cn(
              "drop-shadow-xl transition-transform duration-500 ease-out",
              "motion-safe:hover:scale-105 motion-safe:hover:-rotate-2",
              "w-84"
            )}
          />
        </SectionAside>
      </Section>
      <Section id="demo">
        <SectionMain>
          <SectionHeader as="h2" title="Try It" />
          <p className="mt-3">
            This is the same split logic the app uses. Pick a person, then tap
            items to add or remove them. Watch tax and tip shift to follow what
            each person ordered.
          </p>
          <div className="mt-6">
            <SplitDemo />
          </div>
        </SectionMain>
      </Section>
    </>
  )
}
