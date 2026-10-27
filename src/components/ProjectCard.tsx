// components/project-card.tsx
import { cn } from "@/lib/utils"

type ProjectCardProps = {
  href: string
  title: string
  description: string
  /** Plain-text line under the description, e.g. "First version shipped October 2026" */
  meta?: string
  tech?: string[]
  image?: { src: string; alt: string }
  /** "featured" = wide, image beside text. "default" = compact grid card. */
  variant?: "featured" | "default"
  className?: string
}

export function ProjectCard({
  href,
  title,
  description,
  meta,
  tech,
  image,
  variant = "default",
  className,
}: ProjectCardProps) {
  const featured = variant === "featured"

  return (
    <a
      href={href}
      className={cn(
        "group block overflow-hidden rounded-3xl border border-border bg-primary/10",
        "transition duration-300 ease-out motion-safe:hover:-translate-y-1.5",
        "hover:border-foreground/15 hover:shadow-md",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
        featured ? "p-8 md:p-12" : "p-7",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-8",
          featured && "md:flex-row md:items-center md:gap-12"
        )}
      >
        <div className="flex flex-1 flex-col gap-3">
          <h3
            className={cn("font-bold", featured && "text-4xl md:text-5xl")}
          >
            {title}
          </h3>

          <p
            className={cn(
              featured
                ? "max-w-md type-body-lg text-muted-foreground"
                : "type-card"
            )}
          >
            {description}
          </p>

          {(meta || tech?.length) && (
            <p className="type-caption">
              {[meta, tech?.join(", ")].filter(Boolean).join(" · ")}
            </p>
          )}

          <span className="mt-2 inline-flex items-center gap-2 font-semibold">
            Learn more
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            >
              →
            </span>
          </span>
        </div>

        {image && (
          <div className="flex shrink-0 justify-center">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className={cn(
                "drop-shadow-xl transition-transform duration-500 ease-out",
                "motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-2",
                featured ? "w-56 md:w-72" : "w-full rounded-2xl"
              )}
            />
          </div>
        )}
      </div>
    </a>
  )
}
