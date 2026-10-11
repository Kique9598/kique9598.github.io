// components/sections/Section.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const sectionVariants = cva("w-full", {
  variants: {
    variant: {
      header: "sticky top-0 z-50 py-4", // straight from your Header
      section: "py-12",
      hero: "py-16 md:py-32",
      footer: "mt-6 pb-6",
    },
  },
  defaultVariants: { variant: "section" },
})

const contentVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    variant: {
      header: "flex max-w-7xl items-center justify-center sm:justify-between",
      section: "max-w-5xl", // narrower — text reads better capped tighter
      hero: "flex max-w-7xl flex-col items-center gap-6 text-center",
      footer:
        "pt-3border-t flex max-w-7xl flex-col items-center border-t border-border pt-3",
    },
  },
  defaultVariants: { variant: "section" },
})

const variantTags = {
  header: "header",
  section: "section",
  hero: "section",
  footer: "footer",
} as const

export interface SectionProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  contentClassName?: string
}

export function Section({
  variant = "section",
  className,
  contentClassName,
  children,
  ...props
}: SectionProps) {
  const Tag = variantTags[variant ?? "section"] as React.ElementType
  return (
    <Tag
      data-slot="section"
      className={cn(sectionVariants({ variant }), className)}
      {...props}
    >
      <div className={cn(contentVariants({ variant }), contentClassName)}>
        {children}
      </div>
    </Tag>
  )
}
