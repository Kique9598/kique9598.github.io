import { Section } from "@/components/ui/section"
import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"
import { Link } from "react-router-dom"

export default function NotFound() {
  useTitle("Page Not Found")
  return (
    <Section>
      <h1>404 — Page not found</h1>
      <p>That page doesn't exist.</p>
      <Link to={routes.index.path}>Go home</Link>
    </Section>
  )
}
