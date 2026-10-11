import { Section } from "@/components/ui/section"
import { routes } from "@/config/routes"
import { useTitle } from "@/hooks/useTitle"

export default function Home() {
  useTitle(routes.games.title)
  return <Section>Games</Section>
}
