import { links } from "@/data/links"
import { useEffect, useState } from "react"
import { buttonVariants } from "./ui/button"
import { cn } from "cn"

type SocialLinksProps = {
  enableScrollTransition?: boolean
}

const SocialLinks = ({ enableScrollTransition = false }: SocialLinksProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  useEffect(() => {
    if (!enableScrollTransition) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  })

  const hide = enableScrollTransition && isScrolled

  return (
    <div className="flex">
      {links.map((link) => (
        <a
          key={link.name}
          href={link.to}
          target="_blank"
          rel="noopener noreferrer"

          className={cn(
            buttonVariants({ variant: "link", size: "sm" }),
            "curvy_underline px-2 py-1 text-sm text-muted-foreground transition-slow hover:text-foreground"
          )}
          style={{
            transform: hide ? "translateY(-200%)" : "translateY(0)",
            opacity: hide ? 0 : 1,
          }}
        >
          {link.name}
        </a>
      ))}
    </div>
  )
}

export default SocialLinks
