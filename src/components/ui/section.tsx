// components/ui/section.tsx
//
// <Section>      the outer band: vertical padding + the page-width container
// <SectionMain>  REQUIRED. The section's content and its per-variant layout
// <SectionAside> optional. When present, the container becomes two columns
//                at md+ (main left, aside right), shadcn-style: the container
//                reacts to the aside's data-slot via CSS `has-[]`, no JS.
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva("w-full", {
  variants: {
    variant: {
      header: "sticky top-0 z-50 py-4", // straight from your Header
      section: "py-12",
      hero: "py-6 md:py-8",
      footer: "mt-6 pb-6",
    },
  },
  defaultVariants: { variant: "section" },
})

// Container only: width, centering, gutters. No content layout lives here.
const containerVariants = cva(
  [
    "mx-auto grid w-full grid-cols-1 gap-8 px-4 sm:px-6 lg:px-8",
    // two columns when a <SectionAside> is inside
    "md:has-data-[slot=section-aside]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
    "md:has-data-[slot=section-aside]:items-center md:has-data-[slot=section-aside]:gap-16",
  ],
  {
    variants: {
      variant: {
        header: "max-w-6xl",
        section: "max-w-5xl", // narrower — text reads better capped tighter
        hero: "max-w-5xl",
        footer: "max-w-7xl border-t border-border pt-3",
      },
    },
    defaultVariants: { variant: "section" },
  }
)

// Content layout, per variant. This is what used to break when a section had
// two children: it now applies to the main block's own children.
const mainVariants = cva("min-w-0", {
  variants: {
    variant: {
      header: "flex items-center justify-center sm:justify-between",
      section: "",
      hero: "flex flex-col gap-8",
      footer: "flex flex-col items-center",
    },
  },
  defaultVariants: { variant: "section" },
})

type SectionVariant = NonNullable<
  VariantProps<typeof sectionVariants>["variant"]
>

const variantTags = {
  header: "header",
  section: "section",
  hero: "section",
  footer: "footer",
} as const satisfies Record<SectionVariant, string>

const SectionContext = React.createContext<SectionVariant | null>(null)

export interface SectionProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  /** Extra classes for the width container (not the content layout). */
  contentClassName?: string
}

export function Section({
  variant,
  className,
  contentClassName,
  children,
  ...props
}: SectionProps) {
  const v = variant ?? "section"
  const Tag = variantTags[v] as React.ElementType
  const containerRef = React.useRef<HTMLDivElement>(null)

  // TypeScript can't require a specific child component, so enforce the
  // "every Section has a SectionMain" rule in dev with a console error.
  React.useEffect(() => {
    if (!import.meta.env.DEV) return
    const el = containerRef.current
    if (el && !el.querySelector(':scope > [data-slot="section-main"]')) {
      console.error(
        `<Section variant="${v}"> needs a <SectionMain> as a direct child.`,
        el
      )
    }
  })

  return (
    <SectionContext.Provider value={v}>
      <Tag
        data-slot="section"
        className={cn(sectionVariants({ variant: v }), className)}
        {...props}
      >
        <div
          ref={containerRef}
          data-slot="section-container"
          className={cn(containerVariants({ variant: v }), contentClassName)}
        >
          {children}
        </div>
      </Tag>
    </SectionContext.Provider>
  )
}

function useSectionVariant(component: string): SectionVariant {
  const v = React.useContext(SectionContext)
  if (!v) throw new Error(`<${component}> must be used inside a <Section>.`)
  return v
}

export function SectionMain({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const variant = useSectionVariant("SectionMain")
  return (
    <div
      data-slot="section-main"
      className={cn(mainVariants({ variant }), className)}
      {...props}
    />
  )
}

export function SectionAside({
  className,
  ...props
}: React.ComponentProps<"div">) {
  useSectionVariant("SectionAside")
  return (
    <div
      data-slot="section-aside"
      className={cn("flex min-w-0 justify-center", className)}
      {...props}
    />
  )
}
